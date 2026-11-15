import test from 'node:test';
import assert from 'node:assert/strict';
import type { Difficulty } from '../types.ts';
import { studyCatalog } from '../data/study.ts';
import { getRowDifficulty, matchesRowDifficulty, parseRowDifficultyFilter } from './row-difficulty.ts';

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

test('clearing and changing a shared word immediately reclassifies every containing row', () => {
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
