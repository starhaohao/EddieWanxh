/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@remix-run/dev" />

interface Env {
  SESSION_SECRET: string;
  PUBLIC_STOREFRONT_API_TOKEN: string;
  PUBLIC_STORE_DOMAIN: string;
  PUBLIC_STOREFRONT_API_VERSION: string;
}

declare module '@shopify/remix-oxygen' {
  interface AppLoadContext {
    env: Env;
    session: {
      get(key: string): string | undefined;
      set(key: string, value: string): void;
      unset(key: string): void;
      commit(): Promise<string>;
    };
    storefront: import('@shopify/hydrogen').Storefront;
    waitUntil: ExecutionContext['waitUntil'];
  }
}
