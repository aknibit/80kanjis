import type { ContentEntry, ContentExample, ContentKind, NavigationDocument, NavigationSection, StudyDocument } from '../content-types.ts';
import { normalizeSearch } from './search.ts';

type RecordValue = Record<string, unknown>;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const kanaReading = /^[ぁ-ゖー\s／/]+$/u;
// Example sentences are read in kana: hiragana, katakana for loanwords, spaces and punctuation, never kanji.
// The full-width comma, question and exclamation marks are escaped: the font subset reads literal characters,
// so it only includes them once the content uses them.
const sentenceReading = /^[ぁ-ゖァ-ヶー\s\u3001。\uff1f\uff01]+$/u;

function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function record(value: unknown, required: readonly string[], optional: readonly string[] = []): RecordValue {
  check(typeof value === 'object' && value !== null && !Array.isArray(value), 'Se esperaba un objeto de contenido.');
  const item = value as RecordValue;
  check(required.every((key) => Object.hasOwn(item, key)), `Faltan campos obligatorios: ${required.join(', ')}.`);
  check(Object.keys(item).every((key) => required.includes(key) || optional.includes(key)), 'Hay campos de contenido desconocidos.');
  return item;
}

function text(value: unknown): asserts value is string {
  check(typeof value === 'string' && value.trim().length > 0, 'Hay un texto vacío o no válido.');
}

function id(value: unknown): asserts value is string {
  text(value);
  check(slug.test(value), `Identificador no válido: ${value}.`);
}

function array(value: unknown, min = 0): asserts value is unknown[] {
  check(Array.isArray(value) && value.length >= min && value.length <= 5000, 'Lista de contenido vacía o no válida.');
}

function examples(value: unknown): ContentExample[] {
  array(value, 1);
  return value.map((item) => {
    const example = record(item, ['written', 'reading', 'meaning']);
    text(example.written); text(example.reading); text(example.meaning);
    check(sentenceReading.test(example.reading), 'La lectura de un ejemplo debe estar en kana.');
    return { written: example.written, reading: example.reading, meaning: example.meaning };
  });
}

function texts(value: unknown, min = 0): asserts value is string[] {
  array(value, min);
  value.forEach(text);
}

function unique(value: unknown[], field = 'id'): void {
  const values = value.map((item) => (item as RecordValue)[field]);
  check(new Set(values).size === values.length, `Hay valores repetidos de ${field}.`);
}

function parse(text: string): unknown {
  check(text.length <= 2_000_000, 'El archivo de contenido es demasiado grande.');
  try { return JSON.parse(text) as unknown; }
  catch { throw new Error('El archivo no contiene JSON válido.'); }
}

function isKind(value: unknown): value is ContentKind {
  return value === 'counters' || value === 'kana' || value === 'lexicon';
}

function https(value: unknown): void {
  text(value);
  check(new URL(value).protocol === 'https:', 'La referencia debe usar HTTPS.');
}

export function parseNavigation(input: string): NavigationDocument {
  const data = record(parse(input), ['version', 'sections'], ['$schema']);
  if (data.$schema !== undefined) text(data.$schema);
  check(data.version === 1, 'Versión de navegación no compatible.');
  array(data.sections, 1);
  for (const value of data.sections) {
    const section = record(value, ['id', 'label', 'kind', 'file'], ['placement', 'layout']);
    id(section.id); text(section.label); text(section.file);
    check(section.placement === undefined || section.placement === 'primary' || section.placement === 'support', 'Ubicación de menú no válida.');
    check(section.layout === undefined || (section.layout === 'cards' && section.kind === 'lexicon'), 'Solo las secciones léxicas admiten la presentación en fichas.');
    if (section.kind === 'kanji') {
      check(section.id === 'kanji' && section.file === 'collection.json', 'La colección de kanji debe conservar su fuente.');
      check(section.placement !== 'support', 'La página de entrada debe estar en el menú principal.');
    } else {
      check(isKind(section.kind) && section.id !== 'kanji', 'Tipo de sección desconocido.');
      check(/^content\/[a-z0-9-]+\.json$/.test(section.file), 'Ruta de contenido no válida.');
    }
  }
  unique(data.sections);
  check((data.sections[0] as RecordValue).id === 'kanji', '80 kanjis debe ser la primera sección.');
  return data as unknown as NavigationDocument;
}

