/** Error type for AI requests with optional user-facing hints (CORS etc.). */
export class AIRequestError extends Error {
  readonly hint: string | undefined;

  constructor(
    message: string,
    hint: string | undefined = undefined,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.hint = hint;
    this.name = 'AIRequestError';
  }
}

/** Maps low-level fetch failures to a message plus an actionable hint. */
export function describeFetchError(error: unknown): { message: string; hint?: string | undefined } {
  if (error instanceof AIRequestError) {
    return { message: error.message, hint: error.hint };
  }
  if (error instanceof TypeError) {
    return {
      message: error.message,
      hint: 'The browser blocked the request (CORS, mixed HTTPS/http content, wrong URL or the service is down).',
    };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: String(error) };
}
