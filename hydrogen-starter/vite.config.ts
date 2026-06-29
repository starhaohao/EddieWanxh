import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Oxygen (Cloudflare Workers) has no Node.js built-ins.
//
// Root cause: with ssr.noExternal=true, react-dom/server.node.js gets bundled
// and drags in stream, buffer, util, events, etc. The fix is to use the
// browser-compatible react-dom/server.browser.js instead, which has no Node deps.
//
// We still alias 'stream' → readable-stream for any other packages that use it,
// and keep the events shim and process banner as a safety net.
const nodePolyfills = {
  'react-dom/server': path.resolve('./node_modules/react-dom/server.browser.js'),
  stream: 'readable-stream',
  events: path.resolve('./app/shims/events.js'),
};

// process is a Node.js global not available in CF Workers. Inject via banner.
const processBanner =
  'var process={env:{NODE_ENV:"production"},version:"v18.0.0",versions:{},browser:true,platform:"browser",nextTick:function(fn,a){return setTimeout(function(){fn(a);},0)},hrtime:function(){return[0,0];}};';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve('./app'),
      ...nodePolyfills,
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
  ],
  build: {
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        banner: processBanner,
      },
    },
  },
  ssr: {
    optimizeDeps: {
      include: [],
    },
    noExternal: true,
  },
});
