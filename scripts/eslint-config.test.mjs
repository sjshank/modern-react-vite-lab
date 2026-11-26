import assert from 'node:assert/strict';
import test from 'node:test';
import { ESLint } from 'eslint';

test('ESLint ignores generated and public files while linting source files', async () => {
  const eslint = new ESLint();
  for (const path of [
    'node_modules/example/index.js',
    'dist/assets/index.js',
    'test-results/coverage/nested/report.js',
    'public/nested/example.js',
  ]) {
    assert.equal(await eslint.isPathIgnored(path), true, path);
  }
  for (const path of ['src/App.tsx', 'scripts/security.test.mjs']) {
    assert.equal(await eslint.isPathIgnored(path), false, path);
  }
});
