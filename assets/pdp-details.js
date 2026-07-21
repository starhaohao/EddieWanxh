/*
 * Product details accordion (below Add to Cart).
 * Vanilla JS, scoped to <pdp-details-accordion>. See
 * snippets/product-details-accordion.liquid for the markup this drives.
 */
(function () {
  'use strict';

  if (customElements.get('pdp-details-accordion')) return;

  class PdpDetailsAccordion extends HTMLElement {
    connectedCallback() {
      this.toggle = this.querySelector('[data-pdp-details-toggle]');
      this.reveal = this.querySelector('[data-pdp-details-reveal]');
      this.moreLabel = this.querySelector('[data-pdp-details-label-more]');
      this.lessLabel = this.querySelector('[data-pdp-details-label-less]');

      if (!this.toggle || !this.reveal) return;

      this.expanded = false;
      this.onToggleClick = this.onToggleClick.bind(this);
      this.toggle.addEventListener('click', this.onToggleClick);
    }

    disconnectedCallback() {
      if (this.toggle) this.toggle.removeEventListener('click', this.onToggleClick);
    }

    onToggleClick() {
      this.setExpanded(!this.expanded);
    }

    setExpanded(expanded) {
      this.expanded = expanded;
      this.reveal.setAttribute('data-expanded', expanded ? 'true' : 'false');
      this.toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');

      if (this.moreLabel) this.moreLabel.setAttribute('aria-hidden', expanded ? 'true' : 'false');
      if (this.lessLabel) this.lessLabel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }
  }

  customElements.define('pdp-details-accordion', PdpDetailsAccordion);
})();
