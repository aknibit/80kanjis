import type { KanjiSentencesDocument } from '../content-types.ts';

export type SentenceGroup = 'simple' | 'advanced';

/** Where the sentence audio lives, inside public/audio/. */
export const sentenceAudioDirectory = 'sentences';

/**
 * Named after the kanji and the sentence's place: 4e00-s1.mp3 is the first simple sentence of 一 and 4e00-a4.mp3
 * the last one with adjectives, adverbs and counters. scripts/generate-sentence-audio.py uses the same rule.
 */
export function sentenceAudioFile(kanji: string, group: SentenceGroup, index: number): string {
  return `${kanji.codePointAt(0)!.toString(16)}-${group === 'simple' ? 's' : 'a'}${index + 1}.mp3`;
}

/** One line of public/audio/sentences/generation.json. */
export interface SentenceAudioEntry {
  readonly file: string;
  readonly written: string;
  readonly reading: string;
  readonly sha256: string;
}

/**
 * Every sentence needs an audio generated from its current text and reading, and no audio may be left over.
 * `hashes` maps each MP3 of the directory to its SHA-256.
 */
export function sentenceAudioProblems(document: KanjiSentencesDocument, entries: readonly SentenceAudioEntry[],
  hashes: ReadonlyMap<string, string>): string[] {
  const problems: string[] = [];
  const byFile = new Map(entries.map((entry) => [entry.file, entry]));
  if (byFile.size !== entries.length) problems.push('generation.json repite algún archivo.');
  const expected = new Set<string>();
  for (const sentences of document.entries) {
    for (const group of ['simple', 'advanced'] as const) {
      sentences[group].forEach((sentence, index) => {
        const file = sentenceAudioFile(sentences.kanji, group, index);
        expected.add(file);
        const entry = byFile.get(file);
        if (!entry) problems.push(`Falta el audio de «${sentence.written}» (${file}).`);
        else if (entry.written !== sentence.written || entry.reading !== sentence.reading) {
          problems.push(`${file} dice «${entry.written}» (${entry.reading}), no «${sentence.written}» (${sentence.reading}).`);
        } else if (!hashes.has(file)) problems.push(`Falta el archivo ${file}.`);
        else if (hashes.get(file) !== entry.sha256) problems.push(`${file} no coincide con el SHA-256 de generation.json.`);
      });
    }
  }
  for (const file of new Set([...byFile.keys(), ...hashes.keys()])) {
    if (!expected.has(file)) problems.push(`Sobra el audio ${file}: no es de ninguna frase.`);
  }
  return problems;
}
