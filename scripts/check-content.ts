import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { kanjiSentencesFile, parseKanjiSentences, parseNavigation, parseStudyDocument } from '../src/lib/content.ts';
import { parseCollection } from '../src/lib/collection.ts';
import {
  audioProblems, counterAudioDirectory, counterSentenceAudio, exampleAudio, sentenceAudio, sentenceAudioDirectory,
  verbAudioDirectory, wordAudio, wordAudioDirectory, type AudioEntry, type SpokenText,
} from '../src/lib/audio.ts';
import { createSiteVocabulary, exampleProblems, kanjiSentenceProblems, levelProblems } from '../src/lib/site-vocabulary.ts';
import type { CounterDocument, LexiconDocument, StudyDocument } from '../src/content-types.ts';
import type { CollectionDocument } from '../src/types.ts';

const root = new URL('../public/', import.meta.url);
const navigation = parseNavigation(await readFile(new URL('content/navigation.json', root), 'utf8'));
const referenced = new Set(['navigation.json', 'study.schema.json']);
let collection: CollectionDocument | undefined;
const documents: StudyDocument[] = [];
const sectionDocuments = new Map<string, StudyDocument>();
for (const section of navigation.sections) {
  const input = await readFile(new URL(section.file, root), 'utf8');
  if (section.kind === 'kanji') {
    const data = parseCollection(input);
    collection = data;
    console.log(`${section.label}: ${data.kanji.length} kanji, ${data.vocabulary.length} palabras.`);
  } else {
    const data = parseStudyDocument(input, section.kind);
    documents.push(data);
    sectionDocuments.set(section.id, data);
    referenced.add(section.file.slice('content/'.length));
    console.log(`${section.label}: ${data.entries.length} entradas, ${data.sources.length} fuentes.`);
  }
}

// Every context of the site, the kanji sentences and the examples of the sections, only uses words of the site,
// with their readings.
if (!collection) throw new Error('Falta la colección de kanji.');
const counters = documents.find((data): data is CounterDocument => data.kind === 'counters');
if (!counters) throw new Error('Faltan los contadores, que también cuentan como vocabulario de las frases.');
const lexicons = documents.filter((data): data is LexiconDocument => data.kind === 'lexicon');
const vocabulary = createSiteVocabulary(collection, lexicons, counters);
const sentences = parseKanjiSentences(await readFile(new URL(kanjiSentencesFile, root), 'utf8'), collection.kanji.map((entry) => entry.character));
referenced.add(kanjiSentencesFile.slice('content/'.length));
const problems = kanjiSentenceProblems(sentences, collection, vocabulary);
if (problems.length > 0) throw new Error(`Frases de los kanji:\n${problems.join('\n')}`);
console.log(`Frases de los kanji: ${sentences.entries.length} kanji, ${sentences.entries.length * 6} frases.`);
// Each word, each kanji sentence and each sentence of the counters and the verbs has an audio generated from its
// current text and reading: the page shows the button without asking first.
async function checkAudio(label: string, directory: string, expected: readonly SpokenText[]) {
  const audioRoot = new URL(`audio/${directory}/`, root);
  const generation = JSON.parse(await readFile(new URL('generation.json', audioRoot), 'utf8')) as { entries: AudioEntry[] };
  const hashes = new Map(await Promise.all((await readdir(audioRoot)).filter((file) => file !== 'generation.json')
    .map(async (file) => [file, createHash('sha256').update(await readFile(new URL(file, audioRoot))).digest('hex')] as const)));
  const issues = audioProblems(expected, generation.entries, hashes);
  if (issues.length > 0) throw new Error(`Audio de ${label} (${issues.length}). Ejecuta npm run audio:\n${issues.join('\n')}`);
  console.log(`Audio de ${label}: ${hashes.size} archivos, uno por cada una.`);
}
await checkAudio('las palabras', wordAudioDirectory, wordAudio(collection.vocabulary));
await checkAudio('las frases', sentenceAudioDirectory, sentenceAudio(sentences));
await checkAudio('las frases de los contadores', counterAudioDirectory, counterSentenceAudio(counters));
const verbs = sectionDocuments.get('verbs');
if (verbs?.kind !== 'lexicon') throw new Error('Faltan los verbos, cuyas frases tienen audio.');
await checkAudio('las frases de los verbos', verbAudioDirectory, exampleAudio(verbs));
const exampleIssues = exampleProblems(lexicons, counters, vocabulary);
if (exampleIssues.length > 0) throw new Error(`Ejemplos de las secciones (${exampleIssues.length}):\n${exampleIssues.join('\n')}`);
console.log('Ejemplos de las secciones: solo usan palabras de la web.');
// Each context only uses words as easy as what it illustrates, or easier.
const levelIssues = levelProblems(collection, lexicons, counters, sentences, vocabulary);
if (levelIssues.length > 0) throw new Error(`Frases con palabras más difíciles que lo que muestran (${levelIssues.length}):\n${levelIssues.join('\n')}`);
console.log('Niveles: cada frase usa palabras de su dificultad o más fáciles.');

const contentFiles = (await readdir(new URL('content/', root))).filter((file) => file.endsWith('.json'));
for (const file of contentFiles) {
  if (!referenced.has(file)) throw new Error(`Archivo de contenido sin sección: ${file}.`);
}

// The self-hosted fonts only carry these characters. Reads the same files as scripts/subset-fonts.py.
const subset = new Set(await readFile(new URL('../src/fonts/characters.txt', import.meta.url), 'utf8'));
const missing = new Set<string>();
const cover = (text: string) => { for (const char of text) if (!/\p{C}/u.test(char) && !subset.has(char)) missing.add(char); };
const strings = (value: unknown): string[] => typeof value === 'string' ? [value]
  : Array.isArray(value) ? value.flatMap(strings)
  : value !== null && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
for (const file of ['collection.json', ...contentFiles.filter((file) => file !== 'study.schema.json').map((file) => `content/${file}`)]) {
  strings(JSON.parse(await readFile(new URL(file, root), 'utf8'))).forEach(cover);
}
const sourceFiles = (await readdir(new URL('../src/', import.meta.url), { recursive: true }))
  .filter((file) => file === 'style.css' || (file.endsWith('.ts') && !file.endsWith('.test.ts')));
for (const file of ['../index.html', ...sourceFiles]) cover(await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8'));
if (missing.size > 0) throw new Error(`Las fuentes no incluyen: ${[...missing].join(' ')}. Ejecuta npm run fonts.`);
console.log('Contenido válido: versiones, campos, IDs, fuentes, grupos, lecturas, referencias, frases de los kanji, su audio y cobertura tipográfica.');
