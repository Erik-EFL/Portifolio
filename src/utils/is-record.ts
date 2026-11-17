/**
 * Guard para validar `unknown` vindo de JSON (API, localStorage, storage).
 * Substitui as quatro cópias que existiam em services e no Admin.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
