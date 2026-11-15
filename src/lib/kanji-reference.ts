import type { CollectionDocument, KanjiDefinition, SupportingKanjiDefinition, Vocabulary } from '../types.ts';

export type KanjiReference = {
  readonly kind: 'collection';
  readonly definition: KanjiDefinition;
  readonly position: number;
  readonly vocabulary: readonly Vocabulary[];
} | {
  readonly kind: 'advanced';
  readonly definition: SupportingKanjiDefinition;
  readonly vocabulary: readonly Vocabulary[];
};

/** Both groups read their content from the same canonical document. */
export function createKanjiReferences(source: CollectionDocument): ReadonlyMap<string, KanjiReference> {
  const references = new Map<string, KanjiReference>();
  source.kanji.forEach((definition, index) => {
    references.set(definition.character, {
      kind: 'collection', definition, position: index + 1,
      vocabulary: source.vocabulary.filter((word) => word.written.includes(definition.character)),
    });
  });
  for (const definition of source.supportingKanji ?? []) {
    references.set(definition.character, {
      kind: 'advanced', definition,
      vocabulary: source.vocabulary.filter((word) => word.written.includes(definition.character)),
    });
  }
  return references;
}

export interface WordPart {
  readonly text: string;
  readonly kind: 'text' | 'target' | 'collection' | 'advanced';
}

/** Split by Unicode character, preserving kana and punctuation exactly as written. */
export function wordKanjiParts(written: string, references: ReadonlyMap<string, KanjiReference>, target?: string): readonly WordPart[] {
  const parts: WordPart[] = [];
  for (const character of written) {
    const reference = references.get(character);
    const kind = reference?.kind === 'advanced' ? 'advanced'
      : reference?.kind === 'collection' ? character === target ? 'target' : 'collection' : 'text';
    const previous = parts.at(-1);
    if (kind === 'text' && previous?.kind === 'text') parts[parts.length - 1] = { kind, text: previous.text + character };
    else parts.push({ text: character, kind });
  }
  return parts;
}
