import {Link, useRouteLoaderData} from '@remix-run/react';

export default function Header({shopName}) {
  const root = useRouteLoaderData('root');
  const cartId = root?.cartId;

  return (
    <header className="site-header">
      <Link to="/" className="site-logo">{shopName ?? 'TRIIIPLE'}</Link>
      <nav className="site-nav">
        <Link to="/collections">Shop</Link>
        <Link to="/cart" className="cart-link">
          Cart{cartId ? ' •' : ''}
        </Link>
      </nav>
    </header>
  );
}
