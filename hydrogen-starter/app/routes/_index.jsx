import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import {createStorefront} from '~/lib/storefront.server';

export async function loader({context, request}) {
  const storefront = createStorefront({env: context.env, request});

  const {collections} = await storefront.query(FEATURED_COLLECTIONS_QUERY, {
    variables: {first: 3},
  });

  return json({collections});
}

export default function Index() {
  const {collections} = useLoaderData();

  return (
    <div className="home">
      <section className="home-hero">
        <h1>TRIIIPLE</h1>
        <p>Premium menswear basics.</p>
        <Link to="/collections">Shop All</Link>
      </section>

      <section className="home-collections">
        <h2>Featured Collections</h2>
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
      </section>
    </div>
  );
}

const FEATURED_COLLECTIONS_QUERY = `#graphql
  query FeaturedCollections($first: Int!) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
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
