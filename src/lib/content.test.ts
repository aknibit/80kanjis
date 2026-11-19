import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { exampleForms, filterByGroupAndDifficulty, parseDifficultyFilter, parseNavigation, parseStudyDocument, politeForm, resolveSection, sectionHref, searchContent, shuffled, loadNavigation, loadStudyDocument } from './content.ts';
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

test('shuffling returns a reordered copy with the same entries and leaves the original order untouched', () => {
  const entries = documents.get('vocabulary')!.entries;
  const original = [...entries];
  let seed = 7;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const result = shuffled(entries, random);
  assert.deepEqual(entries, original);
  assert.notDeepEqual(result, original);
  assert.deepEqual([...result].sort((a, b) => a.id.localeCompare(b.id)), [...original].sort((a, b) => a.id.localeCompare(b.id)));
  assert.deepEqual(shuffled([], random), []);
});

test('vocabulary uses cards, and card sections have no examples because cards do not open', () => {
  assert.equal(navigation.sections.find((section) => section.id === 'vocabulary')!.layout, 'cards');
  for (const section of navigation.sections.filter((item) => item.layout === 'cards')) {
    const data = documents.get(section.id) as LexiconDocument;
    for (const entry of data.entries) assert.equal(entry.examples, undefined, `${section.id}: ${entry.id}`);
  }
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

test('every counter has a difficulty: how hard its readings and its use are to learn', () => {
  const level = (difficulty: string) => counters.entries.filter((entry) => entry.difficulty === difficulty).map((entry) => entry.id);
  // No sound changes, or only いっ・はっ・じゅっ.
  assert.deepEqual(level('easy'), ['ko', 'mai', 'dai', 'satsu', 'weeks', 'age', 'thousands', 'ten-thousands']);
  // Alternating endings (ほん・ぽん・ぼん, ふん・ぷん) or a few irregular readings (ひとり, ふたり, よじ, くじ).
  assert.deepEqual(level('medium'), ['nin', 'hon', 'hiki', 'soku', 'hai', 'months', 'hours', 'minutes', 'hundreds']);
  // Series to learn by heart (ひとつ, ついたち, ふつかかん), or a use that is hard to delimit (〜頭 against 〜匹).
  assert.deepEqual(level('hard'), ['tsu', 'wa', 'tou', 'days', 'dates']);
  for (const value of [undefined, 'unrated', 'Fácil', null]) {
    const data = structuredClone(counters) as any;
    data.entries[0].difficulty = value;
    assert.throws(() => parseStudyDocument(JSON.stringify(data)), String(value));
  }
});

test('every word, verb, adjective and adverb has a difficulty: its own traps, which its JLPT level can only raise', () => {
  const entries = ['vocabulary', 'verbs', 'modifiers'].flatMap((id) => (documents.get(id) as LexiconDocument).entries);
  const level = (written: string) => entries.find((entry) => entry.written === written)!.difficulty;
  // N5 without a trap, or a loanword heard as it is, whatever its list says (ビール is N3 there).
  for (const written of ['宿題', 'テレビ', 'ビール', '起きます', 'おいしい', 'とても']) assert.equal(level(written), 'easy', written);
  // A second meaning or a nuance (かれ: él; novio, あります against います, あまり with a negative), or N4 and N3.
  for (const written of ['かれ', 'あります', 'あまり', '店員', '骨']) assert.equal(level(written), 'medium', written);
  // A special reading, a use that depends on whom one talks to, a な adjective that looks like an い one and takes が,
  // or N2, N1 and rarer words.
  for (const written of ['八百屋', '僕', 'くれます', 'きらい', '完璧', '手帳', '鸚鵡']) assert.equal(level(written), 'hard', written);
  for (const value of [undefined, 'unrated', 'Fácil', null]) {
    const data = structuredClone(verbs) as any;
    data.entries[0].difficulty = value;
    assert.throws(() => parseStudyDocument(JSON.stringify(data)), String(value));
  }
});

test('a lexicon entry that is also a word of the 80 kanji keeps the difficulty it has there', async () => {
  const collection = JSON.parse(await readFile(new URL('collection.json', root), 'utf8')) as { vocabulary: { written: string; difficulty: string }[] };
  const words = new Map(collection.vocabulary.map((word) => [word.written, word.difficulty]));
  const shared = ['vocabulary', 'verbs', 'modifiers'].flatMap((id) => (documents.get(id) as LexiconDocument).entries)
    .filter((entry) => words.has(entry.written));
  // 小学校, 中学校 and 休日; six months; 青い, 大きい and 小さい. 早い／速い is not the same entry as 早い: telling the
  // two kanji apart is what makes it medium.
  assert.equal(shared.length, 12);
  for (const entry of shared) assert.equal(entry.difficulty, words.get(entry.written), entry.id);
});

test('each counter form and question has a Japanese example and an everyday sentence that use it with one of its readings', () => {
  const hon = counters.entries.find((entry) => entry.id === 'hon')!;
  assert.deepEqual(hon.forms[0].example, { written: '一本の 鉛筆', reading: 'いっぽんの えんぴつ', meaning: 'un lápiz' });
  assert.equal(hon.question.example.reading, 'えんぴつは なんぼん ありますか。');
  // 十 in the general series is read とお, and the 1st of the month ついたち, not いちにち.
  assert.equal(counters.entries.find((entry) => entry.id === 'tsu')!.forms[9].example.reading, 'とおまで かぞえる');
  assert.equal(counters.entries.find((entry) => entry.id === 'dates')!.forms[0].example.reading, 'いちがつ ついたち');
  assert.deepEqual(hon.forms[0].sentence, { written: '鉛筆を 一本 ください。', reading: 'えんぴつを いっぽん ください。', meaning: 'Un lápiz, por favor.' });
  for (const entry of counters.entries) {
    for (const item of [...entry.forms, entry.question]) {
      for (const sample of [item.example, item.sentence]) {
        assert.ok(sample.written.replace(/\s/gu, '').includes(item.written), `${entry.id}: ${item.written}`);
      }
      assert.match(item.sentence.written, /[。？！]$/u, `${entry.id}: ${item.sentence.written}`);
    }
  }
  const changes: ((data: any) => void)[] = [
    (data) => { delete data.entries[6].forms[0].example; },
    (data) => { delete data.entries[6].question.example; },
    (data) => { data.entries[6].forms[0].meaning = 'un lápiz'; },
    (data) => { data.entries[6].forms[0].example.meaning = ' '; },
    // Another form, a reading that is not the form's, kanji in the reading and blocks that do not match.
    (data) => { data.entries[6].forms[0].example.written = '二本の 鉛筆'; },
    (data) => { data.entries[6].forms[0].example.reading = 'いちほんの えんぴつ'; },
    (data) => { data.entries[6].forms[0].example.reading = 'いっぽんの 鉛筆'; },
    (data) => { data.entries[6].forms[0].example.reading = 'いっぽんのえんぴつ'; },
    (data) => { data.entries[6].question.example.written = '鉛筆は 何冊 ありますか。'; },
    // The everyday sentence follows the same rules and is complete.
    (data) => { delete data.entries[6].forms[0].sentence; },
    (data) => { delete data.entries[6].question.sentence; },
    (data) => { data.entries[6].forms[0].sentence.written = '鉛筆を 二本 貸して ください。'; },
    (data) => { data.entries[6].forms[0].sentence.reading = 'えんぴつを いっぽん ください'; },
    (data) => { data.entries[6].forms[0].sentence = { ...data.entries[6].forms[0].example }; },
  ];
  for (const change of changes) {
    const data = structuredClone(counters); change(data);
    assert.throws(() => parseStudyDocument(JSON.stringify(data)));
  }
});

test('the everyday sentence of each counter form uses the concept of its example', () => {
  const solid = (text: string) => text.replace(/\s/gu, '');
  for (const entry of counters.entries) {
    for (const item of [...entry.forms, entry.question]) {
      const example = solid(item.example.written).replace(/[。？！]$/u, '');
      // 一本の 鉛筆 → 鉛筆; 鉛筆は 何本 ありますか。 → 鉛筆; 七月 七日 → 七月 and 七日; 十まで かぞえる → 十まで and かぞえ.
      const concepts = item === entry.question ? [example.split(/[はをが]/u)[0]]
        : example.includes('の') ? [example.slice(example.indexOf('の') + 1)]
        : item.example.written.split(/\s+/u).map((block) => block.replace(/る$/u, ''));
      for (const concept of concepts) {
        assert.ok(solid(item.sentence.written).includes(concept), `${entry.id}: ${item.example.written} / ${item.sentence.written}`);
      }
    }
  }
});

test('counter group and difficulty filters combine, and each counts what the other lets through', () => {
  const ids = (entries: readonly { id: string }[]) => entries.map((entry) => entry.id);
  const easyObjects = filterByGroupAndDifficulty(counters.entries, 'objects', 'easy');
  assert.deepEqual(ids(easyObjects.entries), ['ko', 'mai', 'dai', 'satsu']);
  // Objetos and the other groups count easy counters; the difficulties count objects.
  assert.equal(easyObjects.groupCounts('all'), 8);
  assert.equal(easyObjects.groupCounts('objects'), 4);
  assert.equal(easyObjects.groupCounts('time'), 2);
  assert.equal(easyObjects.groupCounts('living'), 0);
  assert.equal(easyObjects.difficultyCounts('all'), 8);
  assert.equal(easyObjects.difficultyCounts('easy'), 4);
  assert.equal(easyObjects.difficultyCounts('medium'), 3);
  assert.equal(easyObjects.difficultyCounts('hard'), 1);
  const everything = filterByGroupAndDifficulty(counters.entries, 'all', 'all');
  assert.equal(everything.entries.length, counters.entries.length);
  assert.equal(everything.difficultyCounts('easy') + everything.difficultyCounts('medium') + everything.difficultyCounts('hard'), counters.entries.length);
  assert.deepEqual(ids(filterByGroupAndDifficulty(counters.entries, 'numbers', 'hard').entries), []);
  // Lexicon sections combine them the same way: easy food.
  const vocabulary = documents.get('vocabulary') as LexiconDocument;
  const easyFood = filterByGroupAndDifficulty(vocabulary.entries, 'topic-5', 'easy');
  assert.equal(easyFood.entries.length, 24);
  assert.ok(easyFood.entries.every((entry) => entry.group === 'topic-5' && entry.difficulty === 'easy'));
  assert.equal(easyFood.difficultyCounts('all'), 39);
  assert.equal(easyFood.difficultyCounts('easy') + easyFood.difficultyCounts('medium') + easyFood.difficultyCounts('hard'), 39);
  // Kana has no difficulties and keeps filtering by group only.
  assert.equal(filterByGroupAndDifficulty(kana.entries, 'basic', 'all').entries.length, 46);
  assert.equal(filterByGroupAndDifficulty(kana.entries, 'basic', 'easy').entries.length, 0);
  assert.equal(parseDifficultyFilter('hard'), 'hard');
  for (const value of ['unrated', 'all', '', null]) assert.equal(parseDifficultyFilter(value), 'all');
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
  // The Japanese examples are searchable too, in writing, in kana and in translation.
  assert.deepEqual(searchContent(counters.entries, '鉛筆').map((entry) => entry.id), ['hon']);
  assert.deepEqual(searchContent(counters.entries, 'ひつじ').map((entry) => entry.id), ['tou']);
  assert.deepEqual(searchContent(counters.entries, 'tanabata').map((entry) => entry.id), ['dates']);
  assert.deepEqual(searchContent(counters.entries, 'karaoke').map((entry) => entry.id), ['nin']);
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
  // Every verb opens to its four polite forms, like the adjectives; multi-word verbs may be spaced.
  assert.ok(verbs.groups.every((group) => group.inflection === 'verb'));
  for (const entry of verbs.entries) assert.deepEqual(entry.examples?.map((example) => example.form), exampleForms, entry.id);
  const photo = essentials.find((entry) => entry.id === 'verb-shashin-o-torimasu')!;
  assert.ok(photo.examples!.some((example) => example.written.includes('写真を 撮りました')));
  // Each example closes with its form: a present negative cannot stand in for the past negative.
  const wrongForm = structuredClone(verbs) as any;
  wrongForm.entries[0].examples[3] = { ...wrongForm.entries[0].examples[2], form: 'past-negative' };
  assert.throws(() => parseStudyDocument(JSON.stringify(wrongForm)), /no termina con su forma/);
});

test('polite forms follow the course: く/かった for い adjectives, ではありません/でした for な, and いい from よい', () => {
  assert.deepEqual(exampleForms.map((form) => politeForm('楽しい', 'i-adjective', form)),
    ['楽しいです', '楽しかったです', '楽しくないです', '楽しくなかったです']);
  assert.deepEqual(exampleForms.map((form) => politeForm('いい', 'i-adjective', form)),
    ['いいです', 'よかったです', 'よくないです', 'よくなかったです']);
  assert.deepEqual(exampleForms.map((form) => politeForm('きれい', 'na-adjective', form)),
    ['きれいです', 'きれいでした', 'きれいではありません', 'きれいではありませんでした']);
  assert.deepEqual(exampleForms.map((form) => politeForm('起きます', 'verb', form)),
    ['起きます', '起きました', '起きません', '起きませんでした']);
});

test('adjectives open to the four polite forms in order, and adverbs to examples', () => {
  const modifiers = documents.get('modifiers') as LexiconDocument;
  const inflecting = new Set(modifiers.groups.filter((group) => group.inflection).map((group) => group.id));
  assert.deepEqual([...inflecting], ['i', 'na']);
  for (const entry of modifiers.entries) {
    if (inflecting.has(entry.group)) assert.deepEqual(entry.examples?.map((example) => example.form), exampleForms, entry.id);
    else assert.ok((entry.examples?.length ?? 0) >= 2 && entry.examples!.every((example) => !example.form), entry.id);
  }
  // い adjectives stay together, before the な ones, so the list reads in study order.
  const order = ['i', 'na', 'adverb'];
  const groups = modifiers.entries.map((entry) => entry.group);
  assert.deepEqual(groups, [...groups].sort((a, b) => order.indexOf(a) - order.indexOf(b)));
  const find = (id: string) => modifiers.entries.find((entry) => entry.id === id)!;
  assert.match(find('modifier-ii-yoi').examples![2].written, /よくないです。$/);
  assert.match(find('modifier-kirei').examples![2].written, /きれいでは ありません。$/);

  const rejects = (change: (data: any) => void) => {
    const data = structuredClone(modifiers) as any; change(data);
    assert.throws(() => parseStudyDocument(JSON.stringify(data)));
  };
  const entry = (data: any, id: string) => data.entries.find((item: { id: string }) => item.id === id);
  // きれい is a な adjective: the い negative is the classic mistake.
  rejects((data) => { Object.assign(entry(data, 'modifier-kirei').examples[2], { written: '教室は きれくないです。', reading: 'きょうしつは きれくないです。' }); });
  rejects((data) => { entry(data, 'modifier-tanoshii').examples[1].reading = 'きゅうじつは たのしいかったです。'; });
  // The present negative of a な adjective is not enough for its past negative.
  rejects((data) => { Object.assign(entry(data, 'modifier-benri').examples[3], { written: '虫眼鏡は 便利ではありません。', reading: 'むしめがねは べんりではありません。' }); });
  rejects((data) => { entry(data, 'modifier-tanoshii').examples.reverse(); });
  // The order of the course: present negative after past affirmative, not before.
  rejects((data) => { const list = entry(data, 'modifier-tanoshii').examples; [list[1], list[2]] = [list[2], list[1]]; });
  rejects((data) => { entry(data, 'modifier-tanoshii').examples.pop(); });
  rejects((data) => { delete entry(data, 'modifier-tanoshii').examples[0].form; });
  rejects((data) => { entry(data, 'modifier-tanoshii').examples[0].form = 'future'; });
  rejects((data) => { entry(data, 'adverb-totemo').examples[0].form = 'present-affirmative'; });
  rejects((data) => { data.groups[2].inflection = 'verb'; });
  rejects((data) => { data.guides.find((guide: { examples?: unknown }) => guide.examples).examples[0].form = 'present-affirmative'; });
  const counterGroup = structuredClone(counters) as any;
  counterGroup.groups[0].inflection = 'i-adjective';
  assert.throws(() => parseStudyDocument(JSON.stringify(counterGroup)));
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
    (data) => { data.sections[1].layout = 'cards'; },
    (data) => { data.sections.find((section: any) => section.id === 'vocabulary').layout = 'grid'; },
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
