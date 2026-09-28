/**
 * English dictionary — the reference shape for all other locales.
 * `Dictionary` is derived from this object, so every locale must stay
 * structurally identical (enforced by src/lib/i18n/core.test.ts).
 */
export const en = {
  common: {
    appName: 'WebCraft',
    tagline: 'Learn web design and front-end programming in your browser',
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    copy: 'Copy',
    copied: 'Copied',
    download: 'Download',
    import: 'Import',
    export: 'Export',
    loading: 'Loading…',
    error: 'Error',
    retry: 'Retry',
    delete: 'Delete',
    reset: 'Reset',
    skipToContent: 'Skip to main content',
    backHome: 'Back to home',
    languageNativeName: 'English',
    minutesShort: '{minutes} min',
  },
  nav: {
    home: 'Home',
    courses: 'Courses',
    playground: 'Playground',
    settings: 'Settings',
  },
  footer: {
    privacyNote:
      'No accounts, no telemetry: your progress and code stay in this browser unless you send them to an AI service you configured yourself.',
    openSource: 'Open source under the MIT license.',
  },
  theme: {
    label: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    toggleLabel: 'Switch theme',
  },
  a11y: {
    mainNav: 'Main navigation',
    languageSwitch: 'Switch language',
    breadcrumb: 'Breadcrumb',
  },
  language: {
    label: 'Language',
  },
  home: {
    heroTitle: 'Learn front-end development by writing real code',
    heroSubtitle:
      '24 hands-on lessons from your first HTML tag to complete interactive pages — with a live editor, instant preview and an AI tutor that runs on your own API.',
    ctaStart: 'Start learning',
    ctaPlayground: 'Open the playground',
    featuresTitle: 'Why WebCraft',
    featurePrivacyTitle: 'Privacy by design',
    featurePrivacyBody:
      'No accounts, no analytics, no telemetry. Everything is stored in your browser and you can export or delete it at any time.',
    featureStaticTitle: 'Fully static, works anywhere',
    featureStaticBody:
      'Unzip and deploy to any static host. The editor, preview and lessons all run entirely in your browser — even offline.',
    featureAiTitle: 'Your AI, your keys',
    featureAiBody:
      'Bring your own Ollama or OpenAI-compatible API. Hints, reviews and challenges are generated from your browser, straight to your provider.',
    progressTitle: 'Your progress',
    progressSummary: '{done} of {total} lessons completed',
    continueLearning: 'Continue: {title}',
    startFirst: 'Start with the first lesson',
    viewAll: 'View all courses',
  },
  meta: {
    homeTitle: 'WebCraft — Learn web design & front-end programming',
    homeDescription:
      'A privacy-first, fully static learning platform: 24 hands-on lessons, a sandboxed live editor and an AI tutor powered by your own API keys.',
    coursesTitle: 'Courses — WebCraft',
    coursesDescription:
      '24 lessons covering HTML, CSS, layout, responsive design, JavaScript, the DOM, forms and accessibility.',
    playgroundTitle: 'Playground — WebCraft',
    playgroundDescription:
      'A free HTML/CSS/JavaScript sandbox with console capture and an AI tutor for hints, reviews and challenges.',
    settingsTitle: 'Settings — WebCraft',
    settingsDescription:
      'Theme, language, AI provider configuration, backup and local data management.',
  },
  courses: {
    title: 'Courses',
    subtitle: '24 lessons that take you from zero to building interactive pages.',
    moduleNames: {
      html: 'HTML basics',
      css: 'CSS basics',
      layout: 'Layout & responsive design',
      javascript: 'JavaScript',
      dom: 'DOM & interaction',
      advanced: 'Advanced topics',
    },
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
    },
    status: {
      notStarted: 'Not started',
      inProgress: 'In progress',
      completed: 'Completed',
    },
    lessonsInModule: '{count} lessons',
  },
  lesson: {
    objectives: 'Learning objectives',
    exercise: 'Exercise',
    hints: 'Hints',
    showHint: 'Show hint {n}',
    solution: 'Reference solution',
    loadSolution: 'Load reference code',
    loadSolutionConfirm: 'Replace the editor content with the reference solution?',
    askAi: 'Practice this in the playground',
    markCompleted: 'Mark as completed',
    markInProgress: 'Mark as in progress',
    prev: 'Previous lesson',
    next: 'Next lesson',
    estimated: 'About {minutes} minutes',
    notFound: 'Lesson not found',
  },
  workbench: {
    editorLabel: 'Code editor',
    tabHtml: 'HTML',
    tabCss: 'CSS',
    tabJs: 'JS',
    run: 'Run',
    format: 'Format',
    reset: 'Reset',
    autoRun: 'Live preview',
    autoRunOff: 'Off',
    autoRunFast: 'Fast (0.5s)',
    autoRunNormal: 'Normal (1s)',
    autoRunSlow: 'Slow (2s)',
    runShortcutHint: 'Ctrl/Cmd + Enter',
    resetConfirm: 'Reset all files to the starting code?',
    resetDone: 'Editor content has been reset',
    draftRestored: 'Saved draft restored',
    previewLabel: 'Preview',
    previewAria: 'Rendered result of your code',
    consoleTitle: 'Console',
    consoleClear: 'Clear',
    consoleEmpty: 'No output yet — try console.log()',
  },
  consoleLevels: {
    log: 'Log',
    info: 'Info',
    warn: 'Warn',
    error: 'Error',
    exception: 'Exception',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Preferences are stored only in this browser.',
    sectionGeneral: 'General',
    sectionAi: 'AI assistant',
    sectionBackup: 'Backup & restore',
    sectionData: 'Data',
    ai: {
      enable: 'Enable AI assistant',
      provider: 'Provider',
      providerOpenAI: 'OpenAI-compatible API',
      providerOllama: 'Ollama (local)',
      baseUrl: 'Base URL',
      baseUrlHint: 'For example https://api.openai.com/v1 or http://localhost:11434',
      model: 'Model name',
      modelPlaceholder: 'For example gpt-4o-mini or qwen2.5-coder:7b',
      apiKey: 'API key',
      apiKeyHint:
        'Stored only in this browser and sent only to the service you configure. Never included in exports unless you explicitly choose to.',
      customHeaders: 'Custom headers (JSON)',
      customHeadersHint:
        'Optional, for services that require extra headers. Example: {"X-Title": "WebCraft"}',
      customHeadersInvalid: 'Headers must be a valid JSON object.',
      temperature: 'Temperature',
      maxTokens: 'Max output tokens',
      testConnection: 'Test connection',
      testing: 'Testing…',
      testOk: 'Connection OK — {count} models available',
      testOkNoList: 'Connection OK',
      testFailed: 'Connection failed: {reason}',
      corsWarning:
        'If the test fails with a network or CORS error, the service does not accept browser requests from this site. For Ollama, start it with OLLAMA_ORIGINS set to your site origin (or *). If this page is served over HTTPS, the browser blocks requests to http:// addresses (mixed content).',
      privacyNote:
        'AI requests are sent directly from your browser to the service you configure. WebCraft runs no server in between and never adds your learning data to requests.',
      clearKey: 'Clear API key',
      keyCleared: 'API key cleared',
      saved: 'AI settings saved',
    },
    backup: {
      exportTitle: 'Export data',
      exportBody:
        'Download all progress, drafts, playground records and settings as a versioned, human-readable JSON file.',
      includeSensitive: 'Include sensitive settings (API key)',
      includeSensitiveWarning:
        'The exported file will contain your API key in plain text. Keep it safe.',
      importTitle: 'Import data',
      importBody: 'Restore from a WebCraft backup file. Existing data will be overwritten.',
      importConfirm: 'Import will overwrite your current progress, drafts and settings. Continue?',
      importSuccess: 'Backup imported successfully.',
      importFailed: 'Import failed: {reason}',
      invalidFile: 'This file is not a valid WebCraft backup.',
      newerVersion:
        'The backup was created by a newer version of WebCraft. Please update the app first.',
    },
    data: {
      storageNote:
        'All data lives in this browser (IndexedDB and localStorage). WebCraft has no accounts and no server.',
      clearAll: 'Delete all local data',
      clearAllConfirm:
        'This permanently deletes all progress, drafts, playground records and settings in this browser. This cannot be undone. Continue?',
      clearAllDone: 'All local data has been deleted',
    },
  },
  playground: {
    title: 'Playground',
    subtitle:
      'A free sandbox to practice HTML, CSS and JavaScript — with an AI tutor by your side.',
    tasksTitle: 'Challenges',
    newTask: 'Get a new challenge',
    generating: 'Generating…',
    noTasks: 'No challenges yet. Generate one below, or just experiment freely.',
    fromAi: 'AI challenge',
    builtin: 'Starter challenge',
    taskComplete: 'Mark done',
    taskReopen: 'Reopen',
    taskCompletedLabel: 'Done',
    deleteTaskConfirm: 'Delete this challenge?',
    newTaskFailed: 'Could not generate a challenge: {reason}',
  },
  ai: {
    panelTitle: 'AI tutor',
    disabled:
      'The AI tutor is not configured yet. Add a provider in Settings to enable hints, reviews and challenges.',
    goSettings: 'Open settings',
    placeholder: 'Ask anything about your code or the current lesson…',
    send: 'Send',
    stop: 'Stop',
    modes: {
      hint: 'Hint',
      explain: 'Explain',
      review: 'Review',
      debug: 'Debug',
      challenge: 'New challenge',
    },
    includeCode: 'Include my code',
    includeConsole: 'Include console output',
    thinking: 'Thinking…',
    requestFailed: 'Request failed: {reason}',
    disclaimer: 'AI answers can be wrong — treat them as guidance, not truth.',
  },
  aiPrompts: {
    base:
      'You are the tutor of WebCraft, a learning platform for web design and front-end programming. ' +
      'The student is practicing HTML, CSS and JavaScript. Always respond in {language}. ' +
      'Keep answers short and focused; use tiny code snippets (a few lines at most) instead of full files. ' +
      'Never do the whole exercise for the student — your job is to make them understand and succeed on their own.',
    levelNote: 'The student level is: {level}.',
    lessonContext:
      'Current lesson:\nTitle: {title}\nObjectives:\n{objectives}\nExercise task: {task}',
    codeContext:
      "The student's current code:\n--- HTML ---\n{html}\n--- CSS ---\n{css}\n--- JavaScript ---\n{js}",
    consoleContext: 'Recent console output ({count} entries):\n{lines}',
    hint:
      'The student requests a hint for the current exercise. Give ONE small nudge towards the next step. ' +
      'Do not reveal the final solution. If they seem far from the goal, start with the most fundamental gap.',
    explain:
      'The student wants something explained. Explain the concept or the selected part of their code step by step, ' +
      'with a minimal example if helpful. Stay on the topic they asked about.',
    review:
      "Review the student's code against the exercise goal. List what is already good, then the most important " +
      'issues in priority order (correctness, accessibility, style). Explain why each matters, but do not rewrite ' +
      'the whole code for them — show the pattern for one spot and let them apply it.',
    debug:
      'The student is debugging. Identify the most likely cause of the reported problem, explain how to verify it, ' +
      'and suggest the smallest possible change to try. Do not hand over a full corrected solution.',
    challenge:
      'Create one new practice challenge for the student, building on what the current lesson teaches but different ' +
      'from the official exercise. Respond ONLY with a JSON object, no extra text, in this exact shape:\n' +
      '{"title": "short challenge title", "task": "what to build, 2-4 sentences", "difficulty": "beginner" | "intermediate"}',
  },
  errors: {
    generic: 'Something went wrong: {message}',
    storageUnavailable: 'Browser storage is unavailable — progress cannot be saved.',
    copyFailed: 'Copy failed: {reason}',
  },
  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist.',
  },
};
