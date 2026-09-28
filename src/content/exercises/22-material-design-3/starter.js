// Lesson 22 - A token-themed card.
// CSS does the theming; this script only flips the switch.

const toggle = document.querySelector('#theme-toggle');
const root = document.documentElement;

toggle.addEventListener('click', () => {
  // TODO: flip the theme. Set root.dataset.theme to "dark" when it is
  // currently anything else, and back to "light" when it is "dark".
  // That single attribute change re-skins the whole page, because
  // every component rule references tokens, not colors.
});
