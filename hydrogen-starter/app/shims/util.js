// Minimal Node.js util shim for Oxygen (Cloudflare Workers).
function inherits(Ctor, Super) {
  Ctor.prototype = Object.create(Super.prototype, {
    constructor: {value: Ctor, writable: true, configurable: true},
  });
}

function inspect(value) {
  return String(value);
}

function format(fmt, ...args) {
  let i = 0;
  return String(fmt).replace(/%[sdifjoO%]/g, (m) => {
    if (m === '%%') return '%';
    if (i >= args.length) return m;
    return String(args[i++]);
  });
}

function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, val) => {
        if (err) reject(err);
        else resolve(val);
      });
    });
  };
}

function debuglog() {
  return function () {};
}

function deprecate(fn) {
  return fn;
}

function isBuffer(value) {
  return false;
}

const types = {
  isUint8Array: (v) => v instanceof Uint8Array,
  isArrayBuffer: (v) => v instanceof ArrayBuffer,
  isAsyncFunction: (v) =>
    typeof v === 'function' &&
    Object.prototype.toString.call(v) === '[object AsyncFunction]',
  isGeneratorFunction: (v) =>
    typeof v === 'function' && v.constructor?.name === 'GeneratorFunction',
  isNativeError: (v) => v instanceof Error,
  isRegExp: (v) => v instanceof RegExp,
  isDate: (v) => v instanceof Date,
  isMap: (v) => v instanceof Map,
  isSet: (v) => v instanceof Set,
  isWeakMap: (v) => v instanceof WeakMap,
  isWeakSet: (v) => v instanceof WeakSet,
};

const util = {
  inherits,
  inspect,
  format,
  promisify,
  debuglog,
  deprecate,
  isBuffer,
  types,
};

export default util;
export {inherits, inspect, format, promisify, debuglog, deprecate, isBuffer, types};
