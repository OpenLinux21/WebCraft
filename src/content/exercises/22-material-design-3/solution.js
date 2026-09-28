// Lesson 22 - A token-themed card (solution).
// CSS does the theming; this script only flips the switch.

const toggle = document.querySelector('#theme-toggle');
const root = document.documentElement;

toggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
});
