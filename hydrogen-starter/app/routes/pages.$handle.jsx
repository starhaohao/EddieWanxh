import {json} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader({params, context}) {
  const {page} = await context.storefront.query(`#graphql
    query Page($handle: String!) {
      page(handle: $handle) {
        id title body bodySummary
      }
    }
  `, {variables: {handle: params.handle}});

  if (!page) throw new Response(null, {status: 404});
  return json({page});
}

export default function Page() {
  const {page} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{__html: page.body}} />
    </div>
  );
}
