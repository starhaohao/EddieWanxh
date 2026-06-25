import {json} from '@shopify/remix-oxygen';
import {useLoaderData, useFetcher} from '@remix-run/react';
import {useState} from 'react';
import {createStorefront} from '~/lib/storefront.server';

export async function loader({params, context, request}) {
  const {handle} = params;
  const storefront = createStorefront({env: context.env, request});

  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {handle},
  });

  if (!product) {
    throw new Response('Product not found', {status: 404});
  }

  return json({product});
}

export default function Product() {
  const {product} = useLoaderData();
  const fetcher = useFetcher();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.nodes[0]?.id ?? null,
  );

  const isAdding = fetcher.state !== 'idle';

  return (
    <div className="product-page">
      <div className="product-media">
        {product.featuredImage && (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
          />
        )}
      </div>

      <div className="product-details">
        <h1>{product.title}</h1>
        <p className="product-price">
          {selectedVariant(product, selectedVariantId)?.price.currencyCode}{' '}
          {selectedVariant(product, selectedVariantId)?.price.amount}
        </p>

        {product.variants.nodes.length > 1 && (
          <div className="variant-picker">
            {product.variants.nodes.map((v) => (
              <button
                key={v.id}
                className={`variant-btn${v.id === selectedVariantId ? ' active' : ''}`}
                onClick={() => setSelectedVariantId(v.id)}
              >
                {v.title}
              </button>
            ))}
          </div>
        )}

        <fetcher.Form method="post" action="/cart">
          <input type="hidden" name="intent" value="add" />
          <input type="hidden" name="merchandiseId" value={selectedVariantId ?? ''} />
          <input type="hidden" name="quantity" value="1" />
          <button type="submit" disabled={isAdding || !selectedVariantId} className="btn-add-to-cart">
            {isAdding ? 'Adding…' : 'Add to Cart'}
          </button>
        </fetcher.Form>

        {product.descriptionHtml && (
          <div
            className="product-description"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          />
        )}
      </div>
    </div>
  );
}

function selectedVariant(product, variantId) {
  return product.variants.nodes.find((v) => v.id === variantId);
}

const PRODUCT_QUERY = `#graphql
  query Product($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      featuredImage {
        url
        altText
        width
        height
      }
      variants(first: 20) {
        nodes {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;
