import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Oxygen (Cloudflare Workers) has no Node.js built-ins.
//
// Root cause: with ssr.noExternal=true, react-dom/server.node.js gets bundled
// and drags in stream, buffer, util, events, etc. The fix is to point
// react-dom/server at the browser-compatible variant which uses Web Streams
// API instead, with no Node built-in dependencies.
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
