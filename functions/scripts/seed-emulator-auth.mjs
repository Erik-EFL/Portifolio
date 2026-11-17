#!/usr/bin/env node
/**
 * Creates (or repairs) the local admin account in the Firebase Auth emulator.
 *
 * The Functions API requires a verified email that appears in ADMIN_EMAILS, and
 * accounts created through the emulator UI are not verified, so seed it here:
 *
 *   node functions/scripts/seed-emulator-auth.mjs [email] [password]
 *
 * Defaults: first email from functions/.secret.local ADMIN_EMAILS and the
 * password below. Only works against a running Auth emulator.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const DEFAULT_PASSWORD = "admin123456";
const FUNCTIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
process.env.GCLOUD_PROJECT ??= process.env.FIREBASE_PROJECT_ID ?? "demo-project";

function readAdminEmailsFromSecretLocal() {
  try {
    const raw = readFileSync(join(FUNCTIONS_DIR, ".secret.local"), "utf8");
    const line = raw
      .split(/\r?\n/)
      .find((entry) => entry.trim().startsWith("ADMIN_EMAILS="));
    if (!line) return [];
    return line
      .slice(line.indexOf("=") + 1)
      .replace(/^["']|["']$/g, "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const email =
  process.argv[2]?.trim().toLowerCase() ??
  readAdminEmailsFromSecretLocal()[0] ??
  "admin@example.com";
const password = process.argv[3] ?? DEFAULT_PASSWORD;

if (getApps().length === 0) {
  initializeApp({ projectId: process.env.GCLOUD_PROJECT });
}

const auth = getAuth();

try {
  const existing = await auth.getUserByEmail(email).catch(() => null);

  if (existing) {
    await auth.updateUser(existing.uid, { password, emailVerified: true });
    console.log(`Updated emulator admin ${email} (uid ${existing.uid}, email verified).`);
  } else {
    const created = await auth.createUser({ email, password, emailVerified: true });
    console.log(`Created emulator admin ${email} (uid ${created.uid}, email verified).`);
  }

  console.log(`Emulator: ${process.env.FIREBASE_AUTH_EMULATOR_HOST}`);
  console.log(`Password: ${password}`);
} catch (error) {
  console.error("Could not seed the admin account.");
  console.error(
    "Start the emulators first (npm run firebase:emulators) and confirm the Auth one is on port 9099."
  );
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
