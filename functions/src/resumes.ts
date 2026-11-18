import { getStorage } from "firebase-admin/storage";
import type { Response } from "express";
import { ApiError } from "./errors";
import {
  mirrorResume,
  mirroredResumeAvailability,
  readMirroredResume,
} from "./redundancy";
import type { ResumeLanguage } from "./validation";

const RESUME_CACHE_CONTROL = "public, max-age=300";

export interface ResumeAvailability {
  ptBR: boolean;
  enUS: boolean;
}

/**
 * Nome do bucket dos currículos.
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

function storageUnavailable(error: unknown): ApiError {
  const bucket = resolveResumeBucket() ?? "bucket padrão do projeto";

  // Detalhe vai para o Cloud Logging (a resposta é pública: a página About
  // consulta a disponibilidade), então a mensagem devolvida traz só o bucket.
  console.error(`[resumes] falha no Storage (bucket=${bucket}):`, describeFailure(error));

  return new ApiError(
    502,
    "RESUME_STORAGE_UNAVAILABLE",
    `Resume service is unavailable. (bucket: ${bucket})`,
  );
}

function getResumeFile(language: ResumeLanguage) {
  const bucket = resolveResumeBucket();
  const storage = getStorage();

  return (bucket ? storage.bucket(bucket) : storage.bucket()).file(`resumes/${language}.pdf`);
}

async function storageObjectExists(language: ResumeLanguage): Promise<boolean> {
  const [exists] = await getResumeFile(language).exists();
  return exists;
}

export async function listResumeAvailability(
  checkExists: (language: ResumeLanguage) => Promise<boolean> = storageObjectExists,
  checkMirror: () => Promise<ResumeAvailability | null> = mirroredResumeAvailability,
): Promise<ResumeAvailability> {
  let primary: ResumeAvailability | null = null;
  let primaryError: unknown;

  try {
    const [ptBR, enUS] = await Promise.all([checkExists("ptBR"), checkExists("enUS")]);
    primary = { ptBR, enUS };
  } catch (error) {
    primaryError = error;
  }

  // O espelho responde mesmo quando o Storage do Firebase está fora: é o caso
  // em que essa checagem importa. `null` = espelho não configurado/fora.
  const mirror = await checkMirror();
  if (primary || mirror) {
    return {
      ptBR: Boolean(primary?.ptBR || mirror?.ptBR),
      enUS: Boolean(primary?.enUS || mirror?.enUS),
    };
  }

  throw storageUnavailable(primaryError);
}

export async function saveResume(language: ResumeLanguage, pdf: Buffer): Promise<void> {
  try {
    const file = getResumeFile(language);
    await file.save(pdf, {
      resumable: false,
      metadata: {
        contentType: "application/pdf",
        cacheControl: RESUME_CACHE_CONTROL,
        contentDisposition: `attachment; filename="resume-${language}.pdf"`,
      },
    });
  } catch (error) {
    throw storageUnavailable(error);
  }

  // Cópia de segurança fora do Google. Falha aqui não invalida o upload que já
  // aconteceu na fonte primária (fica registrada no log).
  await mirrorResume(language, pdf);
}

export async function sendResume(language: ResumeLanguage, response: Response): Promise<void> {
  const headers = {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="resume-${language}.pdf"`,
    "Cache-Control": RESUME_CACHE_CONTROL,
    "X-Content-Type-Options": "nosniff",
  };

  let primaryError: unknown;
  let primaryExists = false;
  let file: ReturnType<typeof getResumeFile> | undefined;

  try {
    file = getResumeFile(language);
    [primaryExists] = await file.exists();
  } catch (error) {
    primaryError = error;
  }

  if (primaryExists && file) {
    response.set({ ...headers });
    try {
      await new Promise<void>((resolve, reject) => {
        const stream = file.createReadStream();
        stream.once("error", reject);
        response.once("finish", resolve);
        response.once("close", resolve);
        stream.pipe(response);
      });
      return;
    } catch (error) {
      if (!response.headersSent) {
        throw storageUnavailable(error);
      }
      console.error("[resumes] falha ao enviar o PDF:", describeFailure(error));
      response.destroy();
      return;
    }
  }

  // Fonte primária sem o arquivo (ou fora do ar): serve a cópia do Supabase.
  let mirrored: Buffer | null = null;
  try {
    mirrored = await readMirroredResume(language);
  } catch (error) {
    console.error(
      "[resumes] espelho indisponível para o currículo:",
      describeFailure(error),
    );
  }

  if (mirrored) {
    response.set({ ...headers, "X-Resume-Source": "supabase" });
    response.status(200).end(mirrored);
    return;
  }

  if (primaryError !== undefined) throw storageUnavailable(primaryError);
  throw new ApiError(404, "RESUME_NOT_FOUND", "Requested resume was not found.");
}
