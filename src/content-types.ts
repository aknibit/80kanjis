export type ContentKind = 'counters' | 'kana' | 'lexicon';

export interface NavigationSection {
  readonly id: string;
  readonly label: string;
  readonly kind: 'kanji' | ContentKind;
  readonly file: string;
  readonly placement?: 'primary' | 'support';
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

export interface ContentGroup {
  readonly id: string;
  readonly label: string;
}

/** A short sentence: written as on the page, its reading in kana and a Spanish translation. */
export interface ContentExample {
  readonly written: string;
  readonly reading: string;
  readonly meaning: string;
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

export interface CounterEntry extends EntryBase {
  readonly type: 'counter' | 'number';
  readonly written: string;
  /** Hiragana endings of the counter, most common first (for example ほん, ぽん, ぼん). */
  readonly endings: readonly string[];
  readonly title: string;
  readonly description: string;
  readonly notes: readonly string[];
  readonly forms: readonly {
    readonly value: number;
    readonly meaning: string;
    readonly written: string;
    readonly readings: readonly string[];
    readonly special: boolean;
  }[];
  readonly question: { readonly meaning: string; readonly written: string; readonly readings: readonly string[] };
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
  readonly note?: string;
  /** Simple sentences that use the entry with vocabulary from the site; the row opens to show them. */
  readonly examples?: readonly ContentExample[];
}

export interface LexiconDocument extends DocumentBase {
  readonly kind: 'lexicon';
  readonly entries: readonly LexiconEntry[];
}

export type StudyDocument = CounterDocument | KanaDocument | LexiconDocument;
export type ContentEntry = CounterEntry | KanaEntry | LexiconEntry;
