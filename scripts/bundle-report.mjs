import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = resolve('dist');
const manifest = JSON.parse(
  readFileSync(resolve(dist, '.vite/manifest.json'), 'utf8'),
);
const entryKeys = Object.keys(manifest).filter((key) => manifest[key].isEntry);
if (entryKeys.length === 0) {
  throw new Error(
    'No entry found in the Vite manifest. Run npm run build first.',
  );
}

const visited = new Set();
const initialFiles = new Set();
function visitStaticImports(key) {
  if (visited.has(key)) return;
  visited.add(key);
  const chunk = manifest[key];
  if (!chunk) throw new Error(`Missing manifest chunk: ${key}`);
  if (chunk.file.endsWith('.js')) initialFiles.add(chunk.file);
  for (const dependency of chunk.imports ?? []) visitStaticImports(dependency);
}
for (const key of entryKeys) visitStaticImports(key);

const files = [
  ...new Set(Object.values(manifest).map((chunk) => chunk.file)),
].filter((file) => file.endsWith('.js'));
const chunks = files.map((file) => {
  const source = readFileSync(resolve(dist, file));
  return {
    file,
    initial: initialFiles.has(file),
    raw: source.length,
    gzip: gzipSync(source).length,
  };
});

const format = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;
console.table(
  chunks.map((chunk) => ({
    file: chunk.file,
    load: chunk.initial ? 'initial' : 'deferred',
    raw: format(chunk.raw),
    gzip: format(chunk.gzip),
  })),
);

const initial = chunks.filter((chunk) => chunk.initial);
const initialGzip = initial.reduce((sum, chunk) => sum + chunk.gzip, 0);
const totalGzip = chunks.reduce((sum, chunk) => sum + chunk.gzip, 0);
console.log(
  `Initial JavaScript (${initial.length} chunks): ${format(initialGzip)} gzip`,
);
console.log(
  `Total JavaScript (${chunks.length} chunks): ${format(totalGzip)} gzip`,
);
console.log(
  'Gzip estimates compress each file separately; CSS, images, and HTTP headers are excluded.',
);

const violations = [];
if (initialGzip > 72 * 1024)
  violations.push('Initial JavaScript exceeds 72 KiB gzip.');
if (totalGzip > 80 * 1024)
  violations.push('Total JavaScript exceeds 80 KiB gzip.');
for (const chunk of chunks) {
  if (chunk.raw > 240 * 1024)
    violations.push(`${chunk.file} exceeds 240 KiB uncompressed.`);
}

if (violations.length > 0) {
  for (const violation of violations) console.error(violation);
  process.exitCode = 1;
} else {
  console.log('Bundle budgets passed.');
}
