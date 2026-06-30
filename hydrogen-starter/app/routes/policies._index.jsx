import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Link} from '@remix-run/react';

export async function loader({context}) {
  const {shop} = await context.storefront.query(`#graphql
    query Policies {
      shop {
        privacyPolicy { id title handle }
        shippingPolicy { id title handle }
        termsOfService { id title handle }
        refundPolicy { id title handle }
      }
    }
  `);

  const policies = Object.values(shop).filter(Boolean);
  return json({policies});
}

export default function Policies() {
  const {policies} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>Policies</h1>
      <ul>
        {policies.map((p) => (
          <li key={p.id}>
            <Link to={`/policies/${p.handle}`}>{p.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
