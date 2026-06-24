import {json, redirect} from '@shopify/remix-oxygen';
import {useLoaderData, useFetcher, Link} from '@remix-run/react';
import {createStorefront} from '~/lib/storefront.server';

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({context, request}) {
  const storefront = createStorefront({env: context.env, request});
  const cartId = context.session.get('cartId');

  if (!cartId) return json({cart: null});

  const {cart} = await storefront.query(CART_QUERY, {variables: {cartId}});
  return json({cart});
}

// ─── Action ───────────────────────────────────────────────────────────────────

export async function action({request, context}) {
  const storefront = createStorefront({env: context.env, request});
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'add': {
      const merchandiseId = formData.get('merchandiseId');
      const quantity = Number(formData.get('quantity') ?? 1);

      let cartId = context.session.get('cartId');

      if (!cartId) {
        // Create a new cart
        const {cartCreate} = await storefront.mutate(CART_CREATE_MUTATION, {
          variables: {
            input: {lines: [{merchandiseId, quantity}]},
          },
        });
        cartId = cartCreate.cart.id;
        context.session.set('cartId', cartId);
      } else {
        // Add to existing cart
        await storefront.mutate(CART_LINES_ADD_MUTATION, {
          variables: {
            cartId,
            lines: [{merchandiseId, quantity}],
          },
        });
      }

      return json({ok: true});
    }

    case 'remove': {
      const cartId = context.session.get('cartId');
      const lineId = formData.get('lineId');

      if (!cartId || !lineId) return json({ok: false});

      await storefront.mutate(CART_LINES_REMOVE_MUTATION, {
        variables: {cartId, lineIds: [lineId]},
      });

      return json({ok: true});
    }

    case 'update': {
      const cartId = context.session.get('cartId');
      const lineId = formData.get('lineId');
      const quantity = Number(formData.get('quantity'));

      if (!cartId || !lineId) return json({ok: false});

      if (quantity === 0) {
        await storefront.mutate(CART_LINES_REMOVE_MUTATION, {
          variables: {cartId, lineIds: [lineId]},
        });
      } else {
        await storefront.mutate(CART_LINES_UPDATE_MUTATION, {
          variables: {cartId, lines: [{id: lineId, quantity}]},
        });
      }

      return json({ok: true});
    }

    case 'checkout': {
      const cartId = context.session.get('cartId');
      if (!cartId) return redirect('/');

      const {cart} = await storefront.query(CART_CHECKOUT_URL_QUERY, {
        variables: {cartId},
      });

      if (!cart?.checkoutUrl) return json({ok: false});

      return redirect(cart.checkoutUrl);
    }

    default:
      return json({ok: false}, {status: 400});
  }
}

// ─── View ─────────────────────────────────────────────────────────────────────

export default function Cart() {
  const {cart} = useLoaderData();
  const fetcher = useFetcher();

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <div className="cart-empty">
        <h1>Your cart is empty</h1>
        <Link to="/collections">Keep shopping</Link>
      </div>
    );
  }

  const subtotal = cart.cost.subtotalAmount;

  return (
    <div className="cart-page">
      <h1>Cart</h1>

      <ul className="cart-lines">
        {cart.lines.nodes.map((line) => (
          <CartLine key={line.id} line={line} fetcher={fetcher} />
        ))}
      </ul>

      <div className="cart-summary">
        <p className="cart-subtotal">
          Subtotal: {subtotal.currencyCode} {subtotal.amount}
        </p>

        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="checkout" />
          <button type="submit" className="btn-checkout">
            Checkout
          </button>
        </fetcher.Form>
      </div>
    </div>
  );
}

function CartLine({line, fetcher}) {
  const {id, merchandise, quantity, cost} = line;

  return (
    <li className="cart-line">
      {merchandise.image && (
        <img src={merchandise.image.url} alt={merchandise.image.altText ?? merchandise.title} />
      )}

      <div className="cart-line-info">
        <Link to={`/products/${merchandise.product.handle}`}>
          {merchandise.product.title}
        </Link>
        {merchandise.title !== 'Default Title' && <p>{merchandise.title}</p>}

        <div className="cart-line-qty">
          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="lineId" value={id} />
            <input type="hidden" name="quantity" value={Math.max(0, quantity - 1)} />
            <button type="submit" aria-label="Decrease quantity">−</button>
          </fetcher.Form>

          <span>{quantity}</span>

          <fetcher.Form method="post">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="lineId" value={id} />
            <input type="hidden" name="quantity" value={quantity + 1} />
            <button type="submit" aria-label="Increase quantity">+</button>
          </fetcher.Form>
        </div>

        <p className="cart-line-price">
          {cost.totalAmount.currencyCode} {cost.totalAmount.amount}
        </p>

        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="remove" />
          <input type="hidden" name="lineId" value={id} />
          <button type="submit" className="btn-remove">Remove</button>
        </fetcher.Form>
      </div>
    </li>
  );
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const CART_QUERY = `#graphql
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
      }
      lines(first: 50) {
        nodes {
          id
          quantity
          cost {
            totalAmount { amount currencyCode }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              image {
                url
                altText
              }
              product {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = `#graphql
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `#graphql
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart { id }
      userErrors { field message }
    }
  }
`;

const CART_CHECKOUT_URL_QUERY = `#graphql
  query CartCheckoutUrl($cartId: ID!) {
    cart(id: $cartId) {
      checkoutUrl
    }
  }
`;
