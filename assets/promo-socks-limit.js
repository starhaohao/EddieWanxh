/**
 * Storefront-side safeguard for the "pair-with-socks" promo offer, which is
 * meant to be limited to 1 pair per transaction. This is a UX guard only —
 * it disables the offer's Add trigger(s) once the cart already contains the
 * item, so a customer can't accidentally add a second one from the
 * storefront. It cannot stop every path (e.g. direct API calls), so the
 * real limit must also be set as a Shopify Quantity Rule (min 1 / max 1)
 * on the pair-with-socks product's variants in Admin.
 */
(function () {
  var HANDLE = 'pair-with-socks';
  var TRIGGER_SELECTOR = '[data-promo-socks-trigger]';
  var OFFER_SELECTOR = '[data-promo-socks-offer]';
  var ALREADY_ADDED_TEXT = 'Already in your cart';

  function setTriggerState(inCart) {
    document.querySelectorAll(TRIGGER_SELECTOR).forEach(function (btn) {
      if (inCart) {
        btn.setAttribute('disabled', 'disabled');
        btn.dataset.promoSocksLimited = 'true';
        var textEl = btn.querySelector('.btn__text');
        if (textEl && !btn.dataset.promoSocksOrigText) {
          btn.dataset.promoSocksOrigText = textEl.textContent;
          textEl.textContent = ALREADY_ADDED_TEXT;
        }
      } else if (btn.dataset.promoSocksLimited === 'true') {
        btn.removeAttribute('disabled');
        btn.dataset.promoSocksLimited = 'false';
        var textEl2 = btn.querySelector('.btn__text');
        if (textEl2 && btn.dataset.promoSocksOrigText) {
          textEl2.textContent = btn.dataset.promoSocksOrigText;
        }
      }
    });
  }

  function refreshFromCart() {
    if (!document.querySelector(OFFER_SELECTOR)) return;

    fetch('/cart.js', { headers: { Accept: 'application/json' } })
      .then(function (res) { return res.json(); })
      .then(function (cart) {
        var qty = 0;
        (cart.items || []).forEach(function (item) {
          if (item.handle === HANDLE) qty += item.quantity;
        });
        setTriggerState(qty >= 1);
      })
      .catch(function () {
        /* silent: don't block the offer UI on a network hiccup */
      });
  }

  document.addEventListener('DOMContentLoaded', refreshFromCart);
  document.addEventListener('cart:refresh', refreshFromCart);
  document.addEventListener('theme:cart:change', refreshFromCart);
  document.addEventListener('theme:cart:refresh', refreshFromCart);

  if (document.readyState !== 'loading') {
    refreshFromCart();
  }
})();
