import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { studyCatalog } from '../../tests/collection-fixture.ts';
import { getPronunciation, pronunciations } from './pronunciations.ts';

test('every audio matches a vocabulary identity and its exact reading', () => {
  assert.ok(pronunciations.length >= 30);
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
    assert.match(clip.file, /^[a-z]+\.(mp3|wav)$/);
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

test('all 30 vocabulary words in the requested ten kanji rows have playable audio', () => {
  // Coverage is a content promise for these rows, independent of future rating edits.
  const characters = [...'二三四七八九十百千日'];
  const rows = studyCatalog.rows.filter((row) => characters.includes(row.itemIds[0].slice(6)));
  assert.equal(rows.length, 10);
  const words = rows.flatMap((row) => row.itemIds.slice(1));
  assert.equal(words.length, 30);
  for (const id of words) {
    const item = studyCatalog.byId.get(id)!;
    if (item.type !== 'vocabulary') throw new Error('Expected vocabulary');
    assert.ok(getPronunciation(item), `Missing audio for ${item.written}`);
  }
});

test('saved synthesis queries speak the intended readings, including the 七色 override', async () => {
  const generation = JSON.parse(await readFile(new URL('../../public/audio/generation.json', import.meta.url), 'utf8'));
  assert.equal(generation.engine, 'VOICEVOX Nemo');
  const generated = pronunciations.filter((clip) => clip.kind === 'synthesized');
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
    assert.equal(hiragana, clip.reading, `Wrong synthesized reading: ${clip.itemId}`);
  }
  const nanairo = generation.entries.find((item: { itemId: string }) => item.itemId === 'word:七色');
  assert.equal(nanairo.query.accent_phrases[0].accent, 2);
  assert.equal(nanairo.query.kana, "ナナ'イロ");
});
