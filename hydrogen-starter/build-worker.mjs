import {build} from 'esbuild';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
  'util-stub': `
    module.exports = {
      inherits: function(C, P) { C.prototype = Object.create(P.prototype, { constructor: { value: C } }); },
      inspect: function(v) { return String(v); },
      format: function(f) { return String(f); },
      promisify: function(fn) { return function() { var args = Array.prototype.slice.call(arguments); return new Promise(function(resolve, reject) { fn.apply(null, args.concat(function(err, val) { if (err) reject(err); else resolve(val); })); }); }; },
      debuglog: function() { return function() {}; },
      deprecate: function(fn) { return fn; },
      isBuffer: function(v) { return false; },
      types: { isUint8Array: function(v) { return v instanceof Uint8Array; } },
    };
  `,
  'buffer-stub': `
    var B = typeof globalThis !== 'undefined' && globalThis.Buffer;
    if (!B) { B = function Buffer() {}; B.isBuffer = function() { return false; }; B.from = function(v) { return new Uint8Array(typeof v === 'string' ? new TextEncoder().encode(v) : v); }; B.alloc = function(n) { return new Uint8Array(n); }; }
    module.exports = { Buffer: B };
    module.exports.Buffer = B;
  `,
  'string-decoder-stub': `
    function StringDecoder(enc) { this.enc = enc || 'utf8'; }
    StringDecoder.prototype.write = function(buf) { return typeof buf === 'string' ? buf : new TextDecoder(this.enc).decode(buf); };
    StringDecoder.prototype.end = function(buf) { return buf ? this.write(buf) : ''; };
    module.exports = { StringDecoder: StringDecoder };
  `,
  'log-seo-tags-stub': `export default function LogSeoTags() { return null; }`,
  'empty-stub': `module.exports = {};`,
};

await mkdir('dist/worker', {recursive: true});

// Diagnostic: show first imports of dist/server/index.js
const serverBuildPath = path.join(__dirname, 'dist/server/index.js');
const serverBuildContent = await readFile(serverBuildPath, 'utf-8');
const firstLines = serverBuildContent.split('\n').slice(0, 30);
console.log('=== dist/server/index.js first 30 lines ===');
console.log(firstLines.join('\n'));
console.log('=== end server build header ===');

const result = await build({
  entryPoints: ['server.js'],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  conditions: ['worker', 'browser'],
  write: false,
  mainFields: ['browser', 'module', 'main'],
  alias: {
    '~': path.join(__dirname, 'app'),
    'virtual:remix/server-build': serverBuildPath,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.browser': 'true',
    'process.version': '"v18.0.0"',
    'process.platform': '"browser"',
    'global': 'globalThis',
  },
  banner: {
    js: 'var process=globalThis.process||{env:{NODE_ENV:"production"},browser:true,version:"v18.0.0",platform:"browser",hrtime:function(){return[0,0];},cwd:function(){return"/";},exit:function(){},nextTick:function(f){Promise.resolve().then(f);}};',
  },
  plugins: [
    {
      name: 'node-built-ins',
      setup(build) {
        build.onResolve({filter: /^node:/}, (args) => {
          const bare = args.path.replace(/^node:/, '').replace(/\/.*$/, '');
          const stubKey = bare + '-stub';
          console.log(`[stub] node: "${args.path}" from ${args.importer}`);
          return {path: stubKey in STUBS ? stubKey : 'empty-stub', namespace: 'stub'};
        });
        build.onResolve({filter: /^stream$/}, (args) => {
          console.log(`[stub] bare "stream" from ${args.importer}`);
          return {path: 'stream-stub', namespace: 'stub'};
        });
        build.onResolve({filter: /^events$/}, () => ({path: 'events-stub', namespace: 'stub'}));
        build.onResolve({filter: /^util$/}, () => ({path: 'util-stub', namespace: 'stub'}));
        build.onResolve({filter: /^buffer$/}, () => ({path: 'buffer-stub', namespace: 'stub'}));
        build.onResolve({filter: /^string_decoder$/}, () => ({path: 'string-decoder-stub', namespace: 'stub'}));
        build.onResolve({filter: /^(os|path|fs|url|http|https|crypto|zlib|assert|tty|net|dns|child_process|vm|readline|perf_hooks|async_hooks|worker_threads|cluster|module|v8|inspector|timers|querystring|domain)$/}, (args) => {
          console.log(`[stub] bare built-in "${args.path}"`);
          return {path: 'empty-stub', namespace: 'stub'};
        });
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

let outputText = result.outputFiles[0].text;

// Diagnostic: show first lines of output and search for stream imports
const outFirstLines = outputText.split('\n').slice(0, 30);
console.log('=== dist/worker/index.js first 30 lines ===');
console.log(outFirstLines.join('\n'));
console.log('=== end worker bundle header ===');

const streamImportRE = /^import[^;\n]*["'](?:node:)?stream["']/gm;
const streamMatches = [...outputText.matchAll(streamImportRE)];
console.log(`Stream imports remaining in output: ${streamMatches.length}`);
streamMatches.forEach(m => console.log(`  >> ${m[0]}`));

if (streamMatches.length > 0) {
  console.log('Post-processing: replacing stream imports with inline stub...');
  const inlineStreamStub = `(function(){${EE_IMPL}function inherits(C,P){C.prototype=Object.create(P.prototype,{constructor:{value:C}});}function Stream(){EE.call(this);}inherits(Stream,EE);Stream.Readable=function Readable(){Stream.call(this);this.readable=true;};inherits(Stream.Readable,Stream);Stream.Writable=function Writable(){Stream.call(this);this.writable=true;};inherits(Stream.Writable,Stream);Stream.Duplex=function Duplex(){Stream.Readable.call(this);this.writable=true;};inherits(Stream.Duplex,Stream.Readable);Stream.Transform=function Transform(){Stream.Duplex.call(this);};inherits(Stream.Transform,Stream.Duplex);Stream.PassThrough=function PassThrough(){Stream.Transform.call(this);};inherits(Stream.PassThrough,Stream.Transform);Stream.Stream=Stream;Stream.pipeline=function(){var cb=arguments[arguments.length-1];if(typeof cb==='function')cb(null);};return Stream;})()`;
  outputText = outputText.replace(
    /^import (\w+) from ["'](?:node:)?stream["'];?$/gm,
    (_, name) => `var ${name} = ${inlineStreamStub};`
  );
  outputText = outputText.replace(
    /^import \* as (\w+) from ["'](?:node:)?stream["'];?$/gm,
    (_, name) => `var ${name} = ${inlineStreamStub};`
  );
  outputText = outputText.replace(
    /^import \{([^}]+)\} from ["'](?:node:)?stream["'];?$/gm,
    (_, names) => {
      const _s = inlineStreamStub;
      const parts = names.split(',').map(n => n.trim()).map(n => {
        const [orig, alias] = n.split(' as ').map(s => s.trim());
        return alias ? `var ${alias} = _s.${orig}` : `var ${orig} = _s.${orig}`;
      });
      return `var _s = ${_s}; ${parts.join('; ')};`;
    }
  );
  console.log('Post-processing done.');
}

await writeFile('dist/worker/index.js', outputText);
console.log(`Worker bundle created at dist/worker/index.js (${(outputText.length / 1024).toFixed(1)}kb)`);
