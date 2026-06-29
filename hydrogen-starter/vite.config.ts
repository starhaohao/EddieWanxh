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

// process is not a module — it's a Node.js global. Cloudflare Workers don't
// provide it, so we use Vite's define to replace every reference inline.
const processShim =
  '({ env: { NODE_ENV: "production" }, version: "v18.0.0", versions: {}, browser: true, platform: "browser", nextTick: function(fn) { var a = Array.prototype.slice.call(arguments, 1); return setTimeout(function() { fn.apply(null, a); }, 0); } })';

export default defineConfig({
  define: {
    process: processShim,
  },
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
  },
  ssr: {
    optimizeDeps: {
      include: [],
    },
    noExternal: true,
  },
});
