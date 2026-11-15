import type { Kanji } from '../types.ts';

/** Ignore Latin accents and kana width/script, but preserve Japanese voicing. */
export function normalizeSearch(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/(\p{Script=Latin})\p{M}+/gu, '$1')
    .normalize('NFC')
    .replace(/[ァ-ヶ]/g, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60))
    .trim();
}

export function createKanjiSearch(collection: readonly Kanji[]) {
  const index = collection.map((entry) => ({
    entry,
    text: normalizeSearch([
      entry.character,
      ...entry.meanings,
      ...entry.vocabulary.flatMap((word) => [word.written, word.reading, word.meaning]),
    ].join(' ')),
  }));

  return (query: string): readonly Kanji[] => {
    const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
    return index
      .filter(({ text }) => terms.every((term) => text.includes(term)))
      .map(({ entry }) => entry);
  };
}
