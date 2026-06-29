import {build} from 'esbuild';
import {nodeModulesPolyfillPlugin} from 'esbuild-plugins-node-modules-polyfill';
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
  plugins: [
    {
      // log-seo-tags is a React.lazy dev-only SEO logging utility bundled by
      // Hydrogen into dist/server/assets/. It's not needed in the worker and
      // the filesystem path can't be read by esbuild via alias resolution.
      // Stub it out as a no-op so the rest of the bundle succeeds.
      name: 'stub-dev-modules',
      setup(build) {
        build.onResolve({filter: /log-seo-tags/}, () => ({
          path: 'log-seo-tags-stub',
          namespace: 'stub',
        }));
        build.onLoad({filter: /.*/, namespace: 'stub'}, () => ({
          contents: 'export default function LogSeoTags() { return null; }',
          loader: 'js',
        }));
      },
    },
    nodeModulesPolyfillPlugin(),
  ],
  logLevel: 'info',
});

console.log('Worker bundle created at dist/worker/index.js');
