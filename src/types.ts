export type Difficulty = 'easy' | 'medium' | 'hard';

export type KanjiItemId = `kanji:${string}`;
export type VocabularyItemId = `word:${string}`;
export type StudyItemId = KanjiItemId | VocabularyItemId;

export interface KanjiStudyItem {
  readonly type: 'kanji';
  readonly id: KanjiItemId;
  readonly character: string;
  readonly meanings: readonly string[];
  readonly vocabularyIds: readonly VocabularyItemId[];
  // The source does not supply isolated kanji readings. Do not infer one from a word.
}

export interface VocabularyStudyItem {
  readonly type: 'vocabulary';
  readonly id: VocabularyItemId;
  readonly written: string;
  readonly reading: string;
  readonly meanings: readonly string[];
  /** Characters actually present in the spelling and included in this collection. */
  readonly kanjiIds: readonly KanjiItemId[];
}

/** A quiz can select either kind directly, without depending on a collection row. */
export type StudyItem = KanjiStudyItem | VocabularyStudyItem;

/** Presentation grouping: one kanji followed by exactly three vocabulary items. */
export interface StudyRow {
  readonly id: string;
  readonly itemIds: readonly [KanjiItemId, VocabularyItemId, VocabularyItemId, VocabularyItemId];
}

export interface StudyCatalog {
  readonly items: readonly StudyItem[];
  readonly byId: ReadonlyMap<StudyItemId, StudyItem>;
  readonly rows: readonly StudyRow[];
}

export interface Vocabulary {
  readonly written: string;
  readonly reading: string;
  readonly meaning: string;
  readonly difficulty: Difficulty | null;
}

export interface KanjiDefinition {
  readonly character: string;
  readonly meanings: readonly string[];
  readonly difficulty: Difficulty | null;
  readonly vocabulary: readonly [string, string, string];
}

/** The complete, versioned source of study content and published classifications. */
export interface CollectionDocument {
  readonly version: 1;
  readonly kanji: readonly KanjiDefinition[];
  readonly vocabulary: readonly Vocabulary[];
}

/** Derived presentation/search row; content lives exclusively in collection.json. */
export interface Kanji {
  /** Stable across changes to the collection's order. */
  readonly id: string;
  readonly character: string;
  readonly meanings: readonly string[];
  readonly vocabulary: readonly [Vocabulary, Vocabulary, Vocabulary];
  /** Classification from the canonical collection file. */
  readonly difficulty: Difficulty | null;
}
