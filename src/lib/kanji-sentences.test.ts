import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectionDocument } from '../../tests/collection-fixture.ts';
import { kanjiSentencesFile, loadKanjiSentences, parseKanjiSentences, parseNavigation, parseStudyDocument } from './content.ts';
import { createSiteVocabulary, exampleProblems, harderWords, kanjiSentenceProblems, levelProblems, readSentence } from './site-vocabulary.ts';
import type { CounterDocument, KanjiSentencesDocument, LexiconDocument } from '../content-types.ts';

const root = new URL('../../public/', import.meta.url);
const navigation = parseNavigation(await readFile(new URL('content/navigation.json', root), 'utf8'));
const documents = await Promise.all(navigation.sections.filter((section) => section.kind !== 'kanji')
  .map(async (section) => parseStudyDocument(await readFile(new URL(section.file, root), 'utf8'), section.kind)));
const vocabulary = createSiteVocabulary(collectionDocument,
  documents.filter((data): data is LexiconDocument => data.kind === 'lexicon'),
  documents.find((data): data is CounterDocument => data.kind === 'counters')!);
const characters = collectionDocument.kanji.map((entry) => entry.character);
const input = await readFile(new URL(kanjiSentencesFile, root), 'utf8');
const sentences = parseKanjiSentences(input, characters);

const sentence = (written: string, reading: string) => ({ written, reading, meaning: 'Traducción.' });
const document = (entries: unknown[]) => JSON.stringify({ version: 1, kind: 'kanji-sentences', description: 'Frases.', entries });
const entry = (kanji: string, written = `${kanji}つ あります。`) => ({
  kanji, simple: [sentence(written, 'ひとつ あります。'), sentence(written, 'ひとつ あります。')],
  advanced: Array.from({ length: 4 }, () => sentence(written, 'ひとつ あります。')),
});

test('every kanji of the collection has two simple and four advanced sentences, in the collection order', () => {
  assert.deepEqual(sentences.entries.map((item) => item.kanji), characters);
  for (const item of sentences.entries) {
    assert.equal(item.simple.length, 2, item.kanji);
    assert.equal(item.advanced.length, 4, item.kanji);
  }
  assert.deepEqual(parseKanjiSentences(JSON.stringify(sentences), characters), sentences);
});

test('the sentences only use words of the site, with their readings, and the advanced ones use all three kinds', () => {
  assert.deepEqual(kanjiSentenceProblems(sentences, collectionDocument, vocabulary), []);
});

test('the dialog rejects sentences that do not show their kanji or do not match their reading', () => {
  assert.doesNotThrow(() => parseKanjiSentences(document([entry('一')]), characters));
  assert.throws(() => parseKanjiSentences(document([entry('個')]), characters), /no está en la colección/);
  assert.throws(() => parseKanjiSentences(document([entry('一'), entry('一')]), characters), /repetidas/);
  assert.throws(() => parseKanjiSentences(document([{ ...entry('一'), simple: [sentence('一つ。', 'ひとつ。')] }]), characters), /dos frases sencillas/);
  assert.throws(() => parseKanjiSentences(document([entry('二', '一つ あります。')]), characters), /no lo escribe/);
  assert.throws(() => parseKanjiSentences(document([{ ...entry('一'), simple: [sentence('一つ あります。', 'ひとつあります。'), sentence('一つ。', 'ひとつ。')] }]), characters),
    /mismos bloques/);
  assert.throws(() => parseKanjiSentences(document([{ ...entry('一'), simple: [sentence('一つ。', '一つ。'), sentence('一つ。', 'ひとつ。')] }]), characters),
    /en kana/);
  assert.throws(() => parseKanjiSentences(document([{ ...entry('一'), extra: true }]), characters), /desconocidos/);
});

