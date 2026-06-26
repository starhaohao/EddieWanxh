import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {createStorefront} from '~/lib/storefront.server';

export async function loader({params, context, request}) {
  const {handle} = params;
  const storefront = createStorefront({env: context.env, request});

  const {collection} = await storefront.query(COLLECTION_QUERY, {
    variables: {handle, first: 24},
  });

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }

  return json({collection});
}

export default function Collection() {
  const {collection} = useLoaderData();

  return (
    <div className="collection-page">
      {collection.image && (
        <img
          className="collection-hero"
          src={collection.image.url}
          alt={collection.image.altText ?? collection.title}
        />
      )}
      <h1>{collection.title}</h1>
      {collection.description && <p>{collection.description}</p>}

      <div className="product-grid">
        {collection.products.nodes.map((product) => (
          <Link key={product.id} to={`/products/${product.handle}`} className="product-card">
            {product.featuredImage && (
              <img
                src={product.featuredImage.url}
                alt={product.featuredImage.altText ?? product.title}
              />
            )}
            <h3>{product.title}</h3>
            <p>
              {product.priceRange.minVariantPrice.currencyCode}{' '}
              {product.priceRange.minVariantPrice.amount}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
