// Lesson 21 - Keyboard-accessible disclosure widget (solution).
// One toggle function owns both the real state and the announced
// state, so they can never drift apart.

const trigger = document.querySelector('.disclosure-trigger');
const panel = document.querySelector('#panel');

function toggle() {
  // Flip the real visibility state.
  panel.hidden = !panel.hidden;

  // Mirror it for screen readers: "true" when the panel is visible.
  const expanded = String(!panel.hidden);
  trigger.setAttribute('aria-expanded', expanded);

  // Mirror it visually: rotate the arrow via CSS.
  trigger.classList.toggle('open', panel.hidden === false);
}

trigger.addEventListener('click', toggle);

// No keydown handlers needed: because the trigger is a real button,
// Enter and Space both fire click events natively. Keyboard users tab
// to the button, see the :focus-visible ring, and activate with
// either key - exactly like mouse users.
