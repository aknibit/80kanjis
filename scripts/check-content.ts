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
for (const file of await readdir(new URL('content/', root))) {
  if (file.endsWith('.json') && !referenced.has(file)) throw new Error(`Archivo de contenido sin sección: ${file}.`);
}
console.log('Contenido válido: versiones, campos, IDs, fuentes, grupos, lecturas y referencias.');
