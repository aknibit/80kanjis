import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseNavigation, parseStudyDocument, resolveSection, sectionHref, searchContent, loadNavigation, loadStudyDocument } from './content.ts';
import type { StudyDocument, CounterDocument, KanaDocument, LexiconDocument } from '../content-types.ts';

const root = new URL('../../public/', import.meta.url);
const navigation = parseNavigation(await readFile(new URL('content/navigation.json', root), 'utf8'));
const documents = new Map<string, StudyDocument>();
for (const section of navigation.sections) {
  if (section.kind !== 'kanji') documents.set(section.id, parseStudyDocument(await readFile(new URL(section.file, root), 'utf8'), section.kind));
}
const counters = documents.get('counters') as CounterDocument;
const kana = documents.get('kana') as KanaDocument;
const verbs = documents.get('verbs') as LexiconDocument;

test('the navigation keeps the 80 kanji home first and maps each section to its canonical file', () => {
  assert.equal(navigation.sections[0].id, 'kanji');
  for (const id of ['kanji', 'counters', 'kana', 'verbs', 'vocabulary', 'modifiers']) {
    assert.ok(navigation.sections.some((section) => section.id === id));
  }
  for (const section of navigation.sections) {
    const href = sectionHref(section, 'https://example.github.io/80kanjis/?q=anterior&difficulty=hard#top');
    assert.equal(new URL(href).pathname, '/80kanjis/');
    assert.equal(new URL(href).searchParams.has('q'), false);
    assert.equal(resolveSection(navigation, href), section);
  }
  assert.equal(resolveSection(navigation, 'https://example.test/study/').id, 'kanji');
  assert.throws(() => resolveSection(navigation, 'https://example.test/?section=unknown'));
});

test('all section files round-trip and declare complete sources rather than code-owned content', () => {
  for (const data of documents.values()) assert.deepEqual(parseStudyDocument(JSON.stringify(data)), data);
  assert.ok(counters.entries.length >= 20);
  assert.ok(kana.entries.length >= 104);
  assert.ok(verbs.entries.length >= 50);
  assert.ok(documents.get('vocabulary')!.entries.length >= 132);
  assert.ok(documents.get('modifiers')!.entries.length >= 42);
  for (const data of documents.values()) {
    for (const source of data.sources.filter((source) => source.type === 'vault')) {
      assert.ok(source.path?.endsWith('.md'));
      assert.match(source.sha256!, /^[a-f0-9]{64}$/);
      assert.ok(!source.path!.startsWith('/'));
    }
  }
});

test('counter data distinguishes a day of duration, the first calendar day and number units', () => {
  const find = (id: string) => counters.entries.find((entry) => entry.id === id)!;
  assert.deepEqual(find('days').forms[0].readings, ['いちにち']);
  assert.deepEqual(find('dates').forms[0].readings, ['ついたち']);
  assert.equal(find('dates').forms.length, 31);
  assert.deepEqual(find('dates').forms.find((form) => form.value === 20)!.readings, ['はつか']);
  assert.deepEqual(find('hon').forms[2].readings, ['さんぼん']);
  assert.equal(find('hon').forms[2].special, true);
  assert.deepEqual(find('tsu').forms[9].readings, ['とお']);
  assert.equal(find('hundreds').type, 'number');
  assert.equal(find('hundreds').forms.length, 9);
  assert.equal(find('ten-thousands').forms[9].value, 100000);
});

test('kana covers the basic, voiced and contracted sounds without conflating duplicate romanizations', () => {
  assert.equal(kana.entries.filter((entry) => entry.group === 'basic').length, 46);
  assert.equal(kana.entries.filter((entry) => entry.group === 'voiced').length, 25);
  assert.equal(kana.entries.filter((entry) => entry.group === 'combined').length, 33);
  assert.deepEqual(searchContent(kana.entries, 'ji').map((entry) => entry.hiragana), ['じ', 'ぢ']);
  assert.equal(searchContent(kana.entries, 'キャ')[0].hiragana, 'きゃ');
});

