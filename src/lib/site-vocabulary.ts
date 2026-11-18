import type { ContentExample, CounterDocument, KanjiSentencesDocument, LexiconDocument } from '../content-types.ts';
import type { CollectionDocument } from '../types.ts';

/** What a word contributes to a sentence; the kanji sentences check that the advanced ones use all three. */
export type WordUse = 'adjective' | 'adverb' | 'counter';

interface SiteWord {
  readonly written: string;
  readonly reading: string;
  readonly use?: WordUse;
  readonly inflection?: 'i' | 'na';
  /** Verbs and い adjectives: the kanji stem can take any ending in kana (起きます → 起きました, 早い → 早く). */
  readonly conjugates: boolean;
}

interface SiteSpelling {
  readonly written: string;
  readonly reading: string;
  readonly use?: WordUse;
}

export interface SiteVocabulary {
  /** Spellings with kanji that start with each character, longest first, so 一日中 is read before 一日. */
  readonly byFirst: ReadonlyMap<string, readonly SiteSpelling[]>;
  /** Words in kana that a block can start with: とても, おいしく, よかった. */
  readonly kanaUses: readonly { readonly form: string; readonly use: WordUse }[];
}

const han = /\p{Script=Han}/u;
const numeral = /^[一二三四五六七八九十]/u;

function pairs(written: string, reading: string): [string, string][] {
  const spellings = written.replace(/\s/gu, '').split('／');
  const readings = reading.replace(/\s/gu, '').split('／');
  if (spellings.length === readings.length) return spellings.map((spelling, index) => [spelling, readings[index]]);
  return spellings.flatMap((spelling) => readings.map((value): [string, string] => [spelling, value]));
}

/** Katakana read as hiragana, so a loanword may keep its katakana in the reading. */
function hiragana(text: string): string {
  return text.replace(/[ァ-ヶ]/gu, (character) => String.fromCharCode(character.charCodeAt(0) - 0x60));
}

/** Forms of an adjective in kana: おいしい, おいしく, おいしかった; いい as よく and よかった; きれい as is. */
function adjectiveForms(word: string, inflection: 'i' | 'na'): string[] {
  if (inflection === 'na') return [word];
  const stem = word === 'いい' ? 'よ' : word.slice(0, -1);
  return [word, `${stem}く`, `${stem}かった`];
}

/**
 * Every word the site teaches: the collection, the lexicon sections and the counter forms. A sentence may only
 * write a kanji as part of one of them, with the same reading; 川 or 水 on their own are not words of the site.
 */
export function createSiteVocabulary(collection: CollectionDocument, lexicons: readonly LexiconDocument[], counters: CounterDocument): SiteVocabulary {
  const words: SiteWord[] = [];
  const counterReadings = new Set<string>();
  for (const entry of counters.entries) {
    for (const item of [...entry.forms, entry.question]) {
      for (const reading of item.readings) {
        words.push({ written: item.written, reading, use: 'counter', conjugates: false });
        counterReadings.add(reading);
      }
    }
  }
  for (const word of collection.vocabulary) {
    // The collection keeps verbs in dictionary form (見る, 休む) and い adjectives as such (大きい, 正しい).
    const verb = /[るむつすぶ]$/u.test(word.written) && !numeral.test(word.written);
    const adjective = word.written.endsWith('い');
    // 一ぴき and 五わ are counter forms written with kana: 一匹, 五羽.
    const counter = numeral.test(word.written) && counterReadings.has(word.reading);
    words.push({ written: word.written, reading: word.reading, use: adjective ? 'adjective' : counter ? 'counter' : undefined,
      inflection: adjective ? 'i' : undefined, conjugates: verb || adjective });
  }
  for (const document of lexicons) {
    const groups = new Map(document.groups.map((group) => [group.id, group]));
    for (const entry of document.entries) {
      const group = groups.get(entry.group);
      const use: WordUse | undefined = group?.inflection ? 'adjective' : entry.group === 'adverb' ? 'adverb' : undefined;
      const inflection = group?.inflection === 'i-adjective' ? 'i' : group?.inflection === 'na-adjective' ? 'na' : undefined;
      const conjugates = inflection === 'i' || entry.written.endsWith('ます');
      for (const [written, reading] of pairs(entry.written, entry.reading)) {
        words.push({ written, reading, use, inflection, conjugates });
        // An expression keeps its verb when something comes between: 写真を 三枚 撮りました.
        const object = written.lastIndexOf('を');
        if (conjugates && object > 0 && reading.includes('を')) {
          words.push({ written: written.slice(object + 1), reading: reading.slice(reading.lastIndexOf('を') + 1), conjugates });
        }
      }
    }
  }

  const spellings = new Map<string, SiteSpelling>();
  const add = (spelling: SiteSpelling) => {
    if (spelling.written && spelling.reading) spellings.set(`${spelling.written}:${spelling.reading}`, spelling);
  };
  const kanaUses: { form: string; use: WordUse }[] = [];
  for (const word of words) {
    if (!han.test(word.written)) {
      if (word.use) kanaUses.push(...(word.inflection ? adjectiveForms(word.written, word.inflection) : [word.written]).map((form) => ({ form, use: word.use! })));
      continue;
    }
    add(word);
    // Strip the kana ending from both: 休みます/やすみます → 休/やす, so 休んで and 休みました also match.
    const ending = word.conjugates ? word.written.match(/[^\p{Script=Han}]+$/u)?.[0] ?? '' : '';
    if (ending && word.reading.endsWith(hiragana(ending))) {
      add({ written: word.written.slice(0, -ending.length), reading: word.reading.slice(0, -ending.length), use: word.use });
    }
  }
  const byFirst = new Map<string, SiteSpelling[]>();
  for (const spelling of spellings.values()) {
    const first = [...spelling.written][0];
    byFirst.set(first, [...byFirst.get(first) ?? [], spelling]);
  }
  for (const list of byFirst.values()) list.sort((a, b) => [...b.written].length - [...a.written].length);
  return { byFirst, kanaUses };
}

