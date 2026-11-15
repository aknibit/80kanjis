import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionDocument, kanji, studyCatalog } from '../../tests/collection-fixture.ts';
import type { Kanji, StudyItem } from '../types.ts';
import { createStudyCatalog } from './study-catalog.ts';
import { collectionDifficulties } from './difficulty.ts';

test('each presentation row resolves to exactly one kanji and three vocabulary blocks', () => {
  assert.equal(studyCatalog.rows.length, 80);
  studyCatalog.rows.forEach((row, index) => {
    assert.equal(row.id, kanji[index].id);
    assert.equal(row.itemIds.length, 4);
    assert.equal(new Set(row.itemIds).size, 4);
    assert.deepEqual(row.itemIds.map((id) => studyCatalog.byId.get(id)?.type),
      ['kanji', 'vocabulary', 'vocabulary', 'vocabulary']);
  });
});

test('the flat study pool contains 80 standalone kanji and 232 unique vocabulary items', () => {
  assert.equal(studyCatalog.items.length, 312);
  assert.equal(studyCatalog.items.filter((item) => item.type === 'kanji').length, 80);
  assert.equal(studyCatalog.items.filter((item) => item.type === 'vocabulary').length, 232);
  assert.equal(new Set(studyCatalog.items.map((item) => item.id)).size, 312);
  for (const item of studyCatalog.items) {
    assert.ok(item.meanings.length > 0 && item.meanings.every((meaning) => meaning.trim()));
    if (item.type === 'kanji') {
      assert.ok(item.character);
      assert.equal('reading' in item, false);
      assert.ok(item.vocabularyIds.every((id) => studyCatalog.byId.get(id)?.type === 'vocabulary'));
    } else {
      assert.ok(item.written && item.reading);
      assert.ok(item.kanjiIds.every((id) => studyCatalog.byId.get(id)?.type === 'kanji'));
    }
  }
});

test('a repeated word is one entity, with its own content and links to contained kanji', () => {
  const item = studyCatalog.byId.get('word:一年生');
  assert.equal(item?.type, 'vocabulary');
  if (item?.type !== 'vocabulary') throw new Error('Missing vocabulary item');
  assert.equal(item.written, '一年生');
  assert.equal(item.reading, 'いちねんせい');
  assert.deepEqual(item.meanings, ['estudiante (primero)']);
  assert.deepEqual(item.kanjiIds, ['kanji:一', 'kanji:年', 'kanji:生']);
  const occurrences = studyCatalog.rows.filter((row) => row.itemIds.includes(item.id));
  assert.equal(occurrences.length, 2);
  assert.ok(occurrences.every((row) => studyCatalog.byId.get(row.itemIds.find((id) => id === item.id)!) === item));
});

test('item identities and vocabulary content survive row and example reordering', () => {
  const reordered: Kanji[] = [...kanji].reverse().map((entry) => ({
    ...entry,
    vocabulary: [entry.vocabulary[2], entry.vocabulary[0], entry.vocabulary[1]],
  }));
  const other = createStudyCatalog(reordered);
  assert.deepEqual([...other.byId.keys()].sort(), [...studyCatalog.byId.keys()].sort());
  for (const item of studyCatalog.items.filter((item) => item.type === 'vocabulary')) {
    assert.deepEqual(other.byId.get(item.id), item);
  }
});

test('independent items resolve classifications with the same canonical identities', () => {
  const ratings = collectionDifficulties(collectionDocument);
  assert.deepEqual(studyCatalog.items.map((item) => item.id).sort(), [...ratings.keys()].sort());
  const selected: StudyItem[] = [studyCatalog.byId.get('kanji:一')!, studyCatalog.byId.get('word:一ぴき')!];
  assert.deepEqual(selected.map((item) => ratings.get(item.id)), [
    collectionDocument.kanji[0].difficulty, collectionDocument.vocabulary[1].difficulty,
  ]);
});

test('ambiguous duplicate words are rejected instead of merging incompatible study answers', () => {
  const year = kanji.find((entry) => entry.character === '年')!;
  const conflicting: Kanji = {
    ...year,
    vocabulary: [year.vocabulary[0], { ...year.vocabulary[1], reading: 'べつのよみ' }, year.vocabulary[2]],
  };
  assert.throws(() => createStudyCatalog([kanji[0], conflicting]), /定義|definiciones/);
});
