// Minimal EventEmitter shim for Oxygen (Cloudflare Workers) compatibility.
// Node's built-in 'events' module is unavailable in Oxygen; this covers the
// subset used by readable-stream (which is aliased from the 'stream' built-in).
class EventEmitter {
  constructor() {
    this._events = Object.create(null);
    this._maxListeners = 10;
  }

  setMaxListeners(n) {
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners;
  }

  on(event, fn) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(fn);
    return this;
  }

  addListener(event, fn) {
    return this.on(event, fn);
  }

  once(event, fn) {
    const wrapper = (...args) => {
      fn.apply(this, args);
      this.off(event, wrapper);
    };
    wrapper._original = fn;
    return this.on(event, wrapper);
  }

  off(event, fn) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(
        (f) => f !== fn && f._original !== fn,
      );
    }
    return this;
  }

  removeListener(event, fn) {
    return this.off(event, fn);
  }

  removeAllListeners(event) {
    if (event) {
      delete this._events[event];
    } else {
      this._events = Object.create(null);
    }
    return this;
  }

  emit(event, ...args) {
    const listeners = this._events[event];
    if (!listeners || listeners.length === 0) return false;
    listeners.slice().forEach((fn) => fn.apply(this, args));
    return true;
  }

  listeners(event) {
    return (this._events[event] || []).map((f) => f._original || f);
  }

  rawListeners(event) {
    return this._events[event] || [];
  }

  listenerCount(event) {
    return (this._events[event] || []).length;
  }

  eventNames() {
    return Object.keys(this._events);
  }

  prependListener(event, fn) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].unshift(fn);
    return this;
  }

  prependOnceListener(event, fn) {
    const wrapper = (...args) => {
      fn.apply(this, args);
      this.off(event, wrapper);
    };
    wrapper._original = fn;
    return this.prependListener(event, wrapper);
  }
}

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.defaultMaxListeners = 10;

export {EventEmitter};
export default EventEmitter;
