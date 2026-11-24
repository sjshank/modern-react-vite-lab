import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./bundle-report.mjs', import.meta.url));

function runReport(t, entryBytes, sharedBytes, deferredBytes) {
  const directory = mkdtempSync(resolve(tmpdir(), 'vite-bundle-report-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const dist = resolve(directory, 'dist');
  mkdirSync(resolve(dist, '.vite'), { recursive: true });
  const manifest = {
    'index.html': {
      file: 'entry.js',
      isEntry: true,
      imports: ['shared'],
      dynamicImports: ['optional'],
    },
    shared: { file: 'shared.js' },
    optional: {
      file: 'optional.js',
      isDynamicEntry: true,
      imports: ['shared'],
    },
  };
  writeFileSync(resolve(dist, '.vite/manifest.json'), JSON.stringify(manifest));
  writeFileSync(resolve(dist, 'entry.js'), randomBytes(entryBytes));
  writeFileSync(resolve(dist, 'shared.js'), randomBytes(sharedBytes));
  writeFileSync(
    resolve(dist, 'optional.js'),
    typeof deferredBytes === 'number'
      ? randomBytes(deferredBytes)
      : deferredBytes,
  );
  return spawnSync(process.execPath, [script], {
    cwd: directory,
    encoding: 'utf8',
  });
}

test('counts static dependencies once and excludes deferred chunks from the initial budget', (t) => {
  const result = runReport(t, 25 * 1024, 25 * 1024, 25 * 1024);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Initial JavaScript \(2 chunks\)/);
  assert.match(result.stdout, /Total JavaScript \(3 chunks\)/);
});

test('fails when a static dependency pushes initial JavaScript over budget', (t) => {
  const result = runReport(t, 1, 73 * 1024, 1);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Initial JavaScript exceeds 72 KiB gzip/);
});

test('fails the total budget even when excessive JavaScript is deferred', (t) => {
  const result = runReport(t, 1, 1, 81 * 1024);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Total JavaScript exceeds 80 KiB gzip/);
  assert.doesNotMatch(result.stderr, /Initial JavaScript exceeds/);
});

test('fails the raw chunk budget even when gzip sizes are small', (t) => {
  const result = runReport(t, 1, 1, Buffer.alloc(241 * 1024, 'x'));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /optional\.js exceeds 240 KiB uncompressed/);
  assert.doesNotMatch(result.stderr, /JavaScript exceeds/);
});
