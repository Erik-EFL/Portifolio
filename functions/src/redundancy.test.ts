import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRedundancy,
  mirrorRowDeletion,
  mirrorRows,
  readMirroredRows,
  readResumeFromSupabase,
  resumeObjectPath,
  saveResumeToSupabase,
  supabaseResumeAvailability,
  toMirrorableRows,
} from "./redundancy";
import { SupabaseError, type SupabaseClient, type SupabaseRow } from "./supabase";

interface RecordingClient extends SupabaseClient {
  upserted: SupabaseRow[][];
  deleted: string[][];
  uploaded: Array<{ path: string; contentType: string; size: number }>;
}

function createClient(overrides: Partial<SupabaseClient> = {}, configured = true): RecordingClient {
  const upserted: SupabaseRow[][] = [];
  const deleted: string[][] = [];
  const uploaded: Array<{ path: string; contentType: string; size: number }> = [];

  return {
    configured,
    upserted,
    deleted,
    uploaded,
    upsertRows: async (rows) => {
      upserted.push(rows);
    },
    deleteRows: async (ids) => {
      deleted.push(ids);
    },
    listRows: async () => [],
    uploadObject: async (path, body, contentType) => {
      uploaded.push({ path, contentType, size: body.length });
    },
    downloadObject: async () => Buffer.from("%PDF-1.4"),
    listObjectNames: async () => [],
    ...overrides,
  };
}

describe("toMirrorableRows", () => {
  it("aceita array e objeto, mantendo só linha persistida", () => {
    const rows = toMirrorableRows([
      { _id: "r1", key: "home", value: { a: 1 } },
      { key: "about", value: {} },
      { _id: "", key: "home", value: {} },
      null,
    ]);

    assert.deepEqual(rows, [{ _id: "r1", key: "home", value: { a: 1 } }]);
    assert.deepEqual(toMirrorableRows({ _id: "r2", key: "skills", value: [] }), [
      { _id: "r2", key: "skills", value: [] },
    ]);
    assert.deepEqual(toMirrorableRows(null), []);
    assert.deepEqual(toMirrorableRows(undefined), []);
  });

  it("deixa de fora a linha órfã da coleção (key nula ou desconhecida)", () => {
    // O appbackend tem linhas criadas pelo painel dele com key/value nulos:
    // espelhá-las faria a comparação entre fontes acusar divergência eterna.
    const rows = toMirrorableRows([
      { _id: "r1", key: null, value: null },
      { _id: "r2", key: "chave-antiga", value: {} },
      { _id: "r3", key: "home", value: {} },
    ]);

    assert.deepEqual(rows, [{ _id: "r3", key: "home", value: {} }]);
  });
});

describe("espelho de escrita (conteúdo)", () => {
  it("não faz nada quando a redundância está desligada", async () => {
    const client = createClient({}, false);

    await mirrorRows([{ _id: "r1", key: "home", value: {} }], client);
    await mirrorRowDeletion(["r1"], client);

    assert.equal(client.upserted.length, 0);
    assert.equal(client.deleted.length, 0);
  });

  it("mapeia _id para id no upsert e remove por id", async () => {
    const client = createClient();

    await mirrorRows([{ _id: "r1", key: "home", value: { t: 1 } }], client);
    await mirrorRowDeletion(["r1", "r2"], client);

    assert.deepEqual(client.upserted[0], [{ id: "r1", key: "home", value: { t: 1 } }]);
    assert.deepEqual(client.deleted[0], ["r1", "r2"]);
  });

  it("engole a falha do espelho: a escrita primária já aconteceu", async () => {
    const client = createClient({
      upsertRows: async () => {
        throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
      },
      deleteRows: async () => {
        throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
      },
    });

    await mirrorRows([{ _id: "r1", key: "home", value: {} }], client);
    await mirrorRowDeletion(["r1"], client);
  });
});

