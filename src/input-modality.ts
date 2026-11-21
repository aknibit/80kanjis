/** The keys that move through a tab list or the difficulty drop-down; there, they show where the keyboard is. */
const widgetKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown', 'Enter', ' ']);

/**
 * Focus rings are for the keyboard. Browsers also show them when a script moves the focus, as on opening or closing a
 * dialog, and Safari does after every tap, because a tapped button never takes the focus. So the root says which came
 * last (`data-input`): a click or a tap hides them (style.css); Tab, or moving through a tab list or the difficulty
 * drop-down with its keys, shows them. Other keys, such as Escape or the arrows of the full-screen view, change nothing.
 */
export function trackInputModality(root: HTMLElement = document.documentElement) {
  const use = (input: 'keyboard' | 'pointer') => { if (root.dataset.input !== input) root.dataset.input = input; };
  use('pointer');
  document.addEventListener('pointerdown', () => use('pointer'), true);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Tab' || (widgetKeys.has(event.key)
      && event.target instanceof Element && event.target.closest('[role="tablist"], [role="combobox"]'))) use('keyboard');
  }, true);
}
