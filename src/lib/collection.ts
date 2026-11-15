import type { CollectionDocument, Difficulty, Kanji, Vocabulary } from '../types.ts';

export function isDifficulty(value: unknown): value is Difficulty | null {
  return value === null || value === 'easy' || value === 'medium' || value === 'hard';
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function nonempty(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0; }

/** Validate before rendering the collection. Never invent content. */
export function parseCollection(text: string): CollectionDocument {
  if (text.length > 2_000_000) throw new Error('El archivo de la colección es demasiado grande.');
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { throw new Error('El archivo no contiene JSON válido.'); }
  if (!object(value) || value.version !== 1 || !Array.isArray(value.kanji) || !Array.isArray(value.vocabulary)) {
    throw new Error('El formato o la versión de la colección no es compatible.');
  }
  if (value.kanji.length === 0 || value.vocabulary.length === 0) throw new Error('La colección está vacía.');
  const words = new Set<string>();
  for (const word of value.vocabulary) {
    if (!object(word) || !nonempty(word.written) || !nonempty(word.reading) || !nonempty(word.meaning)
      || !isDifficulty(word.difficulty)) throw new Error('Hay una palabra incompleta o con dificultad no válida.');
    if (words.has(word.written)) throw new Error(`Palabra repetida: ${word.written}.`);
    words.add(word.written);
  }
  const characters = new Set<string>();
  for (const entry of value.kanji) {
    if (!object(entry) || !nonempty(entry.character) || [...entry.character].length !== 1
      || !Array.isArray(entry.meanings) || entry.meanings.length === 0 || !entry.meanings.every(nonempty)
      || !isDifficulty(entry.difficulty) || !Array.isArray(entry.vocabulary) || entry.vocabulary.length !== 3) {
      throw new Error('Hay un kanji incompleto o con dificultad no válida.');
    }
    if (characters.has(entry.character)) throw new Error(`Kanji repetido: ${entry.character}.`);
    characters.add(entry.character);
    if (new Set(entry.vocabulary).size !== 3) throw new Error(`Vocabulario repetido en la fila ${entry.character}.`);
    for (const written of entry.vocabulary) {
      if (!nonempty(written) || !words.has(written)) throw new Error(`Referencia de vocabulario desconocida en ${entry.character}: ${String(written)}.`);
    }
  }
  // Allow optional metadata alongside the study content.
  return value as unknown as CollectionDocument;
}

/** Runtime projection; repeated words share the same object from the source. */
export function collectionRows(source: CollectionDocument): readonly Kanji[] {
  const words = new Map(source.vocabulary.map((word) => [word.written, word]));
  return source.kanji.map((entry) => ({
    id: `kanji-${entry.character.codePointAt(0)!.toString(16)}`,
    character: entry.character,
    meanings: entry.meanings,
    difficulty: entry.difficulty,
    vocabulary: entry.vocabulary.map((written) => words.get(written)!) as unknown as readonly [Vocabulary, Vocabulary, Vocabulary],
  }));
}

export async function loadCollection(): Promise<CollectionDocument> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(new URL('collection.json', document.baseURI), { cache: 'no-store', signal: controller.signal });
    if (!response.ok) throw new Error('No se pudo cargar la colección.');
    return parseCollection(await response.text());
  } finally { clearTimeout(timeout); }
}
