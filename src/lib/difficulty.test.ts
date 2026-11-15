import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { kanji } from '../data/kanji.ts';
import {
  createDifficultyFileWriter, createDifficultyStore, createDifficultyView, DIFFICULTY_STORAGE_KEY,
  LEGACY_DIFFICULTY_STORAGE_KEY, kanjiTarget, wordTarget, ratingDefaults,
  parseRatings, serializeRatings,
} from './difficulty.ts';

const document = (levels: Record<string, unknown> = {}, words: Record<string, unknown> = {}) => JSON.stringify({ version: 2, kanji: levels, words });

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value); },
  };
}

test('the public defaults file has the supported schema', async () => {
  const text = await readFile(new URL('../../public/difficulties.json', import.meta.url), 'utf8');
  assert.doesNotThrow(() => parseRatings(text, kanji));
});

test('ratings round-trip with readable character keys and explicit unrating', () => {
  const values = { 'kanji:二': 'hard', 'kanji:一': null, 'word:一つ': 'medium', 'word:二つ': 'easy' } as const;
  const text = serializeRatings(values, kanji);
  assert.deepEqual(parseRatings(text, kanji), values);
  assert.ok(text.indexOf('一') < text.indexOf('二'));
});

test('rejects malformed documents, unsupported versions, unknown characters, and invalid levels', () => {
  for (const text of ['{', 'null', '[]', '{}', '{"version":2,"ratings":{}}',
    '{"version":1,"ratings":[]}', document({ '龍': 'easy' }), document({ '一': 'extreme' }),
    document({ '一': 1 }), document({ '一': { difficulty: 'easy' } })]) {
    assert.throws(() => parseRatings(text, kanji));
  }
});

test('browser choices and an explicit clear survive reloads', () => {
  const storage = memoryStorage();
  const first = createDifficultyStore(kanji, () => storage);
  first.loadDefaults(document({ '一': 'hard' }));
  first.set('kanji:一', null);
  first.set('kanji:二', 'medium');
  const reloaded = createDifficultyStore(kanji, () => storage);
  reloaded.loadDefaults(document({ '一': 'hard', '三': 'easy' }));
  assert.equal(reloaded.get('kanji:一'), null);
  assert.equal(reloaded.get('kanji:二'), 'medium');
  assert.equal(reloaded.get('kanji:三'), 'easy');
});

test('changing file defaults updates entries without browser overrides', () => {
  const store = createDifficultyStore(kanji, memoryStorage);
  store.loadDefaults(document({ '一': 'easy', '二': 'hard' }));
  store.set('kanji:二', 'medium');
  store.loadDefaults(document({ '一': 'hard', '二': 'easy' }));
  assert.equal(store.get('kanji:一'), 'hard');
  assert.equal(store.get('kanji:二'), 'medium');
});

test('imports merge mentioned entries and invalid imports change nothing', () => {
  const storage = memoryStorage();
  const store = createDifficultyStore(kanji, () => storage);
  store.set('kanji:一', 'easy');
  store.import(document({ '二': 'medium', '三': null }));
  const before = store.export();
  assert.throws(() => store.import(document({ '一': 'hard', '二': 'invalid' })));
  assert.equal(store.export(), before);
  assert.equal(store.get('kanji:一'), 'easy');
  store.import(document({ '一': 'hard' }));
  assert.equal(store.get('kanji:一'), 'hard');
  assert.equal(createDifficultyStore(kanji, () => storage).get('kanji:二'), 'medium');
});

test('full exports can recreate all current choices in a fresh browser', () => {
  const first = createDifficultyStore(kanji, memoryStorage);
  first.loadDefaults(document({ '一': 'easy', '二': 'hard' }));
  first.set('kanji:二', null);
  first.set('kanji:三', 'medium');
  const second = createDifficultyStore(kanji, memoryStorage);
  second.import(first.export());
  assert.deepEqual(second.snapshot(), first.snapshot());
  assert.equal(Object.keys(parseRatings(first.export(), kanji)).length, Object.keys(ratingDefaults(kanji)).length);
});

test('blocked storage retains editable, exportable state in memory', () => {
  const store = createDifficultyStore(kanji, () => { throw new Error('Storage blocked'); });
  assert.equal(store.storageAvailable, false);
  store.set('kanji:一', 'hard');
  assert.equal(store.get('kanji:一'), 'hard');
  assert.equal(parseRatings(store.export(), kanji)['kanji:一'], 'hard');
});

