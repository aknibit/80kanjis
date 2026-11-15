import type { Difficulty, Kanji, StudyItem, Vocabulary } from '../types.ts';
import { kanjiItemId, vocabularyItemId } from './study-catalog.ts';

export type Ratings = Record<string, Difficulty | null>;
export const DIFFICULTY_STORAGE_KEY = '80kanjis:difficulties:v2';
export const LEGACY_DIFFICULTY_STORAGE_KEY = '80kanjis:difficulties:v1';

export interface DifficultyTarget {
  key: string;
  label: string;
}

export function kanjiTarget(entry: Kanji): DifficultyTarget {
  return { key: kanjiItemId(entry.character), label: `kanji ${entry.character}` };
}

export function wordTarget(word: Vocabulary): DifficultyTarget {
  return { key: vocabularyItemId(word.written), label: `palabra ${word.written}` };
}

export function studyItemTarget(item: StudyItem): DifficultyTarget {
  return { key: item.id, label: item.type === 'kanji' ? `kanji ${item.character}` : `palabra ${item.written}` };
}

export function ratingDefaults(collection: readonly Kanji[]): Ratings {
  return Object.fromEntries(collection.flatMap((entry) => [
    [kanjiTarget(entry).key, entry.difficulty],
    ...entry.vocabulary.map((word) => [wordTarget(word).key, null]),
  ]));
}
export const difficultyLabels: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

export function isDifficulty(value: unknown): value is Difficulty | null {
  return value === null || value === 'easy' || value === 'medium' || value === 'hard';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseRatings(text: string, collection: readonly Kanji[]): Ratings {
  if (text.length > 100_000) throw new Error('El archivo de dificultades es demasiado grande.');
  let document: unknown;
  try { document = JSON.parse(text); }
  catch { throw new Error('El archivo no contiene JSON válido.'); }
  if (!isObject(document)) throw new Error('El formato de dificultades no es válido.');
  const known = new Set(Object.keys(ratingDefaults(collection)));
  const ratings: Ratings = {};
  function readGroup(group: unknown, kind: 'kanji' | 'word') {
    if (!isObject(group)) throw new Error('El formato de dificultades no es válido.');
    for (const [name, value] of Object.entries(group)) {
      const key = `${kind}:${name}`;
      if (!known.has(key)) throw new Error(`El archivo incluye un elemento desconocido: ${name}.`);
      if (!isDifficulty(value)) throw new Error(`La dificultad de ${name} no es válida.`);
      ratings[key] = value;
    }
  }
  if (document.version === 1) {
    // Original files only classified kanji. Never infer word ratings from them.
    readGroup(document.ratings, 'kanji');
  } else if (document.version === 2) {
    readGroup(document.kanji, 'kanji');
    readGroup(document.words, 'word');
  } else {
    throw new Error('La versión del archivo de dificultades no es compatible.');
  }
  return ratings;
}

export function serializeRatings(ratings: Ratings, collection: readonly Kanji[]): string {
  const known = ratingDefaults(collection);
  for (const [key, value] of Object.entries(ratings)) {
    if (!Object.hasOwn(known, key) || !isDifficulty(value)) throw new Error('Clasificación no válida.');
  }
  const kanji: Ratings = {};
  const words: Ratings = {};
  for (const key of Object.keys(known)) {
    if (!Object.hasOwn(ratings, key)) continue;
    if (key.startsWith('kanji:')) kanji[key.slice(6)] = ratings[key];
    else words[key.slice(5)] = ratings[key];
  }
  return `${JSON.stringify({ version: 2, kanji, words }, null, 2)}\n`;
}

/** Read-only state never reads browser drafts or requests file permissions. */
export function createDifficultyView(collection: readonly Kanji[]) {
  let defaults = ratingDefaults(collection);
  return {
    get(key: string) { return defaults[key] ?? null; },
    snapshot(): Ratings { return { ...defaults }; },
    loadDefaults(text: string) {
      defaults = { ...ratingDefaults(collection), ...parseRatings(text, collection) };
    },
  };
}

type RatingStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** Defaults come from the fetched file; browser edits are stored separately. */
export function createDifficultyStore(collection: readonly Kanji[], getStorage: () => RatingStorage) {
  const view = createDifficultyView(collection);
  const known = new Set(Object.keys(view.snapshot()));
  let edits: Ratings = {};
  let storageAvailable = true;
  try {
    const storage = getStorage();
    const saved = storage.getItem(DIFFICULTY_STORAGE_KEY) ?? storage.getItem(LEGACY_DIFFICULTY_STORAGE_KEY);
    if (saved !== null) edits = parseRatings(saved, collection);
  } catch { storageAvailable = false; }

  function persist() {
    try {
      getStorage().setItem(DIFFICULTY_STORAGE_KEY, serializeRatings(edits, collection));
      storageAvailable = true;
    } catch { storageAvailable = false; }
  }

  return {
    get storageAvailable() { return storageAvailable; },
    get(key: string) { return Object.hasOwn(edits, key) ? edits[key] : view.get(key); },
    snapshot(): Ratings { return { ...view.snapshot(), ...edits }; },
    loadDefaults: view.loadDefaults,
    set(key: string, difficulty: Difficulty | null) {
      if (!known.has(key) || !isDifficulty(difficulty)) throw new Error('Clasificación no válida.');
      edits[key] = difficulty;
      persist();
    },
    import(text: string): Ratings {
      // Validate the complete document before changing any existing rating.
      const imported = parseRatings(text, collection);
      edits = { ...edits, ...imported };
      persist();
      return imported;
    },
    export() { return serializeRatings({ ...view.snapshot(), ...edits }, collection); },
  };
}

export interface LocalDifficultyFile {
  readonly name: string;
  getFile(): Promise<{ text(): Promise<string> }>;
  requestPermission(options: { mode: 'readwrite' }): Promise<PermissionState>;
  createWritable(): Promise<{
    write(data: string): Promise<void>;
    close(): Promise<void>;
    abort(): Promise<void>;
  }>;
}

/** Serialize writes and re-read the file so unrelated external edits survive. */
export function createDifficultyFileWriter(file: LocalDifficultyFile, collection: readonly Kanji[]) {
  let queue: Promise<unknown> = Promise.resolve();
  return {
    name: file.name,
    write(patch: Ratings): Promise<string> {
      const changes = parseRatings(serializeRatings(patch, collection), collection);
      const operation = queue.then(async () => {
        const current = parseRatings(await (await file.getFile()).text(), collection);
        const text = serializeRatings({ ...current, ...changes }, collection);
        const writable = await file.createWritable();
        try {
          await writable.write(text);
          await writable.close();
        } catch (error) {
          await writable.abort().catch(() => undefined);
          throw error;
        }
        return text;
      });
      queue = operation.catch(() => undefined);
      return operation;
    },
  };
}
