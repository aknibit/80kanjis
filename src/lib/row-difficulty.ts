import type { Difficulty, StudyItemId, StudyRow } from '../types.ts';

export const rowDifficultyFilters = {
  all: 'Todo', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', unrated: 'Sin completar',
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

/** Hide the incomplete category when the current search results contain none. */
export function getRowFilterState(difficulties: readonly (Difficulty | null)[], selected: RowDifficultyFilter) {
  const counts: Record<RowDifficultyFilter, number> = { all: difficulties.length, easy: 0, medium: 0, hard: 0, unrated: 0 };
  for (const difficulty of difficulties) counts[difficulty ?? 'unrated'] += 1;
  const available = (Object.keys(rowDifficultyFilters) as RowDifficultyFilter[])
    .filter((filter) => filter !== 'unrated' || counts.unrated > 0);
  return { counts, available, selected: selected === 'unrated' && counts.unrated === 0 ? 'all' as const : selected };
}
