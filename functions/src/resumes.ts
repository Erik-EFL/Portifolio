import { getStorage } from "firebase-admin/storage";
import type { Response } from "express";
import { ApiError } from "./errors";
import {
  readResumeFromSupabase,
  saveResumeToSupabase,
  supabaseResumeAvailability,
} from "./redundancy";
import { getSupabaseClient } from "./supabase";
import type { ResumeLanguage } from "./validation";

const RESUME_CACHE_CONTROL = "public, max-age=300";

export interface ResumeAvailability {
  ptBR: boolean;
  enUS: boolean;
}

/**
 * Uma fonte de currículo. O PRIMEIRO store da lista é a fonte principal (recebe
 * o upload e responde ao download); os seguintes são cópias.
 *
 * Hoje: Supabase Storage é principal e o Firebase Storage guarda a cópia. Quando
 * o Supabase não está configurado, o Firebase volta a ser o único destino — é o
 * comportamento antigo, sem espelho.
 */
export interface ResumeStore {
  readonly name: "supabase" | "firebase";
  save(language: ResumeLanguage, pdf: Buffer): Promise<void>;
  /** `null` = não existe ali; erro = a fonte está fora do ar. */
  read(language: ResumeLanguage): Promise<Buffer | null>;
  /** `null` = não foi possível consultar esta fonte. */
  availability(): Promise<ResumeAvailability | null>;
}

/**
 * Nome do bucket dos currículos no Firebase.
 *
 * `getStorage().bucket()` sem argumento cai no bucket padrão do Admin SDK, que
 * em projeto novo do Firebase é `<projeto>.appspot.com` — mas o bucket que existe
 * de verdade é `<projeto>.firebasestorage.app`. Com o nome errado toda chamada de
 * Storage falha e o admin só mostrava "Resume service is unavailable".
 *
 * Ordem: RESUME_STORAGE_BUCKET (override explícito) → storageBucket do
 * FIREBASE_CONFIG (que o Firebase injeta na function) → padrão do SDK.
 */
export function resolveResumeBucket(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const explicit = env.RESUME_STORAGE_BUCKET?.trim();
  if (explicit) return explicit;

  const rawConfig = env.FIREBASE_CONFIG;
  if (!rawConfig) return undefined;

  try {
    const config: unknown = JSON.parse(rawConfig);
    if (config && typeof config === "object") {
      const bucket = (config as { storageBucket?: unknown }).storageBucket;
      if (typeof bucket === "string" && bucket.trim()) return bucket.trim();
    }
  } catch {
    // FIREBASE_CONFIG malformado: cai no padrão do SDK
  }

  return undefined;
}

function describeFailure(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error ?? "erro desconhecido");
}

function storageUnavailable(error: unknown, source = "storage"): ApiError {
  const bucket =
    source === "firebase"
      ? `bucket: ${resolveResumeBucket() ?? "padrão do projeto"}`
      : `fonte: ${source}`;

  // Detalhe vai para o Cloud Logging (a resposta é pública: a página About
  // consulta a disponibilidade), então a mensagem devolvida traz só a origem.
  console.error(`[resumes] falha no Storage (${bucket}):`, describeFailure(error));

  return new ApiError(
    502,
    "RESUME_STORAGE_UNAVAILABLE",
    `Resume service is unavailable. (${bucket})`,
  );
}

function getResumeFile(language: ResumeLanguage) {
  const bucket = resolveResumeBucket();
  const storage = getStorage();

  return (bucket ? storage.bucket(bucket) : storage.bucket()).file(`resumes/${language}.pdf`);
}

export const firebaseResumeStore: ResumeStore = {
  name: "firebase",

  async save(language, pdf) {
    await getResumeFile(language).save(pdf, {
      resumable: false,
      metadata: {
        contentType: "application/pdf",
        cacheControl: RESUME_CACHE_CONTROL,
        contentDisposition: `attachment; filename="resume-${language}.pdf"`,
      },
    });
  },

  async read(language) {
    const file = getResumeFile(language);
    const [exists] = await file.exists();
    if (!exists) return null;
    const [contents] = await file.download();
    return contents;
  },

  async availability() {
    const [ptBR, enUS] = await Promise.all([
      getResumeFile("ptBR").exists().then(([exists]) => exists),
      getResumeFile("enUS").exists().then(([exists]) => exists),
    ]);
    return { ptBR, enUS };
  },
};

export const supabaseResumeStore: ResumeStore = {
  name: "supabase",

  async save(language, pdf) {
    await saveResumeToSupabase(language, pdf);
  },

  async read(language) {
    return readResumeFromSupabase(language);
  },

  async availability() {
    return supabaseResumeAvailability();
  },
};

/** Supabase primeiro (principal), Firebase como cópia. */
export function createResumeStores(): ResumeStore[] {
  return getSupabaseClient().configured
    ? [supabaseResumeStore, firebaseResumeStore]
    : [firebaseResumeStore];
}

export async function listResumeAvailability(
  stores: ResumeStore[] = createResumeStores(),
): Promise<ResumeAvailability> {
  const results = await Promise.all(
    stores.map((store) =>
      store.availability().catch((error: unknown) => {
        console.error(
          `[resumes] disponibilidade indisponível em ${store.name}:`,
          describeFailure(error),
        );
        return null;
      }),
    ),
  );

  if (results.every((result) => result === null)) {
    throw storageUnavailable(new Error("nenhuma fonte de currículo respondeu"), "todas");
  }

  return {
    ptBR: results.some((result) => result?.ptBR === true),
    enUS: results.some((result) => result?.enUS === true),
  };
}

/**
 * Grava no primeiro store (principal) e replica nos demais. Falha da cópia vai
 * para o log: o upload já está garantido na fonte principal.
 */
export async function saveResume(
  language: ResumeLanguage,
  pdf: Buffer,
  stores: ResumeStore[] = createResumeStores(),
): Promise<void> {
  const [primary, ...copies] = stores;

  try {
    await primary.save(language, pdf);
  } catch (error) {
    throw storageUnavailable(error, primary.name);
  }

  for (const copy of copies) {
    try {
      await copy.save(language, pdf);
    } catch (error) {
      console.error(
        `[resumes] falha ao copiar o currículo para ${copy.name} (principal já gravou):`,
        describeFailure(error),
      );
    }
  }
}

export async function sendResume(
  language: ResumeLanguage,
  response: Response,
  stores: ResumeStore[] = createResumeStores(),
): Promise<void> {
  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="resume-${language}.pdf"`,
    "Cache-Control": RESUME_CACHE_CONTROL,
    "X-Content-Type-Options": "nosniff",
  };

  let failures = 0;

  for (const store of stores) {
    let pdf: Buffer | null = null;
    try {
      pdf = await store.read(language);
    } catch (error) {
      failures += 1;
      console.error(
        `[resumes] ${store.name} não respondeu para ${language}:`,
        describeFailure(error),
      );
      continue;
    }

    if (!pdf) continue;

    response.set({ ...headers, "X-Resume-Source": store.name });
    response.status(200).end(pdf);
    return;
  }

  if (failures === stores.length) {
    throw storageUnavailable(new Error("todas as fontes falharam"), "todas");
  }

  throw new ApiError(404, "RESUME_NOT_FOUND", "Requested resume was not found.");
}
