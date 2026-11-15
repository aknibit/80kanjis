import test from 'node:test';
import assert from 'node:assert/strict';
import type { Difficulty } from '../types.ts';
import { studyCatalog } from '../../tests/collection-fixture.ts';
import { getRowDifficulty, getRowFilterState, matchesRowDifficulty, parseRowDifficultyFilter } from './row-difficulty.ts';

const row = studyCatalog.rows[0];
const classify = (ratings: (Difficulty | null)[]) => getRowDifficulty(row, (id) => ratings[row.itemIds.indexOf(id)] ?? null);

test('a difficult kanji or any one difficult word makes the whole row difficult', () => {
  for (let index = 0; index < 4; index += 1) {
    const ratings: (Difficulty | null)[] = [null, 'easy', 'medium', null];
    ratings[index] = 'hard';
    assert.equal(classify(ratings), 'hard');
  }
});

test('easy requires all four marks and never includes incomplete rows', () => {
  assert.equal(classify(['easy', 'easy', 'easy', 'easy']), 'easy');
  for (let index = 0; index < 4; index += 1) {
    const ratings: (Difficulty | null)[] = ['easy', 'easy', 'easy', 'easy'];
    ratings[index] = null;
    assert.equal(classify(ratings), null);
  }
  assert.equal(classify([null, null, null, null]), null);
});

test('medium applies when any entry is medium and none is hard, including incomplete rows', () => {
  assert.equal(classify(['easy', 'medium', 'easy', 'easy']), 'medium');
  assert.equal(classify([null, 'medium', null, null]), 'medium');
  assert.equal(classify(['medium', 'hard', 'easy', null]), 'hard');
});

test('the classification of a shared word applies to every containing row', () => {
  const sharedRows = studyCatalog.rows.filter((entry) => entry.itemIds.includes('word:一年生'));
  let sharedRating: Difficulty | null = 'hard';
  const rating = (id: string): Difficulty | null => id === 'word:一年生' ? sharedRating : 'easy';
  assert.equal(sharedRows.length, 2);
  assert.deepEqual(sharedRows.map((entry) => getRowDifficulty(entry, rating)), ['hard', 'hard']);
  sharedRating = null;
  assert.deepEqual(sharedRows.map((entry) => getRowDifficulty(entry, rating)), [null, null]);
  sharedRating = 'easy';
  assert.deepEqual(sharedRows.map((entry) => getRowDifficulty(entry, rating)), ['easy', 'easy']);
});

test('completed results hide the incomplete filter and normalize an obsolete bookmarked selection', () => {
  const state = getRowFilterState(['easy', 'hard', 'medium', 'easy'], 'unrated');
  assert.deepEqual(state.available, ['all', 'easy', 'medium', 'hard']);
  assert.deepEqual(state.counts, { all: 4, easy: 2, medium: 1, hard: 1, unrated: 0 });
  assert.equal(state.selected, 'all');
  assert.equal(getRowFilterState([], 'unrated').selected, 'all');
  assert.equal(getRowFilterState([], 'hard').selected, 'hard');
});

test('incomplete results expose the filter until search or audio excludes those rows', () => {
  const state = getRowFilterState(['easy', null, 'hard', null], 'unrated');
  assert.ok(state.available.includes('unrated'));
  assert.equal(state.counts.unrated, 2);
  assert.equal(state.selected, 'unrated');
  const narrowed = getRowFilterState(['easy', 'hard'], state.selected);
  assert.ok(!narrowed.available.includes('unrated'));
  assert.equal(narrowed.selected, 'all');
});

test('URL filters validate known values and keep incomplete rows out of easy', () => {
  assert.equal(parseRowDifficultyFilter('hard'), 'hard');
  assert.equal(parseRowDifficultyFilter('unrated'), 'unrated');
  assert.equal(parseRowDifficultyFilter(null), 'all');
  assert.equal(parseRowDifficultyFilter('toString'), 'all');
  assert.equal(parseRowDifficultyFilter('unknown'), 'all');
  assert.equal(matchesRowDifficulty(null, 'easy'), false);
  assert.equal(matchesRowDifficulty(null, 'unrated'), true);
  assert.equal(matchesRowDifficulty('medium', 'hard'), false);
  assert.equal(matchesRowDifficulty('hard', 'hard'), true);
  for (const value of ['easy', 'medium', 'hard', null] as const) assert.ok(matchesRowDifficulty(value, 'all'));
});
