import type { Response } from "express";
import { AppBackendError } from "./appbackend";
import { InputValidationError, RequestTooLargeError } from "./validation";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function sendError(response: Response, error: unknown, requestId: string): void {
  if (error instanceof RequestTooLargeError) {
    response.status(413).json({
      error: { code: "PAYLOAD_TOO_LARGE", message: error.message, details: null, requestId },
    });
    return;
  }
  if (error instanceof InputValidationError) {
    response.status(400).json({
      error: { code: "INVALID_REQUEST", message: error.message, details: null, requestId },
    });
    return;
  }
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      // Configuration failures never reach the browser as a readable body when
      // CORS cannot be applied, so always surface them in the server log.
      console.error("API configuration failure", {
        requestId,
        code: error.code,
        message: error.message,
      });
    }
    response.status(error.status).json({
      error: { code: error.code, message: error.message, details: null, requestId },
    });
    return;
  }
  if (error instanceof AppBackendError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, details: null, requestId },
    });
    return;
  }

  console.error("Unhandled API failure", {
    requestId,
    errorName: error instanceof Error ? error.name : "UnknownError",
  });
  response.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Request could not be completed.",
      details: null,
      requestId,
    },
  });
}
