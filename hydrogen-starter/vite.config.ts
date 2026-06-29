import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve('./app'),
      stream: 'readable-stream',
      events: path.resolve('./app/shims/events.js'),
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