test('content search combines groups and terms and handles accents, kana width and readings', () => {
  assert.ok(searchContent(counters.entries, 'lapices').some((entry) => entry.id === 'hon'));
  assert.deepEqual(searchContent(counters.entries, 'さんぼん').map((entry) => entry.id), ['hon']);
  assert.equal(searchContent(counters.entries, 'さんぼん', 'time').length, 0);
  assert.ok(searchContent(verbs.entries, 'escribir').some((entry) => entry.written === '書きます'));
  assert.ok(searchContent(verbs.entries, 'ｶｷﾏｽ').some((entry) => entry.written === '書きます'));
  assert.equal(searchContent(verbs.entries, 'escribir comer').length, 0);
  assert.ok(searchContent(verbs.entries, '', 'expressions').length >= 8);
});

test('invalid navigation, unsafe paths, duplicate sections and a different landing page are rejected', () => {
  const changes: ((data: any) => void)[] = [
    (data) => { data.version = 99; },
    (data) => { data.sections.reverse(); },
    (data) => { data.sections.push(data.sections[0]); },
    (data) => { data.sections[1].file = '../outside.json'; },
    (data) => { data.sections[1].file = 'https://example.test/content.json'; },
    (data) => { data.sections[1].kind = 'unknown'; },
    (data) => { data.sections[0].file = 'another.json'; },
  ];
  for (const change of changes) {
    const data = structuredClone(navigation); change(data);
    assert.throws(() => parseNavigation(JSON.stringify(data)));
  }
});

test('malformed study data, broken references and inconsistent readings fail before rendering', () => {
  const changes: ((data: any) => void)[] = [
    (data) => { data.version = 2; },
    (data) => { data.kind = 'unknown'; },
    (data) => { data.entries.push(data.entries[0]); },
    (data) => { data.entries[0].group = 'missing'; },
    (data) => { data.entries[0].sourceId = 'missing'; },
    (data) => { data.guides[0].sourceId = 'missing'; },
    (data) => { data.entries[0].meaning = ''; },
    (data) => { data.entries[0].reading = 'romaji'; },
    (data) => { data.entries[0].readng = data.entries[0].reading; },
    (data) => { data.sources[0].path = '/private/note.md'; },
    (data) => { data.sources[0].sha256 = 'not-a-checksum'; },
    (data) => { data.sources[0].url = 'javascript:alert(1)'; },
  ];
  for (const change of changes) {
    const data = structuredClone(verbs); change(data);
    assert.throws(() => parseStudyDocument(JSON.stringify(data)));
  }
  const wrongKana = structuredClone(kana) as any;
  wrongKana.entries[0].katakana = 'イ';
  assert.throws(() => parseStudyDocument(JSON.stringify(wrongKana)));
  const wrongCounter = structuredClone(counters) as any;
  wrongCounter.entries[0].forms[1].value = 1;
  assert.throws(() => parseStudyDocument(JSON.stringify(wrongCounter)));
  for (const input of ['{', 'null', '[]', '{}']) assert.throws(() => parseStudyDocument(input));
  assert.throws(() => parseStudyDocument(JSON.stringify(kana), 'counters'));
});

test('loaders request only relative canonical files and reject missing or wrong content', async (t) => {
  Object.defineProperty(globalThis, 'document', { value: { baseURI: 'https://example.github.io/80kanjis/?section=verbs' }, configurable: true });
  t.after(() => { Reflect.deleteProperty(globalThis, 'document'); });
  const urls: string[] = [];
  const fetch = t.mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    urls.push(url.href);
    assert.equal(options.cache, 'no-store');
    return new Response(JSON.stringify(url.pathname.endsWith('navigation.json') ? navigation : verbs));
  });
  assert.deepEqual(await loadNavigation(), navigation);
  assert.deepEqual(await loadStudyDocument(navigation.sections[3]), verbs);
  assert.deepEqual(urls, ['https://example.github.io/80kanjis/content/navigation.json', 'https://example.github.io/80kanjis/content/verbs.json']);
  await assert.rejects(() => loadStudyDocument(navigation.sections[0]));
  fetch.mock.mockImplementation(async () => new Response('', { status: 404 }));
  await assert.rejects(() => loadNavigation(), /cargar el contenido/);
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify(kana)));
  await assert.rejects(() => loadStudyDocument(navigation.sections[3]), /tipo de sección/);
});
