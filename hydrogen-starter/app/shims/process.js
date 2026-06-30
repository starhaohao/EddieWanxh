// Polyfill Node's `process` global for Oxygen (Cloudflare Workers).
// Must be imported as the very first statement in entry.server.jsx so it
// executes before any bundled package that references `process`.
//
// Use queueMicrotask (not setTimeout) for nextTick — microtasks match
// Node's actual nextTick semantics and prevent async rendering hangs.
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {NODE_ENV: 'production'},
    version: 'v18.0.0',
    versions: {},
    browser: true,
    platform: 'browser',
    nextTick:
      typeof queueMicrotask !== 'undefined'
        ? (fn, ...args) => queueMicrotask(() => fn(...args))
        : (fn, ...args) => Promise.resolve().then(() => fn(...args)),
    hrtime: () => [0, 0],
  };
}
