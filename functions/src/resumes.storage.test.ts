import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Response } from "express";
import { ApiError } from "./errors";
import {
  listResumeAvailability,
  saveResume,
  sendResume,
  type ResumeStore,
} from "./resumes";
import type { ResumeLanguage } from "./validation";

interface FakeStore extends ResumeStore {
  saved: Buffer[];
  reads: ResumeLanguage[];
}

function createStore(
  name: ResumeStore["name"],
  overrides: Partial<ResumeStore> = {},
): FakeStore {
  const saved: Buffer[] = [];
  const reads: ResumeLanguage[] = [];

  return {
    name,
    saved,
    reads,
    save: async (_language, pdf) => {
      saved.push(pdf);
    },
    read: async (language) => {
      reads.push(language);
      return null;
    },
    availability: async () => ({ ptBR: false, enUS: false }),
    ...overrides,
  };
}

function createResponse() {
  const captured: {
    headers: Record<string, string>;
    status: number;
    body: Buffer | null;
  } = { headers: {}, status: 0, body: null };

  const response = {
    set(headers: Record<string, string>) {
      Object.assign(captured.headers, headers);
      return response;
    },
    status(code: number) {
      captured.status = code;
      return response;
    },
    end(body?: Buffer) {
      captured.body = body ?? null;
      return response;
    },
  };

  return { response: response as unknown as Response, captured };
}

const pdf = Buffer.from("%PDF-1.4 conteudo");

describe("saveResume", () => {
  it("grava no principal e replica na cópia", async () => {
    const primary = createStore("supabase");
    const copy = createStore("firebase");

    await saveResume("ptBR", pdf, [primary, copy]);

    assert.equal(primary.saved.length, 1);
    assert.equal(copy.saved.length, 1);
    assert.ok(primary.saved[0].equals(pdf));
  });

  it("falha do principal vira 502 e a cópia nem é tentada", async () => {
    const primary = createStore("supabase", {
      save: async () => {
        throw new Error("supabase fora");
      },
    });
    const copy = createStore("firebase");

    await assert.rejects(() => saveResume("ptBR", pdf, [primary, copy]), (error: unknown) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 502);
      assert.equal(error.code, "RESUME_STORAGE_UNAVAILABLE");
      return true;
    });
    assert.equal(copy.saved.length, 0);
  });

  it("falha da cópia não derruba o upload", async () => {
    const primary = createStore("supabase");
    const copy = createStore("firebase", {
      save: async () => {
        throw new Error("bucket do Firebase não existe");
      },
    });

    await saveResume("enUS", pdf, [primary, copy]);

    assert.equal(primary.saved.length, 1);
  });
});

describe("sendResume", () => {
  it("serve do principal e marca a origem", async () => {
    const primary = createStore("supabase", { read: async () => pdf });
    const copy = createStore("firebase", { read: async () => pdf });
    const { response, captured } = createResponse();

    await sendResume("ptBR", response, [primary, copy]);

    assert.equal(captured.status, 200);
    assert.equal(captured.headers["X-Resume-Source"], "supabase");
    assert.ok(captured.body?.equals(pdf));
    assert.equal(copy.reads.length, 0);
  });

  it("cai na cópia quando o principal não tem o arquivo", async () => {
    const primary = createStore("supabase");
    const copy = createStore("firebase", { read: async () => pdf });
    const { response, captured } = createResponse();

    await sendResume("enUS", response, [primary, copy]);

    assert.equal(captured.headers["X-Resume-Source"], "firebase");
    assert.ok(captured.body?.equals(pdf));
  });

  it("cai na cópia quando o principal está fora do ar", async () => {
    const primary = createStore("supabase", {
      read: async () => {
        throw new Error("supabase fora");
      },
    });
    const copy = createStore("firebase", { read: async () => pdf });
    const { response, captured } = createResponse();

    await sendResume("ptBR", response, [primary, copy]);

    assert.equal(captured.status, 200);
    assert.equal(captured.headers["X-Resume-Source"], "firebase");
  });

  it("404 quando nenhuma fonte tem o arquivo", async () => {
    const { response } = createResponse();

    await assert.rejects(
      () => sendResume("ptBR", response, [createStore("supabase"), createStore("firebase")]),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 404);
        assert.equal(error.code, "RESUME_NOT_FOUND");
        return true;
      },
    );
  });

  it("502 quando todas as fontes falham", async () => {
    const offline = () => {
      throw new Error("fora do ar");
    };
    const { response } = createResponse();

    await assert.rejects(
      () =>
        sendResume("ptBR", response, [
          createStore("supabase", { read: async () => offline() }),
          createStore("firebase", { read: async () => offline() }),
        ]),
      (error: unknown) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 502);
        return true;
      },
    );
  });
});

describe("listResumeAvailability", () => {
  it("soma as fontes: o que existe em uma serve", async () => {
    const primary = createStore("supabase", {
      availability: async () => ({ ptBR: true, enUS: false }),
    });
    const copy = createStore("firebase", {
      availability: async () => ({ ptBR: false, enUS: true }),
    });

    assert.deepEqual(await listResumeAvailability([primary, copy]), {
      ptBR: true,
      enUS: true,
    });
  });

  it("ignora a fonte que falhou e responde com a outra", async () => {
    const primary = createStore("supabase", {
      availability: async () => {
        throw new Error("supabase fora");
      },
    });
    const copy = createStore("firebase", {
      availability: async () => ({ ptBR: true, enUS: true }),
    });

    assert.deepEqual(await listResumeAvailability([primary, copy]), {
      ptBR: true,
      enUS: true,
    });
  });

  it("502 quando nenhuma fonte responde", async () => {
    const offline = createStore("supabase", {
      availability: async () => {
        throw new Error("fora do ar");
      },
    });
    const nulled = createStore("firebase", { availability: async () => null });

    await assert.rejects(() => listResumeAvailability([offline, nulled]), ApiError);
  });
});
