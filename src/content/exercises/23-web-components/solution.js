// Lesson 23 - Build the <color-chip> element (solution).
// One render() method, fed by attributes, is the whole architecture:
// connectedCallback and attributeChangedCallback both just call it.

class ColorChip extends HTMLElement {
  // Only these attribute changes are reported to the lifecycle.
  static observedAttributes = ['hex', 'label'];

  constructor() {
    super(); // HTMLElement's constructor must run first
    // The shadow root exists before any render can happen.
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    // Runs whenever the element enters a document - including again
    // after being moved, so it is always safe to render here.
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.render();
  }

  render() {
    // Attributes are the configuration channel and are strings,
    // which is exactly right for colors and short captions.
    // Attribute values are attacker-controllable strings: validate the color
    // and never interpolate the caption into markup.
    const rawHex = this.getAttribute('hex') ?? '#cccccc';
    const hex = /^#[0-9a-f]{3,8}$/i.test(rawHex) ? rawHex : '#cccccc';
    const label = this.getAttribute('label') ?? hex;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
        }
        .chip {
          width: 2.25rem;
          height: 2.25rem;
          border-radius: 50%;
          background: ${hex};
          border: 1px solid rgba(0, 0, 0, 0.2);
        }
        .caption {
          font-size: 0.9rem;
          font-weight: 600;
        }
      </style>
      <span class="chip" part="chip"></span>
      <span class="caption"></span>
    `;
    // textContent keeps the caption inert even when it contains markup.
    this.shadowRoot.querySelector('.caption').textContent = label;
  }
}

// define() is global and final, so guard against running twice.
if (!customElements.get('color-chip')) {
  customElements.define('color-chip', ColorChip);
}
