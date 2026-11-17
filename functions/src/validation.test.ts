import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listResumeAvailability } from "./resumes";
import {
  CONTENT_KEYS,
  createAdminSession,
  InputValidationError,
  parseJsonBody,
  RequestTooLargeError,
  validateCreateRows,
  validateDeleteIds,
  validatePdf,
  validateResumeLanguage,
  validateRowId,
  validateUpdateRow,
} from "./validation";

describe("content request validation", () => {
  it("accepts supported content rows and preserves JSON data", () => {
    const rows = validateCreateRows([
      { key: "navigation", value: [{ label: "Home", href: "/" }] },
      { key: "skillsDetails", value: { enUS: [{ title: "TypeScript" }] } },
    ]);
    assert.equal(rows.length, 2);
    assert.equal(rows[0].key, "navigation");
  });

  it("rejects unknown keys, duplicate keys, and extra fields", () => {
    assert.throws(() => validateCreateRows([{ key: "arbitrary", value: {} }]));
    assert.throws(() =>
      validateCreateRows([
        { key: "home", value: {} },
        { key: "home", value: [] },
      ]),
    );
    assert.throws(() => validateUpdateRow({ _id: "row_1", key: "home", value: {}, extra: true }));
  });

  it("accepts every configured content key", () => {
    const rows = validateCreateRows(CONTENT_KEYS.map((key) => ({ key, value: {} })));
    assert.deepEqual(rows.map((row) => row.key), CONTENT_KEYS);
  });

  it("rejects unsafe object keys and non-structured row values", () => {
    assert.throws(() =>
      validateCreateRows([{ key: "home", value: JSON.parse('{"__proto__":{"admin":true}}') }]),
    );
    assert.throws(() => validateCreateRows([{ key: "home", value: "text" }]));
  });

  it("accepts nested JSON at the depth limit and rejects deeper values", () => {
    const makeNestedValue = (depth: number): unknown => {
      let value: unknown = true;
      for (let level = 0; level < depth; level += 1) {
        value = { nested: value };
      }
      return value;
    };

    assert.doesNotThrow(() =>
      validateCreateRows([{ key: "home", value: makeNestedValue(16) }]),
    );
    assert.throws(
      () => validateCreateRows([{ key: "home", value: makeNestedValue(17) }]),
      InputValidationError,
    );
  });

  it("enforces JSON node-count and serialized row-size boundaries", () => {
    assert.doesNotThrow(() =>
      validateCreateRows([{ key: "home", value: Array.from({ length: 7_999 }, () => null) }]),
    );
    assert.throws(
      () => validateCreateRows([{ key: "home", value: Array.from({ length: 8_000 }, () => null) }]),
      InputValidationError,
    );

    const atSizeLimit = [
      ...Array.from({ length: 4 }, () => "x".repeat(24_000)),
      "x".repeat(2_288),
    ];
    const overSizeLimit = [
      ...Array.from({ length: 4 }, () => "x".repeat(24_000)),
      "x".repeat(2_289),
    ];
    assert.equal(Buffer.byteLength(JSON.stringify(atSizeLimit), "utf8"), 96 * 1024);
    assert.doesNotThrow(() => validateCreateRows([{ key: "home", value: atSizeLimit }]));
    assert.throws(
      () => validateCreateRows([{ key: "home", value: overSizeLimit }]),
      InputValidationError,
    );
  });

  it("validates persisted row identifiers at their length and character boundaries", () => {
    const maxId = "a".repeat(128);
    assert.equal(validateUpdateRow({ _id: maxId, key: "home", value: {} })._id, maxId);

    for (const id of ["", "a".repeat(129), "../other", 17, null]) {
      assert.throws(
        () => validateUpdateRow({ _id: id, key: "home", value: {} }),
        InputValidationError,
      );
    }
  });

  it("validates delete identifiers and row path identifiers", () => {
    assert.deepEqual(validateDeleteIds(["row-1", "row_2"]), ["row-1", "row_2"]);
    assert.throws(() => validateDeleteIds(["row-1", "row-1"]));
    assert.equal(validateRowId("row_1"), "row_1");
    assert.throws(() => validateRowId("../other"));
  });

  it("accepts only configured resume languages and PDF signatures", () => {
    assert.equal(validateResumeLanguage("ptBR"), "ptBR");
    assert.equal(validateResumeLanguage("enUS"), "enUS");
    assert.throws(() => validateResumeLanguage("frFR"));
    for (const language of ["", "ptbr", "en-us", " ptBR "]) {
      assert.throws(() => validateResumeLanguage(language), InputValidationError);
    }

    assert.equal(validatePdf(Buffer.from("%PDF-")).length, 5);
    assert.equal(validatePdf(Buffer.from("%PDF-1.7")).length, 8);
    assert.throws(() => validatePdf(Buffer.from("not pdf")));
    assert.throws(() => validatePdf(Buffer.from("%PDF")), InputValidationError);
    assert.throws(() => validatePdf(Buffer.from("!PDF-")), InputValidationError);

    const atLimit = Buffer.alloc(10 * 1024 * 1024);
    atLimit.write("%PDF-");
    assert.equal(validatePdf(atLimit), atLimit);
    const overLimit = Buffer.alloc(10 * 1024 * 1024 + 1);
    overLimit.write("%PDF-");
    assert.throws(() => validatePdf(overLimit), RequestTooLargeError);
  });

  it("returns only the normalized administrator session contract", () => {
    assert.deepEqual(createAdminSession("Admin@Example.com"), {
      email: "admin@example.com",
      role: "admin",
    });
  });

  it("reports resume availability for both fixed languages", async () => {
    const checkedLanguages: string[] = [];
    const availability = await listResumeAvailability(async (language) => {
      checkedLanguages.push(language);
      return language === "ptBR";
    });

    assert.deepEqual(checkedLanguages, ["ptBR", "enUS"]);
    assert.deepEqual(availability, { ptBR: true, enUS: false });
  });

  it("parses bounded UTF-8 JSON request bodies", () => {
    assert.deepEqual(parseJsonBody(Buffer.from('{"ok":true}')), { ok: true });
    assert.throws(() => parseJsonBody(Buffer.alloc(128 * 1024 + 1)));
    assert.throws(() => parseJsonBody(Buffer.from([0xff])));
  });

  it("rejects absent, empty, and malformed JSON request bodies", () => {
    assert.throws(() => parseJsonBody(undefined), InputValidationError);
    assert.throws(() => parseJsonBody(Buffer.alloc(0)), InputValidationError);
    assert.throws(() => parseJsonBody(Buffer.from('{"incomplete":')), InputValidationError);
  });
});
