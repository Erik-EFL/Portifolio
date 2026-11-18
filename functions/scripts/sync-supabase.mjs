#!/usr/bin/env node
/**
 * Copia o conteúdo do appbackend para o espelho no Supabase (backfill) e
 * compara as duas fontes. É o mesmo trabalho que `GET /api/redundancy` faz no
 * painel, mas sem depender do Firebase Auth — útil no primeiro deploy e para
 * reparar depois de uma escrita que falhou no espelho.
 *
 *   node functions/scripts/sync-supabase.mjs             # copia o que faltar/divergir
 *   node functions/scripts/sync-supabase.mjs --dry-run   # só relata
 *   node functions/scripts/sync-supabase.mjs --prune     # também remove sobras do espelho
 *
 * Lê SUPABASE_URL, SUPABASE_SECRET_KEY e APPBACKEND_COLLECTION_ID do ambiente e,
 * quando ausentes, de functions/.secret.local (git-ignored). Nunca imprime a
 * chave.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FUNCTIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPBACKEND_BASE_URL = "https://v1.appbackend.io/v1/rows";
const ROWS_TABLE = "content_rows";
// Mesmas chaves de functions/src/validation.ts. Linha com `key` nula ou fora
// dessa lista é órfã do painel do appbackend: o site nunca leu e o espelho não
// precisa copiar.
const CONTENT_KEYS = new Set([
  "navigation",
  "footer",
  "footerCopyright",
  "home",
  "about",
  "skills",
  "skillsDetails",
]);
const PER_PAGE = 100;
const MAX_PAGES = 20;

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const prune = args.has("--prune");

function readSecretLocal() {
  try {
    const raw = readFileSync(join(FUNCTIONS_DIR, ".secret.local"), "utf8");
    const values = {};
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const separator = trimmed.indexOf("=");
      values[trimmed.slice(0, separator).trim()] = trimmed
        .slice(separator + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
    }
    return values;
  } catch {
    return {};
  }
}

const secretLocal = readSecretLocal();
const env = (name) => process.env[name]?.trim() || secretLocal[name] || "";

const supabaseUrl = env("SUPABASE_URL").replace(/\/+$/, "");
const supabaseKey = env("SUPABASE_SECRET_KEY") || env("SUPABASE_SERVICE_ROLE_KEY");
const collectionId = env("APPBACKEND_COLLECTION_ID");

const missing = [
  ["SUPABASE_URL", supabaseUrl],
  ["SUPABASE_SECRET_KEY", supabaseKey],
  ["APPBACKEND_COLLECTION_ID", collectionId],
].filter(([, value]) => !value);

if (missing.length > 0) {
  console.error(
    `Faltam valores: ${missing.map(([name]) => name).join(", ")}. ` +
      "Defina no ambiente ou em functions/.secret.local.",
  );
  process.exit(1);
}

async function readPrimaryRows() {
  const rows = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetch(
      `${APPBACKEND_BASE_URL}/${encodeURIComponent(collectionId)}?page=${page}&_=${Date.now()}`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!response.ok) {
      throw new Error(`appbackend respondeu ${response.status}`);
    }
    const body = await response.json();
    if (Array.isArray(body)) {
      rows.push(...body);
      break;
    }
    const data = Array.isArray(body?.data) ? body.data : [];
    rows.push(...data);
    const count = typeof body?.count === "number" ? body.count : rows.length;
    const perPage = typeof body?.perPage === "number" && body.perPage > 0 ? body.perPage : PER_PAGE;
    if (rows.length >= count || data.length < perPage) break;
  }
  return rows.filter((row) => typeof row?.key === "string" && CONTENT_KEYS.has(row.key));
}

function supabaseHeaders(extra = {}) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    ...extra,
  };
}

async function readMirrorRows() {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${ROWS_TABLE}?select=id,key,value&order=id.asc&limit=1000`,
    { headers: supabaseHeaders(), signal: AbortSignal.timeout(15_000) },
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Supabase respondeu ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
  const body = await response.json();
  return Array.isArray(body) ? body : [];
}

async function upsertRows(rows) {
  const response = await fetch(`${supabaseUrl}/rest/v1/${ROWS_TABLE}?on_conflict=id`, {
    method: "POST",
    headers: supabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    }),
    body: JSON.stringify(rows),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`upsert falhou (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }
}

async function deleteRow(id) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/${ROWS_TABLE}?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE", headers: supabaseHeaders({ Prefer: "return=minimal" }) },
  );
  if (!response.ok) throw new Error(`delete de ${id} falhou (${response.status})`);
}

const stableValue = (value) => JSON.stringify(value ?? null);

try {
  const [primary, mirror] = await Promise.all([readPrimaryRows(), readMirrorRows()]);
  const mirrorById = new Map(mirror.map((row) => [row.id, row]));
  const primaryIds = new Set(primary.map((row) => row._id));

  const pending = primary.filter((row) => {
    const mirrored = mirrorById.get(row._id);
    if (!mirrored) return true;
    return mirrored.key !== row.key || stableValue(mirrored.value) !== stableValue(row.value);
  });
  const extra = mirror.filter((row) => !primaryIds.has(row.id));

  console.log(`Fonte primária: ${primary.length} linha(s)`);
  console.log(`Espelho:        ${mirror.length} linha(s)`);
  console.log(`A copiar:       ${pending.length} (${pending.map((row) => row.key).join(", ") || "—"})`);
  console.log(`Sobrando:       ${extra.length} (${extra.map((row) => row.id).join(", ") || "—"})`);

  if (dryRun) {
    console.log("--dry-run: nada foi gravado.");
    process.exit(0);
  }

  if (pending.length > 0) {
    const now = new Date().toISOString();
    await upsertRows(
      pending.map((row) => ({
        id: row._id,
        key: row.key,
        value: row.value,
        updated_at: now,
      })),
    );
    console.log(`Copiadas ${pending.length} linha(s) para o Supabase.`);
  }

  if (prune && extra.length > 0) {
    for (const row of extra) await deleteRow(row.id);
    console.log(`Removidas ${extra.length} sobra(s) do espelho.`);
  } else if (extra.length > 0) {
    console.log("Use --prune para remover as sobras do espelho.");
  }

  console.log("Sincronização concluída.");
} catch (error) {
  console.error("Falha na sincronização:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
