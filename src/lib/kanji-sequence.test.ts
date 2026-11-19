import test from 'node:test';
import assert from 'node:assert/strict';
import { kanjiNeighbours } from './kanji-sequence.ts';

const collection = ['一', '二', '三', '四', '五', '六'];
const position = (character: string) => collection.indexOf(character) + 1;

test('a kanji on screen steps to the kanji before and after it on screen', () => {
  const onScreen = ['二', '四', '五'];
  assert.deepEqual(kanjiNeighbours(onScreen, position, '四'), { index: 1, previous: '二', next: '五' });
  assert.deepEqual(kanjiNeighbours(onScreen, position, '二'), { index: 0, previous: undefined, next: '四' });
  assert.deepEqual(kanjiNeighbours(onScreen, position, '五'), { index: 2, previous: '四', next: undefined });
});

test('a single kanji on screen has nowhere to go', () => {
  assert.deepEqual(kanjiNeighbours(['三'], position, '三'), { index: 0, previous: undefined, next: undefined });
});

test('a kanji filtered out steps to the closest kanji on screen in collection order', () => {
  const onScreen = ['二', '五'];
  assert.deepEqual(kanjiNeighbours(onScreen, position, '三'), { index: -1, previous: '二', next: '五' });
  assert.deepEqual(kanjiNeighbours(onScreen, position, '一'), { index: -1, previous: undefined, next: '二' });
  assert.deepEqual(kanjiNeighbours(onScreen, position, '六'), { index: -1, previous: '五', next: undefined });
  assert.deepEqual(kanjiNeighbours([], position, '三'), { index: -1, previous: undefined, next: undefined });
});
