import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';

const args = new Map(
  process.argv.slice(2).map((argument) => {
    const [name, ...value] = argument.split('=');
    return [name, value.join('=')];
  }),
);
const root = resolve(args.get('--root') ?? process.cwd());
const dist = resolve(root, args.get('--dist') ?? 'dist');
const mode = 'production';
const sensitiveName =
  /(?:SECRET|TOKEN|PASSWORD|PRIVATE[_-]?KEY|CREDENTIAL|API[_-]?KEY|SERVER[_-]?ONLY)/i;
const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /\bsk_live_[A-Za-z0-9]{16,}\b/,
];
const envFiles = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(path)));
    else if (
      /\.(?:html|css|js|mjs|json|svg|txt|map|xml|webmanifest)$/.test(entry.name)
    )
      files.push(path);
  }
  return files;
}

const outputFiles = await collectFiles(dist);
if (outputFiles.length === 0) {
  throw new Error(
    `No built text assets found in ${dist}. Run npm run build first.`,
  );
}

const loadedEnv = loadEnv(mode, root, '');
const envNames = new Set(
  Object.keys(process.env).filter((name) => sensitiveName.test(name)),
);

for (const file of envFiles) {
  try {
    const contents = await readFile(resolve(root, file), 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
      if (match) envNames.add(match[1]);
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

const problems = [];
for (const name of envNames) {
  if (!name.startsWith('VITE_') || !sensitiveName.test(name)) continue;
  problems.push(
    `Public variable name "${name}" suggests sensitive data; do not expose it with VITE_.`,
  );
}

const textAssets = await Promise.all(
  outputFiles.map(async (path) => [path, await readFile(path, 'utf8')]),
);

for (const name of envNames) {
  if (name.startsWith('VITE_')) continue;
  const value = process.env[name] ?? loadedEnv[name];
  if (typeof value !== 'string' || value.length < 8) continue;
  if (textAssets.some(([, contents]) => contents.includes(value))) {
    problems.push(
      `Value for server-side variable "${name}" appears in built client assets.`,
    );
  }
}

for (const pattern of secretPatterns) {
  if (textAssets.some(([, contents]) => pattern.test(contents))) {
    problems.push(
      `Built client assets contain a value matching a high-confidence secret pattern.`,
    );
  }
}

if (problems.length > 0) {
  for (const problem of new Set(problems)) console.error(problem);
  process.exitCode = 1;
} else {
  console.log(
    `Client secret check passed (${textAssets.length} built text assets scanned).`,
  );
}
