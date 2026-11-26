import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { resolveConfig } from 'vite';

const scanner = fileURLToPath(
  new URL('./check-client-secrets.mjs', import.meta.url),
);

test('development and preview bind to loopback with strict ports and local host allowlists', async () => {
  const config = await resolveConfig({}, 'serve');
  assert.equal(config.server.host, '127.0.0.1');
  assert.equal(config.server.port, 5173);
  assert.equal(config.server.strictPort, true);
  assert.notEqual(config.server.allowedHosts, true);
  assert(config.server.allowedHosts.includes('localhost'));
  assert(config.server.allowedHosts.includes('127.0.0.1'));
  assert.equal(config.preview.host, '127.0.0.1');
  assert.equal(config.preview.port, 4000);
  assert.equal(config.preview.strictPort, true);
  assert.notEqual(config.preview.allowedHosts, true);
  assert(config.preview.allowedHosts.includes('localhost'));
  assert(config.preview.allowedHosts.includes('127.0.0.1'));
});

test('development and preview security headers are explicit', async () => {
  const config = await resolveConfig({}, 'serve');
  assert.equal(config.server.headers['X-Content-Type-Options'], 'nosniff');
  assert.equal(config.server.headers['X-Frame-Options'], 'DENY');
  assert.equal(
    config.server.headers['Referrer-Policy'],
    'strict-origin-when-cross-origin',
  );
  assert.equal(config.preview.headers['Cache-Control'], 'no-cache');
  assert.match(
    config.preview.headers['Content-Security-Policy-Report-Only'],
    /default-src 'self';.*object-src 'none';.*frame-ancestors 'none'/,
  );
  assert.equal(config.preview.headers['Strict-Transport-Security'], undefined);
});

function runSecretScan(
  t,
  { envContents, assetContents, assetName = 'index.js', environment = {} },
) {
  const root = mkdtempSync(resolve(tmpdir(), 'vite-security-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const dist = resolve(root, 'dist');
  mkdirSync(dist);
  writeFileSync(resolve(root, '.env.production'), envContents);
  if (assetName !== 'index.js') {
    writeFileSync(resolve(dist, 'index.js'), "const publicLabel = 'demo';");
  }
  writeFileSync(resolve(dist, assetName), assetContents);
  return spawnSync(process.execPath, [scanner, `--root=${root}`], {
    encoding: 'utf8',
    env: { ...process.env, ...environment },
  });
}

test('client secret check accepts harmless server-only sample values', (t) => {
  const result = runSecretScan(t, {
    envContents: 'SERVER_ONLY_DEMO=harmless-server-only-sample-value\n',
    assetContents: "const publicLabel = 'demo';",
  });
  assert.equal(result.status, 0, result.stderr);
});

test('client secret check fails when an env-file server-only value is bundled', (t) => {
  const result = runSecretScan(t, {
    envContents: 'SERVER_ONLY_DEMO=unique-server-only-secret-marker\n',
    assetContents:
      "const accidentallyBundled = 'unique-server-only-secret-marker';",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /SERVER_ONLY_DEMO/);
  assert.doesNotMatch(result.stderr, /unique-server-only-secret-marker/);
});

test('client secret check rejects credentials configured with a VITE_ prefix', (t) => {
  const result = runSecretScan(t, {
    envContents: 'VITE_PRIVATE_API_KEY=sample-value-not-a-credential\n',
    assetContents: "const publicLabel = 'demo';",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /VITE_PRIVATE_API_KEY/);
  assert.doesNotMatch(result.stderr, /sample-value-not-a-credential/);
});

test('client secret check detects high-confidence credentials in built assets', (t) => {
  const result = runSecretScan(t, {
    envContents: '',
    assetContents: "const leaked = 'AKIAABCDEFGHIJKLMNOP';",
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /high-confidence secret pattern/);
  assert.doesNotMatch(result.stderr, /AKIAABCDEFGHIJKLMNOP/);
});

for (const extension of ['txt', 'map', 'xml', 'webmanifest']) {
  test(`client secret check detects server-only values in .${extension} assets`, (t) => {
    const result = runSecretScan(t, {
      envContents: 'SERVER_ONLY_DEMO=unique-server-only-secret-marker\n',
      assetName: `asset.${extension}`,
      assetContents: 'unique-server-only-secret-marker',
    });
    assert.equal(result.status, 1, result.stderr);
    assert.match(result.stderr, /SERVER_ONLY_DEMO/);
    assert.doesNotMatch(result.stderr, /unique-server-only-secret-marker/);
  });
}
