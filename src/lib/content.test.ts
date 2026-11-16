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
  assert.equal(navigation.sections.at(-1)!.id, 'kana');
  assert.equal(navigation.sections.at(-1)!.placement, 'support');
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

test('counter endings list the sound changes from most to least common', () => {
  const endings = (id: string) => counters.entries.find((entry) => entry.id === id)!.endings;
  assert.deepEqual(endings('hon'), ['ほん', 'ぽん', 'ぼん']);
  assert.deepEqual(endings('nin'), ['にん', 'り']);
  assert.deepEqual(endings('dates'), ['にち', 'か']);
  assert.deepEqual(endings('hundreds'), ['ひゃく', 'ぴゃく', 'びゃく']);
  assert.ok(counters.entries.every((entry) => entry.endings.length > 0));
  const withEndings = (id: string, value: string[]) => {
    const data = structuredClone(counters) as any;
    data.entries.find((entry: { id: string }) => entry.id === id).endings = value;
    return JSON.stringify(data);
  };
  assert.throws(() => parseStudyDocument(withEndings('hon', ['ほん', 'ぼん', 'ぽん'])), /más a menos frecuentes/);
  assert.throws(() => parseStudyDocument(withEndings('mai', ['まい', 'ばい'])), /Ninguna lectura/);
  assert.throws(() => parseStudyDocument(withEndings('mai', [])));
  assert.throws(() => parseStudyDocument(withEndings('mai', ['mai'])));
});

test('kana covers the basic, voiced and contracted sounds without conflating duplicate romanizations', () => {
  assert.equal(kana.entries.filter((entry) => entry.group === 'basic').length, 46);
  assert.equal(kana.entries.filter((entry) => entry.group === 'voiced').length, 25);
  assert.equal(kana.entries.filter((entry) => entry.group === 'combined').length, 33);
  assert.deepEqual(searchContent(kana.entries, 'ji').map((entry) => entry.hiragana), ['じ', 'ぢ']);
  assert.equal(searchContent(kana.entries, 'キャ')[0].hiragana, 'きゃ');
});

test('kana charts preserve the vowel columns and the gaps of the Japanese syllabary', () => {
  const position = (hiragana: string) => kana.entries.find((entry) => entry.hiragana === hiragana)!.position;
  assert.deepEqual(['あ', 'い', 'う', 'え', 'お'].map(position), [1, 2, 3, 4, 5].map((row) => ({ column: 1, row })));
  assert.deepEqual(position('か'), { column: 2, row: 1 });
  assert.deepEqual(['や', 'ゆ', 'よ'].map(position), [1, 3, 5].map((row) => ({ column: 8, row })));
  assert.deepEqual(['わ', 'を'].map(position), [1, 5].map((row) => ({ column: 10, row })));
  assert.deepEqual(['きゃ', 'きゅ', 'きょ'].map(position), [1, 2, 3].map((row) => ({ column: 2, row })));
  for (const change of [
    (data: any) => { delete data.entries[0].position; },
    (data: any) => { data.entries[0].position.row = 0; },
    (data: any) => { data.entries[0].position.row = 16; },
    (data: any) => { data.entries[0].position.column = 1.5; },
    (data: any) => { data.entries[1].position = data.entries[0].position; },
  ]) {
    const data = structuredClone(kana); change(data);
    assert.throws(() => parseStudyDocument(JSON.stringify(data)));
  }
});

test('kana variants and combinations share the columns of their basic sound families', () => {
  const families = [
    ['あいうえお'],
    ['かきくけこ', 'がぎぐげご', 'きゃ きゅ きょ', 'ぎゃ ぎゅ ぎょ'],
    ['さしすせそ', 'ざじずぜぞ', 'しゃ しゅ しょ', 'じゃ じゅ じょ'],
    ['たちつてと', 'だぢづでど', 'ちゃ ちゅ ちょ'],
    ['なにぬねの', 'にゃ にゅ にょ'],
    ['はひふへほ', 'ばびぶべぼ', 'ぱぴぷぺぽ', 'ひゃ ひゅ ひょ', 'びゃ びゅ びょ', 'ぴゃ ぴゅ ぴょ'],
    ['まみむめも', 'みゃ みゅ みょ'],
    ['やゆよ'],
    ['らりるれろ', 'りゃ りゅ りょ'],
    ['わを'],
    ['ん'],
  ];
  const covered = new Set<string>();
  families.forEach((family, index) => {
    for (const sounds of family) {
      for (const sound of sounds.includes(' ') ? sounds.split(' ') : [...sounds]) {
        const entry = kana.entries.find((entry) => entry.hiragana === sound)!;
        assert.ok(entry, sound);
        assert.equal(entry.position.column, index + 1, sound);
        covered.add(entry.id);
      }
    }
  });
  assert.equal(covered.size, kana.entries.length);
  for (const [sounds, column, firstRow] of [
    ['ばびぶべぼ', 6, 1],
    ['ぱぴぷぺぽ', 6, 6],
    ['きゃ きゅ きょ', 2, 1],
    ['ぎゃ ぎゅ ぎょ', 2, 4],
    ['しゃ しゅ しょ', 3, 1],
    ['じゃ じゅ じょ', 3, 4],
    ['ひゃ ひゅ ひょ', 6, 1],
    ['びゃ びゅ びょ', 6, 4],
    ['ぴゃ ぴゅ ぴょ', 6, 7],
  ] as const) {
    const syllables = sounds.includes(' ') ? sounds.split(' ') : [...sounds];
    assert.deepEqual(syllables.map((sound) => kana.entries.find((entry) => entry.hiragana === sound)!.position),
      syllables.map((_, index) => ({ column, row: firstRow + index })));
  }
  for (const [group, rowCount] of [['basic', 5], ['voiced', 10], ['combined', 9]] as const) {
    const entries = kana.entries.filter((entry) => entry.group === group);
    assert.equal(Math.max(...entries.map((entry) => entry.position.row)), rowCount, group);
    assert.equal(new Set(entries.map((entry) => entry.position.row)).size, rowCount, group);
  }
});

