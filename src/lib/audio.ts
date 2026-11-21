import type { CounterDocument, KanjiSentencesDocument } from '../content-types.ts';

/**
 * Every word of the vocabulary, every kanji sentence and every counter sentence has an MP3 generated with AivisSpeech by
 * scripts/generate-audio.py, which uses the same file names. npm run check:content makes sure each one matches the
 * current text and reading, so the page shows the button without asking first.
 */
export const audioSource = {
  name: 'AivisSpeech',
  url: 'https://aivis-project.com/',
  voice: 'morioki',
  voiceUrl: 'https://hub.aivis-project.com/aivm-models/baaae3c0-7b22-4605-8ba5-80c959b41a48',
  license: 'ACML 1.0',
  licenseUrl: 'https://github.com/Aivis-Project/ACML/blob/master/ACML-1.0.md',
} as const;

/** Where the audio lives, inside public/audio/. */
export const wordAudioDirectory = 'words';
export const sentenceAudioDirectory = 'sentences';
export const counterAudioDirectory = 'counters';

export type SentenceGroup = 'simple' | 'advanced';

/** Named after the code points of the word: 4e00-3064.mp3 is 一つ. */
export function wordAudioFile(written: string): string {
  return [...written].map((character) => character.codePointAt(0)!.toString(16)).join('-') + '.mp3';
}

/**
 * Named after the kanji and the sentence's place: 4e00-s1.mp3 is the first simple sentence of 一 and 4e00-a4.mp3
 * the last one with adjectives, adverbs and counters.
 */
export function sentenceAudioFile(kanji: string, group: SentenceGroup, index: number): string {
  return `${kanji.codePointAt(0)!.toString(16)}-${group === 'simple' ? 's' : 'a'}${index + 1}.mp3`;
}

/**
 * The sentence of a counter's form, named after the counter and the number: hon-3.mp3 is the sentence of 三本, and
 * hon-q.mp3 the question of the counter (何本).
 */
export function counterSentenceAudioFile(counter: string, value: number | 'question'): string {
  return `${counter}-${value === 'question' ? 'q' : value}.mp3`;
}

/** What an audio says: its file, and the text and reading it was generated from. */
export interface SpokenText {
  readonly file: string;
  readonly written: string;
  readonly reading: string;
}

/** One line of the generation.json of public/audio/words/ or public/audio/sentences/. */
export interface AudioEntry extends SpokenText {
  readonly sha256: string;
}

export function wordAudio(words: readonly { readonly written: string; readonly reading: string }[]): SpokenText[] {
  return words.map(({ written, reading }) => ({ file: wordAudioFile(written), written, reading }));
}

export function sentenceAudio(document: KanjiSentencesDocument): SpokenText[] {
  return document.entries.flatMap((sentences) => (['simple', 'advanced'] as const).flatMap((group) =>
    sentences[group].map(({ written, reading }, index) => ({ file: sentenceAudioFile(sentences.kanji, group, index), written, reading }))));
}

/** Only the sentences of the counters have audio, not their examples. */
export function counterSentenceAudio(document: CounterDocument): SpokenText[] {
  return document.entries.flatMap((counter) => [
    ...counter.forms.map((form) => ({ value: form.value as number | 'question', sentence: form.sentence })),
    { value: 'question' as const, sentence: counter.question.sentence },
  ].map(({ value, sentence: { written, reading } }) => ({ file: counterSentenceAudioFile(counter.id, value), written, reading })));
}

/**
 * Every word or sentence needs an audio generated from its current text and reading, and no audio may be left over.
 * `hashes` maps each MP3 of the directory to its SHA-256.
 */
export function audioProblems(expected: readonly SpokenText[], entries: readonly AudioEntry[],
  hashes: ReadonlyMap<string, string>): string[] {
  const problems: string[] = [];
  const byFile = new Map(entries.map((entry) => [entry.file, entry]));
  if (byFile.size !== entries.length) problems.push('generation.json repite algún archivo.');
  const files = new Set<string>();
  for (const { file, written, reading } of expected) {
    files.add(file);
    const entry = byFile.get(file);
    if (!entry) problems.push(`Falta el audio de «${written}» (${file}).`);
    else if (entry.written !== written || entry.reading !== reading) {
      problems.push(`${file} dice «${entry.written}» (${entry.reading}), no «${written}» (${reading}).`);
    } else if (!hashes.has(file)) problems.push(`Falta el archivo ${file}.`);
    else if (hashes.get(file) !== entry.sha256) problems.push(`${file} no coincide con el SHA-256 de generation.json.`);
  }
  for (const file of new Set([...byFile.keys(), ...hashes.keys()])) {
    if (!files.has(file)) problems.push(`Sobra el audio ${file}: no es de ninguna palabra ni frase.`);
  }
  return problems;
}
