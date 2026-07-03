import {getSitemapIndex} from '@shopify/hydrogen';

export async function loader({request, context: {storefront}}) {
  const response = await getSitemapIndex({
    storefront,
    request,
  });
  return response;
}
