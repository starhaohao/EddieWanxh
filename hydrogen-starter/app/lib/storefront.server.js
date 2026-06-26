import {createStorefrontClient} from '@shopify/hydrogen';

/**
 * Creates a Storefront client scoped to a single request.
 * Call this inside your loader/action and pass the returned `storefront` object.
 */
export function createStorefront({env, request}) {
  const {storefront} = createStorefrontClient({
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
    storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION ?? '2024-07',
    requestGroupId: request.headers.get('request-id'),
  });
  return storefront;
}
