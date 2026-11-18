import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SupabaseError,
  createSupabaseClient,
  readSupabaseConfig,
  type SupabaseConfig,
} from "./supabase";

const env = (values: Record<string, string | undefined>): NodeJS.ProcessEnv =>
  values as NodeJS.ProcessEnv;

const CONFIG: SupabaseConfig = {
  url: "https://projeto.supabase.co",
  secretKey: "sb_secret_teste",
  rowsTable: "content_rows",
  bucket: "resume",
};

interface Call {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
}

/** `fetch` falso: registra as chamadas e devolve respostas na ordem dada. */
function createFetch(responses: Array<() => Response | Promise<Response>>) {
  const calls: Call[] = [];
  let index = 0;

  const fakeFetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((value, key) => {
      headers[key] = value;
    });
    calls.push({
      url: String(input),
      method: init?.method ?? "GET",
      headers,
      body: typeof init?.body === "string" ? init.body : undefined,
    });
    const next = responses[index++];
    if (!next) throw new Error("fetch chamado mais vezes que o esperado");
    return next();
  }) as typeof fetch;

  return { fakeFetch, calls };
}

const json = (body: unknown, status = 200): (() => Response) =>
  () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });

describe("readSupabaseConfig", () => {
  it("desliga a redundância sem a chave secreta", () => {
    // A chave publicável (publishable/anon) não escreve nem ignora RLS:
    // aceitá-la criaria um espelho que falha em silêncio.
    assert.equal(
      readSupabaseConfig(
        env({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_KEY: "sb_publishable_x" }),
      ),
      null,
    );
  });

  it("exige uma URL http(s) válida", () => {
    assert.equal(
      readSupabaseConfig(env({ SUPABASE_URL: "nao-e-url", SUPABASE_SECRET_KEY: "k" })),
      null,
    );
    assert.equal(
      readSupabaseConfig(env({ SUPABASE_URL: "ftp://x.supabase.co", SUPABASE_SECRET_KEY: "k" })),
      null,
    );
  });

  it("normaliza a URL e aplica os padrões", () => {
    const config = readSupabaseConfig(
      env({ SUPABASE_URL: "  https://projeto.supabase.co/  ", SUPABASE_SECRET_KEY: " k " }),
    );

    assert.deepEqual(config, {
      url: "https://projeto.supabase.co",
      secretKey: "k",
      rowsTable: "content_rows",
      bucket: "resume",
    });
  });

  it("respeita tabela e bucket alternativos", () => {
    const config = readSupabaseConfig(
      env({
        SUPABASE_URL: "https://projeto.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "legacy",
        SUPABASE_ROWS_TABLE: "conteudo",
        SUPABASE_STORAGE_BUCKET: "curriculos",
      }),
    );

    assert.equal(config?.secretKey, "legacy");
    assert.equal(config?.rowsTable, "conteudo");
    assert.equal(config?.bucket, "curriculos");
  });
});

