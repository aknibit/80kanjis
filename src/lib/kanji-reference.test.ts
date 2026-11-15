import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionDocument } from '../../tests/collection-fixture.ts';
import { createKanjiReferences, wordKanjiParts } from './kanji-reference.ts';

const references = createKanjiReferences(collectionDocument);

test('every written kanji has reference information, with support characters outside the main 80', () => {
  assert.equal(references.size, 85);
  assert.equal([...references.values()].filter((entry) => entry.kind === 'collection').length, 80);
  for (const character of ['個', '色', '庭', '時', '前']) {
    const reference = references.get(character);
    assert.equal(reference?.kind, 'advanced');
    assert.ok(reference?.definition.meanings.length);
    assert.ok(reference?.vocabulary.length);
  }
  for (const word of collectionDocument.vocabulary) {
    for (const character of word.written) {
      if (/\p{Script=Han}/u.test(character)) assert.ok(references.has(character), `${word.written}: ${character}`);
    }
  }
});

test('all characters are classified per occurrence without changing kana or word spelling', () => {
  assert.deepEqual(wordKanjiParts('一年生', references, '年'), [
    { text: '一', kind: 'collection' }, { text: '年', kind: 'target' }, { text: '生', kind: 'collection' },
  ]);
  assert.deepEqual(wordKanjiParts('庭木', references, '木'), [
    { text: '庭', kind: 'advanced' }, { text: '木', kind: 'target' },
  ]);
  assert.deepEqual(wordKanjiParts('お金と金色', references, '金'), [
    { text: 'お', kind: 'text' }, { text: '金', kind: 'target' }, { text: 'と', kind: 'text' },
    { text: '金', kind: 'target' }, { text: '色', kind: 'advanced' },
  ]);
  assert.deepEqual(wordKanjiParts('木の上', references, '上'), [
    { text: '木', kind: 'collection' }, { text: 'の', kind: 'text' }, { text: '上', kind: 'target' },
  ]);
  for (const word of collectionDocument.vocabulary) {
    assert.equal(wordKanjiParts(word.written, references).map((part) => part.text).join(''), word.written);
  }
});

test('modal examples resolve canonical definitions and support words are deduplicated', () => {
  const wood = references.get('木');
  assert.equal(wood?.kind, 'collection');
  if (wood?.kind !== 'collection') throw new Error('Missing main kanji');
  assert.equal(wood.position, collectionDocument.kanji.findIndex((item) => item.character === '木') + 1);
  assert.deepEqual(wood.vocabulary.map((word) => word.written), wood.definition.vocabulary);
  assert.deepEqual(references.get('色')?.vocabulary.map((word) => word.written), ['七色', '金色', '空色', '音色']);
  assert.equal(references.get('個')?.vocabulary.length, 6);
  assert.equal(references.get('庭')?.vocabulary.length, 3);
  for (const reference of references.values()) {
    for (const word of reference.vocabulary) assert.equal(word, collectionDocument.vocabulary.find((item) => item.written === word.written));
  }
});
