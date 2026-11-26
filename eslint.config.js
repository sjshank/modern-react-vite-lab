// ESLint configuration for the project
import js from '@eslint/js'; // ESLint JavaScript plugin/rules for linting JavaScript files
import globals from 'globals'; // Provides global variables for different environments
import reactHooks from 'eslint-plugin-react-hooks'; // ESLint plugin/rules for React hooks support
import reactRefresh from 'eslint-plugin-react-refresh'; // ESLint plugin/rules for React Refresh (Fast Refresh) support
import tseslint from 'typescript-eslint'; // ESLint plugin/rules for TypeScript support
import { defineConfig, globalIgnores } from 'eslint/config'; // ESLint configuration helpers
import prettier from 'eslint-config-prettier'; // Prettier configuration for ESLint. It will disable ESLint formatting rules that might conflict with Prettier formatting

// ESLint configuration for TypeScript and React projects
export default defineConfig([
  // Global ignore patterns for ESLint
  globalIgnores(['node_modules/', 'dist/', 'test-results/', 'public/']),
  {
    files: ['scripts/**/*.mjs'], // Apply this configuration to JavaScript module files in the scripts directory
    extends: [js.configs.recommended], // Use the recommended ESLint rules for JavaScript files
    languageOptions: {
      globals: globals.node, // Tells ESLint that Node.js globals, such as process and Buffer, are available.
    },
  },
  {
    files: ['**/*.{ts,tsx}'], // Apply this configuration to TypeScript files and React files
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
    ], // Use recommended configurations for JavaScript, TypeScript, React hooks, and React Refresh.
    // experimental compiler rules, use recommended-latest.
    languageOptions: {
      globals: globals.browser, //  tells ESLint that browser globals, such as window and document, are available.
    },
  },
  // Prettier configuration for all TypeScript and JavaScript files
  {
    files: ['**/*.{ts,tsx,js,mjs}'], // Apply this configuration to all TypeScript and JavaScript files
    extends: [prettier], // Use Prettier configuration to disable conflicting ESLint rules
  },
]);
