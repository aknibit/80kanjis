import type { CollectionDocument, Difficulty, StudyItemId } from '../types.ts';
import { kanjiItemId, vocabularyItemId } from './study-catalog.ts';

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
};

/** Read-only classifications, taken directly from the canonical collection. */
export function collectionDifficulties(source: CollectionDocument): ReadonlyMap<StudyItemId, Difficulty | null> {
  return new Map<StudyItemId, Difficulty | null>([
    ...source.kanji.map((entry): [StudyItemId, Difficulty | null] => [kanjiItemId(entry.character), entry.difficulty]),
    ...source.vocabulary.map((word): [StudyItemId, Difficulty | null] => [vocabularyItemId(word.written), word.difficulty]),
  ]);
}