// Escaped like in content.ts: the font subset reads literal characters from the source.
const kana = /[\p{Script=Hiragana}\p{Script=Katakana}ー\u3001。\uff1f\uff01]/u;

/**
 * Reads a sentence with the words of the site: every kanji belongs to one of them and the reading follows that word's
 * reading. Kana are read as written, and katakana may stay in katakana in the reading (コーヒーを のみます). Also says
 * which adjectives, adverbs and counters it uses, from the words it was read with (一日中 is not the counter 一日).
 */
export function readSentence(sentence: Pick<ContentExample, 'written' | 'reading'>, vocabulary: SiteVocabulary) {
  const problems: string[] = [];
  const blocks = (text: string) => text.trim().split(/\s+/u);
  if (blocks(sentence.written).length !== blocks(sentence.reading).length) {
    problems.push('La escritura y la lectura deben tener los mismos bloques, separados por espacios.');
  }
  const written = [...sentence.written.replace(/\s/gu, '')];
  const reading = hiragana(sentence.reading.replace(/\s/gu, ''));
  const failed = new Set<string>();
  const path: SiteSpelling[] = [];
  let furthest = 0;
  const read = (i: number, j: number): boolean => {
    if (i === written.length) return j === reading.length;
    const key = `${i}:${j}`;
    if (failed.has(key)) return false;
    furthest = Math.max(furthest, i);
    const character = written[i];
    if (kana.test(character) && hiragana(character) === reading[j] && read(i + 1, j + 1)) return true;
    for (const word of vocabulary.byFirst.get(character) ?? []) {
      const spelling = [...word.written];
      if (written.slice(i, i + spelling.length).join('') !== word.written) continue;
      const value = hiragana(word.reading);
      if (reading.startsWith(value, j) && read(i + spelling.length, j + value.length)) {
        path.push(word);
        return true;
      }
    }
    failed.add(key);
    return false;
  };
  if (!read(0, 0)) {
    problems.push(`No se puede leer «${written.slice(furthest, furthest + 6).join('')}» con las palabras de la web y sus lecturas.`);
  }
  const uses = new Set<WordUse>(path.flatMap((word) => word.use ? [word.use] : []));
  for (const block of blocks(sentence.written)) {
    for (const item of vocabulary.kanaUses) if (block.startsWith(item.form)) uses.add(item.use);
  }
  return { problems, uses: uses as ReadonlySet<WordUse> };
}

const useLabels: Record<WordUse, string> = { adjective: 'adjetivo', adverb: 'adverbio', counter: 'contador' };

/**
 * Problems with the kanji sentences before publishing: one entry per kanji of the collection, in its order; no sentence
 * repeated; every kanji read as part of a word of the site; and the four advanced sentences of each kanji use an
 * adjective, an adverb or a counter each, with all three among them.
 */
export function kanjiSentenceProblems(document: KanjiSentencesDocument, collection: CollectionDocument, vocabulary: SiteVocabulary): string[] {
  const problems: string[] = [];
  if (document.entries.map((entry) => entry.kanji).join() !== collection.kanji.map((entry) => entry.character).join()) {
    problems.push('Las frases deben cubrir todos los kanji de la colección, en su mismo orden.');
  }
  const seen = new Set<string>();
  for (const entry of document.entries) {
    for (const sentence of [...entry.simple, ...entry.advanced]) {
      const key = sentence.written.replace(/\s/gu, '');
      if (seen.has(key)) problems.push(`${entry.kanji} · ${sentence.written}: la frase está repetida.`);
      seen.add(key);
      for (const problem of readSentence(sentence, vocabulary).problems) problems.push(`${entry.kanji} · ${sentence.written}: ${problem}`);
    }
    const uses = entry.advanced.map((sentence) => readSentence(sentence, vocabulary).uses);
    uses.forEach((found, index) => {
      if (found.size === 0) problems.push(`${entry.kanji} · ${entry.advanced[index].written}: no usa ningún adjetivo, adverbio ni contador.`);
    });
    for (const use of Object.keys(useLabels) as WordUse[]) {
      if (!uses.some((found) => found.has(use))) problems.push(`${entry.kanji}: ninguna frase avanzada usa un ${useLabels[use]}.`);
    }
  }
  return problems;
}
