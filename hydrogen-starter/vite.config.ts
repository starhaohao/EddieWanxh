import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Oxygen (Cloudflare Workers) has no Node.js built-ins.
//
// Root cause: with ssr.noExternal=true, react-dom/server.node.js gets bundled
// and drags in stream, buffer, util, events, etc. The fix is to point
// react-dom/server at the browser-compatible variant which uses Web Streams API.
//
// Additionally, many bundled packages reference the `process` Node.js global.
// CF Workers don't provide it. We inject a shim only into the SSR entry chunk
// (dist/server/index.js) via a renderChunk plugin — NOT via build.rollupOptions
// banner which would corrupt client ESM chunks and cause Oxygen deploy timeouts.

const processShim =
  'var process={env:{NODE_ENV:"production"},version:"v18.0.0",versions:{},' +
  'browser:true,platform:"browser",' +
  'nextTick:function(fn){var a=Array.prototype.slice.call(arguments,1);' +
  'return setTimeout(function(){fn.apply(null,a);},0);},' +
  'hrtime:function(){return[0,0];}};\n';

/** Vite plugin that prepends processShim only to the SSR server entry chunk. */
function oxygenProcessShim() {
  let isSsrBuild = false;
  return {
    name: 'oxygen-process-shim',
    configResolved(config) {
      isSsrBuild = !!config.build?.ssr;
    },
    renderChunk(code, chunk) {
      if (isSsrBuild && chunk.isEntry) {
        return {code: processShim + code, map: null};
      }
      return null;
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve('./app'),
      'react-dom/server': path.resolve(
        './node_modules/react-dom/server.browser.js',
      ),
    },
  },
  plugins: [
    hydrogen(),
    remix({
      presets: [hydrogen.preset()],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    oxygenProcessShim(),
  ],
  build: {
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      include: [],
    },
    noExternal: true,
  },
});