describe("createSupabaseClient", () => {
  it("não chama a rede quando não está configurado", async () => {
    const { fakeFetch, calls } = createFetch([]);
    const client = createSupabaseClient(null, fakeFetch);

    await client.upsertRows([{ id: "a", key: "home", value: {} }]);
    await client.deleteRows(["a"]);
    await client.uploadObject("resumes/ptBR.pdf", Buffer.from("x"), "application/pdf");

    assert.equal(client.configured, false);
    assert.equal(calls.length, 0);
    await assert.rejects(() => client.listRows(), (error: unknown) => {
      assert.ok(error instanceof SupabaseError);
      assert.equal(error.code, "SUPABASE_NOT_CONFIGURED");
      return true;
    });
  });

  it("faz upsert com as duas credenciais e merge por id", async () => {
    const { fakeFetch, calls } = createFetch([json(null, 201)]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await client.upsertRows([
      { id: "r1", key: "home", value: { title: "Oi" } },
      { id: "r2", key: "about", value: null },
    ]);

    assert.equal(calls.length, 1);
    const [call] = calls;
    assert.equal(call.method, "POST");
    assert.equal(call.url, "https://projeto.supabase.co/rest/v1/content_rows?on_conflict=id");
    assert.equal(call.headers.apikey, "sb_secret_teste");
    assert.equal(call.headers.authorization, "Bearer sb_secret_teste");
    assert.match(call.headers.prefer, /merge-duplicates/);
    const body = JSON.parse(call.body ?? "[]") as Array<Record<string, unknown>>;
    assert.equal(body.length, 2);
    assert.deepEqual(body[0].id, "r1");
    assert.deepEqual(body[0].key, "home");
    assert.deepEqual(body[0].value, { title: "Oi" });
    assert.equal(typeof body[0].updated_at, "string");
  });

  it("não faz requisição para lista vazia", async () => {
    const { fakeFetch, calls } = createFetch([]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await client.upsertRows([]);
    await client.deleteRows([]);

    assert.equal(calls.length, 0);
  });

  it("remove linha por id com o valor codificado", async () => {
    const noContent = () => () => new Response(null, { status: 204 });
    const { fakeFetch, calls } = createFetch([noContent(), noContent()]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await client.deleteRows(["r1", "id com espaço&barra"]);

    assert.deepEqual(
      calls.map((call) => `${call.method} ${call.url}`),
      [
        "DELETE https://projeto.supabase.co/rest/v1/content_rows?id=eq.r1",
        "DELETE https://projeto.supabase.co/rest/v1/content_rows?id=eq.id%20com%20espa%C3%A7o%26barra",
      ],
    );
  });

  it("percorre as páginas da lista e converte para o formato do espelho", async () => {
    const page = (ids: string[]) => json(ids.map((id) => ({ id, key: "home", value: { id } })));
    const { fakeFetch, calls } = createFetch([
      page(Array.from({ length: 1000 }, (_, index) => `r${index}`)),
      page(["r1000", "r1001"]),
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    const rows = await client.listRows();

    assert.equal(rows.length, 1002);
    assert.equal(rows[1001].id, "r1001");
    assert.equal(calls.length, 2);
    assert.match(calls[1].url, /offset=1000/);
  });

  it("ignora entradas malformadas da lista", async () => {
    const { fakeFetch } = createFetch([
      json([{ id: "ok", key: "home", value: 1 }, { id: 2, key: "home" }, null, "x"]),
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    assert.deepEqual(await client.listRows(), [{ id: "ok", key: "home", value: 1 }]);
  });

  it("transforma resposta inválida em erro 502", async () => {
    const { fakeFetch } = createFetch([json({ erro: true })]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await assert.rejects(() => client.listRows(), (error: unknown) => {
      assert.ok(error instanceof SupabaseError);
      assert.equal(error.status, 502);
      assert.equal(error.code, "SUPABASE_INVALID_RESPONSE");
      return true;
    });
  });

  it("propaga o status e a mensagem do Supabase", async () => {
    const { fakeFetch } = createFetch([
      json({ message: "relation \"content_rows\" does not exist" }, 404),
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await assert.rejects(() => client.listRows(), (error: unknown) => {
      assert.ok(error instanceof SupabaseError);
      assert.equal(error.status, 404);
      assert.match(error.message, /content_rows/);
      return true;
    });
  });

  it("converte falha de rede em indisponibilidade", async () => {
    const { fakeFetch } = createFetch([
      () => {
        throw new TypeError("fetch failed");
      },
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await assert.rejects(() => client.listRows(), (error: unknown) => {
      assert.ok(error instanceof SupabaseError);
      assert.equal(error.status, 502);
      assert.equal(error.code, "SUPABASE_UNAVAILABLE");
      return true;
    });
  });

  it("envia objeto para o bucket com upsert", async () => {
    const { fakeFetch, calls } = createFetch([json({ Key: "resumes/ptBR.pdf" }, 200)]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    await client.uploadObject("resumes/ptBR.pdf", Buffer.from("%PDF-1.4"), "application/pdf");

    const [call] = calls;
    assert.equal(call.method, "POST");
    assert.equal(call.url, "https://projeto.supabase.co/storage/v1/object/resume/resumes/ptBR.pdf");
    assert.equal(call.headers["x-upsert"], "true");
    assert.equal(call.headers["content-type"], "application/pdf");
  });

  it("baixa objeto como Buffer", async () => {
    const { fakeFetch } = createFetch([
      () => new Response(Buffer.from("%PDF-1.4"), { status: 200 }),
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    const body = await client.downloadObject("resumes/enUS.pdf");

    assert.equal(body.toString(), "%PDF-1.4");
  });

  it("lista nomes do bucket e descarta o que não tem nome", async () => {
    const { fakeFetch, calls } = createFetch([
      json([{ name: "resumes/ptBR.pdf" }, { name: "resumes/enUS.pdf" }, { id: "x" }, 1]),
    ]);
    const client = createSupabaseClient(CONFIG, fakeFetch);

    assert.deepEqual(await client.listObjectNames("resumes"), [
      "resumes/ptBR.pdf",
      "resumes/enUS.pdf",
    ]);
    assert.match(calls[0].url, /\/storage\/v1\/object\/list\/resume$/);
    assert.equal(JSON.parse(calls[0].body ?? "{}").prefix, "resumes");
  });
});
