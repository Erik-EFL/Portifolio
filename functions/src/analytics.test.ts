import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  analyticsDateKey,
  shiftDateKey,
  summarizeDailyDocuments,
} from "./analytics";

describe("analyticsDateKey", () => {
  it("usa o dia de Brasília, não o de UTC", () => {
    // 02:30 UTC de 18/11 ainda é 23:30 de 17/11 em Brasília (UTC-3).
    assert.equal(analyticsDateKey(new Date("2026-11-18T02:30:00Z")), "2026-11-17");
    // 03:00 UTC já virou o dia local.
    assert.equal(analyticsDateKey(new Date("2026-11-18T03:00:00Z")), "2026-11-18");
  });
});

describe("shiftDateKey", () => {
  it("atravessa mês e ano", () => {
    assert.equal(shiftDateKey("2026-03-01", -1), "2026-02-28");
    assert.equal(shiftDateKey("2026-01-01", -1), "2025-12-31");
    assert.equal(shiftDateKey("2026-12-31", 1), "2027-01-01");
  });

  it("volta e avança sem perder o dia", () => {
    let date = "2026-11-17";
    for (let index = 0; index < 40; index++) date = shiftDateKey(date, -1);
    assert.equal(date, "2026-10-08");
    for (let index = 0; index < 40; index++) date = shiftDateKey(date, 1);
    assert.equal(date, "2026-11-17");
  });
});

describe("summarizeDailyDocuments", () => {
  const now = new Date("2026-11-17T15:00:00Z");

  it("preenche com zero os dias sem documento e ordena do mais antigo", () => {
    const summary = summarizeDailyDocuments(
      [
        { id: "2026-11-17", data: { views: 4, visitors: 2 } },
        { id: "2026-11-15", data: { views: 3, visitors: 1 } },
      ],
      3,
      now,
    );

    assert.deepEqual(
      summary.days.map((day) => day.date),
      ["2026-11-15", "2026-11-16", "2026-11-17"],
    );
    assert.deepEqual(
      summary.days.map((day) => day.views),
      [3, 0, 4],
    );
    assert.equal(summary.totals.views, 7);
    assert.equal(summary.totals.visitors, 3);
  });

  it("soma por rota e por idioma", () => {
    const summary = summarizeDailyDocuments(
      [
        {
          id: "2026-11-17",
          data: {
            views: 3,
            paths: { home: 2, skills: 1 },
            languages: { ptBR: 2, enUS: 1 },
          },
        },
        { id: "2026-11-16", data: { views: 1, paths: { about: 1 }, languages: { enUS: 1 } } },
      ],
      2,
      now,
    );

    assert.deepEqual(summary.totals.paths, { home: 2, about: 1, skills: 1, projects: 0 });
    assert.deepEqual(summary.totals.languages, { ptBR: 2, enUS: 2 });
  });

  it("ignora contador inválido em vez de propagar NaN", () => {
    const summary = summarizeDailyDocuments(
      [
        {
          id: "2026-11-17",
          data: {
            views: "12",
            visitors: -3,
            paths: { home: Number.NaN, skills: 2.7 },
            languages: { ptBR: null },
          },
        },
      ],
      1,
      now,
    );

    assert.equal(summary.days[0].views, 0);
    assert.equal(summary.days[0].visitors, 0);
    assert.equal(summary.days[0].paths.home, 0);
    assert.equal(summary.days[0].paths.skills, 2);
    assert.equal(summary.days[0].languages.ptBR, 0);
  });

  it("limita a janela ao teto e nunca fica abaixo de um dia", () => {
    assert.equal(summarizeDailyDocuments([], 1000, now).days.length, 90);
    assert.equal(summarizeDailyDocuments([], 0, now).days.length, 1);
  });
});
