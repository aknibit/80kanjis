import type {
  Kanji, KanjiItemId, StudyCatalog, StudyItem, StudyItemId, StudyRow, VocabularyItemId,
} from '../types.ts';

// These IDs deliberately match the existing difficulty keys; saved ratings stay valid.
export function kanjiItemId(character: string): KanjiItemId { return `kanji:${character}`; }
export function vocabularyItemId(written: string): VocabularyItemId { return `word:${written}`; }

export function createStudyCatalog(collection: readonly Kanji[]): StudyCatalog {
  const byId = new Map<StudyItemId, StudyItem>();
  const knownKanji = new Set(collection.map((entry) => entry.character));
  const rows: StudyRow[] = [];

  for (const entry of collection) {
    const id = kanjiItemId(entry.character);
    if (byId.has(id)) throw new Error(`Kanji repetido en la colección: ${entry.character}.`);
    const vocabularyIds = entry.vocabulary.map((word) => vocabularyItemId(word.written));
    byId.set(id, {
      type: 'kanji', id, character: entry.character,
      meanings: [...entry.meanings], vocabularyIds,
    });
    rows.push({ id: entry.id, itemIds: [id, vocabularyIds[0], vocabularyIds[1], vocabularyIds[2]] });
  }

  for (const entry of collection) {
    for (const word of entry.vocabulary) {
      const id = vocabularyItemId(word.written);
      const existing = byId.get(id);
      if (existing) {
        if (existing.type !== 'vocabulary' || existing.reading !== word.reading || existing.meanings[0] !== word.meaning) {
          throw new Error(`La palabra ${word.written} tiene definiciones incompatibles.`);
        }
        continue;
      }
      byId.set(id, {
        type: 'vocabulary', id, written: word.written,
        reading: word.reading, meanings: [word.meaning],
        kanjiIds: [...new Set(Array.from(word.written))].filter((character) => knownKanji.has(character)).map(kanjiItemId),
      });
    }
  }
  return { items: [...byId.values()], byId, rows };
}