test('a kanji counts only as part of a word of the site, read as the site reads it', () => {
  const problems = (written: string, reading: string) => readSentence({ written, reading }, vocabulary).problems;
  // 川, 森 and 石 are not words of the site on their own; 川べり, 森林 and 小石 are, and so are 水 and 車.
  assert.equal(problems('川に 行きます。', 'かわに いきます。').length, 1);
  assert.equal(problems('森へ 行きます。', 'もりへ いきます。').length, 1);
  assert.equal(problems('石が あります。', 'いしが あります。').length, 1);
  assert.deepEqual(problems('川べりを 歩きます。', 'かわべりを あるきます。'), []);
  assert.deepEqual(problems('でん車で 帰りました。', 'でんしゃで かえりました。'), []);
  assert.deepEqual(problems('水を 飲みます。', 'みずを のみます。'), []);
  assert.deepEqual(problems('車で 帰ります。', 'くるまで かえります。'), []);
  // The reading has to be the site's: 三本 is さんぼん.
  assert.equal(problems('鉛筆が 三本 あります。', 'えんぴつが さんほん あります。').length, 1);
  // Conjugated verbs and adjectives, loanwords in katakana and expressions with something in between.
  assert.deepEqual(problems('休みませんでした。', 'やすみませんでした。'), []);
  assert.deepEqual(problems('赤ちゃんが 立って とても 嬉しかったです。', 'あかちゃんが たって とても うれしかったです。'), []);
  assert.deepEqual(problems('生ハムを 食べます。', 'なまハムを たべます。'), []);
  assert.deepEqual(problems('写真を 三枚 撮りました。', 'しゃしんを さんまい とりました。'), []);
  assert.deepEqual(problems('一日中 寝ました。', 'いちにちじゅうねました。'), ['La escritura y la lectura deben tener los mismos bloques, separados por espacios.']);
});

test('adjectives, adverbs and counters are recognised from the words the sentence is read with', () => {
  const uses = (written: string, reading: string) => [...readSentence({ written, reading }, vocabulary).uses].sort();
  assert.deepEqual(uses('一日中 寝ました。', 'いちにちじゅう ねました。'), []);
  assert.deepEqual(uses('三日間 日記を 書きませんでした。', 'みっかかん にっきを かきませんでした。'), ['counter']);
  assert.deepEqual(uses('子犬が 四匹 生まれました。', 'こいぬが よんひき うまれました。'), ['counter']);
  assert.deepEqual(uses('休日の 天気は とても よかったです。', 'きゅうじつの てんきは とても よかったです。'), ['adjective', 'adverb']);
  assert.deepEqual(uses('この 机は 円いです。', 'この つくえは まるいです。'), ['adjective']);
  assert.deepEqual(uses('名人の 技術は 完璧でした。', 'めいじんの ぎじゅつは かんぺきでした。'), ['adjective']);
  assert.deepEqual(uses('ひよこが 五わ います。', 'ひよこが ごわ います。'), ['counter']);
  // かっこいい conjugates like いい: かっこよかった.
  assert.deepEqual(uses('ダンスは かっこよかったです。', 'ダンスは かっこよかったです。'), ['adjective']);
});

test('the examples of the sections and the counters also only use words of the site', () => {
  const lexicons = documents.filter((data): data is LexiconDocument => data.kind === 'lexicon');
  const counters = documents.find((data): data is CounterDocument => data.kind === 'counters')!;
  assert.deepEqual(exampleProblems(lexicons, counters, vocabulary), []);
  // Each problem says where it is: the section, the entry or counter form, and the example.
  const bottles = structuredClone(counters) as any;
  bottles.entries.find((entry: { id: string }) => entry.id === 'hon').forms[1].sentence = sentence('瓶を 二本 ください。', 'びんを にほん ください。');
  assert.deepEqual(exampleProblems(lexicons, bottles, vocabulary),
    ['Contadores · 二本 · 瓶を 二本 ください。: No se puede leer «瓶を二本くだ» con las palabras de la web y sus lecturas.']);
  const verbs = lexicons.map((data) => structuredClone(data) as any);
  verbs.find((data) => data.title === 'Verbos').entries[0].examples[0] = sentence('暑い 日は 遅く 起きます。', 'あつい ひは おそく おきます。');
  assert.match(exampleProblems(verbs, counters, vocabulary).join('\n'), /^Verbos · 起きます · 暑い 日は 遅く 起きます。: No se puede leer «日は遅く起き»/);
});

