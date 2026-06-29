import {json} from '@shopify/remix-oxygen';
import {useLoaderData, Form, Link} from '@remix-run/react';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') || '';

  if (!query) return json({results: null, query});

  const {products} = await context.storefront.query(`#graphql
    query Search($query: String!) {
      products(first: 20, query: $query) {
        edges {
          node {
            id title handle
            featuredImage { url altText }
            priceRange { minVariantPrice { amount currencyCode } }
          }
        }
      }
    }
  `, {variables: {query}});

  return json({results: products.edges, query});
}

export default function Search() {
  const {results, query} = useLoaderData();
  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: '40px 20px'}}>
      <h1>Search</h1>
      <Form method="get">
        <input name="q" defaultValue={query} placeholder="Search products…" style={{width: '100%', padding: 8, marginBottom: 24}} />
      </Form>
      {results && (
        <ul style={{listStyle: 'none', padding: 0}}>
          {results.map(({node}) => (
            <li key={node.id} style={{marginBottom: 16}}>
              <Link to={`/products/${node.handle}`}>{node.title}</Link>
            </li>
          ))}
          {results.length === 0 && <p>No results for &ldquo;{query}&rdquo;</p>}
        </ul>
      )}
    </div>
  );
}
