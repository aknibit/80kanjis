import type { ContentExample, CounterDocument, KanjiSentencesDocument, LexiconDocument } from '../content-types.ts';
import type { CollectionDocument, Difficulty } from '../types.ts';

/** What a word contributes to a sentence; the kanji sentences check that the advanced ones use all three. */
export type WordUse = 'adjective' | 'adverb' | 'counter';

interface SiteWord {
  readonly written: string;
  readonly reading: string;
  readonly use?: WordUse;
  readonly inflection?: 'i' | 'na';
  /** Verbs and い adjectives: the kanji stem can take any ending in kana (起きます → 起きました, 早い → 早く). */
  readonly conjugates: boolean;
  readonly difficulty?: Difficulty;
  /** The entry it comes from: a lexicon id, counter:id or word:written for the collection. */
  readonly owner: string;
}

interface SiteSpelling {
  readonly written: string;
  readonly reading: string;
  readonly use?: WordUse;
  /** The easiest level among the words written this way: 早い is easy in the collection, 早い／速い medium. */
  readonly difficulty?: Difficulty;
  readonly owners: readonly string[];
  /** The whole word, for messages: 会います rather than its stem 会. */
  readonly name: string;
}

/** A word written in kana, as it can start a block: えき, あります, おいしい, きれい. */
interface KanaWord {
  readonly form: string;
  readonly kind: 'verb' | 'i' | 'na' | 'word';
  readonly difficulty?: Difficulty;
  readonly owners: readonly string[];
  readonly name: string;
}

export interface SiteVocabulary {
  /** Spellings with kanji that start with each character, longest first, so 一日中 is read before 一日. */
  readonly byFirst: ReadonlyMap<string, readonly SiteSpelling[]>;
  /** Words in kana that a block can start with: とても, おいしく, よかった. */
  readonly kanaUses: readonly { readonly form: string; readonly use: WordUse }[];
  /** Every word written in kana, longest first, to tell which ones a block uses. */
  readonly kanaWords: readonly KanaWord[];
}

const rank: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
const easiest = (a: Difficulty | undefined, b: Difficulty | undefined) => a === undefined || b === undefined ? undefined : rank[a] <= rank[b] ? a : b;

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

