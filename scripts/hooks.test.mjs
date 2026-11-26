import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));

for (const [hook, first, second] of [
  ['pre-push', 'type-check', 'build'],
  ['pre-commit', 'format:check', 'lint'],
]) {
  test(`${hook} stops when a command fails`, (t) => {
    const directory = mkdtempSync(join(tmpdir(), 'hook-test-'));
    t.after(() => rmSync(directory, { recursive: true, force: true }));
    const log = join(directory, 'commands');
    writeFileSync(
      join(directory, 'npm'),
      '#!/bin/sh\nprintf "%s\\n" "$2" >> "$HOOK_LOG"\n[ "$2" != "$FAIL_COMMAND" ]\n',
      { mode: 0o755 },
    );

    for (const [failure, expected, status] of [
      [first, [first], 1],
      [second, [first, second], 1],
      ['', [first, second], 0],
    ]) {
      writeFileSync(log, '');
      const result = spawnSync('sh', [`.husky/${hook}`], {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}${delimiter}${process.env.PATH}`,
          HOOK_LOG: log,
          FAIL_COMMAND: failure,
        },
      });
      assert.equal(result.error, undefined);
      assert.equal(result.status, status, result.stderr);
      assert.deepEqual(readFileSync(log, 'utf8').trim().split('\n'), expected);
    }
  });
}

test('pre-push blocks updates to remote main before running checks', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'hook-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const log = join(directory, 'commands');
  writeFileSync(
    join(directory, 'npm'),
    '#!/bin/sh\nprintf "%s\\n" "$2" >> "$HOOK_LOG"\n',
    { mode: 0o755 },
  );

  const feature = 'refs/heads/feature abc refs/heads/feature def\n';
  const main = 'refs/heads/feature abc refs/heads/main def\n';
  const deletion = '(delete) 000 refs/heads/main def\n';
  const tag = 'refs/tags/main abc refs/tags/main def\n';

  for (const [input, status, expected] of [
    [main, 1, []],
    [feature + main, 1, []],
    [deletion, 1, []],
    [feature + tag, 0, ['type-check', 'build']],
    [
      'refs/heads/main abc refs/heads/feature def\n',
      0,
      ['type-check', 'build'],
    ],
  ]) {
    writeFileSync(log, '');
    const result = spawnSync('sh', ['.husky/pre-push', 'origin', 'url'], {
      cwd: root,
      encoding: 'utf8',
      input,
      env: {
        ...process.env,
        PATH: `${directory}${delimiter}${process.env.PATH}`,
        HOOK_LOG: log,
      },
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, status, result.stderr);
    assert.deepEqual(
      readFileSync(log, 'utf8').trim().split('\n').filter(Boolean),
      expected,
    );
    if (status === 1) assert.match(result.stderr, /pull request/i);
  }
});

test('commit-msg validates the message file with npm', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'commit message test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const messageFile = join(directory, 'commit message');
  for (const [message, status] of [
    ['feat: (PROJ-123) add login', 0],
    ['not a valid commit message', 1],
  ]) {
    writeFileSync(messageFile, message);
    const result = spawnSync('sh', ['.husky/commit-msg', messageFile], {
      cwd: root,
      encoding: 'utf8',
    });
    assert.equal(result.error, undefined);
    assert.equal(result.status, status, result.stderr);
  }
});
