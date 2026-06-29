import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Oxygen (Cloudflare Workers) has no Node.js built-ins. We alias each
// built-in module that readable-stream (polyfill for 'stream') depends on
// to the corresponding npm polyfill package already in node_modules.
const nodePolyfills = {
  stream: 'readable-stream',
  events: path.resolve('./app/shims/events.js'),
  buffer: path.resolve('./node_modules/buffer'),
  string_decoder: path.resolve('./node_modules/string_decoder'),
  util: path.resolve('./node_modules/util'),
  inherits: path.resolve('./node_modules/inherits'),
};

// process is a Node.js global not available in Cloudflare Workers. Vite's
// define rejects function values, so we inject it via a rollup banner which
// prepends a var declaration to every output chunk.
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
