import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await mkdir('dist/worker', {recursive: true});

await build({
  entryPoints: ['server.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['worker', 'browser'],
  outfile: 'dist/worker/index.js',
  alias: {
    '~': path.join(__dirname, 'app'),
    'virtual:remix/server-build': path.join(__dirname, 'dist/server/index.js'),
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
  logLevel: 'info',
});

console.log('Worker bundle created at dist/worker/index.js');
