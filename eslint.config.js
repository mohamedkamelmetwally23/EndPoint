import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.{ts,tsx}'], languageOptions: { globals: { window: 'readonly', document: 'readonly', localStorage: 'readonly', navigator: 'readonly', fetch: 'readonly', AbortSignal: 'readonly', AbortController: 'readonly', RequestInit: 'readonly', Headers: 'readonly', File: 'readonly', Blob: 'readonly', FormData: 'readonly', URL: 'readonly', URLSearchParams: 'readonly', XMLHttpRequest: 'readonly', ProgressEvent: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', requestAnimationFrame: 'readonly', console: 'readonly', Buffer: 'readonly', React: 'readonly' } }, rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }] } }
);
