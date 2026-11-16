import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionDocument } from '../../tests/collection-fixture.ts';
import { collectionRows, loadCollection, parseCollection } from './collection.ts';
import { collectionDifficulties } from './difficulty.ts';
import { createKanjiSearch } from './search.ts';

test('the canonical source round-trips without data loss and owns all published ratings', () => {
  assert.deepEqual(parseCollection(JSON.stringify(collectionDocument)), collectionDocument);
  assert.equal(collectionDocument.kanji.length, 80);
  assert.equal(collectionDocument.vocabulary.length, 232);
  assert.equal(collectionDifficulties(collectionDocument).size, 312);
  assert.equal(collectionRows(collectionDocument)[0].vocabulary[0], collectionDocument.vocabulary[0]);
});

test('a single word definition supplies its content and difficulty to every occurrence', () => {
  const next = structuredClone(collectionDocument);
  const word = next.vocabulary.find((word) => word.written === '一年生')!;
  Object.assign(word, { reading: 'あたらしいよみ', meaning: 'Traducción actualizada', difficulty: 'hard' });
  const rows = collectionRows(parseCollection(JSON.stringify(next)));
  const occurrences = rows.flatMap((entry) => entry.vocabulary).filter((word) => word.written === '一年生');
  assert.equal(occurrences.length, 2);
  assert.ok(occurrences.every((item) => item === occurrences[0]));
  assert.equal(occurrences[0].reading, 'あたらしいよみ');
  assert.equal(occurrences[0].meaning, 'Traducción actualizada');
  assert.equal(collectionDifficulties(next).get('word:一年生'), 'hard');
  assert.equal(createKanjiSearch(rows)('Traducción actualizada').length, 2);
});

test('invalid schema, duplicate definitions and broken row references are rejected', () => {
  const mutations: ((data: any) => void)[] = [
    (data) => { data.version = 99; },
    (data) => { data.kanji[0].difficulty = 'unknown'; },
    (data) => { delete data.vocabulary[0].difficulty; },
    (data) => { data.vocabulary[0].reading = ''; },
    (data) => { data.vocabulary[0].meaning = null; },
    (data) => { data.kanji[0].meanings = []; },
    (data) => { delete data.kanji[0].onyomi; },
    (data) => { data.kanji[0].onyomi = ['ichi']; },
    (data) => { data.kanji[0].kunyomi = ['ひと..つ']; },
    (data) => { data.kanji[0].onyomi = []; data.kanji[0].kunyomi = []; },
    (data) => { data.kanji[0].onyomi = ['イチ', 'イチ']; },
    (data) => { data.kanji[0].sourceUrl = 'javascript:alert(1)'; },
    (data) => { data.kanjiReview.date = 'invalid'; },
    (data) => { data.kanjiReview.sourceUrl = 'javascript:alert(1)'; },
    (data) => { data.kanjiReview.creditsFile = '../secrets.txt'; },
    (data) => { data.kanji.push(data.kanji[0]); },
    (data) => { data.vocabulary.push(data.vocabulary[0]); },
    (data) => { data.kanji[0].vocabulary[0] = '未知'; },
    (data) => { data.kanji[0].vocabulary = ['一つ', '一つ', '一年生']; },
    (data) => { data.kanji[0].vocabulary.pop(); },
  ];
  for (const mutate of mutations) {
    const data = structuredClone(collectionDocument);
    mutate(data);
    assert.throws(() => parseCollection(JSON.stringify(data)));
  }
  for (const text of ['{', 'null', '[]', '{}']) assert.throws(() => parseCollection(text));
});

test('support kanji require complete, unique, safe references and cover all additional characters', () => {
  const mutations: ((data: any) => void)[] = [
    (data) => { data.supportingKanji = {}; },
    (data) => { data.supportingKanji.push(data.supportingKanji[0]); },
    (data) => { data.supportingKanji[0].character = '一'; },
    (data) => { data.supportingKanji[0].character = 'こ'; },
    (data) => { data.supportingKanji[0].meanings = []; },
    (data) => { data.supportingKanji[0].onyomi = []; },
    (data) => { data.supportingKanji[0].kunyomi = ['']; },
    (data) => { data.supportingKanji[0].sourceUrl = 'javascript:alert(1)'; },
    (data) => { data.supportingKanji[0].note = ''; },
    (data) => { data.supportingKanji = []; },
  ];
  for (const mutate of mutations) {
    const data = structuredClone(collectionDocument);
    mutate(data);
    assert.throws(() => parseCollection(JSON.stringify(data)));
  }
  // The optional extension does not invalidate earlier version-1 documents.
  const legacy = structuredClone(collectionDocument);
  delete (legacy as { supportingKanji?: unknown }).supportingKanji;
  assert.deepEqual(parseCollection(JSON.stringify(legacy)), legacy);
});

test('the loader uses one dynamic CDN-relative JSON for content and difficulties', async (t) => {
  Object.defineProperty(globalThis, 'document', { value: { baseURI: 'https://cdn.example/study/' }, configurable: true });
  t.after(() => { Reflect.deleteProperty(globalThis, 'document'); });
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    requests += 1;
    assert.equal(url.href, 'https://cdn.example/study/collection.json');
    assert.equal(options.cache, undefined, 'Default HTTP caching lets the request reuse the HTML preload and revalidate with ETag.');
    return new Response(JSON.stringify(collectionDocument));
  });
  assert.deepEqual(await loadCollection(), collectionDocument);
  assert.equal(requests, 1);
});

test('loading fails clearly for missing or invalid JSON instead of using a stale bundled copy', async (t) => {
  Object.defineProperty(globalThis, 'document', { value: { baseURI: 'https://cdn.example/' }, configurable: true });
  t.after(() => { Reflect.deleteProperty(globalThis, 'document'); });
  const fetch = t.mock.method(globalThis, 'fetch', async () => new Response('', { status: 404 }));
  await assert.rejects(loadCollection(), /cargar la colección/);
  fetch.mock.mockImplementation(async () => new Response('{invalid'));
  await assert.rejects(loadCollection(), /JSON válido/);
});
