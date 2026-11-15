import test from 'node:test';
import assert from 'node:assert/strict';
import { kanji } from './kanji.ts';

test('includes all 80 source characters once, in PDF order', () => {
  const expected = '一二三四五六七八九十百千日月火水木金土山川林森竹花草石貝虫犬田年空天気雨夕白青赤大中小上下左右円力口目手足耳音見立休出入女男子人名字文本学校先生早正王玉糸車村町';
  assert.equal(kanji.length, 80);
  assert.equal(kanji.map((entry) => entry.character).join(''), expected);
  assert.equal(new Set(kanji.map((entry) => entry.id)).size, 80);
});

test('every kanji has three complete examples and an unset difficulty', () => {
  for (const entry of kanji) {
    assert.equal(entry.vocabulary.length, 3, entry.character);
    assert.equal(entry.difficulty, null);
    assert.ok(entry.meanings.every((meaning) => meaning.trim()));
    for (const word of entry.vocabulary) {
      assert.ok(word.written.includes(entry.character), `${entry.character}: ${word.written}`);
      assert.match(word.reading, /^[ぁ-ゖー]+$/, word.written);
      assert.ok(word.meaning.trim() && word.meaning !== 'duplicado', word.written);
    }
  }
});

test('repeated vocabulary has consistent readings and meanings', () => {
  const words = new Map<string, { reading: string; meaning: string }>();
  for (const entry of kanji) {
    for (const { written, reading, meaning } of entry.vocabulary) {
      if (words.has(written)) assert.deepEqual({ reading, meaning }, words.get(written), written);
      words.set(written, { reading, meaning });
    }
  }
});
