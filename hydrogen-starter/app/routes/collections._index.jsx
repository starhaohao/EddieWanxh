import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {createStorefront} from '~/lib/storefront.server';

export async function loader({context, request}) {
  const storefront = createStorefront({env: context.env, request});

  const {collections} = await storefront.query(ALL_COLLECTIONS_QUERY, {
    variables: {first: 20},
  });

  return json({collections});
}

export default function Collections() {
  const {collections} = useLoaderData();

  return (
    <div className="collections-page">
      <h1>All Collections</h1>
      <div className="collection-grid">
        {collections.nodes.map((col) => (
          <Link key={col.id} to={`/collections/${col.handle}`} className="collection-card">
            {col.image && (
              <img src={col.image.url} alt={col.image.altText ?? col.title} />
            )}
            <h3>{col.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}

const ALL_COLLECTIONS_QUERY = `#graphql
  query AllCollections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        image {
          url
          altText
          width
          height
        }
      }
    }
  }
`;
