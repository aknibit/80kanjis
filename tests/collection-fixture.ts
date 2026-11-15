import { readFileSync } from 'node:fs';
import { collectionRows, parseCollection } from '../src/lib/collection.ts';
import { createStudyCatalog } from '../src/lib/study-catalog.ts';

// Tests and runtime derive their content from the same tracked JSON; no data copy.
export const collectionDocument = parseCollection(readFileSync(new URL('../public/collection.json', import.meta.url), 'utf8'));
export const kanji = collectionRows(collectionDocument);
export const studyCatalog = createStudyCatalog(kanji);
