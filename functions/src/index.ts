import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { defineSecret, type SecretParam } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { callAppBackend, listAllRows } from "./appbackend";
import { ApiError, sendError } from "./errors";
import { listResumeAvailability, saveResume, sendResume } from "./resumes";
import {
  createAdminSession,
  parseJsonBody,
  validateCreateRows,
  validateDeleteIds,
  validatePdf,
  validateResumeLanguage,
  validateRowId,
  validateUpdateRow,
} from "./validation";

const APPBACKEND_COLLECTION_ID = defineSecret("APPBACKEND_COLLECTION_ID");
const ADMIN_EMAILS = defineSecret("ADMIN_EMAILS");
const CORS_ALLOWED_ORIGINS = defineSecret("CORS_ALLOWED_ORIGINS");
const REQUIRED_SECRETS = [APPBACKEND_COLLECTION_ID, ADMIN_EMAILS, CORS_ALLOWED_ORIGINS];
const ALLOWED_METHODS = "GET, POST, PUT, DELETE, OPTIONS";
const ALLOWED_HEADERS = "Authorization, Content-Type";

if (getApps().length === 0) initializeApp();

if (
  process.env.FUNCTIONS_EMULATOR === "true" &&
  !process.env.FIREBASE_AUTH_EMULATOR_HOST
) {
  console.warn(
    "Auth emulator is not running, so ID tokens cannot be verified. " +
      "Start the emulators with `npm run firebase:emulators` (functions + auth).",
  );
}

/**
 * Secret values are absent locally unless declared in `functions/.secret.local`
 * (or `functions/.env.<project-id>` for non-secret params). In that case
 * `value()` yields undefined instead of throwing, so read defensively and let
 * the callers answer with an explicit configuration error.
 */
function readSecret(parameter: SecretParam): string {
  let value: unknown;
  try {
    value = parameter.value();
  } catch {
    value = undefined;
  }
  return typeof value === "string" ? value.trim() : "";
}

function setCommonHeaders(response: Response): void {
  response.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Cache-Control": "no-store",
  });
}

function allowedOrigins(): Set<string> {
  const configured = readSecret(CORS_ALLOWED_ORIGINS);
  const configuredOrigins = configured
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (configuredOrigins.length === 0 || configuredOrigins.includes("*")) {
    throw new ApiError(503, "CORS_NOT_CONFIGURED", "Allowed request origins are not configured.");
  }

  const origins = new Set<string>();
  for (const configuredOrigin of configuredOrigins) {
    let parsedOrigin: URL;
    try {
      parsedOrigin = new URL(configuredOrigin);
    } catch {
      throw new ApiError(503, "CORS_NOT_CONFIGURED", "Allowed request origins are invalid.");
    }
    if (
      !["https:", "http:"].includes(parsedOrigin.protocol) ||
      (parsedOrigin.protocol === "http:" &&
        !["localhost", "127.0.0.1", "[::1]"].includes(parsedOrigin.hostname)) ||
      parsedOrigin.username ||
      parsedOrigin.password ||
      parsedOrigin.pathname !== "/" ||
      parsedOrigin.search ||
      parsedOrigin.hash
    ) {
      throw new ApiError(503, "CORS_NOT_CONFIGURED", "Allowed request origins are invalid.");
    }
    origins.add(parsedOrigin.origin);
  }
  return origins;
}

function applyCors(request: Request, response: Response): void {
  response.vary("Origin");
  const origin = request.get("origin");
  if (!origin) return;
  if (!allowedOrigins().has(origin)) {
    throw new ApiError(403, "ORIGIN_NOT_ALLOWED", "Request origin is not allowed.");
  }
  response.set("Access-Control-Allow-Origin", origin);
  response.set("Access-Control-Allow-Methods", ALLOWED_METHODS);
  response.set("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  response.set("Access-Control-Max-Age", "600");
}

function getBearerToken(request: Request): string {
  const authorization = request.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/);
  if (!match) throw new ApiError(401, "AUTHENTICATION_REQUIRED", "A valid Firebase ID token is required.");
  return match[1];
}

function adminEmailSet(): Set<string> {
  const emails = readSecret(ADMIN_EMAILS)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  if (emails.length === 0 || emails.some((email) => !email.includes("@"))) {
    throw new ApiError(503, "AUTHORIZATION_NOT_CONFIGURED", "Administrator access is not configured.");
  }
  return new Set(emails);
}

