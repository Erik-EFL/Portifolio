import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveResumeBucket } from "./resumes";

const env = (values: Record<string, string | undefined>): NodeJS.ProcessEnv =>
  values as NodeJS.ProcessEnv;

describe("resolveResumeBucket", () => {
  it("prefere o override explícito", () => {
    const bucket = resolveResumeBucket(
      env({
        RESUME_STORAGE_BUCKET: "meu-bucket.firebasestorage.app",
        FIREBASE_CONFIG: JSON.stringify({
          storageBucket: "outro.appspot.com",
        }),
      }),
    );

    assert.equal(bucket, "meu-bucket.firebasestorage.app");
  });

  it("usa o storageBucket que o Firebase injeta na function", () => {
    const bucket = resolveResumeBucket(
      env({
        FIREBASE_CONFIG: JSON.stringify({
          projectId: "portifolio-7b841",
          storageBucket: "portifolio-7b841.firebasestorage.app",
        }),
      }),
    );

    assert.equal(bucket, "portifolio-7b841.firebasestorage.app");
  });

  it("cai no padrão do SDK quando não há configuração", () => {
    assert.equal(resolveResumeBucket(env({})), undefined);
  });

  it("ignora FIREBASE_CONFIG malformado ou sem bucket", () => {
    assert.equal(resolveResumeBucket(env({ FIREBASE_CONFIG: "{nao-e-json" })), undefined);
    assert.equal(
      resolveResumeBucket(env({ FIREBASE_CONFIG: JSON.stringify({ projectId: "x" }) })),
      undefined,
    );
  });

  it("ignora valores em branco", () => {
    assert.equal(
      resolveResumeBucket(env({ RESUME_STORAGE_BUCKET: "   ", FIREBASE_CONFIG: "{}" })),
      undefined,
    );
  });
});
