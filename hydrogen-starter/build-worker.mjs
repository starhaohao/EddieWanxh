import {build} from 'esbuild';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal EventEmitter used as the base for stream stubs
const EE_IMPL = `
function EE() { this._e = Object.create(null); }
EE.prototype.on = EE.prototype.addListener = function(t,f){ (this._e[t]=this._e[t]||[]).push(f); return this; };
EE.prototype.off = EE.prototype.removeListener = function(t,f){ var a=this._e[t]; if(a) this._e[t]=a.filter(function(x){return x!==f&&x.listener!==f;}); return this; };
EE.prototype.once = function(t,f){ var self=this; function w(){ self.off(t,w); f.apply(this,arguments); } w.listener=f; return this.on(t,w); };
EE.prototype.emit = function(t){ var a=Array.prototype.slice.call(arguments,1),h=this._e[t]; if(!h) return false; h.forEach(function(f){f.apply(null,a);}); return true; };
EE.prototype.removeAllListeners = function(t){ if(t) delete this._e[t]; else this._e=Object.create(null); return this; };
EE.prototype.listeners = function(t){ return (this._e[t]||[]).slice(); };
EE.prototype.listenerCount = function(t){ return (this._e[t]||[]).length; };
EE.prototype.prependListener = function(t,f){ (this._e[t]=this._e[t]||[]).unshift(f); return this; };
EE.prototype.setMaxListeners = function(){ return this; };
EE.defaultMaxListeners = 10;
`;

const STUBS = {
  'stream-stub': `
    ${EE_IMPL}
    function inherits(C, P) { C.prototype = Object.create(P.prototype, { constructor: { value: C } }); }
    function Stream() { EE.call(this); } inherits(Stream, EE);
    function Readable(o) { Stream.call(this); this.readable = true; } inherits(Readable, Stream);
    function Writable(o) { Stream.call(this); this.writable = true; } inherits(Writable, Stream);
    Writable.prototype.write = function(c,e,cb) { if(typeof e==='function') e(); else if(typeof cb==='function') cb(); return true; };
    Writable.prototype.end = function(c,e,cb) { if(typeof c==='function') c(); else if(typeof e==='function') e(); else if(typeof cb==='function') cb(); };
    function Duplex(o) { Readable.call(this); this.writable = true; } inherits(Duplex, Readable);
    function Transform(o) { Duplex.call(this); } inherits(Transform, Duplex);
    function PassThrough(o) { Transform.call(this); } inherits(PassThrough, Transform);
    Stream.Readable = Readable; Stream.Writable = Writable; Stream.Duplex = Duplex;
    Stream.Transform = Transform; Stream.PassThrough = PassThrough; Stream.Stream = Stream;
    function pipeline() { var cb=arguments[arguments.length-1]; if(typeof cb==='function') cb(null); }
    module.exports = Stream;
    module.exports.Stream = Stream; module.exports.Readable = Readable;
    module.exports.Writable = Writable; module.exports.Duplex = Duplex;
    module.exports.Transform = Transform; module.exports.PassThrough = PassThrough;
    module.exports.pipeline = pipeline;
  `,
  'events-stub': `
    ${EE_IMPL}
    module.exports = EE;
    module.exports.EventEmitter = EE;
  `,
  'log-seo-tags-stub': `export default function LogSeoTags() { return null; }`,
};

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
        // stream: Node.js built-in not available in CF Workers
        build.onResolve({filter: /^stream$/}, () => ({path: 'stream-stub', namespace: 'stub'}));
        // events: used by stream internals, not installed as a package
        build.onResolve({filter: /^events$/}, () => ({path: 'events-stub', namespace: 'stub'}));
        // log-seo-tags: React.lazy dev-only SEO utility from dist/server/assets/
        build.onResolve({filter: /log-seo-tags/}, () => ({path: 'log-seo-tags-stub', namespace: 'stub'}));

        build.onLoad({filter: /.*/, namespace: 'stub'}, (args) => ({
          contents: STUBS[args.path] || '',
          loader: 'js',
        }));
      },
    },
  ],
  logLevel: 'info',
});

console.log('Worker bundle created at dist/worker/index.js');
