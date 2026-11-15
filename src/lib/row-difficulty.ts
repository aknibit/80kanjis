import type { Difficulty, StudyItemId, StudyRow } from '../types.ts';

export const rowDifficultyFilters = {
  all: 'Todas', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', unrated: 'Sin completar',
} as const;
export type RowDifficultyFilter = keyof typeof rowDifficultyFilters;

export function parseRowDifficultyFilter(value: string | null): RowDifficultyFilter {
  return value !== null && Object.hasOwn(rowDifficultyFilters, value) ? value as RowDifficultyFilter : 'all';
}

/** A row stays whole. Unmarked items cannot make a partially rated row easy. */
export function getRowDifficulty(row: StudyRow, getRating: (id: StudyItemId) => Difficulty | null): Difficulty | null {
  const ratings = row.itemIds.map(getRating);
  if (ratings.includes('hard')) return 'hard';
  if (ratings.includes('medium')) return 'medium';
  if (ratings.every((rating) => rating === 'easy')) return 'easy';
  return null;
}

export function matchesRowDifficulty(difficulty: Difficulty | null, filter: RowDifficultyFilter): boolean {
  return filter === 'all' || (filter === 'unrated' ? difficulty === null : difficulty === filter);
}