/** Shared with PR checks: reject malformed content before it reaches the UI. */
export function parseStudyDocument(input: string, expectedKind?: ContentKind): StudyDocument {
  const data = record(parse(input), ['version', 'kind', 'title', 'description', 'sources', 'groups', 'guides', 'entries'], ['$schema', 'editorialNotes']);
  if (data.$schema !== undefined) text(data.$schema);
  check(data.version === 1 && isKind(data.kind), 'Versión o tipo de contenido no compatible.');
  check(!expectedKind || data.kind === expectedKind, 'El archivo no corresponde al tipo de sección.');
  text(data.title); text(data.description);
  array(data.sources, 1); array(data.groups, 1); array(data.guides); array(data.entries, 1);
  for (const value of data.sources) {
    const source = record(value, ['id', 'label', 'type'], ['path', 'sha256', 'url']);
    id(source.id); text(source.label);
    check(['vault', 'attachment', 'reference'].includes(String(source.type)), 'Tipo de fuente desconocido.');
    if (source.type === 'vault' || source.path !== undefined) {
      text(source.path);
      check(!source.path.startsWith('/') && !source.path.split('/').includes('..') && source.path.endsWith('.md'), 'La nota de origen debe tener una ruta relativa.');
    }
    if (source.type === 'vault' || source.sha256 !== undefined) {
      text(source.sha256);
      check(/^[a-f0-9]{64}$/.test(source.sha256), 'Huella de la nota de origen no válida.');
    }
    if (source.type === 'reference' || source.url !== undefined) https(source.url);
  }
  for (const value of data.groups) {
    const group = record(value, ['id', 'label']);
    id(group.id); text(group.label);
  }
  unique(data.sources); unique(data.groups); unique(data.guides); unique(data.entries);
  const sources = new Set(data.sources.map((source) => (source as RecordValue).id));
  const groups = new Set(data.groups.map((group) => (group as RecordValue).id));
  for (const value of data.guides) {
    const guide = record(value, ['id', 'title', 'sourceId', 'paragraphs'], ['examples']);
    id(guide.id); text(guide.title); texts(guide.paragraphs, 1);
    check(sources.has(guide.sourceId), 'La guía referencia una fuente desconocida.');
    if (guide.examples !== undefined) examples(guide.examples);
  }
  const kanaPositions = new Set<string>();
  for (const value of data.entries) {
    const common = ['id', 'group', 'sourceId'];
    const entry = data.kind === 'counters'
      ? record(value, [...common, 'written', 'endings', 'title', 'description', 'type', 'forms', 'question', 'notes'])
      : data.kind === 'kana'
        ? record(value, [...common, 'hiragana', 'katakana', 'romaji', 'position'])
        : record(value, [...common, 'written', 'reading', 'romaji', 'meaning'], ['note', 'examples']);
    id(entry.id);
    check(groups.has(entry.group), `Grupo desconocido en ${entry.id}.`);
    check(sources.has(entry.sourceId), `Fuente desconocida en ${entry.id}.`);
    if (data.kind === 'counters') {
      text(entry.written); text(entry.title); text(entry.description); texts(entry.notes);
      check(entry.type === 'counter' || entry.type === 'number', 'Tipo de contador desconocido.');
      array(entry.forms, 1);
      let previous = 0;
      const readingGroups: string[][] = [];
      for (const value of entry.forms) {
        const form = record(value, ['value', 'meaning', 'written', 'readings', 'special']);
        check(typeof form.value === 'number' && Number.isSafeInteger(form.value) && form.value > previous, 'Las cantidades deben ser positivas, únicas y estar ordenadas.');
        previous = form.value;
        text(form.meaning); text(form.written); texts(form.readings, 1);
        check(form.readings.every((reading) => kanaReading.test(reading)), 'Lectura de contador no válida.');
        check(new Set(form.readings).size === form.readings.length, 'Lectura de contador repetida.');
        check(typeof form.special === 'boolean', 'Falta la marca de lectura especial.');
        readingGroups.push(form.readings);
      }
      const question = record(entry.question, ['meaning', 'written', 'readings']);
      text(question.meaning); text(question.written); texts(question.readings, 1);
      check(question.readings.every((reading) => kanaReading.test(reading)), 'Lectura de pregunta no válida.');
      // Endings go from most to least common; a form or the question counts once if any reading ends with it.
      texts(entry.endings, 1);
      check(entry.endings.every((ending) => kanaReading.test(ending)), 'Terminación de contador no válida.');
      check(new Set(entry.endings).size === entry.endings.length, 'Terminación de contador repetida.');
      readingGroups.push(question.readings);
      const uses = entry.endings.map((ending) => readingGroups.filter((group) => group.some((reading) => reading.endsWith(ending))).length);
      check(uses.every((count) => count > 0), `Ninguna lectura de ${entry.id} usa una de sus terminaciones.`);
      check(uses.every((count, index) => index === 0 || count <= uses[index - 1]), `Las terminaciones de ${entry.id} deben ir de más a menos frecuentes.`);
    } else if (data.kind === 'kana') {
      text(entry.hiragana); text(entry.katakana); text(entry.romaji);
      check(/^[ぁ-ゖ]+$/u.test(entry.hiragana) && /^[ァ-ヶ]+$/u.test(entry.katakana), 'Los kana deben usar su escritura correspondiente.');
      check(normalizeSearch(entry.katakana) === entry.hiragana, 'Hiragana y katakana no representan el mismo sonido.');
      const position = record(entry.position, ['column', 'row']);
      check(typeof position.column === 'number' && Number.isInteger(position.column) && position.column >= 1 && position.column <= 32,
        'Columna de kana no válida.');
      check(typeof position.row === 'number' && Number.isInteger(position.row) && position.row >= 1 && position.row <= 15,
        'Fila de kana no válida.');
      const cell = `${entry.group}:${position.column}:${position.row}`;
      check(!kanaPositions.has(cell), 'Dos kana ocupan la misma posición de la tabla.');
      kanaPositions.add(cell);
    } else {
      text(entry.written); text(entry.reading); text(entry.romaji); text(entry.meaning);
      check(kanaReading.test(entry.reading), 'La lectura debe estar en hiragana.');
      if (entry.note !== undefined) text(entry.note);
      if (entry.examples !== undefined) {
        // Each example shows the entry itself, conjugated or not: 起きます → 起きました, 写真を撮ります → 写真を 撮りました.
        const stems = entry.written.split('／').map((form) => form.replace(/\s/gu, '').replace(/ます$/u, ''));
        for (const example of examples(entry.examples)) {
          check(stems.some((stem) => example.written.replace(/\s/gu, '').includes(stem)), `Un ejemplo de ${entry.id} no usa la entrada.`);
        }
      }
    }
  }
  if (data.editorialNotes !== undefined) {
    check(data.kind === 'counters', 'Las notas de transcripción corresponden a contadores.');
    texts(data.editorialNotes);
  }
  return data as unknown as StudyDocument;
}

