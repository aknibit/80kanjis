import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { studyCatalog } from './study.ts';
import { getPronunciation, pronunciations } from './pronunciations.ts';

test('every sample matches a vocabulary identity and its exact reading', () => {
  assert.equal(pronunciations.length, 12);
  assert.equal(new Set(pronunciations.map((clip) => clip.itemId)).size, 12);
  for (const clip of pronunciations) {
    const item = studyCatalog.byId.get(clip.itemId);
    assert.equal(item?.type, 'vocabulary');
    if (item?.type !== 'vocabulary') throw new Error('Missing vocabulary');
    assert.equal(item.reading, clip.reading);
    assert.equal(getPronunciation(item), clip);
    assert.equal(getPronunciation({ ...item, reading: 'べつのよみ' }), undefined);
  }
});

test('sample files are byte-identical to the licensed upstream recordings and credited', async () => {
  const base = new URL('../../public/audio/', import.meta.url);
  const credits = await readFile(new URL('CREDITS.txt', base), 'utf8');
  assert.match(await readFile(new URL('LICENSE-CC-BY-SA-4.0.txt', base), 'utf8'), /Attribution-ShareAlike 4.0 International/);
  for (const clip of pronunciations) {
    assert.match(clip.file, /^[a-z]+\.mp3$/);
    const data = await readFile(new URL(clip.file, base));
    const sha = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    assert.equal(sha, clip.gitBlobSha, `Modified or missing audio: ${clip.itemId}`);
    assert.ok(credits.includes(clip.file) && credits.includes(clip.sourceUrl));
  }
});
