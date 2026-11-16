/**
 * Masonry for lexicon cards: each card goes to the shortest column, so it keeps its own height and the order
 * still reads from left to right. Native CSS masonry (grid-lanes) is not in every browser yet, and CSS columns
 * would order the cards from top to bottom.
 *
 * CSS sets the minimum card width (--card-min) and the gap (--card-gap); this only sizes and places the cards
 * and gives the list its height. Call the returned function after replacing or showing the cards.
 */
export function setupMasonry(list: HTMLElement): () => void {
  let frame = 0;

  function layout() {
    cancelAnimationFrame(frame);
    frame = 0;
    const cards = [...list.children] as HTMLElement[];
    const width = list.clientWidth;
    if (cards.length === 0 || width === 0) return;
    const style = getComputedStyle(list);
    const gap = parseFloat(style.getPropertyValue('--card-gap')) || 0;
    const minimum = parseFloat(style.getPropertyValue('--card-min')) || width;
    const columns = Math.max(1, Math.floor((width + gap) / (minimum + gap)));
    const cardWidth = (width - gap * (columns - 1)) / columns;
    for (const card of cards) card.style.width = `${cardWidth}px`;
    // Read every height after all the writes, so the browser lays the cards out once.
    const heights = cards.map((card) => card.getBoundingClientRect().height);
    const bottoms = Array<number>(columns).fill(0);
    cards.forEach((card, index) => {
      const column = bottoms.indexOf(Math.min(...bottoms));
      // Whole pixels keep the text sharp; the next card starts from where this one really ends.
      const top = Math.round(bottoms[column]);
      card.style.transform = `translate(${Math.round(column * (cardWidth + gap))}px, ${top}px)`;
      bottoms[column] = top + heights[index] + gap;
    });
    list.style.height = `${Math.ceil(Math.max(...bottoms) - gap)}px`;
  }

  // A new width (window, zoom) or a new card height (web fonts arriving) lays the cards out again on the next
  // frame. Transforms do not resize anything, so a layout never triggers itself.
  const observer = new ResizeObserver(() => { if (!frame) frame = requestAnimationFrame(layout); });
  return function update() {
    observer.disconnect();
    observer.observe(list);
    for (const card of list.children) observer.observe(card);
    layout();
  };
}
