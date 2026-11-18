import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import {
  ANALYTICS_MAX_DAYS,
  PAGE_VIEW_PATHS,
  type PageViewPath,
  type ResumeLanguage,
} from "./validation";

/**
 * Contadores de acesso ficam no Firestore, nunca no appbackend: cada visita
 * seria uma linha nova (a tabela cresce sem limite e a API pagina de 100 em
 * 100), e a tela de acessos precisa de agregação por dia, não de uma lista.
 *
 * O Firestore é server-only aqui: `firestore.rules` nega tudo e só o Admin SDK
 * das Functions escreve e lê. Nada de credencial ou regra no navegador.
 */
export const ANALYTICS_TIME_ZONE = "America/Sao_Paulo";
export const ANALYTICS_DAILY_COLLECTION = "analyticsDaily";
export const ANALYTICS_VISITOR_COLLECTION = "analyticsVisitorDays";

export interface PageView {
  path: PageViewPath;
  language: ResumeLanguage;
  visitorId: string;
}

export interface DailyAnalytics {
  date: string;
  views: number;
  visitors: number;
  paths: Record<PageViewPath, number>;
  languages: Record<ResumeLanguage, number>;
}

export interface AnalyticsTotals {
  views: number;
  visitors: number;
  paths: Record<PageViewPath, number>;
  languages: Record<ResumeLanguage, number>;
  days: number;
}

export interface AnalyticsSummary {
  generatedAt: string;
  timeZone: string;
  days: DailyAnalytics[];
  totals: AnalyticsTotals;
}

export interface DailyAnalyticsDocument {
  id: string;
  data: Record<string, unknown>;
}

const DAY_MS = 86_400_000;

/** "Hoje" é o dia em Brasília; em UTC a virada acontece às 21h locais. */
const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const analyticsDateKey = (now: Date = new Date()): string => dateKeyFormatter.format(now);

/**
 * Meio-dia UTC como âncora: somar dias em milissegundos a partir da meia-noite
 * local erra em fuso com horário de verão (o dia pode ter 23 ou 25 horas).
 */
export const shiftDateKey = (dateKey: string, dayDelta: number): string => {
  const anchor = new Date(`${dateKey}T12:00:00Z`);
  return analyticsDateKey(new Date(anchor.getTime() + dayDelta * DAY_MS));
};

const emptyPaths = (): Record<PageViewPath, number> => ({
  home: 0,
  about: 0,
  skills: 0,
  projects: 0,
});

const emptyLanguages = (): Record<ResumeLanguage, number> => ({ ptBR: 0, enUS: 0 });

/** Contador gravado por um cliente nunca é confiável: aceita só inteiro ≥ 0. */
const toCount = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.trunc(value) : 0;

const toPathCounts = (value: unknown): Record<PageViewPath, number> => {
  const counts = emptyPaths();
  if (typeof value !== "object" || value === null) return counts;
  const record = value as Record<string, unknown>;
  for (const path of PAGE_VIEW_PATHS) counts[path] = toCount(record[path]);
  return counts;
};

const toLanguageCounts = (value: unknown): Record<ResumeLanguage, number> => {
  const counts = emptyLanguages();
  if (typeof value !== "object" || value === null) return counts;
  const record = value as Record<string, unknown>;
  counts.ptBR = toCount(record.ptBR);
  counts.enUS = toCount(record.enUS);
  return counts;
};

/**
 * Monta a série do mais antigo para o mais novo, preenchendo com zero os dias
 * sem documento. Sem isso a tela mostraria um gráfico com buracos silenciosos.
 */
export const summarizeDailyDocuments = (
  documents: readonly DailyAnalyticsDocument[],
  days: number,
  now: Date = new Date(),
): AnalyticsSummary => {
  const windowDays = Math.min(Math.max(Math.trunc(days), 1), ANALYTICS_MAX_DAYS);
  const byDate = new Map(documents.map((document) => [document.id, document.data]));
  const today = analyticsDateKey(now);
  const totals: AnalyticsTotals = {
    views: 0,
    visitors: 0,
    paths: emptyPaths(),
    languages: emptyLanguages(),
    days: windowDays,
  };
  const series: DailyAnalytics[] = [];

  for (let offset = windowDays - 1; offset >= 0; offset--) {
    const date = shiftDateKey(today, -offset);
    const data = byDate.get(date) ?? {};
    const day: DailyAnalytics = {
      date,
      views: toCount(data.views),
      visitors: toCount(data.visitors),
      paths: toPathCounts(data.paths),
      languages: toLanguageCounts(data.languages),
    };

    series.push(day);
    totals.views += day.views;
    totals.visitors += day.visitors;
    for (const path of PAGE_VIEW_PATHS) totals.paths[path] += day.paths[path];
    totals.languages.ptBR += day.languages.ptBR;
    totals.languages.enUS += day.languages.enUS;
  }

  return {
    generatedAt: now.toISOString(),
    timeZone: ANALYTICS_TIME_ZONE,
    days: series,
    totals,
  };
};

export const recordPageView = async (pageView: PageView): Promise<void> => {
  const firestore = getFirestore();
  const date = analyticsDateKey();
  const dailyDocument = firestore.collection(ANALYTICS_DAILY_COLLECTION).doc(date);
  const visitorDocument = firestore
    .collection(ANALYTICS_VISITOR_COLLECTION)
    .doc(`${date}_${pageView.visitorId}`);

  // `create` falha quando o documento já existe: é assim que a visita repetida
  // do mesmo navegador no mesmo dia não infla "visitantes únicos".
  const firstVisitToday = await visitorDocument
    .create({ date, createdAt: FieldValue.serverTimestamp() })
    .then(() => true)
    .catch(() => false);

  await dailyDocument.set(
    {
      date,
      views: FieldValue.increment(1),
      visitors: FieldValue.increment(firstVisitToday ? 1 : 0),
      [`paths.${pageView.path}`]: FieldValue.increment(1),
      [`languages.${pageView.language}`]: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
};

export const readAnalyticsSummary = async (days: number): Promise<AnalyticsSummary> => {
  // Firestore não aceita varredura DESCENDENTE pela chave do documento
  // ("descending key scans" → FAILED_PRECONDITION). Como o id é a data
  // (YYYY-MM-DD), a janela é recortada por `>= corte` em ordem crescente.
  const today = analyticsDateKey();
  const cutoff = shiftDateKey(today, -(Math.min(Math.max(days, 1), ANALYTICS_MAX_DAYS) - 1));

  const snapshot = await getFirestore()
    .collection(ANALYTICS_DAILY_COLLECTION)
    .where(FieldPath.documentId(), ">=", cutoff)
    .orderBy(FieldPath.documentId())
    .limit(days)
    .get();

  return summarizeDailyDocuments(
    snapshot.docs.map((document) => ({ id: document.id, data: document.data() ?? {} })),
    days,
  );
};
