import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react';
import {json} from '@shopify/remix-oxygen';
import {createStorefront} from '~/lib/storefront.server';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import styles from '~/styles/global.css?url';

export function links() {
  return [{rel: 'stylesheet', href: styles}];
}

export async function loader({context, request}) {
  const storefront = createStorefront({env: context.env, request});

  const {shop} = await storefront.query(SHOP_QUERY);

  return json({
    shop,
    cartId: context.session.get('cartId'),
  });
}

export default function App() {
  const {shop} = useLoaderData();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header shopName={shop.name} />
        <main>
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const SHOP_QUERY = `#graphql
  query ShopLayout {
    shop {
      name
      description
    }
  }
`;
