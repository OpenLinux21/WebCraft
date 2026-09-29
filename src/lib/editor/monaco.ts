/**
 * Monaco editor integration. Loaded dynamically by the workbench so the
 * (large) editor chunks are only fetched on pages that need them. This is the
 * only module allowed to import monaco-editor directly (ESLint enforced).
 *
 * editor.main.js bundles the editor features plus the HTML/CSS/TypeScript
 * (JavaScript) language services. Since the 0.5x restructure the language
 * workers are spawned by monaco itself via `new Worker(new URL(...),
 * import.meta.url)`, which Vite bundles automatically — no MonacoEnvironment
 * setup is needed. The `editor/…` specifier form is required by the package's
 * exports map (it prepends `esm/vs/` itself).
 */
import 'monaco-editor/editor/editor.main.js';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import type * as MonacoApi from 'monaco-editor/editor/editor.api.js';
// The TypeScript/JavaScript language service namespace moved out of the
// `monaco.languages` API in the 0.5x restructure.
import {
  ScriptTarget,
  javascriptDefaults,
} from 'monaco-editor/languages/features/typescript/register.js';

export type MonacoNamespace = typeof monaco;
export type EditorViewState = MonacoApi.editor.ICodeEditorViewState | null;
export type EditorModel = MonacoApi.editor.ITextModel;
export type { MonacoApi };

export type CodeLanguage = 'html' | 'css' | 'javascript';

export const CODE_LANGUAGES: readonly CodeLanguage[] = ['html', 'css', 'javascript'];

// Keep the JavaScript language service friendly for beginners.
javascriptDefaults.setCompilerOptions({
  target: ScriptTarget.ESNext,
  allowJs: true,
  allowNonTsExtensions: true,
  checkJs: false,
});

/** Editor themes matched to the workshop-terminal token palette. */
const THEMES = {
  light: 'webcraft-light',
  dark: 'webcraft-dark',
} as const;

monaco.editor.defineTheme('webcraft-light', {
  base: 'vs',
  inherit: true,
  rules: [{ token: 'comment', foreground: '74777f', fontStyle: 'italic' }],
  colors: {
    'editor.background': '#ffffff',
    'editor.lineHighlightBackground': '#f0f1f4',
    'editor.selectionBackground': '#dce4f7',
    'editorCursor.foreground': '#35548f',
    'editorIndentGuide.background1': '#e0e2e7',
    'editorWidget.background': '#f7f8fa',
    'editorWidget.border': '#c4c7cf',
  },
});

monaco.editor.defineTheme('webcraft-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [{ token: 'comment', foreground: '8e9199', fontStyle: 'italic' }],
  colors: {
    'editor.background': '#1a1c21',
    'editor.lineHighlightBackground': '#1e2126',
    'editor.selectionBackground': '#2b4680',
    'editorCursor.foreground': '#a8c2ff',
    'editorIndentGuide.background1': '#33363d',
    'editorWidget.background': '#1e2126',
    'editorWidget.border': '#44474e',
  },
});

export function currentMonacoTheme(): (typeof THEMES)[keyof typeof THEMES] {
  return document.documentElement.dataset.theme === 'dark' ? THEMES.dark : THEMES.light;
}

export interface EditorFactoryOptions {
  container: HTMLElement;
  language: CodeLanguage;
  value: string;
}

export interface EditorInstance {
  readonly editor: MonacoApi.editor.IStandaloneCodeEditor;
  format(): void;
  onContentChange(callback: () => void): void;
  addRunCommand(callback: () => void): void;
  dispose(): void;
}

export function createCodeEditor(options: EditorFactoryOptions): EditorInstance {
  const editor = monaco.editor.create(options.container, {
    value: options.value,
    language: options.language,
    theme: currentMonacoTheme(),
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    tabSize: 2,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
    fixedOverflowWidgets: true,
  });

  // Follow app theme switches (event dispatched by lib/theme).
  const themeListener = (event: Event): void => {
    const resolved = (event as CustomEvent<{ resolved?: string }>).detail?.resolved;
    editor.updateOptions({ theme: resolved === 'dark' ? THEMES.dark : THEMES.light });
  };
  document.addEventListener('webcraft:theme-change', themeListener);

  return {
    editor,
    format(): void {
      void editor.getAction('editor.action.formatDocument')?.run();
    },
    onContentChange(callback: () => void): void {
      editor.onDidChangeModelContent(callback);
    },
    addRunCommand(callback: () => void): void {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, callback);
    },
    dispose(): void {
      document.removeEventListener('webcraft:theme-change', themeListener);
      editor.dispose();
    },
  };
}

export interface EditorModels {
  html: EditorModel;
  css: EditorModel;
  javascript: EditorModel;
}

/** The subset of this module the workbench consumes after dynamic import. */
export interface MonacoWorkbenchApi {
  createCodeEditor: typeof createCodeEditor;
  createModels: typeof createModels;
  disposeModels: typeof disposeModels;
}

const MODEL_FILES: Record<CodeLanguage, string> = {
  html: 'index.html',
  css: 'style.css',
  javascript: 'script.js',
};

/**
 * One model per language with stable URIs, so language services keep their
 * state while the user switches tabs.
 */
export function createModels(
  initial: Record<CodeLanguage, string>,
  instanceId: string,
): EditorModels {
  const create = (language: CodeLanguage, value: string): EditorModel => {
    const uri = monaco.Uri.parse(`inmemory://webcraft/${instanceId}/${MODEL_FILES[language]}`);
    const existing = monaco.editor.getModel(uri);
    if (existing) {
      existing.setValue(value);
      return existing;
    }
    return monaco.editor.createModel(value, language, uri);
  };

  return {
    html: create('html', initial.html),
    css: create('css', initial.css),
    javascript: create('javascript', initial.javascript),
  };
}

export function disposeModels(models: EditorModels): void {
  models.html.dispose();
  models.css.dispose();
  models.javascript.dispose();
}
