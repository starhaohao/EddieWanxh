import {useRouteError, isRouteErrorResponse} from '@remix-run/react';

export async function loader() {
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
