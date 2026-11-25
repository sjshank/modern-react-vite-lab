import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import { preview } from 'vite';

const dist = resolve('dist');
const manifest = JSON.parse(
  readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8'),
);
const files = [
  ...new Set([
    'index.html',
    ...Object.values(manifest).flatMap((chunk) => [
      chunk.file,
      ...(chunk.css ?? []),
      ...(chunk.assets ?? []),
    ]),
  ]),
];
const entry = manifest['index.html'];
assert(entry?.isEntry, 'Run npm run build before the delivery tests.');

test('generated text assets retain originals and round-trip through gzip and Brotli', () => {
  const eligible = files.filter(
    (file) =>
      /\.(?:html|css|js|mjs|svg)$/.test(file) &&
      readFileSync(resolve(dist, file)).length > 1024,
  );
  assert(
    eligible.some((file) => file.endsWith('.js')),
    'Expected bundled JavaScript',
  );
  assert(
    eligible.some((file) => file.endsWith('.css')),
    'Expected bundled CSS',
  );

  for (const file of eligible) {
    const original = readFileSync(resolve(dist, file));
    for (const [extension, decompress] of [
      ['gz', gunzipSync],
      ['br', brotliDecompressSync],
    ]) {
      const compressed = readFileSync(resolve(dist, `${file}.${extension}`));
      assert(
        compressed.length < original.length,
        `${file}.${extension} must save bytes`,
      );
      assert.deepEqual(
        decompress(compressed),
        original,
        `${file}.${extension} must be lossless`,
      );
    }
  }
});

test('small generated text assets and already-compressed images are not precompressed', () => {
  const html = readFileSync(resolve(dist, 'index.html'));
  assert(html.length > 0, 'Expected a nonempty HTML entry');
  const smallTextFiles = files.filter(
    (file) =>
      /\.(?:html|css|js|mjs|svg)$/.test(file) &&
      readFileSync(resolve(dist, file)).length <= 1024,
  );
  const images = files.filter((file) => file.endsWith('.png'));
  assert(images.length > 0, 'Expected an imported PNG');
  for (const file of [...smallTextFiles, ...images]) {
    assert(!existsSync(resolve(dist, `${file}.gz`)), file);
    assert(!existsSync(resolve(dist, `${file}.br`)), file);
  }
});

test('preview revalidates cached responses and negotiates HTTP compression', async (t) => {
  const server = await preview({
    logLevel: 'silent',
    preview: { host: '127.0.0.1', port: 0, strictPort: true },
  });
  t.after(() => server.close());
  const address = server.httpServer.address();
  assert(address && typeof address === 'object');
  const base = `http://127.0.0.1:${address.port}${server.config.base}`;

  for (const file of ['', entry.file, 'favicon.svg']) {
    const response = await fetch(`${base}${file}`, {
      headers: { 'Accept-Encoding': 'identity' },
    });
    assert.equal(response.status, 200, file);
    assert.equal(response.headers.get('cache-control'), 'no-cache', file);
    assert.equal(
      response.headers.get('x-content-type-options'),
      'nosniff',
      file,
    );
    assert.equal(
      response.headers.get('referrer-policy'),
      'strict-origin-when-cross-origin',
      file,
    );
    assert.equal(response.headers.get('x-frame-options'), 'DENY', file);
    assert.equal(
      response.headers
        .get('content-security-policy-report-only')
        ?.includes("object-src 'none'"),
      true,
      file,
    );
    await response.arrayBuffer();
  }

  const original = readFileSync(resolve(dist, entry.file));
  const identity = await fetch(`${base}${entry.file}`, {
    headers: { 'Accept-Encoding': 'identity' },
  });
  const etag = identity.headers.get('etag');
  assert(etag, 'Expected an ETag for conditional revalidation');
  assert.deepEqual(Buffer.from(await identity.arrayBuffer()), original);
  const cached = await fetch(`${base}${entry.file}`, {
    headers: { 'If-None-Match': etag, 'Accept-Encoding': 'identity' },
  });
  assert.equal(cached.status, 304);
  assert.equal((await cached.arrayBuffer()).byteLength, 0);

  const response = await fetch(`${base}${entry.file}`, {
    headers: { 'Accept-Encoding': 'gzip' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-encoding'), 'gzip');
  assert.match(response.headers.get('vary') ?? '', /accept-encoding/i);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), original);
});
