// @ts-ignore
import * as remixBuild from 'virtual:remix/server-build';
import {createRequestHandler} from '@shopify/remix-oxygen';
import {createStorefrontClient} from '@shopify/hydrogen';

export default {
  async fetch(request, env, executionContext) {
    const {storefront} = createStorefrontClient({
      cache: await caches.open('hydrogen'),
      waitUntil: (p) => executionContext.waitUntil(p),
      publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      storeDomain: env.PUBLIC_STORE_DOMAIN,
      storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || '2024-07',
    });

    const handleRequest = createRequestHandler({
      build: remixBuild,
      mode: process.env.NODE_ENV,
      getLoadContext: () => ({storefront, env}),
    });

    return handleRequest(request, executionContext);
  },
};
