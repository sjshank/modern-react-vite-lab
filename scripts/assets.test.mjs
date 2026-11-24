import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { chromium, expect } from '@playwright/test';
import sharp from 'sharp';
import { build, preview } from 'vite';

test('assets render at the root and a deployment subpath', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'vite-assets-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const browser = await chromium.launch();
  t.after(() => browser.close());

  for (const [name, base] of [
    ['root', '/'],
    ['subpath', '/learn-vite/'],
  ]) {
    await t.test(name, async (t) => {
      const outDir = join(directory, name);
      await build({
        base,
        logLevel: 'silent',
        build: { outDir, emptyOutDir: true },
      });
      for (const file of ['favicon.svg', 'icons.svg']) {
        assert.deepEqual(
          await readFile(join(outDir, file)),
          await readFile(resolve('public', file)),
        );
      }
      const manifest = JSON.parse(
        await readFile(join(outDir, '.vite/manifest.json'), 'utf8'),
      );
      assert.match(
        manifest['src/assets/hero.png'].file,
        /^assets\/hero-[\w-]+\.png$/,
      );

      const server = await preview({
        base,
        logLevel: 'silent',
        build: { outDir },
        preview: { host: '127.0.0.1', port: 0, strictPort: true },
      });
      t.after(() => server.close());
      const address = server.httpServer.address();
      assert(address && typeof address === 'object');
      const origin = `http://127.0.0.1:${address.port}`;
      const page = await browser.newPage();
      t.after(() => page.close());
      const failures = [];
      page.on('pageerror', (error) => failures.push(error.message));
      page.on('requestfailed', (request) => failures.push(request.url()));
      page.on('response', (response) => {
        if (response.status() >= 400)
          failures.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(`${origin}${base}`);
      await expect(
        page.getByRole('heading', { name: 'Get started', exact: true }),
      ).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator('img')
            .evaluateAll(
              (images) =>
                images.length > 0 &&
                images.every(
                  (image) => image.complete && image.naturalWidth > 0,
                ),
            ),
        )
        .toBe(true);
      await expect(page.locator('svg use')).toHaveCount(6);
      await expect
        .poll(() =>
          page
            .locator('svg use')
            .evaluateAll((uses) =>
              uses.every(
                (use) => use.getBBox().width > 0 && use.getBBox().height > 0,
              ),
            ),
        )
        .toBe(true);

      for (const href of await page
        .locator('svg use')
        .evaluateAll((uses) => uses.map((use) => use.getAttribute('href')))) {
        assert(href.startsWith(`${base}icons.svg#`), href);
      }
      assert.equal(
        await page.locator('link[rel="icon"]').getAttribute('href'),
        `${base}favicon.svg`,
      );
      for (const file of [
        'favicon.svg',
        'icons.svg',
        manifest['src/assets/hero.png'].file,
      ]) {
        const response = await fetch(`${origin}${base}${file}`);
        assert.equal(response.status, 200, file);
        assert.deepEqual(
          Buffer.from(await response.arrayBuffer()),
          await readFile(join(outDir, file)),
        );
      }
      assert.deepEqual(failures, []);
    });
  }
});

test('changing imported image content invalidates its emitted URL', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'vite-asset-hash-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(
    join(directory, 'index.html'),
    '<img src="./hero.png" alt="">',
  );
  const source = await readFile('src/assets/hero.png');
  const emitted = [];
  for (const bytes of [source, await sharp(source).flop().png().toBuffer()]) {
    await writeFile(join(directory, 'hero.png'), bytes);
    await build({
      configFile: false,
      root: directory,
      publicDir: false,
      logLevel: 'silent',
      build: { assetsInlineLimit: 0 },
    });
    const files = await readdir(join(directory, 'dist/assets'));
    const image = files.find((file) => /^hero-[\w-]+\.png$/.test(file));
    assert(image, 'Expected a content-hashed image');
    const html = await readFile(join(directory, 'dist/index.html'), 'utf8');
    assert(
      html.includes(`/assets/${image}`),
      'HTML must reference the emitted image',
    );
    emitted.push(image);
  }
  assert.notEqual(emitted[0], emitted[1]);
});