test('corrupt browser storage does not prevent using the collection', () => {
  const storage = memoryStorage();
  storage.setItem(DIFFICULTY_STORAGE_KEY, '{invalid');
  const store = createDifficultyStore(kanji, () => storage);
  assert.equal(store.storageAvailable, false);
  assert.equal(store.get('kanji:一'), null);
  store.set('kanji:一', 'easy');
  assert.equal(store.storageAvailable, true);
  assert.equal(createDifficultyStore(kanji, () => storage).get('kanji:一'), 'easy');
});

function fakeFile(initial: Record<string, unknown> = {}) {
  let contents = document(initial);
  let failWrite = false;
  let failOpen = false;
  let aborted = 0;
  let active = 0;
  let maxActive = 0;
  return {
    name: 'difficulties.json',
    requestPermission: async () => 'granted' as const,
    getFile: async () => ({ text: async () => contents }),
    async createWritable() {
      if (failOpen) { failOpen = false; throw new Error('Permission denied'); }
      active += 1;
      maxActive = Math.max(maxActive, active);
      let staged = '';
      return {
        async write(text: string) {
          if (failWrite) { failWrite = false; throw new Error('Disk full'); }
          await Promise.resolve();
          staged = text;
        },
        async close() { contents = staged; active -= 1; },
        async abort() { aborted += 1; active -= 1; },
      };
    },
    editExternally(text: string) { contents = text; },
    failNextWrite() { failWrite = true; },
    failNextOpen() { failOpen = true; },
    get contents() { return contents; },
    get aborted() { return aborted; },
    get maxActive() { return maxActive; },
  };
}

test('rapid file changes are serialized and the latest value is saved', async () => {
  const file = fakeFile({ '三': 'medium' });
  const writer = createDifficultyFileWriter(file, kanji);
  await Promise.all([
    writer.write({ 'kanji:一': 'easy' }), writer.write({ 'kanji:二': 'hard' }), writer.write({ 'kanji:一': null }),
  ]);
  assert.deepEqual(parseRatings(file.contents, kanji), { 'kanji:一': null, 'kanji:二': 'hard', 'kanji:三': 'medium' });
  assert.equal(file.maxActive, 1);
});

test('file writes preserve unrelated edits made outside the page', async () => {
  const file = fakeFile();
  const writer = createDifficultyFileWriter(file, kanji);
  await writer.write({ 'kanji:一': 'easy' });
  file.editExternally(document({ '一': 'easy', '二': 'medium' }));
  await writer.write({ 'kanji:三': 'hard' });
  assert.deepEqual(parseRatings(file.contents, kanji), { 'kanji:一': 'easy', 'kanji:二': 'medium', 'kanji:三': 'hard' });
});

test('failed writes abort without replacing the file and later retries succeed', async () => {
  const file = fakeFile({ '一': 'easy' });
  const writer = createDifficultyFileWriter(file, kanji);
  file.failNextWrite();
  await assert.rejects(writer.write({ 'kanji:一': 'hard' }), /Disk full/);
  assert.equal(file.aborted, 1);
  assert.equal(parseRatings(file.contents, kanji)['kanji:一'], 'easy');
  await writer.write({ 'kanji:一': 'hard' });
  assert.equal(parseRatings(file.contents, kanji)['kanji:一'], 'hard');
});

test('permission errors and invalid files are reported without overwriting contents', async () => {
  const file = fakeFile({ '一': 'easy' });
  const writer = createDifficultyFileWriter(file, kanji);
  file.failNextOpen();
  await assert.rejects(writer.write({ 'kanji:一': 'hard' }), /Permission denied/);
  assert.equal(parseRatings(file.contents, kanji)['kanji:一'], 'easy');
  file.editExternally('{not a ratings file');
  await assert.rejects(writer.write({ 'kanji:一': 'hard' }));
  assert.equal(file.contents, '{not a ratings file');
});


