import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';
import SaleHero from '~/components/SaleHero';

export async function loader() {
  return json({collections: {nodes: []}});
}

export default function Index() {
  const {collections} = useLoaderData();

  return (
    <div className="home">
      <SaleHero
        image={{
          url: 'https://cdn.shopify.com/s/files/1/placeholder/In_TRIIIPLE_Instagram_Post_45.jpg',
          altText: 'TRIIIPLE final clearance sale',
        }}
        heroHeight={100}
        overlayFrom="#2C0000"
        overlayTo="#1b1b1b52"
        eyebrow="Final Clearance"
        eyebrowColor="#f1f4f5"
        title="The<br/>Last Run."
        titleSize={84}
        subtitle="<strong>Buy 3</strong> — 15% off · <strong>Buy 5</strong> — 25% off<br/>Free shipping over $50 · Singapore"
        ctaText="Shop All"
        ctaUrl="/pages/fabric-and-size-guide"
        ctaBg="#344e5c"
        ctaTextColor="#f1f4f5"
        showUrgency
        urgencyLabel="Stock Status"
        urgencyText="<p>Wear it.</p><p>Own it.</p><p>Explain nothing.</p>"
        ghostCtas={[
          {label: 'Briefs', url: '/collections/briefs'},
          {label: 'Boxer Trunks', url: '/collections/boxer-trunks'},
          {label: 'Essentials', url: '/collections/essentials'},
        ]}
      />

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
