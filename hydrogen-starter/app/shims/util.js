// Minimal util shim for Cloudflare Workers / Oxygen

export function inherits(Ctor, Super) {
  Ctor.prototype = Object.create(Super.prototype, {
    constructor: {value: Ctor, writable: true, configurable: true},
  });
}
export function inspect(value) { return String(value); }
export function format(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[sdifjoO%]/g, (m) => {
    if (m === '%%') return '%';
    if (i >= args.length) return m;
    return String(args[i++]);
  });
}
export function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, val) => { if (err) reject(err); else resolve(val); });
    });
  };
}
export function debuglog() { return function () {}; }
export function deprecate(fn) { return fn; }
export function isBuffer(value) { return false; }
export const types = {
  isUint8Array: (v) => v instanceof Uint8Array,
  isArrayBuffer: (v) => v instanceof ArrayBuffer,
  isAsyncFunction: (v) => typeof v === 'function' && Object.prototype.toString.call(v) === '[object AsyncFunction]',
  isGeneratorFunction: (v) => typeof v === 'function' && v.constructor?.name === 'GeneratorFunction',
  isNativeError: (v) => v instanceof Error,
  isRegExp: (v) => v instanceof RegExp,
  isDate: (v) => v instanceof Date,
  isMap: (v) => v instanceof Map,
  isSet: (v) => v instanceof Set,
  isWeakMap: (v) => v instanceof WeakMap,
  isWeakSet: (v) => v instanceof WeakSet,
};

export default {inherits, inspect, format, promisify, debuglog, deprecate, isBuffer, types};
