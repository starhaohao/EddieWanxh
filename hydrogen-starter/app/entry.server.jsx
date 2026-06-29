// Polyfill process for Oxygen (Cloudflare Workers), which has no Node.js globals.
// This must run before any bundled package that references `process`.
if (typeof process === 'undefined') {
  globalThis.process = {
    env: {NODE_ENV: 'production'},
    version: 'v18.0.0',
    versions: {},
    browser: true,
    platform: 'browser',
    nextTick: (fn, ...args) => setTimeout(() => fn(...args), 0),
    hrtime: () => [0, 0],
  };
}

import {RemixServer} from '@remix-run/react';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  remixContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy();

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