async function requireAdministrator(request: Request): Promise<string> {
  const token = getBearerToken(request);
  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(token, true);
  } catch {
    throw new ApiError(401, "INVALID_AUTHENTICATION", "Firebase ID token is invalid or expired.");
  }
  const email = decodedToken.email?.toLowerCase();
  if (decodedToken.email_verified !== true || !email || !adminEmailSet().has(email)) {
    throw new ApiError(403, "ADMIN_ACCESS_REQUIRED", "Verified administrator access is required.");
  }
  return email;
}

function requireJsonContentType(request: Request): void {
  if (request.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/json.");
  }
}

function requirePdfContentType(request: Request): void {
  if (request.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/pdf") {
    throw new ApiError(415, "UNSUPPORTED_MEDIA_TYPE", "Content-Type must be application/pdf.");
  }
}

function getCollectionId(): string {
  const collectionId = readSecret(APPBACKEND_COLLECTION_ID);
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(collectionId)) {
    throw new ApiError(503, "CONTENT_SERVICE_NOT_CONFIGURED", "Content service is not configured.");
  }
  return collectionId;
}

function sendUpstreamResult(response: Response, result: { status: number; body: unknown }): void {
  if (result.status === 204) {
    response.status(204).end();
    return;
  }
  response.status(result.status).json(result.body);
}

function parsePathSegment(value: string | undefined): string {
  if (!value) throw new ApiError(404, "NOT_FOUND", "Endpoint was not found.");
  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new ApiError(400, "INVALID_REQUEST", "Path parameter is invalid.");
  }
  return validateRowId(decoded);
}

function routeResumePath(pathname: string): { language: string } | undefined {
  const match = pathname.match(/^\/api\/resumes\/([^/]+)$/);
  return match ? { language: match[1] } : undefined;
}

export const api = onRequest(
  { secrets: REQUIRED_SECRETS, cors: false, maxInstances: 10 },
  async (request, response) => {
    const requestId = randomUUID();
    setCommonHeaders(response);
    try {
      applyCors(request, response);
      if (request.method === "OPTIONS") {
        response.status(204).end();
        return;
      }

      const pathname = new URL(request.url, "https://function.invalid").pathname;
      if (pathname === "/api/session" && request.method === "GET") {
        const email = await requireAdministrator(request);
        response.status(200).json(createAdminSession(email));
        return;
      }
      if (pathname === "/api/resumes" && request.method === "GET") {
        response.status(200).json(await listResumeAvailability());
        return;
      }
      if (pathname === "/api/rows" && request.method === "GET") {
        const rows = await listAllRows(getCollectionId());
        response.status(200).json(rows);
        return;
      }
      if (pathname.startsWith("/api/rows/") && request.method === "GET") {
        const rowId = parsePathSegment(pathname.slice("/api/rows/".length));
        const result = await callAppBackend(getCollectionId(), "GET", rowId);
        sendUpstreamResult(response, result);
        return;
      }
      if (pathname === "/api/rows" && ["POST", "PUT", "DELETE"].includes(request.method)) {
        await requireAdministrator(request);
        requireJsonContentType(request);
        const body = parseJsonBody(request.rawBody);
        const collectionId = getCollectionId();
        if (request.method === "POST") {
          const rows = validateCreateRows(body);
          sendUpstreamResult(response, await callAppBackend(collectionId, "POST", undefined, rows));
          return;
        }
        if (request.method === "PUT") {
          const row = validateUpdateRow(body);
          sendUpstreamResult(response, await callAppBackend(collectionId, "PUT", undefined, row));
          return;
        }
        const ids = validateDeleteIds(body);
        sendUpstreamResult(response, await callAppBackend(collectionId, "DELETE", undefined, ids));
        return;
      }

      const resumeRoute = routeResumePath(pathname);
      if (resumeRoute && request.method === "GET") {
        const language = validateResumeLanguage(resumeRoute.language);
        await sendResume(language, response);
        return;
      }
      if (resumeRoute && request.method === "POST") {
        await requireAdministrator(request);
        requirePdfContentType(request);
        const contentLength = request.get("content-length");
        if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > 10 * 1024 * 1024)) {
          throw new ApiError(413, "PAYLOAD_TOO_LARGE", "PDF exceeds the 10 MB limit.");
        }
        const language = validateResumeLanguage(resumeRoute.language);
        const pdf = validatePdf(request.rawBody);
        await saveResume(language, pdf);
        response.status(200).json({ language, message: "Resume uploaded." });
        return;
      }
      throw new ApiError(404, "NOT_FOUND", "Endpoint was not found.");
    } catch (error) {
      sendError(response, error, requestId);
    }
  },
);
