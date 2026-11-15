import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { studyCatalog } from '../../tests/collection-fixture.ts';
import { getPronunciation, pronunciations } from './pronunciations.ts';

test('every vocabulary item has exactly one audio with the matching reading', () => {
  const words = studyCatalog.items.filter((item) => item.type === 'vocabulary');
  assert.equal(pronunciations.length, words.length);
  for (const word of words) assert.ok(getPronunciation(word), `Missing audio for ${word.written}`);
  assert.equal(new Set(pronunciations.map((clip) => clip.itemId)).size, pronunciations.length);
  assert.equal(new Set(pronunciations.map((clip) => clip.file)).size, pronunciations.length);
  for (const clip of pronunciations) {
    const item = studyCatalog.byId.get(clip.itemId);
    assert.equal(item?.type, 'vocabulary');
    if (item?.type !== 'vocabulary') throw new Error('Missing vocabulary');
    assert.equal(item.reading, clip.reading);
    assert.equal(getPronunciation(item), clip);
    assert.equal(getPronunciation({ ...item, reading: 'べつのよみ' }), undefined);
  }
});

test('recorded and generated audio have matching checksums, source credits, and applicable terms', async () => {
  const base = new URL('../../public/audio/', import.meta.url);
  const credits = await readFile(new URL('CREDITS.txt', base), 'utf8');
  assert.match(await readFile(new URL('LICENSE-CC-BY-SA-4.0.txt', base), 'utf8'), /Attribution-ShareAlike 4.0 International/);
  assert.match(await readFile(new URL('VOICEVOX-NEMO-POLICY.txt', base), 'utf8'), /VOICEVOX Nemo/);
  for (const clip of pronunciations) {
    assert.match(clip.file, /^[a-z0-9]+(?:-[a-z0-9]+)*\.(mp3|wav)$/);
    const data = await readFile(new URL(clip.file, base));
    if (clip.kind === 'recorded') {
      const sha = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
      assert.equal(sha, clip.gitBlobSha, `Modified or missing recording: ${clip.itemId}`);
    } else {
      assert.equal(data.toString('ascii', 0, 4), 'RIFF');
      assert.equal(data.toString('ascii', 8, 12), 'WAVE');
      assert.equal(createHash('sha256').update(data).digest('hex'), clip.sha256);
      assert.ok(credits.includes('VOICEVOX Nemo') && credits.includes(clip.sha256));
    }
    assert.ok(credits.includes(clip.file) && credits.includes(clip.sourceUrl));
  }
});

test('saved synthesis queries speak the intended readings, including the 七色 override', async () => {
  const generation = JSON.parse(await readFile(new URL('../../public/audio/generation.json', import.meta.url), 'utf8'));
  assert.equal(generation.engine, 'VOICEVOX Nemo');
  const generated = pronunciations.filter((clip) => clip.kind === 'synthesized');
  // Standard spoken long vowels can differ from kana spelling in the source.
  const longVowels: Record<string, string> = {
    'word:円けい': 'えんけえ', 'word:本名': 'ほんみょお', 'word:町村': 'ちょおそん',
    'word:ざっ草': 'ざっそお', 'word:名犬': 'めえけん', 'word:下校': 'げこお',
    'word:校庭': 'こおてえ', 'word:てん校': 'てんこお', 'word:先とう': 'せんとお',
  };
  assert.equal(generation.entries.length, generated.length);
  for (const clip of generated) {
    const entry = generation.entries.find((item: { itemId: string }) => item.itemId === clip.itemId);
    assert.ok(entry, `Missing synthesis query: ${clip.itemId}`);
    assert.equal(entry.reading, clip.reading);
    assert.equal(entry.file, clip.file);
    assert.equal(entry.speaker, generation.speaker);
    const spoken = entry.query.accent_phrases.flatMap((phrase: { moras: { text: string }[] }) => phrase.moras)
      .map((mora: { text: string }) => mora.text).join('');
    const hiragana = [...spoken].map((character) => character >= 'ァ' && character <= 'ヶ'
      ? String.fromCharCode(character.charCodeAt(0) - 0x60) : character).join('');
    assert.equal(hiragana, longVowels[clip.itemId] ?? clip.reading, `Wrong synthesized reading: ${clip.itemId}`);
    assert.equal(entry.spokenReading ?? entry.reading, hiragana);
  }
  const nanairo = generation.entries.find((item: { itemId: string }) => item.itemId === 'word:七色');
  assert.equal(nanairo.query.accent_phrases[0].accent, 2);
  assert.equal(nanairo.query.kana, "ナナ'イロ");
  const yamamichi = generation.entries.find((item: { itemId: string }) => item.itemId === 'word:山みち');
  assert.equal(yamamichi.query.kana, "ヤマ'ミチ");
  assert.equal(yamamichi.query.accent_phrases[0].accent, 2);
  const karabako = generation.entries.find((item: { itemId: string }) => item.itemId === 'word:空ばこ');
  assert.equal(karabako.query.accent_phrases.length, 1);
});