describe("currículos no Supabase (fonte principal)", () => {
  it("grava o PDF no caminho do bucket", async () => {
    const client = createClient();

    await saveResumeToSupabase("enUS", Buffer.from("%PDF-1.4"), client);

    assert.deepEqual(client.uploaded, [
      { path: "resumes/enUS.pdf", contentType: "application/pdf", size: 8 },
    ]);
  });

  it("propaga a falha do upload: aqui não há fonte anterior", async () => {
    const client = createClient({
      uploadObject: async () => {
        throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
      },
    });

    await assert.rejects(() => saveResumeToSupabase("ptBR", Buffer.from("x"), client), SupabaseError);
  });
});

describe("espelho de leitura", () => {
  it("devolve as linhas no formato do conteúdo", async () => {
    const client = createClient({
      listRows: async () => [
        { id: "r1", key: "home", value: { a: 1 } },
        { id: "r2", key: "about", value: null },
      ],
    });

    assert.deepEqual(await readMirroredRows(client), [
      { _id: "r1", key: "home", value: { a: 1 } },
      { _id: "r2", key: "about", value: null },
    ]);
  });

  it("trata 404 do objeto como ausência e propaga o resto", async () => {
    const missing = createClient({
      downloadObject: async () => {
        throw new SupabaseError(404, "SUPABASE_REQUEST_FAILED", "not found");
      },
    });
    const offline = createClient({
      downloadObject: async () => {
        throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
      },
    });

    assert.equal(await readResumeFromSupabase("ptBR", missing), null);
    await assert.rejects(() => readResumeFromSupabase("ptBR", offline), SupabaseError);
  });

  it("resume o caminho do currículo por idioma", () => {
    assert.equal(resumeObjectPath("ptBR"), "resumes/ptBR.pdf");
    assert.equal(resumeObjectPath("enUS"), "resumes/enUS.pdf");
  });

  it("calcula a disponibilidade pelo bucket (nome relativo ao prefixo)", async () => {
    // A API real devolve "ptBR.pdf" para o prefixo "resumes"; o caminho inteiro
    // também é aceito.
    const client = createClient({
      listObjectNames: async () => ["ptBR.pdf", "outro.pdf"],
    });

    assert.deepEqual(await supabaseResumeAvailability(client), {
      ptBR: true,
      enUS: false,
    });
  });

  it("devolve null sem configuração ou com Storage fora", async () => {
    assert.equal(await supabaseResumeAvailability(createClient({}, false)), null);
    assert.equal(
      await supabaseResumeAvailability(
        createClient({
          listObjectNames: async () => {
            throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
          },
        }),
      ),
      null,
    );
  });
});

describe("checkRedundancy", () => {
  it("reporta desligado sem configuração", async () => {
    const status = await checkRedundancy(async () => [], createClient({}, false));

    assert.deepEqual(status, {
      configured: false,
      rowsInMirror: null,
      rowsInPrimary: null,
      missingInMirror: [],
      extraInMirror: [],
      error: null,
    });
  });

  it("compara as duas fontes por id", async () => {
    const client = createClient({
      listRows: async () => [
        { id: "r1", key: "home", value: {} },
        { id: "r9", key: "sobrando", value: {} },
      ],
    });

    const status = await checkRedundancy(
      async () => [
        { _id: "r1", key: "home", value: {} },
        { _id: "r2", key: "about", value: {} },
      ],
      client,
    );

    assert.equal(status.configured, true);
    assert.equal(status.rowsInPrimary, 2);
    assert.equal(status.rowsInMirror, 2);
    assert.deepEqual(status.missingInMirror, ["r2"]);
    assert.deepEqual(status.extraInMirror, ["r9"]);
    assert.equal(status.error, null);
  });

  it("acumula o erro de cada fonte em vez de lançar", async () => {
    const client = createClient({
      listRows: async () => {
        throw new SupabaseError(502, "SUPABASE_UNAVAILABLE", "fora do ar");
      },
    });

    const status = await checkRedundancy(async () => {
      throw new Error("appbackend recusou");
    }, client);

    assert.equal(status.rowsInPrimary, null);
    assert.equal(status.rowsInMirror, null);
    assert.match(status.error ?? "", /fonte primária: appbackend recusou/);
    assert.match(status.error ?? "", /espelho: fora do ar/);
  });
});
