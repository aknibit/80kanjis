import type { CollectionDocument, Difficulty, StudyItemId } from '../types.ts';
import { kanjiItemId, vocabularyItemId } from './study-catalog.ts';

export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Fácil', medium: 'Medio', hard: 'Difícil',
};

/** One, two or three filled dots for easy, medium and hard; three faded dots when unmarked. */
export function difficultyIcon(value: Difficulty | null): string {
  const filled = value === 'easy' ? 1 : value === 'medium' ? 2 : value === 'hard' ? 3 : 0;
  return `<svg class="difficulty-icon" viewBox="0 0 32 16" aria-hidden="true" focusable="false">${[6, 16, 26].map((x, index) => `<circle cx="${x}" cy="8" r="3.2"${index < filled ? ' class="is-filled"' : ''}/>`).join('')}</svg>`;
}

/** Read-only classifications, taken directly from the canonical collection. */
export function collectionDifficulties(source: CollectionDocument): ReadonlyMap<StudyItemId, Difficulty | null> {
  return new Map<StudyItemId, Difficulty | null>([
    ...source.kanji.map((entry): [StudyItemId, Difficulty | null] => [kanjiItemId(entry.character), entry.difficulty]),
    ...source.vocabulary.map((word): [StudyItemId, Difficulty | null] => [vocabularyItemId(word.written), word.difficulty]),
  ]);
}
