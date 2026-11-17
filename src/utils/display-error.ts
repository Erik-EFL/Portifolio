/** Mensagem legível para qualquer erro capturado, sem vazar stack/objeto. */
export const displayError = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unexpected request failure.'
