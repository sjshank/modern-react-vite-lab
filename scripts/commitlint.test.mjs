import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

test('commit messages require a ticket and a subject', () => {
  const cases = [
    ['feat: (PROJ-123) add login', true],
    ['maintenance: (APP2-5) update dependencies', true],
    ['feat: add login', false],
    ['feat: (123) add login', false],
    ['feat: (proj-123) add login', false],
    ['feat: (PROJ-123)', false],
    ['feat: (PROJ-123)   ', false],
    ['feat(auth): (PROJ-123) add login', false],
    ['chore: (PROJ-123) update dependencies', false],
  ];

  for (const [message, valid] of cases) {
    const result = spawnSync('pnpm', ['exec', 'commitlint'], {
      cwd: root,
      encoding: 'utf8',
      input: message,
    });
    assert.equal(result.error, undefined);
    assert.equal(
      result.status,
      valid ? 0 : 1,
      `${message}\n${result.stdout}${result.stderr}`,
    );
  }
});