test('each context only uses words as easy as what it illustrates, or easier', () => {
  const lexicons = documents.filter((data): data is LexiconDocument => data.kind === 'lexicon');
  const counters = documents.find((data): data is CounterDocument => data.kind === 'counters')!;
  assert.deepEqual(levelProblems(collectionDocument, lexicons, counters, sentences, vocabulary), []);
  // Words in kana count too: the one that starts each block, with its ending. この is grammar, not a word of the site.
  const words = (written: string, reading = written) => readSentence({ written, reading }, vocabulary).words.map((word) => word.written).sort();
  assert.deepEqual(words('えきで かさを かして ください。'), ['えき', 'かさ', 'かします']);
  assert.deepEqual(words('時間が ありませんでした。', 'じかんが ありませんでした。'), ['あります', '時間']);
  // After では, ありません is the negative of です, not the verb あります.
  assert.deepEqual(words('この へやは 静かでは ありませんでした。', 'この へやは しずかでは ありませんでした。'), ['へや', '静か']);
  // A word that starts in kana is read whole: かん字, not か, ん and the word 字.
  assert.deepEqual(words('かん字は 難しいです。', 'かんじは むずかしいです。'), ['かん字', '難しい']);
  // An easy entry only uses easy words, a medium one easy and medium words; the entry itself does not count.
  const meeting = sentence('えきで ともだちに 会いました。', 'えきで ともだちに あいました。');
  assert.deepEqual(harderWords(meeting, 'easy', [], vocabulary), ['会います']);
  assert.deepEqual(harderWords(meeting, 'easy', ['verb-aimasu'], vocabulary), []);
  assert.deepEqual(harderWords(meeting, 'medium', [], vocabulary), []);
  // A word in two lists counts at its easiest level: 早い is easy in the collection, 早い／速い medium.
  assert.deepEqual(harderWords(sentence('バスは 早いです。', 'バスは はやいです。'), 'easy', [], vocabulary), []);
  // In the sentences of a kanji, the word that writes it may be of any level: 川 is easy, 川上 medium.
  const changed = structuredClone(sentences) as any;
  const river = changed.entries.find((entry: { kanji: string }) => entry.kanji === '川');
  river.simple[0] = sentence('川上は とても 静かです。', 'かわかみは とても しずかです。');
  river.simple[1] = sentence('川上で ともだちに 会いました。', 'かわかみで ともだちに あいました。');
  assert.deepEqual(levelProblems(collectionDocument, lexicons, counters, changed, vocabulary),
    ['Frases de 川 (fácil) · 川上で ともだちに 会いました。: 会います']);
});

test('the publishing check reports missing kanji, repeated sentences and advanced sentences without modifiers or counters', () => {
  const first = sentences.entries[0];
  const changed = (entries: KanjiSentencesDocument['entries']) => kanjiSentenceProblems({ ...sentences, entries }, collectionDocument, vocabulary);
  assert.match(changed(sentences.entries.slice(1)).join('\n'), /todos los kanji/);
  assert.match(changed([{ ...first, simple: [first.simple[0], first.simple[0]] }, ...sentences.entries.slice(1)]).join('\n'), /repetida/);
  const plain = { ...first, advanced: [first.simple[0], first.simple[1], first.advanced[2], first.advanced[3]] };
  const problems = changed([plain, ...sentences.entries.slice(1)]).join('\n');
  assert.match(problems, /no usa ningún adjetivo, adverbio ni contador/);
});

test('the sentences load from one relative file with default caching, and fail clearly when it is missing', async (t) => {
  Object.defineProperty(globalThis, 'document', { value: { baseURI: 'https://example.github.io/80kanjis/' }, configurable: true });
  t.after(() => { Reflect.deleteProperty(globalThis, 'document'); });
  const urls: string[] = [];
  const fetch = t.mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    urls.push(url.href);
    assert.equal(options.cache, undefined, 'Default HTTP caching revalidates with ETag instead of downloading again.');
    return new Response(input);
  });
  assert.deepEqual(await loadKanjiSentences(characters), sentences);
  assert.deepEqual(urls, ['https://example.github.io/80kanjis/content/kanji-sentences.json']);
  fetch.mock.mockImplementation(async () => new Response('', { status: 404 }));
  await assert.rejects(() => loadKanjiSentences(characters), /cargar el contenido/);
});
