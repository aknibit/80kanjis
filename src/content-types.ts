import type { Difficulty } from './types.ts';

export type ContentKind = 'counters' | 'kana' | 'lexicon';

export interface NavigationSection {
  readonly id: string;
  readonly label: string;
  readonly kind: 'kanji' | ContentKind;
  readonly file: string;
  readonly placement?: 'primary' | 'support';
  /** Lexicon only: compact cards in as many columns as fit, one list per group, with wrapping filters. */
  readonly layout?: 'cards';
}

export interface NavigationDocument {
  readonly version: 1;
  readonly sections: readonly NavigationSection[];
}

export interface ContentSource {
  readonly id: string;
  readonly label: string;
  readonly type: 'vault' | 'attachment' | 'reference';
  readonly path?: string;
  readonly sha256?: string;
  readonly url?: string;
}

/** How the entries of a lexicon group conjugate; their examples then show the four polite forms. */
export type Inflection = 'i-adjective' | 'na-adjective';

export interface ContentGroup {
  readonly id: string;
  readonly label: string;
  readonly inflection?: Inflection;
}

/** Polite affirmative or negative, present or past, in the order of the course: たのしいです, たのしかったです, たのしくないです, たのしくなかったです. */
export type ExampleForm = 'present-affirmative' | 'past-affirmative' | 'present-negative' | 'past-negative';

/** A short sentence: written as on the page, its reading in kana and a Spanish translation. */
export interface ContentExample {
  readonly written: string;
  readonly reading: string;
  readonly meaning: string;
  /** Only in groups with an inflection: the form the sentence ends with. */
  readonly form?: ExampleForm;
}

export interface ContentGuide {
  readonly id: string;
  readonly title: string;
  readonly sourceId: string;
  readonly paragraphs: readonly string[];
  readonly examples?: readonly ContentExample[];
}

interface DocumentBase {
  readonly version: 1;
  readonly title: string;
  readonly description: string;
  readonly sources: readonly ContentSource[];
  readonly groups: readonly ContentGroup[];
  readonly guides: readonly ContentGuide[];
}

interface EntryBase {
  readonly id: string;
  readonly group: string;
  readonly sourceId: string;
}

/**
 * A real use of a counter form or question, in Japanese with its reading and translation: 一本の 鉛筆, いっぽんの えんぴつ,
 * un lápiz. It writes the form, and its reading uses one of the form's readings.
 */
export type CounterExample = Omit<ContentExample, 'form'>;

export interface CounterEntry extends EntryBase {
  readonly type: 'counter' | 'number';
  readonly written: string;
  /** How hard the counter is to learn; the page filters by it alongside the group. */
  readonly difficulty: Difficulty;
  /** Hiragana endings of the counter, most common first (for example ほん, ぽん, ぼん). */
  readonly endings: readonly string[];
  readonly title: string;
  readonly description: string;
  readonly notes: readonly string[];
  readonly forms: readonly {
    readonly value: number;
    readonly written: string;
    readonly readings: readonly string[];
    readonly special: boolean;
    readonly example: CounterExample;
    /** A complete everyday sentence with the form: 鉛筆を 一本 貸して ください。 */
    readonly sentence: CounterExample;
  }[];
  readonly question: {
    readonly written: string;
    readonly readings: readonly string[];
    readonly example: CounterExample;
    readonly sentence: CounterExample;
  };
}

export interface CounterDocument extends DocumentBase {
  readonly kind: 'counters';
  readonly entries: readonly CounterEntry[];
  readonly editorialNotes?: readonly string[];
}

export interface KanaEntry extends EntryBase {
  readonly hiragana: string;
  readonly katakana: string;
  readonly romaji: string;
  /** Sound families share columns from the right; rows advance downwards within each group. */
  readonly position: { readonly column: number; readonly row: number };
}

export interface KanaDocument extends DocumentBase {
  readonly kind: 'kana';
  readonly entries: readonly KanaEntry[];
}

export interface LexiconEntry extends EntryBase {
  readonly written: string;
  readonly reading: string;
  readonly romaji: string;
  readonly meaning: string;
  /** How hard the word is to learn: its own traps, raised by its JLPT level. The page filters by it alongside the group. */
  readonly difficulty: Difficulty;
  readonly note?: string;
  /** Simple sentences that use the entry with vocabulary from the site; the row opens to show them. */
  readonly examples?: readonly ContentExample[];
}

export interface LexiconDocument extends DocumentBase {
  readonly kind: 'lexicon';
  readonly entries: readonly LexiconEntry[];
}

export type StudyDocument = CounterDocument | KanaDocument | LexiconDocument;

/** Sentences for one of the 80 kanji: two simple ones, then four with adjectives, adverbs and counters. */
export interface KanjiSentences {
  readonly kanji: string;
  readonly simple: readonly ContentExample[];
  readonly advanced: readonly ContentExample[];
}

/** Loaded when a kanji dialog first opens, so the collection that loads with the page stays small. */
export interface KanjiSentencesDocument {
  readonly version: 1;
  readonly kind: 'kanji-sentences';
  readonly description: string;
  readonly entries: readonly KanjiSentences[];
}
export type ContentEntry = CounterEntry | KanaEntry | LexiconEntry;
