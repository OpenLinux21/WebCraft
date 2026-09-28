// Lesson 21 - Keyboard-accessible disclosure widget.
// The markup and styles are mostly in place; your job is the toggle
// logic, keeping ARIA state in sync, and the focus-visible styling
// (which lives in the CSS file).

// TODO 1: select the trigger button (.disclosure-trigger) and the
// panel (#panel) and store them in variables.

// TODO 2: write a single toggle() function that does BOTH of these in
// the same place, so they can never drift apart:
//   - flip panel.hidden (panel.hidden = !panel.hidden)
//   - set the button's aria-expanded to the matching string:
//     "true" when the panel is visible, "false" when hidden
// Also toggle the class "open" on the button for the CSS arrow.

// TODO 3: listen for "click" on the trigger and call toggle().
// Note: do NOT add keydown handlers for Enter or Space - a real
// button fires click for both keys automatically. If Enter or Space
// does not activate your widget, the bug is in the markup.

// TODO 4: after wiring it up, verify with the keyboard only:
//   - Tab reaches the button and shows your :focus-visible ring
//   - Enter opens the panel, and screen readers reading aria-expanded
//     would hear "expanded true"
//   - Space closes it again

// Bonus: check the initial state is honest - the button starts with
// aria-expanded="false" and the panel starts hidden in the HTML,
// before any JavaScript runs.
