// Minimal EventEmitter shim for Cloudflare Workers / Oxygen

export function EventEmitter() {
  this._events = {};
}
EventEmitter.prototype.on = function (ev, fn) {
  if (!this._events[ev]) this._events[ev] = [];
  this._events[ev].push(fn);
  return this;
};
EventEmitter.prototype.once = function (ev, fn) {
  var self = this;
  function wrap() { self.off(ev, wrap); fn.apply(this, arguments); }
  wrap._orig = fn;
  return this.on(ev, wrap);
};
EventEmitter.prototype.off = function (ev, fn) {
  if (!this._events[ev]) return this;
  this._events[ev] = this._events[ev].filter(function (f) { return f !== fn && f._orig !== fn; });
  return this;
};
EventEmitter.prototype.removeListener = EventEmitter.prototype.off;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;
EventEmitter.prototype.emit = function (ev) {
  var args = Array.prototype.slice.call(arguments, 1);
  var fns = (this._events[ev] || []).slice();
  for (var i = 0; i < fns.length; i++) fns[i].apply(this, args);
  return fns.length > 0;
};
EventEmitter.prototype.removeAllListeners = function (ev) {
  if (ev) delete this._events[ev]; else this._events = {};
  return this;
};
EventEmitter.prototype.listeners = function (ev) { return (this._events[ev] || []).slice(); };
EventEmitter.prototype.setMaxListeners = function () { return this; };

export default {EventEmitter};
