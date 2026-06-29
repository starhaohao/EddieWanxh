// Buffer shim for Cloudflare Workers / Oxygen
// Cloudflare Workers has a native Buffer global; fall back to a minimal impl.

const B =
  (typeof globalThis !== 'undefined' && globalThis.Buffer) ||
  (() => {
    function FakeBuffer() {}
    FakeBuffer.isBuffer = () => false;
    FakeBuffer.from = (v) => {
      if (typeof v === 'string') return new TextEncoder().encode(v);
      if (v instanceof ArrayBuffer || ArrayBuffer.isView(v)) return new Uint8Array(v);
      return new Uint8Array(0);
    };
    FakeBuffer.alloc = (n) => new Uint8Array(n);
    FakeBuffer.allocUnsafe = (n) => new Uint8Array(n);
    FakeBuffer.concat = (bufs) => {
      const total = bufs.reduce((s, b) => s + b.length, 0);
      const out = new Uint8Array(total);
      let offset = 0;
      for (const b of bufs) { out.set(b, offset); offset += b.length; }
      return out;
    };
    return FakeBuffer;
  })();

export {B as Buffer};
export default {Buffer: B};
