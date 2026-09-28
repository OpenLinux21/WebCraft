// @ts-check
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      'release/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      // Course content is prose (formatted by Prettier); linting it adds no value.
      'src/content/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  prettier,
  {
    files: ['*.mjs', 'scripts/**'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  // Layer boundaries: business code must not bind directly to heavy UI/editor libraries.
  {
    files: ['src/**/*.{ts,astro}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@material/web', '@material/web/*'],
              message: 'Import Material components only via @/components/material.',
            },
            {
              group: ['monaco-editor', 'monaco-editor/*'],
              message: 'Import Monaco only via @/lib/editor.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/components/material/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['monaco-editor', 'monaco-editor/*'],
              message: 'Import Monaco only via @/lib/editor.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/lib/editor/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@material/web', '@material/web/*'],
              message: 'Import Material components only via @/components/material.',
            },
          ],
        },
      ],
    },
  },
);
