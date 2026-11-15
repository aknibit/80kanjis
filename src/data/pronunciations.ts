import type { VocabularyItemId, VocabularyStudyItem } from '../types.ts';

interface PronunciationBase {
  readonly itemId: VocabularyItemId;
  readonly reading: string;
  readonly file: string;
  readonly sourceUrl: string;
}
export interface RecordedPronunciation extends PronunciationBase {
  readonly kind: 'recorded';
  readonly gitBlobSha: string;
}
export interface SynthesizedPronunciation extends PronunciationBase {
  readonly kind: 'synthesized';
  readonly sha256: string;
}
export type Pronunciation = RecordedPronunciation | SynthesizedPronunciation;

/** Original recordings; attribution and license also ship in public/audio/. */
export const pronunciationSource = {
  name: 'Tofugu y WaniKani',
  url: 'https://github.com/tofugu/japanese-vocabulary-pronunciation-audio',
  license: 'CC BY-SA 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
} as const;
export const synthesizedSource = {
  name: 'VOICEVOX Nemo',
  url: 'https://voicevox.hiroshiba.jp/nemo/',
  termsUrl: 'https://voicevox.hiroshiba.jp/nemo/term/',
  voice: '女声1',
} as const;

/** File/reading alignment is checked; native-speaker listening review is still pending. */
export const pronunciations = [
  {
    "kind": "recorded",
    "itemId": "word:一つ",
    "reading": "ひとつ",
    "file": "hitotsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E3%81%A4%E3%80%90%E3%81%B2%E3%81%A8%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "c06b52852c3fefbb56c34e0dea40cc04fa4a6a64"
  },
  {
    "kind": "recorded",
    "itemId": "word:一年生",
    "reading": "いちねんせい",
    "file": "ichinensei.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E5%B9%B4%E7%94%9F%E3%80%90%E3%81%84%E3%81%A1%E3%81%AD%E3%82%93%E3%81%9B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "b0a7894804705cfd1cf81af5bec5628fbd75f3da"
  },
  {
    "kind": "recorded",
    "itemId": "word:二つ",
    "reading": "ふたつ",
    "file": "futatsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%8C%E3%81%A4%E3%80%90%E3%81%B5%E3%81%9F%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "e4b09016111c12377904c1bc4a87edc5bb1f99d1"
  },
  {
    "kind": "recorded",
    "itemId": "word:二日",
    "reading": "ふつか",
    "file": "futsuka.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%8C%E6%97%A5%E3%80%90%E3%81%B5%E3%81%A4%E3%81%8B%E3%80%91.mp3",
    "gitBlobSha": "4f822c58e5b08e04960c0dfdb9ffe372ffbdfb94"
  },
  {
    "kind": "recorded",
    "itemId": "word:三つ",
    "reading": "みっつ",
    "file": "mittsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%89%E3%81%A4%E3%80%90%E3%81%BF%E3%81%A3%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "ea28c5891c9606b07d568d5857cdadfafee54fb0"
  },
  {
    "kind": "recorded",
    "itemId": "word:一日",
    "reading": "いちにち",
    "file": "ichinichi.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E6%97%A5%E3%80%90%E3%81%84%E3%81%A1%E3%81%AB%E3%81%A1%E3%80%91.mp3",
    "gitBlobSha": "f0448fb192f650e459d854c8ed3f1193fa67a86e"
  },
  {
    "kind": "recorded",
    "itemId": "word:お金",
    "reading": "おかね",
    "file": "okane.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E3%81%8A%E9%87%91%E3%80%90%E3%81%8A%E3%81%8B%E3%81%AD%E3%80%91.mp3",
    "gitBlobSha": "ac31bace9dbe6a87248a2c260ec159fe7d0e2686"
  },
  {
    "kind": "recorded",
    "itemId": "word:ふじ山",
    "reading": "ふじさん",
    "file": "fujisan.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E3%81%B5%E3%81%98%E5%B1%B1%E3%80%90%E3%81%B5%E3%81%98%E3%81%95%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "b2d82d792979199c987b70d26ebdca6689e0da31"
  },
  {
    "kind": "recorded",
    "itemId": "word:中学校",
    "reading": "ちゅうがっこう",
    "file": "chuugakkou.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%AD%E5%AD%A6%E6%A0%A1%E3%80%90%E3%81%A1%E3%82%85%E3%81%86%E3%81%8C%E3%81%A3%E3%81%93%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "64ff802d2008a6c50761f89a192a77386a417da4"
  },
  {
    "kind": "recorded",
    "itemId": "word:上げる",
    "reading": "あげる",
    "file": "ageru.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%8A%E3%81%92%E3%82%8B%E3%80%90%E3%81%82%E3%81%92%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "02c2e86d397f165f9267ebad6c3f4fd9b84c8382"
  },
  {
    "kind": "recorded",
    "itemId": "word:休む",
    "reading": "やすむ",
    "file": "yasumu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BC%91%E3%82%80%E3%80%90%E3%82%84%E3%81%99%E3%82%80%E3%80%91.mp3",
    "gitBlobSha": "fbc3dcef76908685bd6dbcc3e9c60a0c07605c1e"
  },
  {
    "kind": "recorded",
    "itemId": "word:先生",
    "reading": "せんせい",
    "file": "sensei.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%88%E7%94%9F%E3%80%90%E3%81%9B%E3%82%93%E3%81%9B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "817a05ec9d7f246a9f58947aac0c4d92e80525d4"
  },
  {
    "kind": "recorded",
    "itemId": "word:三こ",
    "reading": "さんこ",
    "file": "sanko.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%89%E5%80%8B%E3%80%90%E3%81%95%E3%82%93%E3%81%93%E3%80%91.mp3",
    "gitBlobSha": "61d1d636742e2aa8e61be741cd0c1a1c9147382f"
  },
  {
    "kind": "recorded",
    "itemId": "word:四つ",
    "reading": "よっつ",
    "file": "yottsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%9B%9B%E3%81%A4%E3%80%90%E3%82%88%E3%81%A3%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "206fa300372d4edbdae90dbfaf730e6eca063cc4"
  },
  {
    "kind": "recorded",
    "itemId": "word:四月",
    "reading": "しがつ",
    "file": "shigatsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%9B%9B%E6%9C%88%E3%80%90%E3%81%97%E3%81%8C%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "3e2fd607207877c0b7a79c2d8763db2c9ff3115e"
  },
  {
    "kind": "recorded",
    "itemId": "word:七つ",
    "reading": "ななつ",
    "file": "nanatsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%83%E3%81%A4%E3%80%90%E3%81%AA%E3%81%AA%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "d794faadf7679d9acc085068ac541b18dc045520"
  },
  {
    "kind": "recorded",
    "itemId": "word:八つ",
    "reading": "やっつ",
    "file": "yattsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%AB%E3%81%A4%E3%80%90%E3%82%84%E3%81%A3%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "aed49340f9050525be2c709f78a230762b7e370b"
  },
  {
    "kind": "recorded",
    "itemId": "word:八日",
    "reading": "ようか",
    "file": "youka.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%AB%E6%97%A5%E3%80%90%E3%82%88%E3%81%86%E3%81%8B%E3%80%91.mp3",
    "gitBlobSha": "808d0fb8aecc1f0f556a265d124dc8cc1bde056b"
  },
  {
    "kind": "recorded",
    "itemId": "word:九つ",
    "reading": "ここのつ",
    "file": "kokonotsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B9%9D%E3%81%A4%E3%80%90%E3%81%93%E3%81%93%E3%81%AE%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "22464f2d7a79037dd4251d7600b2bf1ef134fcdc"
  },
  {
    "kind": "recorded",
    "itemId": "word:十月",
    "reading": "じゅうがつ",
    "file": "juugatsu.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8D%81%E6%9C%88%E3%80%90%E3%81%98%E3%82%85%E3%81%86%E3%81%8C%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "b3f7e5d8b5053895d2dd35c05886074fb07975bd"
  },
  {
    "kind": "recorded",
    "itemId": "word:十日",
    "reading": "とおか",
    "file": "tooka.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8D%81%E6%97%A5%E3%80%90%E3%81%A8%E3%81%8A%E3%81%8B%E3%80%91.mp3",
    "gitBlobSha": "2fb6e632146ef850dd3a2c8b9fa49bafa2fc9ac6"
  },
  {
    "kind": "recorded",
    "itemId": "word:千円",
    "reading": "せんえん",
    "file": "senen.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8D%83%E5%86%86%E3%80%90%E3%81%9B%E3%82%93%E3%81%88%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "cf133d9752e3a377e290f6abcb567dcf209bf5df"
  },
  {
    "kind": "recorded",
    "itemId": "word:三日",
    "reading": "みっか",
    "file": "mikka.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%89%E6%97%A5%E3%80%90%E3%81%BF%E3%81%A3%E3%81%8B%E3%80%91.mp3",
    "gitBlobSha": "b8287dcb6b240724d7907e4e6e4f7b044438f3f4"
  },
  {
    "kind": "synthesized",
    "itemId": "word:二こ",
    "reading": "にこ",
    "file": "niko.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "1a857a03890fe807ae56507c14ae03b16aa3227ab9537a96a3af7f3cfca53121"
  },
  {
    "kind": "synthesized",
    "itemId": "word:三本",
    "reading": "さんぼん",
    "file": "sanbon.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "078790af289f8d5474e9af7c154b11c5ed438bf1f67fab817a28a560c114307a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:四こ",
    "reading": "よんこ",
    "file": "yonko.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "369bc30ce64aed034e432c74fbb38671d3f8a1994a78c6961a53d52b6f1ade93"
  },
  {
    "kind": "synthesized",
    "itemId": "word:七月",
    "reading": "しちがつ",
    "file": "shichigatsu.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "84f11e8136435fcdf6edffafc34175f5892127655f7caaa0127f6cfc840bb88f"
  },
  {
    "kind": "synthesized",
    "itemId": "word:七色",
    "reading": "なないろ",
    "file": "nanairo.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8ee14887ef06e1e72994bdbbc2d1883659a250bba62ed1fd83a36694bcce0f8a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:八月",
    "reading": "はちがつ",
    "file": "hachigatsu.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8c4040429c14d77aea514953a9d1c8dffb7139653dfc42a25a138e8021256402"
  },
  {
    "kind": "synthesized",
    "itemId": "word:九こ",
    "reading": "きゅうこ",
    "file": "kyuuko.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "2b37b8dd9b8e78ea7c845bb32219c1486260d340e4c23d5b68a6f4d708fd0763"
  },
  {
    "kind": "synthesized",
    "itemId": "word:九月",
    "reading": "くがつ",
    "file": "kugatsu.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "0caf72be12546b895cd4762b2af88a34f73108504577d22452af92944651fe92"
  },
  {
    "kind": "synthesized",
    "itemId": "word:十年",
    "reading": "じゅうねん",
    "file": "juunen.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "477a41778048be7847e03eac6dfcbfbba60d67bf7238248f16eaba4defd40948"
  },
  {
    "kind": "synthesized",
    "itemId": "word:百年",
    "reading": "ひゃくねん",
    "file": "hyakunen.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "f10c5898e6ef04c6ba6a847640c3fbbc91a3e3655252ddf48327e5b6f54df834"
  },
  {
    "kind": "synthesized",
    "itemId": "word:百円",
    "reading": "ひゃくえん",
    "file": "hyakuen.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "7cf282b81ac143106a028998cad3ed8f14d342b336844169ccbe773c5eb1105e"
  },
  {
    "kind": "synthesized",
    "itemId": "word:百日",
    "reading": "ひゃくにち",
    "file": "hyakunichi.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "9d15e428ee48a213920d9d10c7094f0a9fa3336138e4d168a88ac4c8588dc7c6"
  },
  {
    "kind": "synthesized",
    "itemId": "word:千年",
    "reading": "せんねん",
    "file": "sennen.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "1cd4274a13861e9a70d39fdaf183f160c14d3962d8782d818832a8fb4605abc2"
  },
  {
    "kind": "synthesized",
    "itemId": "word:千人",
    "reading": "せんにん",
    "file": "sennin.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "ec7b125674dd8b7145effacc7f1e1956cf67bc84a347ffb42d4d91d0a7f304f1"
  },
  {
    "kind": "synthesized",
    "itemId": "word:日時",
    "reading": "にちじ",
    "file": "nichiji.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "22203c18f0b224043120e20cab3f95ed8cf3c8ae6740772b4660be3aa0bb3bb6"
  }
] as const satisfies readonly Pronunciation[];

const byItemId = new Map<string, Pronunciation>(pronunciations.map((clip) => [clip.itemId, clip]));

/** Keep the written form AND reading aligned, including words with multiple readings. */
export function getPronunciation(item: VocabularyStudyItem): Pronunciation | undefined {
  const clip = byItemId.get(item.id);
  return clip?.reading === item.reading ? clip : undefined;
}
