import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { collectionDocument } from '../../tests/collection-fixture.ts';
import { kanjiSentencesFile, parseKanjiSentences } from './content.ts';
import { sentenceAudioDirectory, sentenceAudioFile, sentenceAudioProblems, type SentenceAudioEntry } from './sentence-audio.ts';
import type { KanjiSentencesDocument } from '../content-types.ts';

const root = new URL('../../public/', import.meta.url);
const audioRoot = new URL(`audio/${sentenceAudioDirectory}/`, root);
const sentences = parseKanjiSentences(await readFile(new URL(kanjiSentencesFile, root), 'utf8'),
  collectionDocument.kanji.map((entry) => entry.character));
const generation = JSON.parse(await readFile(new URL('generation.json', audioRoot), 'utf8')) as {
  engine: string; voice: string; model: { license: string }; dictionary: unknown[];
  entries: (SentenceAudioEntry & { kana: string; sourceText: string })[];
};
const files = (await readdir(audioRoot)).filter((file) => file !== 'generation.json');
const data = new Map(await Promise.all(files.map(async (file) => [file, await readFile(new URL(file, audioRoot))] as const)));
const hashes = new Map([...data].map(([file, bytes]) => [file, createHash('sha256').update(bytes).digest('hex')]));

test('the audio of a sentence is named after its kanji, group and place', () => {
  assert.equal(sentenceAudioFile('一', 'simple', 0), '4e00-s1.mp3');
  assert.equal(sentenceAudioFile('一', 'advanced', 3), '4e00-a4.mp3');
  assert.equal(sentenceAudioFile('林', 'simple', 1), '6797-s2.mp3');
});

test('each of the 480 sentences has an MP3 generated from its current text, with nothing left over', () => {
  assert.deepEqual(sentenceAudioProblems(sentences, generation.entries, hashes), []);
  assert.equal(files.length, sentences.entries.length * 6);
  for (const [file, bytes] of data) {
    assert.match(file, /^[0-9a-f]+-[sa][1-4]\.mp3$/);
    // MPEG audio frame sync: the file starts with an MP3 frame, not a WAV or an ID3 tag.
    assert.ok(bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0, `${file} is not an MP3`);
  }
});

test('the sentence audio is credited to AivisSpeech, with the morioki voice and its license', async () => {
  assert.equal(generation.engine, 'AivisSpeech Engine');
  assert.equal(generation.voice, 'morioki');
  assert.equal(generation.model.license, 'ACML 1.0');
  const credits = await readFile(new URL('audio/CREDITS.txt', root), 'utf8');
  assert.match(credits, /SYNTHESIZED SENTENCES \(480\) — AivisSpeech \(morioki\)/);
  assert.match(credits, /Aivis Common Model License \(ACML\) 1\.0/);
  assert.ok(credits.includes(`${sentenceAudioDirectory}/generation.json`));
});

test('the engine reads the words that the sentences spell in mixed kana and kanji as the collection does', () => {
  const kana = (written: string) => generation.entries.find((entry) => entry.written === written)?.kana;
  // 日本 is «nihon», not «nippon»; こん虫 and でん車 are not read kanji by kanji; はは is not two particles.
  assert.match(kana('ともだちは 日本人ですか。')!, /ニホンジ'ン/);
  assert.match(kana('玉虫は とても 面白い こん虫です。')!, /コンチュウ/);
  assert.match(kana('でん車は とても 便利です。')!, /デンシャ/);
  assert.match(kana('ははは うたが とても 上手です。')!, /^ハ'ハワ/);
  // Like the word audio, 七色 keeps the accent on its second mora.
  assert.match(kana('七色の かさは とても 面白いです。')!, /^ナナ'イロノ/);
  // 下 is した, not もと; 草はら is not くさわら, 年より not ねんより, 三歳 not みとせ.
  assert.match(kana('青空の 下で いっしょに ひるごはんを 食べました。')!, /シタデ/);
  assert.match(kana('草はらで 休みます。')!, /^クサハラデ/);
  assert.match(kana('村の人は ほとんど 年よりです。')!, /トシヨ'リ/);
  assert.match(kana('この 白い犬は 三歳です。')!, /サ'ンサイ/);
  // は and the hiragana after it are not one word: はえ (fly), はいしゃ (dentist).
  assert.match(kana('わたしは えが すこし 下手です。')!, /^ワタシワエ'ガ/);
  assert.match(kana('その 女の人は いしゃです。')!, /ヒトワ'\/イシャ/);
});

test('a changed, missing, altered or orphaned audio is reported', () => {
  const [first] = sentences.entries;
  const only: KanjiSentencesDocument = { ...sentences, entries: [first] };
  const own = generation.entries.filter((entry) => entry.file.startsWith('4e00-'));
  const ownHashes = new Map([...hashes].filter(([file]) => file.startsWith('4e00-')));
  assert.deepEqual(sentenceAudioProblems(only, own, ownHashes), []);

  const edited: KanjiSentencesDocument = { ...only, entries: [{ ...first, simple: [{ ...first.simple[0], written: 'わたしは 一年生じゃないです。' }, first.simple[1]] }] };
  assert.match(sentenceAudioProblems(edited, own, ownHashes).join('\n'), /4e00-s1\.mp3 dice «わたしは 一年生です。»/);
  assert.match(sentenceAudioProblems(only, own.slice(1), ownHashes).join('\n'), /Falta el audio de «わたしは 一年生です。»/);
  assert.match(sentenceAudioProblems(only, own, new Map([...ownHashes, ['4e00-s1.mp3', 'otro']])).join('\n'), /no coincide/);
  assert.match(sentenceAudioProblems(only, own, new Map([...ownHashes, ['4e00-a5.mp3', 'x']])).join('\n'), /Sobra el audio 4e00-a5\.mp3/);
  assert.match(sentenceAudioProblems(only, [...own, own[0]], ownHashes).join('\n'), /repite/);
});
