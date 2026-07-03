import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

const POLICY_HANDLES = {
  'privacy-policy': 'privacyPolicy',
  'shipping-policy': 'shippingPolicy',
  'terms-of-service': 'termsOfService',
  'refund-policy': 'refundPolicy',
};

export async function loader({params, context}) {
  const field = POLICY_HANDLES[params.handle];
  if (!field) throw new Response(null, {status: 404});

  const {shop} = await context.storefront.query(`#graphql
    query Policy {
      shop {
        privacyPolicy { title body }
        shippingPolicy { title body }
        termsOfService { title body }
        refundPolicy { title body }
      }
    }
  `);

  const policy = shop[field];
  if (!policy) throw new Response(null, {status: 404});
  return json({policy});
}

export default function Policy() {
  const {policy} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>{policy.title}</h1>
      <div dangerouslySetInnerHTML={{__html: policy.body}} />
    </div>
  );
}
