/**
 * Serializes a value for embedding in a `<script type="application/json">`
 * data block. `JSON.stringify` alone does not escape `<`, so a value
 * containing `</script>` would terminate the block early and let the rest of
 * the payload be parsed as page markup. Escaping `<` as `\u003c` (valid JSON)
 * closes that hole.
 */
export function serializeJsonScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
