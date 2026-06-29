import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const eventsStub = `
var maxListeners = 10;
function EventEmitter() {
  this._events = Object.create(null);
  this._eventsCount = 0;
  this._maxListeners = void 0;
}
EventEmitter.prototype.setMaxListeners = function(n) { this._maxListeners = n; return this; };
EventEmitter.prototype.getMaxListeners = function() { return this._maxListeners == null ? maxListeners : this._maxListeners; };
EventEmitter.prototype.emit = function(type) {
  var args = Array.prototype.slice.call(arguments, 1);
  var handler = this._events[type];
  if (!handler) return false;
  if (typeof handler === 'function') { handler.apply(this, args); }
  else { var len = handler.length; for (var i = 0; i < len; i++) handler[i].apply(this, args); }
  return true;
};
EventEmitter.prototype.addListener = EventEmitter.prototype.on = function(type, listener) {
  var existing = this._events[type];
  if (!existing) { this._events[type] = listener; this._eventsCount++; }
  else if (typeof existing === 'function') { this._events[type] = [existing, listener]; }
  else { existing.push(listener); }
  return this;
};
EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  function g() { self.removeListener(type, g); listener.apply(this, arguments); }
  g.listener = listener;
  this.on(type, g);
  return this;
};
EventEmitter.prototype.removeListener = EventEmitter.prototype.off = function(type, listener) {
  var list = this._events[type];
  if (!list) return this;
  if (typeof list === 'function') {
    if (list === listener || list.listener === listener) {
      if (--this._eventsCount === 0) this._events = Object.create(null);
      else delete this._events[type];
    }
  } else {
    var idx = -1;
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) { idx = i; break; }
    }
    if (idx >= 0) {
      if (list.length === 1) {
        if (--this._eventsCount === 0) this._events = Object.create(null);
        else delete this._events[type];
      } else list.splice(idx, 1);
    }
  }
  return this;
};
EventEmitter.prototype.prependListener = function(type, listener) {
  var existing = this._events[type];
  if (!existing) { this._events[type] = listener; this._eventsCount++; }
  else if (typeof existing === 'function') { this._events[type] = [listener, existing]; }
  else { existing.unshift(listener); }
  return this;
};
EventEmitter.prototype.prependOnceListener = function(type, listener) {
  var self = this;
  function g() { self.removeListener(type, g); listener.apply(this, arguments); }
  g.listener = listener;
  this.prependListener(type, g);
  return this;
};
EventEmitter.prototype.removeAllListeners = function(type) {
  if (type) {
    if (this._events[type]) {
      if (--this._eventsCount === 0) this._events = Object.create(null);
      else delete this._events[type];
    }
  } else { this._events = Object.create(null); this._eventsCount = 0; }
  return this;
};
EventEmitter.prototype.listeners = function(type) {
  var evlistener = this._events[type];
  if (!evlistener) return [];
  if (typeof evlistener === 'function') return [evlistener.listener || evlistener];
  var ret = new Array(evlistener.length);
  for (var i = 0; i < ret.length; ++i) ret[i] = evlistener[i].listener || evlistener[i];
  return ret;
};
EventEmitter.prototype.listenerCount = function(type) {
  var evlistener = this._events[type];
  if (!evlistener) return 0;
  if (typeof evlistener === 'function') return 1;
  return evlistener.length;
};
EventEmitter.prototype.eventNames = function() { return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : []; };
EventEmitter.defaultMaxListeners = maxListeners;
module.exports = EventEmitter;
module.exports.EventEmitter = EventEmitter;
`;

await mkdir('dist/worker', {recursive: true});

await build({
  entryPoints: ['server.js'],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  conditions: ['worker', 'browser'],
  outfile: 'dist/worker/index.js',
  alias: {
    '~': path.join(__dirname, 'app'),
    'virtual:remix/server-build': path.join(__dirname, 'dist/server/index.js'),
    // stream is a Node.js built-in; alias to the browser-compatible polyfill
    'stream': 'readable-stream',
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
  },
  plugins: [
    {
      name: 'node-built-ins',
      setup(build) {
        // events is required by readable-stream but not installed as a package;
        // provide a functional EventEmitter stub
        build.onResolve({filter: /^events$/}, () => ({
          path: 'events-stub',
          namespace: 'stub',
        }));
        // log-seo-tags is a React.lazy dev-only SEO utility - stub as no-op
        build.onResolve({filter: /log-seo-tags/}, () => ({
          path: 'log-seo-tags-stub',
          namespace: 'stub',
        }));
        build.onLoad({filter: /.*/, namespace: 'stub'}, (args) => {
          if (args.path === 'events-stub') {
            return {contents: eventsStub, loader: 'js'};
          }
          return {
            contents: 'export default function LogSeoTags() { return null; }',
            loader: 'js',
          };
        });
      },
    },
  ],
  logLevel: 'info',
});

console.log('Worker bundle created at dist/worker/index.js');
