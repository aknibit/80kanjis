import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { collectionDocument, studyCatalog } from '../../tests/collection-fixture.ts';
import { kanjiSentencesFile, parseKanjiSentences, parseStudyDocument } from './content.ts';
import {
  audioProblems, audioSource, counterAudioDirectory, counterSentenceAudio, counterSentenceAudioFile, sentenceAudio,
  sentenceAudioDirectory, sentenceAudioFile, wordAudio, wordAudioDirectory, wordAudioFile, type AudioEntry,
} from './audio.ts';
import type { CounterDocument, KanjiSentencesDocument } from '../content-types.ts';

const root = new URL('../../public/', import.meta.url);

interface Generation {
  engine: string;
  voice: string;
  model: { license: string; url: string };
  entries: (AudioEntry & { kana: string; sourceText: string })[];
}

async function generated(directory: string) {
  const base = new URL(`audio/${directory}/`, root);
  const generation = JSON.parse(await readFile(new URL('generation.json', base), 'utf8')) as Generation;
  const files = (await readdir(base)).filter((file) => file !== 'generation.json');
  const data = new Map(await Promise.all(files.map(async (file) => [file, await readFile(new URL(file, base))] as const)));
  const hashes = new Map([...data].map(([file, bytes]) => [file, createHash('sha256').update(bytes).digest('hex')]));
  const kana = (written: string) => generation.entries.find((entry) => entry.written === written)?.kana;
  return { generation, data, hashes, kana };
}

const sentences = parseKanjiSentences(await readFile(new URL(kanjiSentencesFile, root), 'utf8'),
  collectionDocument.kanji.map((entry) => entry.character));
const vocabulary = studyCatalog.items.filter((item) => item.type === 'vocabulary');
const words = await generated(wordAudioDirectory);
const sentenceAudios = await generated(sentenceAudioDirectory);
const counters = parseStudyDocument(await readFile(new URL('content/counters.json', root), 'utf8'), 'counters') as CounterDocument;
const counterAudios = await generated(counterAudioDirectory);

function assertMp3s(data: ReadonlyMap<string, Buffer>, name: RegExp) {
  for (const [file, bytes] of data) {
    assert.match(file, name);
    // MPEG audio frame sync: the file starts with an MP3 frame, not a WAV or an ID3 tag.
    assert.ok(bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0, `${file} is not an MP3`);
  }
}

test('an audio is named after its word, or after the kanji, group and place of its sentence', () => {
  assert.equal(wordAudioFile('一つ'), '4e00-3064.mp3');
  assert.equal(wordAudioFile('女の人'), '5973-306e-4eba.mp3');
  assert.equal(sentenceAudioFile('一', 'simple', 0), '4e00-s1.mp3');
  assert.equal(sentenceAudioFile('一', 'advanced', 3), '4e00-a4.mp3');
  assert.equal(sentenceAudioFile('林', 'simple', 1), '6797-s2.mp3');
  assert.equal(counterSentenceAudioFile('hon', 3), 'hon-3.mp3');
  assert.equal(counterSentenceAudioFile('ten-thousands', 100000), 'ten-thousands-100000.mp3');
  assert.equal(counterSentenceAudioFile('hon', 'question'), 'hon-q.mp3');
});

test('each word of the vocabulary has an MP3 generated from its current spelling and reading, with nothing left over', () => {
  assert.deepEqual(audioProblems(wordAudio(vocabulary), words.generation.entries, words.hashes), []);
  assert.equal(words.data.size, vocabulary.length);
  assertMp3s(words.data, /^[0-9a-f]+(?:-[0-9a-f]+)*\.mp3$/);
});

test('each of the 480 sentences has an MP3 generated from its current text, with nothing left over', () => {
  assert.deepEqual(audioProblems(sentenceAudio(sentences), sentenceAudios.generation.entries, sentenceAudios.hashes), []);
  assert.equal(sentenceAudios.data.size, sentences.entries.length * 6);
  assertMp3s(sentenceAudios.data, /^[0-9a-f]+-[sa][1-4]\.mp3$/);
});

test('each sentence of the counters, and only the sentences, has an MP3 generated from its current text', () => {
  assert.deepEqual(audioProblems(counterSentenceAudio(counters), counterAudios.generation.entries, counterAudios.hashes), []);
  const sentenceCount = counters.entries.reduce((total, counter) => total + counter.forms.length + 1, 0);
  assert.equal(counterAudios.data.size, sentenceCount);
  assertMp3s(counterAudios.data, /^[a-z]+(?:-[a-z]+)*-(?:\d+|q)\.mp3$/);
});

