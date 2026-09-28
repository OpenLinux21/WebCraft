import { parsePreviewMessage, type PreviewInboundMessage } from './protocol';
import { buildPreviewDocument } from './document';
import type { CodeFiles } from '@/lib/courses/code-files';

export interface PreviewController {
  /** Rebuilds the sandbox document with the given files. */
  run(files: CodeFiles): void;
  dispose(): void;
}

/**
 * Drives the sandboxed preview iframe (sandbox="allow-scripts", no
 * allow-same-origin). Inbound messages are validated with the shared token
 * and the `event.source` check; everything else is dropped.
 */
export function createPreviewController(
  iframe: HTMLIFrameElement,
  token: string,
  onMessage: (message: PreviewInboundMessage) => void,
): PreviewController {
  const listener = (event: MessageEvent): void => {
    if (event.source !== iframe.contentWindow) return;
    const message = parsePreviewMessage(event.data, token);
    if (message) onMessage(message);
  };
  window.addEventListener('message', listener);

  return {
    run(files: CodeFiles): void {
      iframe.srcdoc = buildPreviewDocument(files, token);
    },
    dispose(): void {
      window.removeEventListener('message', listener);
    },
  };
}
