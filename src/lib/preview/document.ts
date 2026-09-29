import type { CodeFiles } from '@/lib/courses/code-files';

export type PreviewSource = CodeFiles;

/**
 * Injected as the first script in the preview document. It forwards console
 * output, runtime errors and unhandled rejections to the parent window via
 * postMessage. Kept as a plain string because it must run inside the sandboxed
 * iframe (opaque origin, no access to app code).
 */
const CAPTURE_SCRIPT = `
(function () {
  'use strict';
  var TOKEN = __TOKEN__;
  function post(message) {
    message.source = 'webcraft-preview';
    message.token = TOKEN;
    parent.postMessage(message, '*');
  }
  function serialize(value, depth) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    var type = typeof value;
    if (type === 'string') return depth === 0 ? value : JSON.stringify(value);
    if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
    if (type === 'function') return '[Function ' + (value.name || 'anonymous') + ']';
    if (type === 'symbol') return value.toString();
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (depth > 3) return Array.isArray(value) ? '[Array]' : '[Object]';
    if (Array.isArray(value)) {
      return '[' + value.slice(0, 20).map(function (item) { return serialize(item, depth + 1); }).join(', ') + (value.length > 20 ? ', …' : '') + ']';
    }
    if (value instanceof Map) return 'Map(' + value.size + ')';
    if (value instanceof Set) return 'Set(' + value.size + ')';
    try {
      var entries = Object.entries(value).slice(0, 20).map(function (entry) {
        return entry[0] + ': ' + serialize(entry[1], depth + 1);
      });
      return '{ ' + entries.join(', ') + ' }';
    } catch (error) {
      return '[Unserializable]';
    }
  }
  function formatArgs(args) {
    return Array.prototype.map.call(args, function (arg) { return serialize(arg, 0); }).join(' ');
  }
  ['log', 'info', 'warn', 'error', 'debug'].forEach(function (level) {
    var original = typeof console[level] === 'function' ? console[level].bind(console) : function () {};
    console[level] = function () {
      post({ kind: 'console', level: level, text: formatArgs(arguments) });
      original.apply(null, arguments);
    };
  });
  window.addEventListener('error', function (event) {
    post({
      kind: 'error',
      message: event.message || 'Error',
      line: typeof event.lineno === 'number' ? event.lineno : null,
      column: typeof event.colno === 'number' ? event.colno : null,
    });
  });
  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason;
    var message = reason instanceof Error ? reason.message : String(reason);
    post({ kind: 'unhandledrejection', message: message });
  });
  post({ kind: 'ready' });
})();
`.trim();

/**
 * Builds the full document loaded into the sandboxed preview iframe.
 * Pure function — unit tested. The token must match the one used by the
 * parent's message listener.
 */
export function buildPreviewDocument(files: PreviewSource, token: string): string {
  // JSON.stringify quotes the token and escapes anything dangerous; the
  // function replacer keeps `$` sequences in the token literal.
  const safeToken = JSON.stringify(token).replace(/</g, '\\u003c');
  const capture = CAPTURE_SCRIPT.replace('__TOKEN__', () => safeToken);
  // Prevent user code from closing the wrapping tags early ('\/' is a valid
  // escape for '/' in both JS strings and CSS identifiers).
  const js = files.js.replace(/<\/script/gi, '<\\/script');
  const css = files.css.replace(/<\/style/gi, '<\\/style');
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<style>\n${css}\n</style>`,
    `<script>\n${capture}\n</script>`,
    '</head>',
    '<body>',
    files.html,
    `<script>\n${js}\n</script>`,
    '</body>',
    '</html>',
  ].join('\n');
}