/** Forms of an adjective in kana: おいしい, おいしく, おいしかった; いい as よく and よかった, also in かっこいい; きれい as is. */
function adjectiveForms(word: string, inflection: 'i' | 'na'): string[] {
  if (inflection === 'na') return [word];
  const stem = word.endsWith('いい') ? `${word.slice(0, -2)}よ` : word.slice(0, -1);
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
        words.push({ written: item.written, reading, use: 'counter', conjugates: false, difficulty: entry.difficulty, owner: `counter:${entry.id}` });
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
      inflection: adjective ? 'i' : undefined, conjugates: verb || adjective, difficulty: word.difficulty ?? undefined, owner: `word:${word.written}` });
  }
  for (const document of lexicons) {
    const groups = new Map(document.groups.map((group) => [group.id, group]));
    for (const entry of document.entries) {
      const group = groups.get(entry.group);
      const adjective = group?.inflection === 'i-adjective' || group?.inflection === 'na-adjective';
      const use: WordUse | undefined = adjective ? 'adjective' : entry.group === 'adverb' ? 'adverb' : undefined;
      const inflection: 'i' | 'na' | undefined = group?.inflection === 'i-adjective' ? 'i' : group?.inflection === 'na-adjective' ? 'na' : undefined;
      const conjugates = inflection === 'i' || entry.written.endsWith('ます');
      const own = { use, inflection, conjugates, difficulty: entry.difficulty, owner: entry.id };
      // が marks an expression only when the reading spaces it off (こころが おれます), not in 召し上がります.
      const particles = /が\s/u.test(entry.reading) ? ['を', 'が'] : ['を'];
      for (const [written, reading] of pairs(entry.written, entry.reading)) {
        words.push({ written, reading, ...own });
        // An expression keeps its verb when something comes between: 写真を 三枚 撮りました.
        const object = Math.max(...particles.map((particle) => written.lastIndexOf(particle)));
        const objectReading = Math.max(...particles.map((particle) => reading.lastIndexOf(particle)));
        if (conjugates && object > 0 && objectReading > 0) {
          words.push({ written: written.slice(object + 1), reading: reading.slice(objectReading + 1), ...own, use: undefined });
        }
      }
    }
  }

  const spellings = new Map<string, SiteSpelling>();
  const add = (spelling: SiteSpelling) => {
    if (!spelling.written || !spelling.reading) return;
    const key = `${spelling.written}:${spelling.reading}`;
    const known = spellings.get(key);
    spellings.set(key, known ? { ...spelling, use: known.use ?? spelling.use, difficulty: easiest(known.difficulty, spelling.difficulty),
      owners: [...known.owners, ...spelling.owners], name: known.name } : spelling);
  };
  const kanaUses: { form: string; use: WordUse }[] = [];
  const kanaWords = new Map<string, KanaWord>();
  for (const word of words) {
    if (!han.test(word.written)) {
      if (word.use) kanaUses.push(...(word.inflection ? adjectiveForms(word.written, word.inflection) : [word.written]).map((form) => ({ form, use: word.use! })));
      const kind = word.written.endsWith('ます') ? 'verb' : word.inflection ?? 'word';
      const form = kind === 'verb' ? word.written.slice(0, -2) : word.written;
      const key = `${kind}:${form}`;
      const known = kanaWords.get(key);
      kanaWords.set(key, { form, kind, difficulty: known ? easiest(known.difficulty, word.difficulty) : word.difficulty,
        owners: [...known?.owners ?? [], word.owner], name: known?.name ?? word.written });
      continue;
    }
    add({ written: word.written, reading: word.reading, use: word.use, difficulty: word.difficulty, owners: [word.owner], name: word.written });
    // Strip the kana ending from both: 休みます/やすみます → 休/やす, so 休んで and 休みました also match. A verb
    // whose stem ends in kana keeps it (見える → 見え, 食べます → 食べ), so that 見えます is not read as 見る.
    const tail = word.conjugates ? word.written.match(/[^\p{Script=Han}]+$/u)?.[0] ?? '' : '';
    const ending = /^[えけげせぜてでねへべぺめれ](?:る|ます)$|^[いきぎしじちにひびみり]る$/u.test(tail) ? tail.slice(1) : tail;
    if (ending && word.reading.endsWith(hiragana(ending))) {
      add({ written: word.written.slice(0, -ending.length), reading: word.reading.slice(0, -ending.length), use: word.use,
        difficulty: word.difficulty, owners: [word.owner], name: word.written });
    }
  }
  const byFirst = new Map<string, SiteSpelling[]>();
  for (const spelling of spellings.values()) {
    const first = [...spelling.written][0];
    byFirst.set(first, [...byFirst.get(first) ?? [], spelling]);
  }
  for (const list of byFirst.values()) list.sort((a, b) => [...b.written].length - [...a.written].length);
  return { byFirst, kanaUses, kanaWords: [...kanaWords.values()].sort((a, b) => b.form.length - a.form.length) };
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
  const path: { word: SiteSpelling; start: number }[] = [];
  let furthest = 0;
  const read = (i: number, j: number): boolean => {
    if (i === written.length) return j === reading.length;
    const key = `${i}:${j}`;
    if (failed.has(key)) return false;
    furthest = Math.max(furthest, i);
    const character = written[i];
    // Words first, so that かん字, お花見 and ひる休み are read as words and not as kana followed by 字 or 花見.
    for (const word of vocabulary.byFirst.get(character) ?? []) {
      const spelling = [...word.written];
      if (written.slice(i, i + spelling.length).join('') !== word.written) continue;
      const value = hiragana(word.reading);
      if (reading.startsWith(value, j) && read(i + spelling.length, j + value.length)) {
        path.push({ word, start: i });
        return true;
      }
    }
    if (kana.test(character) && hiragana(character) === reading[j] && read(i + 1, j + 1)) return true;
    failed.add(key);
    return false;
  };
  if (!read(0, 0)) {
    problems.push(`No se puede leer «${written.slice(furthest, furthest + 6).join('')}» con las palabras de la web y sus lecturas.`);
  }
  const uses = new Set<WordUse>(path.flatMap(({ word }) => word.use ? [word.use] : []));
  for (const block of blocks(sentence.written)) {
    for (const item of vocabulary.kanaUses) if (block.startsWith(item.form)) uses.add(item.use);
  }
  // The words it uses: those with kanji, from the reading above, and the word in kana that starts a block (えきで,
  // とても, ありませんでした). A block that starts with neither is grammar or a word outside the site (この, ねこ).
  const used: UsedWord[] = path.map(({ word }) => ({ written: word.name, difficulty: word.difficulty, owners: word.owners }));
  let start = 0;
  let previous = '';
  for (const block of blocks(sentence.written)) {
    const covered = path.some((step) => step.start === start);
    // In 静かでは ありません, ありません is the negative of です, not the verb あります.
    const copula = previous.endsWith('では') && block.startsWith('ありません');
    previous = block;
    if (!covered && !copula && kana.test(block[0])) {
      const word = kanaWordAt(block, vocabulary);
      if (word) used.push({ written: word.name, difficulty: word.difficulty, owners: word.owners });
    }
    start += [...block].length;
  }
  return { problems, uses: uses as ReadonlySet<WordUse>, words: used as readonly UsedWord[] };
}

