/*
 * <pdp-share> — minimal custom element. The share row is pure anchors
 * that open channel share URLs in a new tab, so no JS wiring is needed
 * beyond registering the element for structural consistency.
 */
(function () {
  'use strict';
  if (customElements.get('pdp-share')) return;

  class PdpShare extends HTMLElement {}

  customElements.define('pdp-share', PdpShare);
})();