test('the engine reads the counters as their tables do', () => {
  const kana = counterAudios.kana;
  // Readings that the engine would not choose: ななにん, さんば, なんぞく, and 靴下 whole despite the word 靴.
  assert.match(kana('ちちの かいしゃには かいしゃいんが 七人 います。')!, /ナナ'ニン/);
  assert.match(kana('えきに ハトが 三羽 います。')!, /サ'ンバ/);
  assert.match(kana('靴を 何足 買いましたか。')!, /ナ'ンゾク/);
  assert.match(kana('靴下を 二足 買いました。')!, /^クツ'シタオ/);
  // Numerals in figures for the engine: はっぽん, not はちほん; じゅうがつ とおか, not とつきとおか; ふん, not ぶ.
  assert.match(kana('花屋で 花を 八本 買いました。')!, /ハ'ッポン/);
  assert.match(kana('十月 十日から 休みです。')!, /^ジュウガツ'\/トオカカラ/);
  assert.match(kana('その ダンスは 三分です。')!, /サ'ンプン/);
  // Hiragana words cut in the right place: not あ / さごじに.
  assert.match(kana('あさ 五時に 起きました。')!, /^ア'サ\/ゴ'ジニ/);
  const sourceText = (written: string) => counterAudios.generation.entries.find((entry) => entry.written === written)?.sourceText;
  assert.equal(sourceText('二月 十四日に チョコレートを あげます。'), '二月 14日に チョコレートを あげます。');
  // 二十四日 needs no correction: only 十四日 after 二月 is replaced.
  assert.equal(sourceText('十二月 二十四日に ケーキを 買います。'), '十二月 二十四日に ケーキを 買います。');
});

test('all the audio is credited to AivisSpeech, with the morioki voice and its license', async () => {
  for (const { generation } of [words, sentenceAudios, counterAudios]) {
    assert.equal(generation.engine, 'AivisSpeech Engine');
    assert.equal(generation.voice, audioSource.voice);
    assert.equal(generation.model.license, audioSource.license);
    assert.equal(generation.model.url, audioSource.voiceUrl);
  }
  const credits = await readFile(new URL('audio/CREDITS.txt', root), 'utf8');
  assert.match(credits, new RegExp(`WORDS \\(${vocabulary.length}\\), SENTENCES \\(480\\) AND COUNTER SENTENCES \\(${counterAudios.data.size}\\) — AivisSpeech \\(morioki\\)`));
  assert.match(credits, /Aivis Common Model License \(ACML\) 1\.0/);
  for (const directory of [wordAudioDirectory, sentenceAudioDirectory, counterAudioDirectory]) {
    assert.ok(credits.includes(`${directory}/generation.json`), directory);
  }
  // Nothing is left of the previous recordings and voice (hidden files such as .DS_Store are ignored by Git).
  assert.deepEqual((await readdir(new URL('audio/', root))).filter((file) => !file.startsWith('.')).sort(),
    ['CREDITS.txt', counterAudioDirectory, sentenceAudioDirectory, wordAudioDirectory].sort());
});

test('the engine reads the words that the vocabulary spells in mixed kana and kanji as the collection does', () => {
  // The dictionary gives a word the same reading and accent alone and in its sentences.
  assert.equal(words.kana('七色'), "ナナ'イロ");
  assert.match(sentenceAudios.kana('七色の かさは とても 面白いです。')!, /^ナナ'イロノ/);
  assert.equal(words.kana('竹林'), "タケバヤ'シ");
  assert.equal(words.kana('空ばこ'), "カラ'バコ");
  assert.equal(words.kana('千年'), "セ'ンネン");
  // Other words are spoken from their standard spelling: 火じ as 火事, 一ぴき as 一匹.
  const sourceText = (written: string) => words.generation.entries.find((entry) => entry.written === written)?.sourceText;
  assert.equal(sourceText('火じ'), '火事');
  assert.equal(sourceText('一ぴき'), '一匹');
});

test('the engine reads the words that the sentences spell in mixed kana and kanji as the collection does', () => {
  const kana = sentenceAudios.kana;
  // 日本 is «nihon», not «nippon»; こん虫 and でん車 are not read kanji by kanji; はは is not two particles.
  assert.match(kana('ともだちは 日本人ですか。')!, /ニホンジ'ン/);
  assert.match(kana('玉虫は とても 面白い こん虫です。')!, /コンチュウ/);
  assert.match(kana('でん車は とても 便利です。')!, /デンシャ/);
  assert.match(kana('ははは うたが とても 上手です。')!, /^ハ'ハワ/);
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
  const own = sentenceAudios.generation.entries.filter((entry) => entry.file.startsWith('4e00-'));
  const ownHashes = new Map([...sentenceAudios.hashes].filter(([file]) => file.startsWith('4e00-')));
  assert.deepEqual(audioProblems(sentenceAudio(only), own, ownHashes), []);

  const edited: KanjiSentencesDocument = { ...only, entries: [{ ...first, simple: [{ ...first.simple[0], written: 'わたしは 一年生じゃないです。' }, first.simple[1]] }] };
  assert.match(audioProblems(sentenceAudio(edited), own, ownHashes).join('\n'), /4e00-s1\.mp3 dice «わたしは 一年生です。»/);
  assert.match(audioProblems(sentenceAudio(only), own.slice(1), ownHashes).join('\n'), /Falta el audio de «わたしは 一年生です。»/);
  assert.match(audioProblems(sentenceAudio(only), own, new Map([...ownHashes, ['4e00-s1.mp3', 'otro']])).join('\n'), /no coincide/);
  assert.match(audioProblems(sentenceAudio(only), own, new Map([...ownHashes, ['4e00-a5.mp3', 'x']])).join('\n'), /Sobra el audio 4e00-a5\.mp3/);
  assert.match(audioProblems(sentenceAudio(only), [...own, own[0]], ownHashes).join('\n'), /repite/);

  // A word with another reading needs a new audio.
  const word = vocabulary.find((item) => item.written === '一つ')!;
  assert.match(audioProblems(wordAudio([{ ...word, reading: 'いっこ' }]), words.generation.entries, words.hashes).join('\n'),
    /4e00-3064\.mp3 dice «一つ» \(ひとつ\), no «一つ» \(いっこ\)/);
});
