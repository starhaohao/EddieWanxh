import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Node.js built-ins (stream, util, events, buffer) are not npm packages so
// ssr.noExternal doesn't bundle them — Vite leaves them as external imports.
// Oxygen (Cloudflare Workers) cannot resolve those, so we alias them to
// browser-safe shims so Vite inlines them into dist/server/index.js rather
// than leaving bare import statements that Oxygen rejects with "No such module".
export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve('./app'),
      'stream': path.resolve('./app/shims/stream.js'),
      'node:stream': path.resolve('./app/shims/stream.js'),
      'events': path.resolve('./app/shims/events.js'),
      'node:events': path.resolve('./app/shims/events.js'),
      'util': path.resolve('./app/shims/util.js'),
      'node:util': path.resolve('./app/shims/util.js'),
      'buffer': path.resolve('./app/shims/buffer.js'),
      'node:buffer': path.resolve('./app/shims/buffer.js'),
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
