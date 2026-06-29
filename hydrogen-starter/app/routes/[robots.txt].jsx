export async function loader({request}) {
  const url = new URL(request.url);
  return new Response(
    [
      'User-agent: *',
      'Disallow: /admin',
      'Disallow: /cart',
      'Disallow: /orders',
      'Disallow: /checkouts/',
      'Disallow: /checkout',
      `Sitemap: ${url.origin}/sitemap.xml`,
    ].join('\n'),
    {headers: {'Content-Type': 'text/plain'}},
  );
}
