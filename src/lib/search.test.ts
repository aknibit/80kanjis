import test from 'node:test';
import assert from 'node:assert/strict';
import { kanji } from '../data/kanji.ts';
import { createKanjiSearch, normalizeSearch } from './search.ts';

const search = createKanjiSearch(kanji);
const characters = (query: string) => search(query).map((entry) => entry.character);

test('empty and whitespace searches return the full collection in source order', () => {
  assert.deepEqual(search(''), kanji);
  assert.deepEqual(search(' \t '), kanji);
});

test('searches kanji, vocabulary, kana, and Spanish without accents', () => {
  assert.ok(characters('水').includes('水'));
  assert.ok(characters('山みち').includes('山'));
  assert.ok(characters('やまみち').includes('山'));
  assert.ok(characters(' VOLCAN ').includes('火'));
  assert.ok(characters('arbol').includes('木'));
  assert.ok(characters('ñame').includes('山'));
  assert.ok(characters('ñame').includes('山'));
});

test('accepts katakana and half-width kana without losing voicing', () => {
  assert.deepEqual(search('カザン'), search('かざん'));
  assert.deepEqual(search('ｶｻﾞﾝ'), search('かざん'));
  assert.equal(normalizeSearch('が'), 'が');
  assert.notEqual(normalizeSearch('が'), normalizeSearch('か'));
  assert.equal(search('かさん').length, 0);
});

test('all space-separated terms must match the same kanji card', () => {
  assert.deepEqual(characters('agua corriente'), ['水']);
  assert.equal(search('agua volcán').length, 0);
});

test('unknown or markup-shaped text returns no results', () => {
  assert.equal(search('zzzzzzzz').length, 0);
  assert.equal(search('<script>alert(1)</script>').length, 0);
});
