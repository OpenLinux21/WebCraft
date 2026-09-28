// Lesson 23 - Build the <color-chip> element.
// The page already uses <color-chip> three times; your class brings
// them to life. All of the chip's markup and styles live in its
// Shadow DOM.

// TODO 1: create the class:
//   class ColorChip extends HTMLElement {
//     - constructor(): call super() FIRST, then
//       this.attachShadow({ mode: "open" })
//     - static observedAttributes = ["hex", "label"]
//     - connectedCallback(): call this.render()
//     - attributeChangedCallback(name, oldValue, newValue): if the value
//       actually changed, call this.render()
//   }

// TODO 2: write render() - the single place that writes to
// this.shadowRoot.innerHTML. Inside, build:
//   - a <style> block with:
//       :host { display: inline-flex; ... }   (the element's own face)
//       .chip { the swatch: width/height, rounded, background: the hex }
//       .caption { the text beside the swatch }
//   - a .chip span and a .caption span
//
// Read the attributes, with fallbacks:
//   const hex = this.getAttribute("hex") ?? "#cccccc";
//   const label = this.getAttribute("label") ?? hex;  // no label -> show hex
//
// Remember: attributes are strings, which is exactly right for colors.

// TODO 3: register the element, guarded against double definition:
//   if (!customElements.get("color-chip")) {
//     customElements.define("color-chip", ColorChip);
//   }

// TODO 4: verify the lifecycle - after the chips render, open the
// console and run:
//   document.querySelector("color-chip").setAttribute("hex", "#d81b60");
// The first chip must change immediately, because
// attributeChangedCallback re-renders on observed attribute changes.
