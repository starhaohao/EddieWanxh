/*
 * PDP share control. Native Web Share when available; otherwise the inline
 * social row stays visible. Copy Link writes location to the clipboard.
 * Vanilla JS, scoped to <pdp-share>.
 */
(function () {
  'use strict';
  if (customElements.get('pdp-share')) return;

  class PdpShare extends HTMLElement {
    connectedCallback() {
      this.url = this.getAttribute('data-share-url') || window.location.href;
      this.title = this.getAttribute('data-share-title') || document.title;
      this.nativeBtn = this.querySelector('[data-pdp-share-native]');
      this.row = this.querySelector('[data-pdp-share-row]');
      this.copyBtn = this.querySelector('[data-pdp-share-copy]');
      this.copyLabel = this.querySelector('[data-pdp-share-copy-label]');

      // Prefer the native share sheet on devices that support it.
      if (navigator.share && this.nativeBtn && this.row) {
        this.nativeBtn.hidden = false;
        this.row.hidden = true;
        this.nativeBtn.addEventListener('click', this.onNative.bind(this));
      }

      if (this.copyBtn) this.copyBtn.addEventListener('click', this.onCopy.bind(this));
    }

    onNative() {
      navigator.share({ title: this.title, url: this.url }).catch(function () {});
    }

    onCopy() {
      var self = this;
      var done = function () {
        if (!self.copyLabel) return;
        var prev = self.copyLabel.textContent;
        self.copyLabel.textContent = 'Copied';
        self.copyBtn.classList.add('is-copied');
        setTimeout(function () {
          self.copyLabel.textContent = prev;
          self.copyBtn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(this.url).then(done).catch(function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = this.url;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    }
  }

  customElements.define('pdp-share', PdpShare);
})();
