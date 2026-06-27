/**
 * TRIIIPLE Studio — scroll-triggered fade-up animations
 * Observes [data-ts-fade] elements and adds .ts-visible when in viewport.
 * Load once (guarded by window.__tsAnim) from the first section on the page.
 */
(function () {
  if (window.__tsAnim) return;
  window.__tsAnim = true;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('ts-visible');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -48px 0px', threshold: 0.08 }
  );

  function observe() {
    document.querySelectorAll('[data-ts-fade]:not(.ts-visible)').forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe);
  } else {
    observe();
  }

  /* Re-run after Shopify section re-renders in editor */
  document.addEventListener('shopify:section:load', function () {
    setTimeout(observe, 80);
  });
})();
