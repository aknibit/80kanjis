import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionDocument, studyCatalog } from '../../tests/collection-fixture.ts';
import { collectionDifficulties } from './difficulty.ts';

test('every study item reads its classification directly from the canonical collection', () => {
  const ratings = collectionDifficulties(collectionDocument);
  assert.equal(ratings.size, 312);
  assert.deepEqual([...ratings.keys()].sort(), studyCatalog.items.map((item) => item.id).sort());
  for (const entry of collectionDocument.kanji) assert.equal(ratings.get(`kanji:${entry.character}`), entry.difficulty);
  for (const word of collectionDocument.vocabulary) assert.equal(ratings.get(`word:${word.written}`), word.difficulty);
});

test('reloading a changed source supplies new classifications, including explicit unmarked values', () => {
  const source = structuredClone(collectionDocument);
  Object.assign(source.kanji[0], { difficulty: 'hard' });
  Object.assign(source.vocabulary[0], { difficulty: null });
  const ratings = collectionDifficulties(source);
  assert.equal(ratings.get('kanji:一'), 'hard');
  assert.equal(ratings.get('word:一つ'), null);
  assert.equal(collectionDifficulties(collectionDocument).get('word:一つ'), collectionDocument.vocabulary[0].difficulty);
});
