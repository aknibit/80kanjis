import { kanji } from './kanji.ts';
import { createStudyCatalog } from '../lib/study-catalog.ts';

/** Shared by the collection today and by independent study/quiz screens later. */
export const studyCatalog = createStudyCatalog(kanji);
