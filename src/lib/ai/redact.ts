/**
 * Ensures secrets never leak into logs, error messages or exports.
 *
 * Secrets are matched longest-first so a secret containing another secret
 * cannot leave a partial remainder behind (`['abc', 'abcdef']` must redact
 * the whole of `abcdef`, not leave `def`).
 *
 * Secrets shorter than 4 characters are skipped: matching them would
 * over-redact common short words in error text, and real API keys are never
 * that short. The floor is part of this module's contract.
 */
export function redactSecrets(text: string, secrets: ReadonlyArray<string | undefined>): string {
  const redactable = [...secrets]
    .filter((secret): secret is string => secret !== undefined && secret.length >= 4)
    .sort((a, b) => b.length - a.length);
  let result = text;
  for (const secret of redactable) {
    result = result.split(secret).join('***');
  }
  return result;
}
