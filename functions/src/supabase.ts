/**
 * Cliente mínimo do Supabase (PostgREST + Storage) para a cópia de segurança do
 * conteúdo e dos currículos.
 *
 * Não usamos o SDK `@supabase/supabase-js`: as três operações de que precisamos
 * são REST puro, e o runtime das Functions já tem `fetch` nativo — uma
 * dependência a menos no deploy.
 *
 * A chave usada aqui é a SECRETA (service role): ela ignora RLS e não pode sair
 * do servidor. O site nunca fala com o Supabase diretamente.
 */

const DEFAULT_ROWS_TABLE = "content_rows";
// bucket já criado no projeto (singular); o override é SUPABASE_STORAGE_BUCKET
const DEFAULT_BUCKET = "resume";
const ROWS_TIMEOUT_MS = 8_000;
const OBJECT_TIMEOUT_MS = 20_000;
const LIST_PAGE_SIZE = 1_000;

export interface SupabaseConfig {
  url: string;
  secretKey: string;
  rowsTable: string;
  bucket: string;
}

/** Linha do conteúdo como ela é guardada no espelho (`id` = `_id` do appbackend). */
export interface SupabaseRow {
  id: string;
  key: string;
  value: unknown;
}

export class SupabaseError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "SupabaseError";
    this.status = status;
    this.code = code;
  }
}

type FetchLike = typeof fetch;

function normalizeUrl(raw: string): string | undefined {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    return undefined;
  }
}

/**
 * `null` = redundância desligada (deploy sem as chaves). Quem chama decide o que
 * fazer: espelho ignora, leitura de fallback propaga o erro original.
 */
export function readSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env,
): SupabaseConfig | null {
  const url = normalizeUrl(env.SUPABASE_URL ?? "");
  // A chave publicável (anon/publishable) não escreve nem ignora RLS; aceitar
  // `SUPABASE_KEY` aqui só criaria um espelho que falha em silêncio.
  const secretKey = (env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  if (!url || !secretKey) return null;

  return {
    url,
    secretKey,
    rowsTable: (env.SUPABASE_ROWS_TABLE ?? "").trim() || DEFAULT_ROWS_TABLE,
    bucket: (env.SUPABASE_STORAGE_BUCKET ?? "").trim() || DEFAULT_BUCKET,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function describeFailure(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? "erro desconhecido");
}

async function readErrorBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    if (!text) return "";
    try {
      const body: unknown = JSON.parse(text);
      if (isRecord(body) && typeof body.message === "string") return body.message;
    } catch {
      // resposta não é JSON: devolve o texto cru (curto)
    }
    return text.slice(0, 200);
  } catch {
    return "";
  }
}

export interface SupabaseClient {
  /** `false` quando não há configuração: nada é replicado nem lido do espelho. */
  readonly configured: boolean;
  upsertRows(rows: SupabaseRow[]): Promise<void>;
  deleteRows(ids: string[]): Promise<void>;
  listRows(): Promise<SupabaseRow[]>;
  uploadObject(path: string, body: Buffer, contentType: string): Promise<void>;
  downloadObject(path: string): Promise<Buffer>;
  listObjectNames(folder?: string): Promise<string[]>;
}

