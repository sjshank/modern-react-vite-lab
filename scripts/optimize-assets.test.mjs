import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import sharp from 'sharp';
import { optimizeAssets } from './optimize-assets.mjs';

test('discovers nested assets and shrinks SVG/PNG without changing names, IDs, or pixels', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'asset-optimizer-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const nested = join(directory, 'nested');
  await mkdir(nested);
  const svgPath = join(nested, 'future.SVG');
  await writeFile(
    svgPath,
    `<svg xmlns="http://www.w3.org/2000/svg">
    <!-- removable comment -->
    <symbol id="future-icon" viewBox="0 0 10 10">
      <path d="M0 0h10v10H0z"/>
    </symbol>
  </svg>`,
  );
  const pngPath = join(nested, 'future.png');
  const png = await sharp({
    create: { width: 64, height: 64, channels: 4, background: '#aa33ff88' },
  })
    .png({ compressionLevel: 0 })
    .toBuffer();
  await writeFile(pngPath, png);
  await optimizeAssets([directory]);
  const svg = await readFile(svgPath, 'utf8');
  assert(!svg.includes('removable comment'));
  assert(svg.includes('id="future-icon"'));
  assert(svg.includes('viewBox="0 0 10 10"'));
  const optimized = await readFile(pngPath);
  assert(optimized.length < png.length);
  assert.deepEqual(
    await sharp(optimized).raw().toBuffer(),
    await sharp(png).raw().toBuffer(),
  );
  await optimizeAssets([directory]);
  assert.deepEqual(
    await readFile(pngPath),
    optimized,
    'Reruns must not increase size or rewrite unchanged assets',
  );
  assert.equal(await readFile(svgPath, 'utf8'), svg);
});

test('keeps compact WebP and unsupported files unchanged and does not follow symlinks', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'asset-optimizer-skip-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const assets = join(directory, 'assets');
  await mkdir(assets);
  const webp = await sharp({
    create: { width: 8, height: 8, channels: 4, background: '#ffffff' },
  })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
  await writeFile(join(assets, 'small.webp'), webp);
  const font = Buffer.from('unsupported font fixture');
  await writeFile(join(assets, 'future.woff2'), font);
  const external = join(directory, 'outside.svg');
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg">  <!-- unchanged -->  </svg>';
  await writeFile(external, svg);
  await symlink(external, join(assets, 'linked.svg'));
  await optimizeAssets([assets]);
  assert.deepEqual(await readFile(join(assets, 'small.webp')), webp);
  assert.deepEqual(await readFile(join(assets, 'future.woff2')), font);
  assert.equal(await readFile(external, 'utf8'), svg);
});

test('invalid supported files fail explicitly instead of being silently ignored', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'asset-optimizer-error-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(join(directory, 'invalid.png'), 'not a PNG');
  await assert.rejects(
    optimizeAssets([directory]),
    /unsupported image format/i,
  );
});
