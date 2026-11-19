import type { Difficulty, StudyItemId, StudyRow } from '../types.ts';

export const rowDifficultyFilters = {
  all: 'Todas', easy: 'Fácil', medium: 'Medio', hard: 'Difícil', unrated: 'Sin completar',
} as const;
export type RowDifficultyFilter = keyof typeof rowDifficultyFilters;

export function parseRowDifficultyFilter(value: string | null): RowDifficultyFilter {
  return value !== null && Object.hasOwn(rowDifficultyFilters, value) ? value as RowDifficultyFilter : 'all';
}

/**
 * The choice of the difficulty filter shared by every section when a page opens: a valid one in the address wins, so
 * a shared link opens at its level; otherwise the one saved in the browser; otherwise Todas. Sin completar only exists
 * on the kanji page; the other sections offer Todas and the three levels.
 */
export function initialRowDifficultyFilter(fromUrl: string | null, saved: string | null): RowDifficultyFilter {
  return parseRowDifficultyFilter(fromUrl !== null && Object.hasOwn(rowDifficultyFilters, fromUrl) ? fromUrl : saved);
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
