// Creates dist/worker/index.js as a copy of dist/server/index.js.
// hydrogen deploy uses dist/server/ as the worker directory when the project
// is not in a Hydrogen monorepo. This step is kept as a safety net in case
// that detection changes, and also validates the bundle has no Node.js
// built-in imports (which Oxygen/Cloudflare Workers cannot resolve).
import {mkdir, copyFile, readFile} from 'node:fs/promises';

await mkdir('dist/worker', {recursive: true});
await copyFile('dist/server/index.js', 'dist/worker/index.js');

const content = await readFile('dist/worker/index.js', 'utf-8');
const nodeImports = [
  ...content.matchAll(
    /\bfrom\s*["'](node:)?(stream|util|events|buffer|crypto|path|fs|url|http|https|os|child_process|assert)["']/g,
  ),
];
if (nodeImports.length > 0) {
  console.warn(
    'WARNING: worker bundle still contains Node.js built-in imports:',
  );
  nodeImports.forEach((m) => console.warn(' ', m[0]));
  process.exit(1);
} else {
  console.log('Worker bundle OK: no Node.js built-in imports detected.');
}
console.log('Worker bundle written to dist/worker/index.js');