test('a row has four independent targets and repeated words share a target', () => {
  const entry = kanji[0];
  const targets = [kanjiTarget(entry), ...entry.vocabulary.map(wordTarget)];
  assert.equal(new Set(targets.map((target) => target.key)).size, 4);
  const store = createDifficultyStore(kanji, memoryStorage);
  store.set(targets[0].key, 'hard');
  store.set(targets[1].key, 'easy');
  store.set(targets[2].key, 'medium');
  store.set(targets[3].key, null);
  assert.deepEqual(targets.map((target) => store.get(target.key)), ['hard', 'easy', 'medium', null]);
  const year = kanji.find((item) => item.character === '年')!;
  const repeated = year.vocabulary.find((word) => word.written === '一年生')!;
  assert.equal(wordTarget(repeated).key, targets[3].key);
  store.set(wordTarget(repeated).key, 'medium');
  assert.equal(store.get(targets[3].key), 'medium');
});

test('v1 files migrate only kanji ratings and export as v2 without losing words', () => {
  const legacy = JSON.stringify({ version: 1, ratings: { '一': 'hard', '二': null } });
  const store = createDifficultyStore(kanji, memoryStorage);
  store.set('word:一つ', 'easy');
  store.import(legacy);
  assert.equal(store.get('kanji:一'), 'hard');
  assert.equal(store.get('word:一つ'), 'easy');
  assert.equal(store.get('word:一ぴき'), null);
  const output = JSON.parse(store.export());
  assert.equal(output.version, 2);
  assert.equal(output.kanji['一'], 'hard');
  assert.equal(output.words['一つ'], 'easy');
});

test('legacy browser drafts are recovered, and v2 drafts take priority afterwards', () => {
  const storage = memoryStorage();
  const oldDraft = JSON.stringify({ version: 1, ratings: { '一': 'hard' } });
  storage.setItem(LEGACY_DIFFICULTY_STORAGE_KEY, oldDraft);
  const first = createDifficultyStore(kanji, () => storage);
  assert.equal(first.get('kanji:一'), 'hard');
  first.set('word:一つ', 'medium');
  first.set('kanji:一', null);
  const next = createDifficultyStore(kanji, () => storage);
  assert.equal(next.get('kanji:一'), null);
  assert.equal(next.get('word:一つ'), 'medium');
  assert.equal(storage.getItem(LEGACY_DIFFICULTY_STORAGE_KEY), oldDraft);
});

test('word changes survive reload and explicit clears preserve the kanji rating', () => {
  const storage = memoryStorage();
  const first = createDifficultyStore(kanji, () => storage);
  first.set('kanji:一', 'hard');
  first.set('word:一つ', 'medium');
  const next = createDifficultyStore(kanji, () => storage);
  assert.equal(next.get('word:一つ'), 'medium');
  next.set('word:一つ', null);
  assert.equal(next.get('kanji:一'), 'hard');
  assert.equal(parseRatings(next.export(), kanji)['word:一つ'], null);
});

test('unknown words and invalid word levels reject an entire import', () => {
  const store = createDifficultyStore(kanji, memoryStorage);
  store.set('kanji:一', 'easy');
  const before = store.export();
  for (const words of [{ '未知の言葉': 'easy' }, { '一つ': 'extreme' }]) {
    assert.throws(() => store.import(document({ '一': 'hard' }, words)));
    assert.equal(store.export(), before);
  }
});

test('the read-only view follows the public file independently of editor drafts', () => {
  const storage = memoryStorage();
  const editor = createDifficultyStore(kanji, () => storage);
  editor.set('kanji:一', 'hard');
  editor.set('word:一つ', 'hard');
  const viewer = createDifficultyView(kanji);
  viewer.loadDefaults(document({ '一': 'easy' }, { '一つ': 'medium' }));
  assert.equal(viewer.get('kanji:一'), 'easy');
  assert.equal(viewer.get('word:一つ'), 'medium');
  assert.equal(viewer.get('word:一ぴき'), null);
  assert.equal('set' in viewer, false);
  assert.equal('import' in viewer, false);
});

test('queued file writes retain kanji, words, explicit clears, and legacy file data', async () => {
  const file = fakeFile();
  file.editExternally(JSON.stringify({ version: 1, ratings: { '二': 'medium' } }));
  const writer = createDifficultyFileWriter(file, kanji);
  await Promise.all([
    writer.write({ 'kanji:一': 'hard' }),
    writer.write({ 'word:一つ': 'easy' }),
    writer.write({ 'word:二つ': 'medium' }),
    writer.write({ 'word:一つ': null }),
  ]);
  assert.deepEqual(parseRatings(file.contents, kanji), {
    'kanji:一': 'hard', 'kanji:二': 'medium', 'word:一つ': null, 'word:二つ': 'medium',
  });
  assert.equal(JSON.parse(file.contents).version, 2);
});
