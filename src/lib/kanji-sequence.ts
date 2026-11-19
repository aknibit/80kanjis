/** The search parameter of the full-screen view of a kanji: `?kanji=水`. */
export const kanjiParameter = 'kanji';

export interface KanjiNeighbours {
  /** Its place among the kanji on screen, from 0, or -1 when it is not one of them. */
  readonly index: number;
  readonly previous?: string;
  readonly next?: string;
}

/**
 * Where the full-screen view of a kanji can go: the kanji on screen, which keep the order of the collection after the
 * search and the difficulty filter. A kanji filtered out (an address can name it) still has the closest ones around it.
 */
export function kanjiNeighbours(onScreen: readonly string[], position: (character: string) => number,
  current: string): KanjiNeighbours {
  const found = onScreen.indexOf(current);
  // Before a kanji filtered out, the first one on screen that comes after it in the collection.
  const after = found !== -1 ? found + 1 : onScreen.findIndex((character) => position(character) > position(current));
  const split = after === -1 ? onScreen.length : after;
  const before = found !== -1 ? found - 1 : split - 1;
  return { index: found, previous: before >= 0 ? onScreen[before] : undefined, next: onScreen[split] };
}
