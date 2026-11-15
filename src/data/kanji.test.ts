import test from 'node:test';
import assert from 'node:assert/strict';
import { kanji } from '../../tests/collection-fixture.ts';
import { isDifficulty } from '../lib/collection.ts';

test('includes all 80 source characters once, in PDF order', () => {
  const expected = '一二三四五六七八九十百千日月火水木金土山川林森竹花草石貝虫犬田年空天気雨夕白青赤大中小上下左右円力口目手足耳音見立休出入女男子人名字文本学校先生早正王玉糸車村町';
  assert.equal(kanji.length, 80);
  assert.equal(kanji.map((entry) => entry.character).join(''), expected);
  assert.equal(new Set(kanji.map((entry) => entry.id)).size, 80);
});

test('every kanji has three complete examples and valid published difficulties', () => {
  for (const entry of kanji) {
    assert.equal(entry.vocabulary.length, 3, entry.character);
    assert.ok(isDifficulty(entry.difficulty));
    assert.ok(entry.meanings.every((meaning) => meaning.trim()));
    for (const word of entry.vocabulary) {
      assert.ok(isDifficulty(word.difficulty));
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

test('reviewed meanings and readings retain important senses and vocabulary-specific readings', () => {
  const byCharacter = new Map(kanji.map((entry) => [entry.character, entry]));
  for (const [character, meaning] of [['気', 'aire'], ['生', 'crudo'], ['青', 'joven'], ['金', 'metal'], ['本', 'verdadero']]) {
    assert.ok(byCharacter.get(character)?.meanings.includes(meaning), `${character}: ${meaning}`);
  }
  for (const [character, reading] of [['中', 'ジュウ'], ['石', 'シャク'], ['力', 'リキ'], ['名', 'ミョウ'], ['文', 'モン']]) {
    assert.ok(byCharacter.get(character)?.onyomi.includes(reading), `${character}: ${reading}`);
  }
  for (const [character, reading] of [['音', 'ね'], ['木', 'こ'], ['空', 'から'], ['上', 'かみ'], ['下', 'しも'], ['雨', 'あま'], ['生', 'なま']]) {
    assert.ok(byCharacter.get(character)?.kunyomi.includes(reading), `${character}: ${reading}`);
  }
});