export function createSupabaseClient(
  config: SupabaseConfig | null,
  fetchImpl: FetchLike = fetch,
): SupabaseClient {
  const notConfigured = () =>
    new SupabaseError(
      503,
      "SUPABASE_NOT_CONFIGURED",
      "Supabase redundancy is not configured.",
    );

  const request = async (
    path: string,
    init: RequestInit & { timeoutMs: number },
  ): Promise<Response> => {
    if (!config) throw notConfigured();
    const { timeoutMs, ...rest } = init;
    const headers = new Headers(rest.headers);
    headers.set("apikey", config.secretKey);
    headers.set("Authorization", `Bearer ${config.secretKey}`);

    let response: Response;
    try {
      response = await fetchImpl(`${config.url}${path}`, {
        ...rest,
        headers,
        signal: rest.signal ?? AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      throw new SupabaseError(
        502,
        "SUPABASE_UNAVAILABLE",
        `Supabase request failed: ${describeFailure(error)}`,
      );
    }

    if (!response.ok) {
      const detail = await readErrorBody(response);
      throw new SupabaseError(
        response.status >= 500 ? 502 : response.status,
        "SUPABASE_REQUEST_FAILED",
        `Supabase answered ${response.status}${detail ? `: ${detail}` : ""}`,
      );
    }
    return response;
  };

  const rowsPath = (suffix = "") =>
    config ? `/rest/v1/${config.rowsTable}${suffix}` : "";

  return {
    configured: config !== null,

    async upsertRows(rows) {
      if (!config || rows.length === 0) return;
      // `updated_at` é do espelho (quem lê não depende do relógio do appbackend)
      const now = new Date().toISOString();
      await request(rowsPath("?on_conflict=id"), {
        method: "POST",
        timeoutMs: ROWS_TIMEOUT_MS,
        headers: {
          "Content-Type": "application/json",
          // id é a chave primária: merge-duplicates transforma o POST em upsert
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(
          rows.map((row) => ({
            id: row.id,
            key: row.key,
            value: row.value,
            updated_at: now,
          })),
        ),
      });
    },

    async deleteRows(ids) {
      if (!config || ids.length === 0) return;
      // Um DELETE por id: o filtro `in.(...)` exigiria escapar aspas e vírgula
      // do valor, e o conjunto aqui é sempre pequeno (máx. 7 chaves de conteúdo).
      for (const id of ids) {
        await request(rowsPath(`?id=eq.${encodeURIComponent(id)}`), {
          method: "DELETE",
          timeoutMs: ROWS_TIMEOUT_MS,
          headers: { Prefer: "return=minimal" },
        });
      }
    },

    async listRows() {
      if (!config) throw notConfigured();
      const rows: SupabaseRow[] = [];
      for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
        const response = await request(
          rowsPath(
            `?select=id,key,value&order=id.asc&limit=${LIST_PAGE_SIZE}&offset=${offset}`,
          ),
          { method: "GET", timeoutMs: ROWS_TIMEOUT_MS },
        );
        const body: unknown = await response.json();
        if (!Array.isArray(body)) {
          throw new SupabaseError(
            502,
            "SUPABASE_INVALID_RESPONSE",
            "Supabase returned an invalid row list.",
          );
        }
        for (const entry of body) {
          if (!isRecord(entry)) continue;
          const { id, key, value } = entry;
          if (typeof id !== "string" || typeof key !== "string") continue;
          rows.push({ id, key, value });
        }
        if (body.length < LIST_PAGE_SIZE) break;
      }
      return rows;
    },

    async uploadObject(path, body, contentType) {
      if (!config) return;
      await request(
        `/storage/v1/object/${encodeURIComponent(config.bucket)}/${encodePath(path)}`,
        {
          method: "POST",
          timeoutMs: OBJECT_TIMEOUT_MS,
          headers: {
            "Content-Type": contentType,
            "x-upsert": "true",
            "cache-control": "max-age=300",
          },
          // Buffer → Uint8Array: o fetch do Node aceita, e evita cópia de string
          body: new Uint8Array(body),
        },
      );
    },

    async downloadObject(path) {
      const response = await request(
        `/storage/v1/object/${config ? encodeURIComponent(config.bucket) : ""}/${encodePath(path)}`,
        { method: "GET", timeoutMs: OBJECT_TIMEOUT_MS },
      );
      return Buffer.from(await response.arrayBuffer());
    },

    async listObjectNames(folder = "") {
      if (!config) throw notConfigured();
      const response = await request(
        `/storage/v1/object/list/${encodeURIComponent(config.bucket)}`,
        {
          method: "POST",
          timeoutMs: OBJECT_TIMEOUT_MS,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prefix: folder,
            limit: 100,
            offset: 0,
            sortBy: { column: "name", order: "asc" },
          }),
        },
      );
      const body: unknown = await response.json();
      if (!Array.isArray(body)) return [];
      return body
        .map((entry) => (isRecord(entry) && typeof entry.name === "string" ? entry.name : ""))
        .filter((name) => name !== "");
    },
  };
}

/** Cada segmento é codificado, a barra do caminho é preservada. */
function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

let cached: SupabaseClient | undefined;

export function getSupabaseClient(): SupabaseClient {
  cached ??= createSupabaseClient(readSupabaseConfig());
  return cached;
}

/** Só para teste: descarta o cliente memoizado entre casos. */
export function resetSupabaseClient(): void {
  cached = undefined;
}
