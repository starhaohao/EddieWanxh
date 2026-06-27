/* Quick-add to cart — layers onto existing Broadcast theme product grid items */
(function () {
  'use strict';

  var TOAST_ID = 'qa-toast';

  function getOrCreateToast() {
    var t = document.getElementById(TOAST_ID);
    if (!t) {
      t = document.createElement('div');
      t.id = TOAST_ID;
      t.setAttribute('aria-live', 'polite');
      t.style.cssText = [
        'position:fixed',
        'bottom:32px',
        'left:50%',
        'transform:translateX(-50%) translateY(16px)',
        'background:#1a1d20',
        'color:#fff',
        'font-family:monospace',
        'font-size:9px',
        'letter-spacing:0.14em',
        'text-transform:uppercase',
        'padding:12px 24px',
        'opacity:0',
        'transition:opacity 0.25s,transform 0.25s',
        'z-index:9999',
        'pointer-events:none',
        'white-space:nowrap',
        'border:1px solid rgba(255,255,255,0.12)'
      ].join(';');
      document.body.appendChild(t);
    }
    return t;
  }

  function showToast(msg) {
    var t = getOrCreateToast();
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(16px)';
    }, 2500);
  }

  function addToCart(variantId, btn) {
    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = '···';

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var name = data.title || 'Item';
        showToast(name + ' — added to cart');
        btn.textContent = '✓';
        document.dispatchEvent(new CustomEvent('cart:refresh'));
        setTimeout(function () { btn.textContent = orig; btn.disabled = false; }, 2000);
      })
      .catch(function () {
        btn.textContent = orig;
        btn.disabled = false;
      });
  }

  /* Build the overlay for a single product card */
  function buildOverlay(card) {
    if (card.querySelector('.qa-overlay')) return;

    var productUrl = card.querySelector('a[href*="/products/"]');
    if (!productUrl) return;

    var handle = (productUrl.getAttribute('href').match(/\/products\/([^?#/]+)/) || [])[1];
    if (!handle) return;

    var overlay = document.createElement('div');
    overlay.className = 'qa-overlay';
    overlay.innerHTML = '<div class="qa-loading">···</div>';

    /* position relative to the card image */
    var imgWrap = card.querySelector('.product-item__image, .card__media, .media, [class*="product-item__bg"]');
    (imgWrap || card).style.position = 'relative';
    (imgWrap || card).appendChild(overlay);

    /* fetch variants once on hover */
    var fetched = false;
    card.addEventListener('mouseenter', function () {
      if (fetched) return;
      fetched = true;

      fetch('/products/' + handle + '.js')
        .then(function (r) { return r.json(); })
        .then(function (product) {
          var sizeOption = product.options.indexOf('Size');
          var variants = product.variants;

          overlay.innerHTML = '';

          if (sizeOption !== -1) {
            /* render size buttons */
            var wrap = document.createElement('div');
            wrap.className = 'qa-sizes';

            var seen = {};
            variants.forEach(function (v) {
              var size = v['option' + (sizeOption + 1)];
              if (seen[size]) return;
              seen[size] = true;

              var btn = document.createElement('button');
              btn.className = 'qa-size' + (v.available ? '' : ' qa-size--oos');
              btn.textContent = size;
              btn.disabled = !v.available;
              btn.dataset.variantId = v.id;
              wrap.appendChild(btn);
            });
            overlay.appendChild(wrap);
          } else {
            /* single ATC button */
            var firstAvail = variants.find(function (v) { return v.available; });
            var btn = document.createElement('button');
            btn.className = 'qa-btn';
            btn.textContent = firstAvail ? 'Add to Cart' : 'Sold Out';
            btn.disabled = !firstAvail;
            if (firstAvail) btn.dataset.variantId = firstAvail.id;
            overlay.appendChild(btn);
          }
        })
        .catch(function () { fetched = false; overlay.innerHTML = ''; });
    });

    /* delegate click on overlay */
    overlay.addEventListener('click', function (e) {
      var btn = e.target.closest('.qa-size:not([disabled]), .qa-btn:not([disabled])');
      if (btn && btn.dataset.variantId) addToCart(btn.dataset.variantId, btn);
    });
  }

  function initCards() {
    var selectors = [
      '.product-item',
      '.grid-product',
      '.card-wrapper',
      '.product-card-wrapper',
      '[data-product-id]'
    ];
    var cards = document.querySelectorAll(selectors.join(','));
    cards.forEach(buildOverlay);
  }

  /* init on DOM ready and after ajax navigation */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCards);
  } else {
    initCards();
  }

  /* re-init after Ajaxinate / infinite scroll injects new cards */
  document.addEventListener('Ajaxinate:complete', initCards);
  document.addEventListener('ajaxinate:update', initCards);

  /* inject styles */
  var style = document.createElement('style');
  style.textContent = [
    '.qa-overlay{',
    'position:absolute;bottom:0;left:0;right:0;',
    'padding:6px;',
    'opacity:0;transform:translateY(4px);',
    'transition:opacity 0.22s,transform 0.22s;',
    'pointer-events:none;',
    'z-index:10;',
    'background:linear-gradient(to top,rgba(10,10,10,0.7) 0%,transparent 100%);',
    '}',
    '.product-item:hover .qa-overlay,',
    '.grid-product:hover .qa-overlay,',
    '.card-wrapper:hover .qa-overlay,',
    '.product-card-wrapper:hover .qa-overlay,',
    '[data-product-id]:hover .qa-overlay{',
    'opacity:1;transform:translateY(0);pointer-events:auto;',
    '}',
    '.qa-sizes{display:flex;gap:4px;flex-wrap:wrap;justify-content:center;}',
    '.qa-size,.qa-btn{',
    'padding:7px 10px;',
    'font-family:monospace;font-size:9px;letter-spacing:0.1em;text-transform:uppercase;',
    'border:1px solid rgba(255,255,255,0.4);background:rgba(255,255,255,0.08);color:#fff;',
    'cursor:pointer;transition:background 0.15s,border-color 0.15s;',
    'min-width:36px;text-align:center;',
    '}',
    '.qa-size:hover:not([disabled]),.qa-btn:hover:not([disabled]){background:rgba(255,255,255,0.9);color:#111;border-color:rgba(255,255,255,0.9);}',
    '.qa-size--oos{opacity:0.3;text-decoration:line-through;cursor:not-allowed;}',
    '.qa-btn{width:100%;}',
    '.qa-loading{text-align:center;color:rgba(255,255,255,0.4);font-family:monospace;font-size:10px;padding:8px;}',
    '@media(max-width:749px){',
    '.qa-overlay{opacity:1;transform:none;pointer-events:auto;}',
    '}'
  ].join('');
  document.head.appendChild(style);
})();
