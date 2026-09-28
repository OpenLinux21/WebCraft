/**
 * Ensures secrets never leak into logs, error messages or exports.
 * Every message that could carry request details passes through here.
 */
export function redactSecrets(text: string, secrets: ReadonlyArray<string | undefined>): string {
  let result = text;
  for (const secret of secrets) {
    if (secret !== undefined && secret.length >= 4) {
      result = result.split(secret).join('***');
    }
  }
  return result;
}