async function fetchFile(file: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(new URL(file, document.baseURI), { signal: controller.signal });
    if (!response.ok) throw new Error('No se pudo cargar el contenido.');
    return await response.text();
  } finally { clearTimeout(timeout); }
}

export async function loadNavigation(): Promise<NavigationDocument> {
  return parseNavigation(await fetchFile('content/navigation.json'));
}

export async function loadStudyDocument(section: NavigationSection): Promise<StudyDocument> {
  check(isKind(section.kind) && /^content\/[a-z0-9-]+\.json$/.test(section.file), 'Sección de contenido no válida.');
  return parseStudyDocument(await fetchFile(section.file), section.kind);
}

export function resolveSection(navigation: NavigationDocument, url: string): NavigationSection {
  const id = new URL(url).searchParams.get('section') || 'kanji';
  const section = navigation.sections.find((item) => item.id === id);
  check(section, 'Esta sección no existe.');
  return section;
}

/** Query-based pages work on a CDN subdirectory without server rewrite rules. */
export function sectionHref(section: NavigationSection, base: string): string {
  const url = new URL(base);
  url.search = ''; url.hash = '';
  if (section.id !== 'kanji') url.searchParams.set('section', section.id);
  return url.href;
}

export function searchContent<T extends ContentEntry>(entries: readonly T[], query: string, group = 'all'): readonly T[] {
  const terms = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    if (group !== 'all' && entry.group !== group) return false;
    const searchable = 'forms' in entry
      ? [entry.written, entry.title, entry.description, ...entry.notes, entry.question.meaning, entry.question.written,
        ...entry.question.readings, ...entry.forms.flatMap((form) => [String(form.value), form.meaning, form.written, ...form.readings])]
      : 'hiragana' in entry ? [entry.hiragana, entry.katakana, entry.romaji]
        : [entry.written, entry.reading, entry.romaji, entry.meaning, entry.note ?? ''];
    const text = normalizeSearch(searchable.join(' '));
    return terms.every((term) => text.includes(term));
  });
}

/** A shuffled copy (Fisher-Yates); the original order stays untouched. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}
