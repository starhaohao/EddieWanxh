import {createRequestHandler} from '@shopify/remix-oxygen';
import {createStorefront} from '~/lib/storefront.server';

// @ts-ignore
import * as remixBuild from 'virtual:remix/server-build';

export default {
  async fetch(request, env, executionContext) {
    const waitUntil = executionContext.waitUntil.bind(executionContext);
    const [cache, session] = await Promise.all([
      caches.open('hydrogen'),
      HydrogenSession.init(request, [env.SESSION_SECRET]),
    ]);

    const storefront = createStorefront({env, request});

    const handleRequest = createRequestHandler({
      build: remixBuild,
      mode: 'production',
      getLoadContext() {
        return {env, session, storefront, waitUntil};
      },
    });

    return handleRequest(request).catch((err) => {
      console.error(err);
      return new Response('Internal Server Error', {status: 500});
    });
  },
};

class HydrogenSession {
  #sessionStorage;
  #session;

  constructor(sessionStorage, session) {
    this.#sessionStorage = sessionStorage;
    this.#session = session;
  }

  static async init(request, secrets) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    });

    const session = await storage
      .getSession(request.headers.get('Cookie'))
      .catch(() => storage.getSession());

    return new HydrogenSession(storage, session);
  }

  get(key) {
    return this.#session.get(key);
  }

  set(key, value) {
    this.#session.set(key, value);
  }

  unset(key) {
    this.#session.unset(key);
  }

  async commit() {
    return this.#sessionStorage.commitSession(this.#session);
  }
}

function createCookieSessionStorage({cookie}) {
  return {
    async getSession(cookieHeader) {
      const data = {};
      if (cookieHeader) {
        try {
          const match = cookieHeader.match(new RegExp(`${cookie.name}=([^;]+)`));
          if (match) {
            const decoded = atob(decodeURIComponent(match[1]));
            Object.assign(data, JSON.parse(decoded));
          }
        } catch {}
      }
      return {
        _data: data,
        get: (key) => data[key],
        set: (key, val) => { data[key] = val; },
        unset: (key) => { delete data[key]; },
        _raw: data,
      };
    },
    async commitSession(session) {
      const encoded = encodeURIComponent(btoa(JSON.stringify(session._raw ?? session._data)));
      const maxAge = 60 * 60 * 24 * 30;
      return `${cookie.name}=${encoded}; Path=${cookie.path}; HttpOnly; SameSite=${cookie.sameSite}; Max-Age=${maxAge}`;
    },
  };
}
