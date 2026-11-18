/**
 * Camada de redundância: espelha o conteúdo (appbackend → Supabase) e os
 * currículos (Firebase Storage → Supabase Storage), e serve de fallback de
 * leitura quando a fonte primária está fora.
 *
 * Regra: escrita espelhada é *best-effort* — a resposta ao admin nunca falha
 * porque o espelho caiu (o conteúdo já está salvo na fonte primária, e o script
 * de sincronização reconcilia depois). Leitura de fallback propaga o erro para
 * quem chamou decidir entre usar a cópia e devolver a falha original.
 */
import { CONTENT_KEYS, type ResumeLanguage } from "./validation";
import {
  getSupabaseClient,
  type SupabaseClient,
  type SupabaseRow,
} from "./supabase";

export interface MirroredResumeAvailability {
  ptBR: boolean;
  enUS: boolean;
}

export interface RedundancyStatus {
  configured: boolean;
  rowsInMirror: number | null;
  rowsInPrimary: number | null;
  missingInMirror: string[];
  extraInMirror: string[];
  error: string | null;
}

const RESUME_FOLDER = "resumes";
const CONTENT_KEY_SET: ReadonlySet<string> = new Set(CONTENT_KEYS);

const describeFailure = (error: unknown): string =>
  error instanceof Error ? error.message : String(error ?? "erro desconhecido");

export interface ContentRowRecord {
  _id: string;
  key: string;
  value: unknown;
}

/** Caminho do objeto dentro do bucket do Supabase (`resumes/<idioma>.pdf`). */
export function resumeObjectPath(language: ResumeLanguage): string {
  return `${RESUME_FOLDER}/${language}.pdf`;
}

const toSupabaseRow = (row: ContentRowRecord): SupabaseRow => ({
  id: row._id,
  key: row.key,
  value: row.value,
});

/**
 * Extrai linhas persistidas de uma resposta do appbackend. O POST responde com
 * a lista criada (com `_id`); o PUT com a linha atualizada. Qualquer coisa fora
 * desse formato é ignorada — espelhar um `_id` inventado seria pior que não
 * espelhar nada.
 *
 * A coleção real tem linhas órfãs (`key` e `value` nulos, criadas pelo painel do
 * appbackend) que o site nunca leu: elas ficam fora do espelho, senão a
 * comparação entre as fontes acusaria divergência para sempre.
 */
export function toMirrorableRows(body: unknown): ContentRowRecord[] {
  const entries = Array.isArray(body) ? body : [body];
  const rows: ContentRowRecord[] = [];

  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null) continue;
    const { _id, key, value } = entry as Record<string, unknown>;
    if (typeof _id !== "string" || !_id) continue;
    if (typeof key !== "string" || !CONTENT_KEY_SET.has(key)) continue;
    rows.push({ _id, key, value });
  }

  return rows;
}

export async function mirrorRows(
  rows: ContentRowRecord[],
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  if (!client.configured || rows.length === 0) return;
  try {
    await client.upsertRows(rows.map(toSupabaseRow));
  } catch (error) {
    console.error(
      `[redundancy] falha ao espelhar ${rows.length} linha(s) no Supabase:`,
      describeFailure(error),
    );
  }
}

export async function mirrorRowDeletion(
  ids: string[],
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  if (!client.configured || ids.length === 0) return;
  try {
    await client.deleteRows(ids);
  } catch (error) {
    console.error(
      `[redundancy] falha ao remover ${ids.length} linha(s) do espelho:`,
      describeFailure(error),
    );
  }
}

/** Leitura do espelho no mesmo formato da fonte primária (`_id`). */
export async function readMirroredRows(
  client: SupabaseClient = getSupabaseClient(),
): Promise<ContentRowRecord[]> {
  const rows = await client.listRows();
  return rows.map(({ id, key, value }) => ({ _id: id, key, value }));
}

export async function mirrorResume(
  language: ResumeLanguage,
  pdf: Buffer,
  client: SupabaseClient = getSupabaseClient(),
): Promise<void> {
  if (!client.configured) return;
  try {
    await client.uploadObject(resumeObjectPath(language), pdf, "application/pdf");
  } catch (error) {
    console.error(
      `[redundancy] falha ao espelhar o currículo ${language} no Supabase:`,
      describeFailure(error),
    );
  }
}

/** `null` = o objeto não existe no espelho; erro = espelho indisponível. */
export async function readMirroredResume(
  language: ResumeLanguage,
  client: SupabaseClient = getSupabaseClient(),
): Promise<Buffer | null> {
  try {
    return await client.downloadObject(resumeObjectPath(language));
  } catch (error) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 400) return null;
    throw error;
  }
}

/**
 * Disponibilidade pelo espelho. `null` quando não há configuração ou o Storage
 * do Supabase não respondeu (quem chama decide se a fonte primária basta).
 */
export async function mirroredResumeAvailability(
  client: SupabaseClient = getSupabaseClient(),
): Promise<MirroredResumeAvailability | null> {
  if (!client.configured) return null;
  try {
    const names = await client.listObjectNames(RESUME_FOLDER);
    const files = new Set(names);
    // A listagem do Storage devolve o nome RELATIVO ao prefixo pedido
    // ("ptBR.pdf"); o mock dos testes devolvia o caminho inteiro. Aceitar as
    // duas formas evita depender desse detalhe.
    const hasResume = (language: ResumeLanguage): boolean =>
      files.has(`${language}.pdf`) || files.has(`${RESUME_FOLDER}/${language}.pdf`);
    return {
      ptBR: hasResume("ptBR"),
      enUS: hasResume("enUS"),
    };
  } catch (error) {
    console.error(
      "[redundancy] falha ao consultar o Storage do Supabase:",
      describeFailure(error),
    );
    return null;
  }
}

/**
 * Compara as duas fontes de conteúdo. Erro de rede em qualquer lado é devolvido
 * no campo `error` (o painel mostra o diagnóstico em vez de um 502 opaco).
 */
export async function checkRedundancy(
  readPrimary: () => Promise<ContentRowRecord[]>,
  client: SupabaseClient = getSupabaseClient(),
): Promise<RedundancyStatus> {
  const status: RedundancyStatus = {
    configured: client.configured,
    rowsInMirror: null,
    rowsInPrimary: null,
    missingInMirror: [],
    extraInMirror: [],
    error: null,
  };

  if (!client.configured) return status;

  let primary: ContentRowRecord[] | null = null;
  try {
    primary = await readPrimary();
    status.rowsInPrimary = primary.length;
  } catch (error) {
    status.error = `fonte primária: ${describeFailure(error)}`;
  }

  let mirror: ContentRowRecord[] | null = null;
  try {
    mirror = await readMirroredRows(client);
    status.rowsInMirror = mirror.length;
  } catch (error) {
    const mirrorError = `espelho: ${describeFailure(error)}`;
    status.error = status.error ? `${status.error}; ${mirrorError}` : mirrorError;
  }

  if (primary && mirror) {
    const primaryIds = new Set(primary.map((row) => row._id));
    const mirrorIds = new Set(mirror.map((row) => row._id));
    status.missingInMirror = primary
      .filter((row) => !mirrorIds.has(row._id))
      .map((row) => row._id);
    status.extraInMirror = mirror
      .filter((row) => !primaryIds.has(row._id))
      .map((row) => row._id);
  }

  return status;
}
