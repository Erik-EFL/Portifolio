import { InputValidationError } from "./validation";

const APPBACKEND_BASE_URL = "https://v1.appbackend.io/v1/rows";
const MAX_UPSTREAM_RESPONSE_BYTES = 1024 * 1024;

export class AppBackendError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppBackendError";
  }
}

export interface UpstreamResult {
  status: number;
  body: unknown;
}

type UpstreamMethod = "GET" | "POST" | "PUT" | "DELETE";

async function readBoundedResponse(response: Response): Promise<string> {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_UPSTREAM_RESPONSE_BYTES) {
        await reader.cancel();
        throw new AppBackendError(
          502,
          "UPSTREAM_INVALID_RESPONSE",
          "Content service response exceeded the size limit.",
        );
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof AppBackendError) throw error;
    throw new AppBackendError(502, "UPSTREAM_INVALID_RESPONSE", "Content service returned an unreadable response.");
  }
  return Buffer.concat(chunks).toString("utf8");
}

export async function callAppBackend(
  collectionId: string,
  method: UpstreamMethod,
  rowId?: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<UpstreamResult> {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(collectionId)) {
    throw new InputValidationError("AppBackend collection configuration is invalid.");
  }
  if (rowId !== undefined && !/^[A-Za-z0-9_-]{1,128}$/.test(rowId)) {
    throw new InputValidationError("Row id is invalid.");
  }

  const url = new URL(`${APPBACKEND_BASE_URL}/${encodeURIComponent(collectionId)}`);
  if (method === "GET" && rowId !== undefined) {
    url.pathname += `/${encodeURIComponent(rowId)}`;
  }
  for (const [key, value] of Object.entries(query ?? {})) {
    url.searchParams.set(key, value);
  }
  if (method === "GET") {
    // Reads are CDN-cached upstream; without this the panel (and the site)
    // can keep serving a row that was just updated or deleted.
    url.searchParams.set("_", String(Date.now()));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new AppBackendError(502, "UPSTREAM_UNAVAILABLE", "Content service is unavailable.");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new AppBackendError(404, "ROW_NOT_FOUND", "Requested content row was not found.");
    }
    if (response.status === 409) {
      throw new AppBackendError(409, "CONTENT_CONFLICT", "Content service rejected a conflicting update.");
    }
    if (response.status === 400 || response.status === 422) {
      throw new AppBackendError(502, "UPSTREAM_REJECTED_REQUEST", "Content service rejected the request.");
    }
    if (response.status === 429 || response.status >= 500) {
      throw new AppBackendError(502, "UPSTREAM_UNAVAILABLE", "Content service is temporarily unavailable.");
    }
    throw new AppBackendError(502, "UPSTREAM_FAILURE", "Content service failed to complete the request.");
  }

  if (response.status === 204) return { status: 204, body: null };
  const responseText = await readBoundedResponse(response);
  if (responseText.length === 0) return { status: response.status, body: null };
  try {
    return { status: response.status, body: JSON.parse(responseText) as unknown };
  } catch {
    throw new AppBackendError(502, "UPSTREAM_INVALID_RESPONSE", "Content service returned invalid JSON.");
  }
}

const MAX_PAGES = 20;
const DEFAULT_PER_PAGE = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * The rows endpoint answers `{ data, page, count, perPage }`, not a bare array,
 * and paginates at 100 rows. The app contract is a flat `Row[]`, so unwrap and
 * follow the pages here instead of leaking the upstream envelope to clients.
 */
export async function listAllRows(collectionId: string): Promise<unknown[]> {
  const rows: unknown[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { body } = await callAppBackend(collectionId, "GET", undefined, undefined, {
      page: String(page),
    });

    if (Array.isArray(body)) {
      rows.push(...body);
      break;
    }
    if (!isRecord(body) || !Array.isArray(body.data)) {
      throw new AppBackendError(502, "UPSTREAM_INVALID_RESPONSE", "Content service returned an invalid row list.");
    }

    rows.push(...body.data);
    const count = typeof body.count === "number" ? body.count : rows.length;
    const perPage = typeof body.perPage === "number" && body.perPage > 0 ? body.perPage : DEFAULT_PER_PAGE;
    if (rows.length >= count || body.data.length < perPage) break;
  }

  return rows;
}
