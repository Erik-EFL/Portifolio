import { getStorage } from "firebase-admin/storage";
import type { Response } from "express";
import { ApiError } from "./errors";
import type { ResumeLanguage } from "./validation";

const RESUME_CACHE_CONTROL = "public, max-age=300";

export interface ResumeAvailability {
  ptBR: boolean;
  enUS: boolean;
}

function getResumeFile(language: ResumeLanguage) {
  return getStorage().bucket().file(`resumes/${language}.pdf`);
}

async function storageObjectExists(language: ResumeLanguage): Promise<boolean> {
  const [exists] = await getResumeFile(language).exists();
  return exists;
}

export async function listResumeAvailability(
  checkExists: (language: ResumeLanguage) => Promise<boolean> = storageObjectExists,
): Promise<ResumeAvailability> {
  try {
    const [ptBR, enUS] = await Promise.all([checkExists("ptBR"), checkExists("enUS")]);
    return { ptBR, enUS };
  } catch {
    throw new ApiError(502, "RESUME_STORAGE_UNAVAILABLE", "Resume service is unavailable.");
  }
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
  } catch {
    throw new ApiError(502, "RESUME_STORAGE_UNAVAILABLE", "Resume service is unavailable.");
  }
}

export async function sendResume(language: ResumeLanguage, response: Response): Promise<void> {
  let file: ReturnType<typeof getResumeFile>;
  let exists: boolean;
  try {
    file = getResumeFile(language);
    [exists] = await file.exists();
  } catch {
    throw new ApiError(502, "RESUME_STORAGE_UNAVAILABLE", "Resume service is unavailable.");
  }
  if (!exists) throw new ApiError(404, "RESUME_NOT_FOUND", "Requested resume was not found.");

  response.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="resume-${language}.pdf"`,
    "Cache-Control": RESUME_CACHE_CONTROL,
    "X-Content-Type-Options": "nosniff",
  });
  try {
    await new Promise<void>((resolve, reject) => {
      const stream = file.createReadStream();
      stream.once("error", reject);
      response.once("finish", resolve);
      response.once("close", resolve);
      stream.pipe(response);
    });
  } catch {
    if (!response.headersSent) {
      throw new ApiError(502, "RESUME_STORAGE_UNAVAILABLE", "Resume service is unavailable.");
    }
    response.destroy();
  }
}
