import {useRouteError, isRouteErrorResponse} from '@remix-run/react';

export async function loader({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const {origin} = url;

  // Check for Shopify redirect with a timeout so health checks don't hang
  const result = await Promise.race([
    storefront.query(`#graphql
      query redirect($url: String!) {
        urlRedirects(first: 1, query: $url) {
          edges { node { target } }
        }
      }
    `, {variables: {url: url.pathname}}),
    new Promise((resolve) => setTimeout(() => resolve(null), 5000)),
  ]).catch(() => null);

  const target = result?.urlRedirects?.edges?.[0]?.node?.target;
  if (target) {
    return Response.redirect(new URL(target, origin).toString(), 301);
  }

  throw new Response(null, {status: 404});
}

export default function CatchAll() {
  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div style={{textAlign: 'center', padding: '80px 20px'}}>
        <h1>404 — Page not found</h1>
        <a href="/">Back to home</a>
      </div>
    );
  }
  throw error;
}