export interface UsedWord {
  readonly written: string;
  readonly difficulty?: Difficulty;
  readonly owners: readonly string[];
}

// What may follow a word in kana inside its block: particles, the copula or the end of the sentence.
const afterWord = /^(?:$|[のはがをにでとへもやかねよな\u3001。\uff1f\uff01]|から|まで|です|でした|では|じゃ|さん|たち)/u;
const verbEndings = /^(?:ませんでした|ませんか|ません|ました|ましょう|ます|て|た|ない)/u;
// て forms of a ます stem, for 〜て ください: かして, おしえて, きって, もらって.
const teForms = (stem: string) => {
  const last = stem.at(-1) ?? '';
  const base = stem.slice(0, -1);
  const godan: Record<string, string> = { い: 'って', ち: 'って', り: 'って', き: 'いて', ぎ: 'いで', み: 'んで', び: 'んで', に: 'んで', し: 'して' };
  return [`${stem}て`, ...(godan[last] ? [`${base}${godan[last]}`] : [])];
};

/** The longest word in kana that starts a block, with an ending that fits it: えきで, おいしかった, かして. */
function kanaWordAt(block: string, vocabulary: SiteVocabulary): KanaWord | undefined {
  for (const word of vocabulary.kanaWords) {
    if (word.kind === 'verb') {
      if (block.startsWith(word.form) && verbEndings.test(block.slice(word.form.length))) return word;
      // A て form fills its block, before ください or います: かして ください, not きってを (a stamp).
      if (teForms(word.form).includes(block)) return word;
    } else if (word.kind === 'i') {
      const forms = adjectiveForms(word.form, 'i');
      if (forms.some((form) => block.startsWith(form) && (form !== word.form || afterWord.test(block.slice(form.length)) || block.slice(form.length).startsWith('です')))) return word;
    } else if (block.startsWith(word.form) && afterWord.test(block.slice(word.form.length))) return word;
  }
  return undefined;
}

/**
 * The words of a sentence harder than `difficulty`, the level of what it illustrates: an easy entry, kanji or counter
 * only uses easy words, a medium one easy and medium words, and a hard one any word. The words of `owners` (the entry
 * itself) do not count, nor those `exempt` lets through.
 */
