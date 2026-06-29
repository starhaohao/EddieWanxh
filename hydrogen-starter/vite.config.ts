import {defineConfig} from 'vite';
import {hydrogen} from '@shopify/hydrogen/vite';
import {vitePlugin as remix} from '@remix-run/dev';
import path from 'node:path';

// Oxygen (Cloudflare Workers) has no Node.js built-ins.
//
// With ssr.noExternal=true all node_modules are bundled. Some packages check
// process.env.NODE_ENV at module-init time. We eliminate those references via
// Vite's `define` (build-time substitution). This also enables dead-code
// elimination, shrinking the SSR bundle from ~836kB to ~317kB.
export default defineConfig({
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
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