test('content search combines groups and terms and handles accents, kana width and readings', () => {
  assert.ok(searchContent(counters.entries, 'lapices').some((entry) => entry.id === 'hon'));
  assert.deepEqual(searchContent(counters.entries, 'さんぼん').map((entry) => entry.id), ['hon']);
  // Each counter row shows a different real use, so searching an object finds its counter.
  assert.deepEqual(searchContent(counters.entries, 'peliculas').map((entry) => entry.id), ['hon']);
  assert.deepEqual(searchContent(counters.entries, 'ballenas').map((entry) => entry.id), ['tou']);
  assert.deepEqual(searchContent(counters.entries, 'grullas').map((entry) => entry.id), ['wa']);
  assert.equal(searchContent(counters.entries, 'さんぼん', 'time').length, 0);
  assert.ok(searchContent(verbs.entries, 'escribir').some((entry) => entry.written === '書きます'));
  assert.ok(searchContent(verbs.entries, 'ｶｷﾏｽ').some((entry) => entry.written === '書きます'));
  assert.equal(searchContent(verbs.entries, 'escribir comer').length, 0);
  assert.ok(searchContent(verbs.entries, '', 'expressions').length >= 8);
});

test('verbs open with the 20 essential verbs, in study order', () => {
  assert.equal(verbs.groups[0].id, 'essentials');
  const essentials = verbs.entries.filter((entry) => entry.group === 'essentials');
  assert.equal(essentials.length, 20);
  assert.deepEqual(verbs.entries.slice(0, 20), essentials);
  assert.equal(essentials[0].written, '起きます');
  assert.equal(essentials.at(-1)!.written, '寝ます');
  assert.ok(essentials.some((entry) => entry.written === '来ます'));
  // Every verb opens to simple examples; the conjugated verb counts, and multi-word verbs may be spaced.
  for (const entry of verbs.entries) assert.ok((entry.examples?.length ?? 0) >= 2, entry.id);
  const photo = essentials.find((entry) => entry.id === 'verb-shashin-o-torimasu')!;
  assert.ok(photo.examples!.some((example) => example.written.includes('写真を 撮りました')));
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
    (data) => { data.sections[0].placement = 'support'; },
    (data) => { data.sections[1].placement = 'unknown'; },
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
    (data) => { data.entries[0].examples = []; },
    (data) => { data.entries[0].examples[0].reading = data.entries[0].examples[0].written; },
    (data) => { data.entries[0].examples[0].meaning = ' '; },
    (data) => { data.entries[0].examples[0].romaji = 'kyuujitsu'; },
    (data) => { data.entries[0].examples[0] = { ...data.entries[1].examples[0] }; },
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
  const verbsSection = navigation.sections.find((section) => section.id === 'verbs')!;
  Object.defineProperty(globalThis, 'document', { value: { baseURI: 'https://example.github.io/80kanjis/?section=verbs' }, configurable: true });
  t.after(() => { Reflect.deleteProperty(globalThis, 'document'); });
  const urls: string[] = [];
  const fetch = t.mock.method(globalThis, 'fetch', async (url: URL, options: RequestInit) => {
    urls.push(url.href);
    assert.equal(options.cache, undefined, 'Default HTTP caching lets the request reuse the HTML preload and revalidate with ETag.');
    return new Response(JSON.stringify(url.pathname.endsWith('navigation.json') ? navigation : verbs));
  });
  assert.deepEqual(await loadNavigation(), navigation);
  assert.deepEqual(await loadStudyDocument(verbsSection), verbs);
  assert.deepEqual(urls, ['https://example.github.io/80kanjis/content/navigation.json', 'https://example.github.io/80kanjis/content/verbs.json']);
  await assert.rejects(() => loadStudyDocument(navigation.sections[0]));
  fetch.mock.mockImplementation(async () => new Response('', { status: 404 }));
  await assert.rejects(() => loadNavigation(), /cargar el contenido/);
  fetch.mock.mockImplementation(async () => new Response(JSON.stringify(kana)));
  await assert.rejects(() => loadStudyDocument(verbsSection), /tipo de sección/);
});
