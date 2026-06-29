import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';

export async function loader() {
  return json({collections: {nodes: []}});
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
