#!/usr/bin/env node
import { spawn } from "node:child_process";
import { constants as osConstants } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ID = "demo-project";
const ROOT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const FIREBASE_CLI = join(
  ROOT_DIR,
  "node_modules",
  "firebase-tools",
  "lib",
  "bin",
  "firebase.js"
);
const child = spawn(
  process.execPath,
  [FIREBASE_CLI, "emulators:start", "--project", PROJECT_ID],
  {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      GCLOUD_PROJECT: PROJECT_ID,
      GOOGLE_CLOUD_PROJECT: PROJECT_ID,
      FIREBASE_PROJECT_ID: PROJECT_ID,
    },
    stdio: "inherit",
  }
);

let receivedSignal;
const signals = ["SIGINT", "SIGTERM", "SIGHUP"];

for (const signal of signals) {
  process.on(signal, () => {
    receivedSignal ??= signal;
    child.kill(signal);
  });
}

child.on("error", (error) => {
  console.error(`Could not start the local Firebase CLI: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  for (const handledSignal of signals) {
    process.removeAllListeners(handledSignal);
  }
  process.exitCode = receivedSignal
    ? 128 + osConstants.signals[receivedSignal]
    : signal
      ? 128 + osConstants.signals[signal]
      : (code ?? 1);
});
