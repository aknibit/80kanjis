import { readFile, readdir } from 'node:fs/promises';
import { parseNavigation, parseStudyDocument } from '../src/lib/content.ts';
import { parseCollection } from '../src/lib/collection.ts';

const root = new URL('../public/', import.meta.url);
const navigation = parseNavigation(await readFile(new URL('content/navigation.json', root), 'utf8'));
const referenced = new Set(['navigation.json', 'study.schema.json']);
for (const section of navigation.sections) {
  const input = await readFile(new URL(section.file, root), 'utf8');
  if (section.kind === 'kanji') {
    const data = parseCollection(input);
    console.log(`${section.label}: ${data.kanji.length} kanji, ${data.vocabulary.length} palabras.`);
  } else {
    const data = parseStudyDocument(input, section.kind);
    referenced.add(section.file.slice('content/'.length));
    console.log(`${section.label}: ${data.entries.length} entradas, ${data.sources.length} fuentes.`);
  }
}
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
console.log('Contenido válido: versiones, campos, IDs, fuentes, grupos, lecturas, referencias y cobertura tipográfica.');
