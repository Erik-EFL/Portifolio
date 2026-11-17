export const CONTENT_KEYS = [
  "navigation",
  "footer",
  "footerCopyright",
  "home",
  "about",
  "skills",
  "skillsDetails",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface ContentRow {
  key: ContentKey;
  value: JsonValue;
}

export interface PersistedContentRow extends ContentRow {
  _id: string;
}

export type ResumeLanguage = "ptBR" | "enUS";

export interface AdminSession {
  email: string;
  role: "admin";
}

const MAX_BODY_BYTES = 128 * 1024;
const MAX_VALUE_BYTES = 96 * 1024;
const MAX_JSON_DEPTH = 16;
const MAX_JSON_NODES = 8000;
const MAX_JSON_STRING_LENGTH = 24_000;
const CONTENT_KEY_SET: ReadonlySet<string> = new Set(CONTENT_KEYS);
const FORBIDDEN_OBJECT_KEYS = new Set(["__proto__", "prototype", "constructor"]);
const ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

export class RequestTooLargeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestTooLargeError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContentKey(value: unknown): value is ContentKey {
  return typeof value === "string" && CONTENT_KEY_SET.has(value);
}

function validateJsonValue(value: unknown, depth = 0, budget = { nodes: 0 }): value is JsonValue {
  budget.nodes += 1;
  if (budget.nodes > MAX_JSON_NODES || depth > MAX_JSON_DEPTH) return false;

  if (
    value === null ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return true;
  }
  if (typeof value === "string") return value.length <= MAX_JSON_STRING_LENGTH;

  if (Array.isArray(value)) {
    return value.length <= MAX_JSON_NODES && value.every((item) => validateJsonValue(item, depth + 1, budget));
  }
  if (!isRecord(value)) return false;

  const entries = Object.entries(value);
  if (entries.length > MAX_JSON_NODES) return false;
  return entries.every(
    ([key, item]) =>
      key.length <= 256 &&
      !FORBIDDEN_OBJECT_KEYS.has(key) &&
      validateJsonValue(item, depth + 1, budget),
  );
}

function assertOnlyKeys(value: Record<string, unknown>, expected: readonly string[]): void {
  if (Object.keys(value).some((key) => !expected.includes(key))) {
    throw new InputValidationError("Request contains unsupported fields.");
  }
}

function validateContentRow(value: unknown, allowId: boolean): ContentRow | PersistedContentRow {
  if (!isRecord(value)) throw new InputValidationError("Each row must be an object.");
  assertOnlyKeys(value, allowId ? ["_id", "key", "value"] : ["key", "value"]);

  if (!isContentKey(value.key)) throw new InputValidationError("Row key is not editable.");
  if (!isRecord(value.value) && !Array.isArray(value.value)) {
    throw new InputValidationError("Row value must be a JSON object or array.");
  }
  if (!validateJsonValue(value.value)) throw new InputValidationError("Row value exceeds JSON limits.");

  const valueSize = Buffer.byteLength(JSON.stringify(value.value), "utf8");
  if (valueSize > MAX_VALUE_BYTES) throw new InputValidationError("Row value exceeds the size limit.");

  if (!allowId) return { key: value.key, value: value.value };
  if (typeof value._id !== "string" || !ID_PATTERN.test(value._id)) {
    throw new InputValidationError("Row _id is invalid.");
  }
  return { _id: value._id, key: value.key, value: value.value };
}

export function parseJsonBody(rawBody: Buffer | undefined): unknown {
  if (!rawBody || rawBody.length === 0) throw new InputValidationError("A JSON request body is required.");
  if (rawBody.length > MAX_BODY_BYTES) throw new RequestTooLargeError("Request body exceeds the size limit.");

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(rawBody)) as unknown;
  } catch {
    throw new InputValidationError("Request body must contain valid JSON.");
  }
}

export function validateCreateRows(value: unknown): ContentRow[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > CONTENT_KEYS.length) {
    throw new InputValidationError("POST body must be an array of 1–7 rows.");
  }
  const rows = value.map((row) => validateContentRow(row, false) as ContentRow);
  if (new Set(rows.map((row) => row.key)).size !== rows.length) {
    throw new InputValidationError("Each content key may appear only once.");
  }
  return rows;
}

export function validateUpdateRow(value: unknown): PersistedContentRow {
  return validateContentRow(value, true) as PersistedContentRow;
}

export function validateDeleteIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > CONTENT_KEYS.length) {
    throw new InputValidationError("DELETE body must be an array of 1–7 row ids.");
  }
  if (
    !value.every((id): id is string => typeof id === "string" && ID_PATTERN.test(id)) ||
    new Set(value).size !== value.length
  ) {
    throw new InputValidationError("DELETE body contains an invalid or duplicate row id.");
  }
  return value;
}

export function validateRowId(value: string): string {
  if (!ID_PATTERN.test(value)) throw new InputValidationError("Row id is invalid.");
  return value;
}

export function validateResumeLanguage(value: string): ResumeLanguage {
  if (value !== "ptBR" && value !== "enUS") {
    throw new InputValidationError("Resume language must be ptBR or enUS.");
  }
  return value;
}

export function createAdminSession(email: string): AdminSession {
  return { email: email.toLowerCase(), role: "admin" };
}

export function validatePdf(rawBody: Buffer | undefined): Buffer {
  if (!rawBody || rawBody.length === 0) throw new InputValidationError("PDF body is required.");
  if (rawBody.length > 10 * 1024 * 1024) throw new RequestTooLargeError("PDF exceeds the 10 MB limit.");
  if (rawBody.length < 5 || rawBody.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new InputValidationError("Body does not have a PDF signature.");
  }
  return rawBody;
}
