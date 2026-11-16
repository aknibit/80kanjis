/**
 * Shows the full search hint when it fits the input and a compact one when it would be cut off.
 * Measured with the input's own font, so it adapts to any width without fixed breakpoints.
 */
export function fitPlaceholder(input: HTMLInputElement, full: string, compact: string) {
  const context = document.createElement('canvas').getContext('2d');
  const update = () => {
    if (!context || input.clientWidth === 0) return;
    const style = getComputedStyle(input);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    input.placeholder = context.measureText(full).width <= input.clientWidth ? full : compact;
  };
  input.placeholder = full;
  new ResizeObserver(update).observe(input);
  // DM Sans may load after the first measurement and change the text width.
  void document.fonts.ready.then(update);
}
