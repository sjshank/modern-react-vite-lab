import { readFile, readdir, writeFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { optimize } from 'svgo';

async function optimizeFile(path) {
  const extension = extname(path).toLowerCase();
  if (!['.svg', '.png', '.webp'].includes(extension)) {
    console.log(`${path}: skipped (unsupported format; unchanged)`);
    return;
  }
  const original = await readFile(path);
  let optimized;
  if (extension === '.svg') {
    // Keep geometry, colors, viewBoxes, and externally referenced sprite IDs intact.
    const result = optimize(original.toString('utf8'), {
      path,
      plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'sortAttrs',
      ],
    });
    optimized = Buffer.from(`${result.data}\n`);
  } else {
    const image = sharp(original);
    const metadata = await image.metadata();
    const format = extension.slice(1);
    if (
      metadata.format !== format ||
      metadata.depth !== 'uchar' ||
      (metadata.pages ?? 1) > 1
    ) {
      console.log(
        `${path}: skipped (requires a matching static 8-bit image; unchanged)`,
      );
      return;
    }
    const pipeline = image.clone().keepMetadata();
    optimized = await (
      format === 'png'
        ? pipeline.png({ compressionLevel: 9, effort: 10 })
        : pipeline.webp({ lossless: true, effort: 6 })
    ).toBuffer();
    if (optimized.length < original.length) {
      const before = await sharp(original)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const after = await sharp(optimized)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      if (
        before.info.width !== after.info.width ||
        before.info.height !== after.info.height ||
        before.info.channels !== after.info.channels ||
        !before.data.equals(after.data)
      ) {
        console.log(`${path}: skipped (decoded pixels differ; unchanged)`);
        return;
      }
    }
  }
  if (optimized.length < original.length) {
    await writeFile(path, optimized);
    console.log(`${path}: ${original.length} -> ${optimized.length} bytes`);
  } else {
    console.log(`${path}: no size saving; unchanged`);
  }
}

export async function optimizeAssets(directories = ['src/assets', 'public']) {
  for (const directory of directories) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await optimizeAssets([path]);
      else if (entry.isFile()) await optimizeFile(path);
      else console.log(`${path}: skipped (symlink or special file; unchanged)`);
    }
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await optimizeAssets();
}
