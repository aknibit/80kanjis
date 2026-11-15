import type { VocabularyItemId, VocabularyStudyItem } from '../types.ts';

export interface Pronunciation {
  readonly itemId: VocabularyItemId;
  readonly reading: string;
  readonly file: string;
  readonly sourceUrl: string;
  readonly gitBlobSha: string;
}

/** Original, unmodified recordings. Attribution and license also ship in public/audio/. */
export const pronunciationSource = {
  name: 'Tofugu y WaniKani',
  url: 'https://github.com/tofugu/japanese-vocabulary-pronunciation-audio',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const;

/** A limited audition sample, not a claim of linguistic review or full coverage. */
export const pronunciations = [
  {
    "itemId": "word:一つ",
    "reading": "ひとつ",
    "file": "hitotsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E3%81%A4%E3%80%90%E3%81%B2%E3%81%A8%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "c06b52852c3fefbb56c34e0dea40cc04fa4a6a64"
  },
  {
    "itemId": "word:一年生",
    "reading": "いちねんせい",
    "file": "ichinensei.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E5%B9%B4%E7%94%9F%E3%80%90%E3%81%84%E3%81%A1%E3%81%AD%E3%82%93%E3%81%9B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "b0a7894804705cfd1cf81af5bec5628fbd75f3da"
  },
  {
    "itemId": "word:二つ",
    "reading": "ふたつ",
    "file": "futatsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%8C%E3%81%A4%E3%80%90%E3%81%B5%E3%81%9F%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "e4b09016111c12377904c1bc4a87edc5bb1f99d1"
  },
  {
    "itemId": "word:二日",
    "reading": "ふつか",
    "file": "futsuka.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%8C%E6%97%A5%E3%80%90%E3%81%B5%E3%81%A4%E3%81%8B%E3%80%91.mp3",
    "gitBlobSha": "4f822c58e5b08e04960c0dfdb9ffe372ffbdfb94"
  },
  {
    "itemId": "word:三つ",
    "reading": "みっつ",
    "file": "mittsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%89%E3%81%A4%E3%80%90%E3%81%BF%E3%81%A3%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "ea28c5891c9606b07d568d5857cdadfafee54fb0"
  },
  {
    "itemId": "word:一日",
    "reading": "いちにち",
    "file": "ichinichi.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E6%97%A5%E3%80%90%E3%81%84%E3%81%A1%E3%81%AB%E3%81%A1%E3%80%91.mp3",
    "gitBlobSha": "f0448fb192f650e459d854c8ed3f1193fa67a86e"
  },
  {
    "itemId": "word:お金",
    "reading": "おかね",
    "file": "okane.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E3%81%8A%E9%87%91%E3%80%90%E3%81%8A%E3%81%8B%E3%81%AD%E3%80%91.mp3",
    "gitBlobSha": "ac31bace9dbe6a87248a2c260ec159fe7d0e2686"
  },
  {
    "itemId": "word:ふじ山",
    "reading": "ふじさん",
    "file": "fujisan.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E3%81%B5%E3%81%98%E5%B1%B1%E3%80%90%E3%81%B5%E3%81%98%E3%81%95%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "b2d82d792979199c987b70d26ebdca6689e0da31"
  },
  {
    "itemId": "word:中学校",
    "reading": "ちゅうがっこう",
    "file": "chuugakkou.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%AD%E5%AD%A6%E6%A0%A1%E3%80%90%E3%81%A1%E3%82%85%E3%81%86%E3%81%8C%E3%81%A3%E3%81%93%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "64ff802d2008a6c50761f89a192a77386a417da4"
  },
  {
    "itemId": "word:上げる",
    "reading": "あげる",
    "file": "ageru.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%8A%E3%81%92%E3%82%8B%E3%80%90%E3%81%82%E3%81%92%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "02c2e86d397f165f9267ebad6c3f4fd9b84c8382"
  },
  {
    "itemId": "word:休む",
    "reading": "やすむ",
    "file": "yasumu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BC%91%E3%82%80%E3%80%90%E3%82%84%E3%81%99%E3%82%80%E3%80%91.mp3",
    "gitBlobSha": "fbc3dcef76908685bd6dbcc3e9c60a0c07605c1e"
  },
  {
    "itemId": "word:先生",
    "reading": "せんせい",
    "file": "sensei.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%88%E7%94%9F%E3%80%90%E3%81%9B%E3%82%93%E3%81%9B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "817a05ec9d7f246a9f58947aac0c4d92e80525d4"
  }
] as const satisfies readonly Pronunciation[];

const byItemId = new Map<string, Pronunciation>(pronunciations.map((clip) => [clip.itemId, clip]));

/** Keep the written form AND reading aligned, including words with multiple readings. */
export function getPronunciation(item: VocabularyStudyItem): Pronunciation | undefined {
  const clip = byItemId.get(item.id);
  return clip?.reading === item.reading ? clip : undefined;
}

