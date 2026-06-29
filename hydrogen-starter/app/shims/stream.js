// Minimal Node.js stream shim for Oxygen (Cloudflare Workers).
// Provides just enough surface area for packages that import 'stream'
// without actually needing Node stream I/O at runtime.
import {EventEmitter} from './events.js';

function inherits(Ctor, Super) {
  Ctor.prototype = Object.create(Super.prototype, {
    constructor: {value: Ctor, writable: true, configurable: true},
  });
}

function Stream() {
  EventEmitter.call(this);
}
inherits(Stream, EventEmitter);
Stream.prototype.pipe = function (dest) {
  return dest;
};

function Readable(opts) {
  Stream.call(this);
  this.readable = true;
  this._readableState = {objectMode: !!(opts && opts.objectMode)};
  this.push = function () {};
  this.read = function () {
    return null;
  };
}
inherits(Readable, Stream);
Readable.prototype.setEncoding = function () {
  return this;
};
Readable.prototype.resume = function () {
  return this;
};
Readable.prototype.pause = function () {
  return this;
};
Readable.prototype.destroy = function () {
  return this;
};

function Writable(opts) {
  Stream.call(this);
  this.writable = true;
  this._writableState = {objectMode: !!(opts && opts.objectMode)};
}
inherits(Writable, Stream);
Writable.prototype.write = function (chunk, enc, cb) {
  if (typeof enc === 'function') enc();
  else if (typeof cb === 'function') cb();
  return true;
};
Writable.prototype.end = function (chunk, enc, cb) {
  if (typeof chunk === 'function') chunk();
  else if (typeof enc === 'function') enc();
  else if (typeof cb === 'function') cb();
  this.emit('finish');
};
Writable.prototype.destroy = function () {
  return this;
};

function Duplex(opts) {
  Readable.call(this, opts);
  this.writable = true;
}
inherits(Duplex, Readable);
Duplex.prototype.write = Writable.prototype.write;
Duplex.prototype.end = Writable.prototype.end;
Duplex.prototype.destroy = Writable.prototype.destroy;

function Transform(opts) {
  Duplex.call(this, opts);
  this._transformState = {needDrain: false};
}
inherits(Transform, Duplex);
Transform.prototype._transform = function (chunk, enc, cb) {
  cb(null, chunk);
};
Transform.prototype._flush = function (cb) {
  cb();
};

function PassThrough(opts) {
  Transform.call(this, opts);
}
inherits(PassThrough, Transform);
PassThrough.prototype._transform = function (chunk, enc, cb) {
  cb(null, chunk);
};

function pipeline() {
  var cb = arguments[arguments.length - 1];
  if (typeof cb === 'function') cb(null);
}

Stream.Stream = Stream;
Stream.Readable = Readable;
Stream.Writable = Writable;
Stream.Duplex = Duplex;
Stream.Transform = Transform;
Stream.PassThrough = PassThrough;
Stream.pipeline = pipeline;

export default Stream;
export {Stream, Readable, Writable, Duplex, Transform, PassThrough, pipeline};