export function harderWords(sentence: Pick<ContentExample, 'written' | 'reading'>, difficulty: Difficulty | null | undefined,
  owners: readonly string[], vocabulary: SiteVocabulary, exempt: (written: string) => boolean = () => false): string[] {
  if (!difficulty) return [];
  return readSentence(sentence, vocabulary).words
    .filter((word) => word.difficulty && rank[word.difficulty] > rank[difficulty] && !word.owners.some((owner) => owners.includes(owner))
      && !exempt(word.written))
    .map((word) => word.written);
}

/**
 * Problems with the other contexts of the site: the examples of the lexicon entries and guides, and the example and
 * sentence of every counter form and question. Like the kanji sentences, they only write a kanji as part of a word of
 * the site, with its reading.
 */
export function exampleProblems(lexicons: readonly LexiconDocument[], counters: CounterDocument, vocabulary: SiteVocabulary): string[] {
  const problems: string[] = [];
  const check = (place: string, sample: Pick<ContentExample, 'written' | 'reading'>) => {
    for (const problem of readSentence(sample, vocabulary).problems) problems.push(`${place} · ${sample.written}: ${problem}`);
  };
  for (const document of lexicons) {
    for (const guide of document.guides) for (const sample of guide.examples ?? []) check(`${document.title} · ${guide.title}`, sample);
    for (const entry of document.entries) for (const sample of entry.examples ?? []) check(`${document.title} · ${entry.written}`, sample);
  }
  for (const entry of counters.entries) {
    for (const item of [...entry.forms, entry.question]) {
      check(`${counters.title} · ${item.written}`, item.example);
      check(`${counters.title} · ${item.written}`, item.sentence);
    }
  }
  return problems;
}

const levelLabels: Record<Difficulty, string> = { easy: 'fácil', medium: 'media', hard: 'difícil' };

/**
 * Contexts that use words harder than what they illustrate: the examples of an easy entry, the sentences of an easy
 * kanji and the example and sentence of each form of an easy counter only use easy words; medium ones, easy and
 * medium words; hard ones, any word. The guides illustrate no entry and are left out.
 */
export function levelProblems(collection: CollectionDocument, lexicons: readonly LexiconDocument[], counters: CounterDocument,
  sentences: KanjiSentencesDocument, vocabulary: SiteVocabulary): string[] {
  const problems: string[] = [];
  const check = (place: string, sample: Pick<ContentExample, 'written' | 'reading'>, difficulty: Difficulty | null, owners: string[],
    exempt?: (written: string) => boolean) => {
    const harder = harderWords(sample, difficulty, owners, vocabulary, exempt);
    if (harder.length > 0) problems.push(`${place} (${levelLabels[difficulty!]}) · ${sample.written}: ${[...new Set(harder)].join(', ')}`);
  };
  for (const document of lexicons) {
    for (const entry of document.entries) {
      for (const sample of entry.examples ?? []) check(`${document.title} · ${entry.written}`, sample, entry.difficulty, [entry.id]);
    }
  }
  for (const entry of counters.entries) {
    for (const item of [...entry.forms, entry.question]) {
      for (const sample of [item.example, item.sentence]) check(`${counters.title} · ${item.written}`, sample, entry.difficulty, [`counter:${entry.id}`]);
    }
  }
  // The word that writes the kanji may be of any level: 川, 虫, 田, 雨 and 口 are easy, but no word with them is.
  const kanji = new Map(collection.kanji.map((entry) => [entry.character, entry.difficulty]));
  for (const entry of sentences.entries) {
    for (const sentence of [...entry.simple, ...entry.advanced]) {
      check(`Frases de ${entry.kanji}`, sentence, kanji.get(entry.kanji) ?? null, [], (written) => written.includes(entry.kanji));
    }
  }
  return problems;
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
