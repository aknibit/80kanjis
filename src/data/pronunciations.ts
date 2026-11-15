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
    "itemId": "word:三個",
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
    "itemId": "word:二個",
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
    "itemId": "word:四個",
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
    "itemId": "word:九個",
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
  },
  {
    "kind": "recorded",
    "itemId": "word:一ぴき",
    "reading": "いっぴき",
    "file": "word-4e00-3074-304d.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%80%E5%8C%B9%E3%80%90%E3%81%84%E3%81%A3%E3%81%B4%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "bc1bed4828b6e9a423226e98b92f06a6856a37dc"
  },
  {
    "kind": "recorded",
    "itemId": "word:五つ",
    "reading": "いつつ",
    "file": "word-4e94-3064.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%94%E3%81%A4%E3%80%90%E3%81%84%E3%81%A4%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "f20bf0e65ed1a784455823398b9531d4e46e40d3"
  },
  {
    "kind": "recorded",
    "itemId": "word:六つ",
    "reading": "むっつ",
    "file": "word-516d-3064.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%AD%E3%81%A4%E3%80%90%E3%82%80%E3%81%A3%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "a60477cfe17dbd2edda6f34a9364b2d9346ca634"
  },
  {
    "kind": "recorded",
    "itemId": "word:月見",
    "reading": "つきみ",
    "file": "word-6708-307f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%9C%88%E8%A6%8B%E3%80%90%E3%81%A4%E3%81%8D%E3%81%BF%E3%80%91.mp3",
    "gitBlobSha": "02113d2748dfa5d485777652b229530ec6164cfa"
  },
  {
    "kind": "recorded",
    "itemId": "word:二月",
    "reading": "にがつ",
    "file": "word-4e8c-6708.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%8C%E6%9C%88%E3%80%90%E3%81%AB%E3%81%8C%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "eda1849ad4b49767582a016bba47b9c7907c02a2"
  },
  {
    "kind": "recorded",
    "itemId": "word:まん月",
    "reading": "まんげつ",
    "file": "word-307e-3093-6708.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%BA%80%E6%9C%88%E3%80%90%E3%81%BE%E3%82%93%E3%81%92%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "9c8480a7003ed72a59983e62ea7d46f2edc1f867"
  },
  {
    "kind": "recorded",
    "itemId": "word:火じ",
    "reading": "かじ",
    "file": "word-706b-3058.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%81%AB%E4%BA%8B%E3%80%90%E3%81%8B%E3%81%98%E3%80%91.mp3",
    "gitBlobSha": "bd7e657ec658c186e2e86f4b26841021b7b43464"
  },
  {
    "kind": "recorded",
    "itemId": "word:火山",
    "reading": "かざん",
    "file": "word-706b-5c71.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%81%AB%E5%B1%B1%E3%80%90%E3%81%8B%E3%81%96%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "9dc5a36f14edc1c45cadb1421d4d8e6c963ec090"
  },
  {
    "kind": "recorded",
    "itemId": "word:ちょ金",
    "reading": "ちょきん",
    "file": "word-3061-3087-91d1.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%B2%AF%E9%87%91%E3%80%90%E3%81%A1%E3%82%87%E3%81%8D%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "299c2db13b83ed11a8263f94f560a5089b6d9d0d"
  },
  {
    "kind": "recorded",
    "itemId": "word:年上",
    "reading": "としうえ",
    "file": "word-5e74-4e0a.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B9%B4%E4%B8%8A%E3%80%90%E3%81%A8%E3%81%97%E3%81%86%E3%81%88%E3%80%91.mp3",
    "gitBlobSha": "cbfcb93994d174e211cab0ca07fef292f4e2d82d"
  },
  {
    "kind": "recorded",
    "itemId": "word:空気",
    "reading": "くうき",
    "file": "word-7a7a-6c17.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%A9%BA%E6%B0%97%E3%80%90%E3%81%8F%E3%81%86%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "340efef62ff65da70b8c47e26f6f20c23c2d99e4"
  },
  {
    "kind": "recorded",
    "itemId": "word:天気",
    "reading": "てんき",
    "file": "word-5929-6c17.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A4%A9%E6%B0%97%E3%80%90%E3%81%A6%E3%82%93%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "9ba2ce3bcc4b8dd39cc8610f3ff8654368177a5d"
  },
  {
    "kind": "recorded",
    "itemId": "word:天ごく",
    "reading": "てんごく",
    "file": "word-5929-3054-304f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A4%A9%E5%9B%BD%E3%80%90%E3%81%A6%E3%82%93%E3%81%94%E3%81%8F%E3%80%91.mp3",
    "gitBlobSha": "316bdf4ccdc7db63a496c6065cc8ff16ef442138"
  },
  {
    "kind": "recorded",
    "itemId": "word:気もち",
    "reading": "きもち",
    "file": "word-6c17-3082-3061.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%B0%97%E6%8C%81%E3%81%A1%E3%80%90%E3%81%8D%E3%82%82%E3%81%A1%E3%80%91.mp3",
    "gitBlobSha": "6b041fb4f71853565f384a997a81d12b16c1e128"
  },
  {
    "kind": "recorded",
    "itemId": "word:げん気",
    "reading": "げんき",
    "file": "word-3052-3093-6c17.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%83%E6%B0%97%E3%80%90%E3%81%92%E3%82%93%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "2b1e3fdce95c0007646de55648cd668252ea7201"
  },
  {
    "kind": "recorded",
    "itemId": "word:大すき",
    "reading": "だいすき",
    "file": "word-5927-3059-304d.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A4%A7%E5%A5%BD%E3%81%8D%E3%80%90%E3%81%A0%E3%81%84%E3%81%99%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "a511fb8dc16b90304311f458387a0794d8ba98a2"
  },
  {
    "kind": "recorded",
    "itemId": "word:大へん",
    "reading": "たいへん",
    "file": "word-5927-3078-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A4%A7%E5%A4%89%E3%80%90%E3%81%9F%E3%81%84%E3%81%B8%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "9c7f72b8f0948f7bf297573b33df65db3f191ad7"
  },
  {
    "kind": "recorded",
    "itemId": "word:大きい",
    "reading": "おおきい",
    "file": "word-5927-304d-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A4%A7%E3%81%8D%E3%81%84%E3%80%90%E3%81%8A%E3%81%8A%E3%81%8D%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "7b0545b1ec9451f58fedde7656a412a4e32db478"
  },
  {
    "kind": "recorded",
    "itemId": "word:左右",
    "reading": "さゆう",
    "file": "word-5de6-53f3.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B7%A6%E5%8F%B3%E3%80%90%E3%81%95%E3%82%86%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "b241a0c230a48d4c19f57fd7a076dc1a2de5d36c"
  },
  {
    "kind": "recorded",
    "itemId": "word:左がわ",
    "reading": "ひだりがわ",
    "file": "word-5de6-304c-308f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B7%A6%E5%81%B4%E3%80%90%E3%81%B2%E3%81%A0%E3%82%8A%E3%81%8C%E3%82%8F%E3%80%91.mp3",
    "gitBlobSha": "873d4caa4f68518fbfab10a1d90ca2d05ece6310"
  },
  {
    "kind": "recorded",
    "itemId": "word:右がわ",
    "reading": "みぎがわ",
    "file": "word-53f3-304c-308f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8F%B3%E5%81%B4%E3%80%90%E3%81%BF%E3%81%8E%E3%81%8C%E3%82%8F%E3%80%91.mp3",
    "gitBlobSha": "3f0e81511c8faf21a8fda034961b084ecd99bf13"
  },
  {
    "kind": "recorded",
    "itemId": "word:右手",
    "reading": "みぎて",
    "file": "word-53f3-624b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8F%B3%E6%89%8B%E3%80%90%E3%81%BF%E3%81%8E%E3%81%A6%E3%80%91.mp3",
    "gitBlobSha": "641d68bb7567d7b382b58d586a3fc6c01ca657cf"
  },
  {
    "kind": "recorded",
    "itemId": "word:円い",
    "reading": "まるい",
    "file": "word-5186-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%86%86%E3%81%84%E3%80%90%E3%81%BE%E3%82%8B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "6d42737012d752d13aab29436ab5b0d75aadea68"
  },
  {
    "kind": "recorded",
    "itemId": "word:円ばん",
    "reading": "えんばん",
    "file": "word-5186-3070-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%86%86%E7%9B%A4%E3%80%90%E3%81%88%E3%82%93%E3%81%B0%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "089b0e824d74284b0c4df3ad34d6c273389df6c6"
  },
  {
    "kind": "recorded",
    "itemId": "word:目てき",
    "reading": "もくてき",
    "file": "word-76ee-3066-304d.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%9B%AE%E7%9A%84%E3%80%90%E3%82%82%E3%81%8F%E3%81%A6%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "2c9ec55f4daf63d2d6c852d351fb9cefe181aa8b"
  },
  {
    "kind": "recorded",
    "itemId": "word:見る",
    "reading": "みる",
    "file": "word-898b-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%A6%8B%E3%82%8B%E3%80%90%E3%81%BF%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "e3e629afa6ad3663a9b01a36e095c288edcd3f96"
  },
  {
    "kind": "recorded",
    "itemId": "word:見える",
    "reading": "みえる",
    "file": "word-898b-3048-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%A6%8B%E3%81%88%E3%82%8B%E3%80%90%E3%81%BF%E3%81%88%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "ef8e9d9978db209da496d4f880006d8039582709"
  },
  {
    "kind": "recorded",
    "itemId": "word:立つ",
    "reading": "たつ",
    "file": "word-7acb-3064.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%AB%8B%E3%81%A4%E3%80%90%E3%81%9F%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "fb919eae3a2394d1712a356ed0c4b989484ee39f"
  },
  {
    "kind": "recorded",
    "itemId": "word:立てる",
    "reading": "たてる",
    "file": "word-7acb-3066-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%AB%8B%E3%81%A6%E3%82%8B%E3%80%90%E3%81%9F%E3%81%A6%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "e1d07fb404b777466479754841cb1b4748f8af9e"
  },
  {
    "kind": "recorded",
    "itemId": "word:休日",
    "reading": "きゅうじつ",
    "file": "word-4f11-3058-3064.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BC%91%E6%97%A5%E3%80%90%E3%81%8D%E3%82%85%E3%81%86%E3%81%98%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "49e423d920898513bf3a4c2fffd5833e59bc6db6"
  },
  {
    "kind": "recorded",
    "itemId": "word:入る",
    "reading": "はいる",
    "file": "word-5165-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%A5%E3%82%8B%E3%80%90%E3%81%AF%E3%81%84%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "a9920d59a8deb101e37eda5f9b73cb1e7c20e309"
  },
  {
    "kind": "recorded",
    "itemId": "word:入学",
    "reading": "にゅうがく",
    "file": "word-5165-5b66.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%A5%E5%AD%A6%E3%80%90%E3%81%AB%E3%82%85%E3%81%86%E3%81%8C%E3%81%8F%E3%80%91.mp3",
    "gitBlobSha": "dd32e4badac045e72bc84fcd9fe97f99c8512636"
  },
  {
    "kind": "recorded",
    "itemId": "word:入り口",
    "reading": "いりぐち",
    "file": "word-5165-308a-53e3.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%85%A5%E3%82%8A%E5%8F%A3%E3%80%90%E3%81%84%E3%82%8A%E3%81%90%E3%81%A1%E3%80%91.mp3",
    "gitBlobSha": "68bc9ca28cfd839e88a620c76d29a11211636cf3"
  },
  {
    "kind": "recorded",
    "itemId": "word:女子",
    "reading": "じょし",
    "file": "word-5973-5b50.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A5%B3%E5%AD%90%E3%80%90%E3%81%98%E3%82%87%E3%81%97%E3%80%91.mp3",
    "gitBlobSha": "170b9cc0420dd635678722a2d0a35fe8bcdbe0dc"
  },
  {
    "kind": "recorded",
    "itemId": "word:女の人",
    "reading": "おんなのひと",
    "file": "word-5973-306e-4eba.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%A5%B3%E3%81%AE%E4%BA%BA%E3%80%90%E3%81%8A%E3%82%93%E3%81%AA%E3%81%AE%E3%81%B2%E3%81%A8%E3%80%91.mp3",
    "gitBlobSha": "8e4ee5622967a663b0879825164fa7414576b99e"
  },
  {
    "kind": "recorded",
    "itemId": "word:男の人",
    "reading": "おとこのひと",
    "file": "word-7537-306e-4eba.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%94%B7%E3%81%AE%E4%BA%BA%E3%80%90%E3%81%8A%E3%81%A8%E3%81%93%E3%81%AE%E3%81%B2%E3%81%A8%E3%80%91.mp3",
    "gitBlobSha": "57fe8616c5d2f27c7c434b4bc71991a51cbb155a"
  },
  {
    "kind": "recorded",
    "itemId": "word:男の子",
    "reading": "おとこのこ",
    "file": "word-7537-306e-5b50.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%94%B7%E3%81%AE%E5%AD%90%E3%80%90%E3%81%8A%E3%81%A8%E3%81%93%E3%81%AE%E3%81%93%E3%80%91.mp3",
    "gitBlobSha": "e9a7a8235c2bb864c01091024aebda8d084f4598"
  },
  {
    "kind": "recorded",
    "itemId": "word:子ども",
    "reading": "こども",
    "file": "word-5b50-3069-3082.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%AD%90%E4%BE%9B%E3%80%90%E3%81%93%E3%81%A9%E3%82%82%E3%80%91.mp3",
    "gitBlobSha": "d49cd6c4dfcaf1f05a343437485bcdb119d0fddf"
  },
  {
    "kind": "recorded",
    "itemId": "word:子犬",
    "reading": "こいぬ",
    "file": "word-5b50-72ac.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%AD%90%E7%8A%AC%E3%80%90%E3%81%93%E3%81%84%E3%81%AC%E3%80%91.mp3",
    "gitBlobSha": "89bc2d0290f504662e375ad97429ab28c3f2aa1a"
  },
  {
    "kind": "recorded",
    "itemId": "word:人ごみ",
    "reading": "ひとごみ",
    "file": "word-4eba-3054-307f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%BA%E8%BE%BC%E3%81%BF%E3%80%90%E3%81%B2%E3%81%A8%E3%81%94%E3%81%BF%E3%80%91.mp3",
    "gitBlobSha": "88dc74b1299a17c405c1e6a9199fdfb77f595177"
  },
  {
    "kind": "recorded",
    "itemId": "word:名人",
    "reading": "めいじん",
    "file": "word-540d-4eba.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%90%8D%E4%BA%BA%E3%80%90%E3%82%81%E3%81%84%E3%81%98%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "bee21f61c197d8158bb609b95751200c09151e31"
  },
  {
    "kind": "recorded",
    "itemId": "word:人げん",
    "reading": "にんげん",
    "file": "word-4eba-3052-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%BA%E9%96%93%E3%80%90%E3%81%AB%E3%82%93%E3%81%92%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "f06675710bec97627705b797386d19eb62bcc18c"
  },
  {
    "kind": "recorded",
    "itemId": "word:名前",
    "reading": "なまえ",
    "file": "word-540d-524d.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%90%8D%E5%89%8D%E3%80%90%E3%81%AA%E3%81%BE%E3%81%88%E3%80%91.mp3",
    "gitBlobSha": "8da4d3a6f0662c93e1e5528773cfd31eeaa1f2aa"
  },
  {
    "kind": "recorded",
    "itemId": "word:本だな",
    "reading": "ほんだな",
    "file": "word-672c-3060-306a.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%9C%AC%E6%A3%9A%E3%80%90%E3%81%BB%E3%82%93%E3%81%A0%E3%81%AA%E3%80%91.mp3",
    "gitBlobSha": "6b2f6ca3a6a028c8d7dc1cb0703749e77ed1e367"
  },
  {
    "kind": "recorded",
    "itemId": "word:本とう",
    "reading": "ほんとう",
    "file": "word-672c-3068-3046.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%9C%AC%E5%BD%93%E3%80%90%E3%81%BB%E3%82%93%E3%81%A8%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "b8f28fc9606eaf498c65f562501624d4c9390fd0"
  },
  {
    "kind": "recorded",
    "itemId": "word:学年",
    "reading": "がくねん",
    "file": "word-5b66-5e74.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%AD%A6%E5%B9%B4%E3%80%90%E3%81%8C%E3%81%8F%E3%81%AD%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "85f9774bd8767aee8e2bff8e887928d89a90d8cf"
  },
  {
    "kind": "recorded",
    "itemId": "word:小学生",
    "reading": "しょうがくせい",
    "file": "word-5c0f-5b66-751f.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B0%8F%E5%AD%A6%E7%94%9F%E3%80%90%E3%81%97%E3%82%87%E3%81%86%E3%81%8C%E3%81%8F%E3%81%9B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "8e6de3429078afbebb3ea87f57713456c3bb616d"
  },
  {
    "kind": "recorded",
    "itemId": "word:学ぶ",
    "reading": "まなぶ",
    "file": "word-5b66-3076.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%AD%A6%E3%81%B6%E3%80%90%E3%81%BE%E3%81%AA%E3%81%B6%E3%80%91.mp3",
    "gitBlobSha": "d174cd6d187f307b357a428defe6c047b902c4d4"
  },
  {
    "kind": "recorded",
    "itemId": "word:早い",
    "reading": "はやい",
    "file": "word-65e9-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%97%A9%E3%81%84%E3%80%90%E3%81%AF%E3%82%84%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "c6c8a2af32348dfd089bae7e5492120fccebb8c0"
  },
  {
    "kind": "synthesized",
    "itemId": "word:五個",
    "reading": "ごこ",
    "file": "word-4e94-3053.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "7dd13e819028c6641ff8025bda710afe9ea4e25721092693ac6fa8d13bd6f0f0"
  },
  {
    "kind": "synthesized",
    "itemId": "word:五わ",
    "reading": "ごわ",
    "file": "word-4e94-308f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "70c5420c9447fd4506f9b5a88f312deb1829706fb737397ef6ab4234e2f4ec86"
  },
  {
    "kind": "synthesized",
    "itemId": "word:六個",
    "reading": "ろっこ",
    "file": "word-516d-3053.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "86cc04c2b35013400dbf1efb73fc6cd72726dc83baced2ac5b80b3ad599216a2"
  },
  {
    "kind": "synthesized",
    "itemId": "word:六本",
    "reading": "ろっぽん",
    "file": "word-516d-672c.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "5876516d7326bd901b5a84f14676eac9d61986a4eaa61e3c8d1a1031f46c5c9b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:火のこ",
    "reading": "ひのこ",
    "file": "word-706b-306e-3053.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "11eea7b0f804e0837177a5655152b6604b700623d2b0d51a525060029dc13042"
  },
  {
    "kind": "synthesized",
    "itemId": "word:木目",
    "reading": "もくめ",
    "file": "word-6728-76ee.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "fc235c518dd2e3303426e8586c9a25040eb6a678f5d369394d3520f6ec90f61d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:庭木",
    "reading": "にわき",
    "file": "word-306b-308f-6728.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "bfb02ab379c56923828feef83788af703093d0bbabe9d8c837aa0377734b9745"
  },
  {
    "kind": "synthesized",
    "itemId": "word:木かげ",
    "reading": "こかげ",
    "file": "word-6728-304b-3052.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "36fe18b8f7b8fe5c4cadd4124cfb98ae985cbf2892b2e81c865e5b8f2cd40107"
  },
  {
    "kind": "synthesized",
    "itemId": "word:金色",
    "reading": "きんいろ",
    "file": "word-91d1-8272.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "52e368321feeb672da54ffe1fdfb306c1ef7f37304fd1a222abb1d6789c5cd55"
  },
  {
    "kind": "synthesized",
    "itemId": "word:土き",
    "reading": "どき",
    "file": "word-571f-304d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "d3145afcd2bbf98471e275efad7c351bc079558dd4272cea1ce67c3281444963"
  },
  {
    "kind": "synthesized",
    "itemId": "word:土足",
    "reading": "どそく",
    "file": "word-571f-8db3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "e66189884fba4d3e997a53e2298a079c94786cd6166e500bdfc3628a5c27ef31"
  },
  {
    "kind": "synthesized",
    "itemId": "word:赤土",
    "reading": "あかつち",
    "file": "word-8d64-571f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "984615c2a340a57595822bfd6918da72cc5112c91459a813759b7d851c3f1218"
  },
  {
    "kind": "synthesized",
    "itemId": "word:山みち",
    "reading": "やまみち",
    "file": "word-5c71-307f-3061.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "20cc3619cdf9b0b81195d903d7a21bd2f78400d2100356b404e001fe2243b718"
  },
  {
    "kind": "synthesized",
    "itemId": "word:山いも",
    "reading": "やまいも",
    "file": "word-5c71-3044-3082.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "3b4b3b7958b12dd0b3a2e1d9724c22072135c98979223078b2aa14e7d1d871ff"
  },
  {
    "kind": "synthesized",
    "itemId": "word:川上",
    "reading": "かわかみ",
    "file": "word-5ddd-304b-307f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "4aa50de919d4cb56ff64c7e0ced44bf0cad9cc0e39d761a0554fbc9277b6d247"
  },
  {
    "kind": "synthesized",
    "itemId": "word:川下",
    "reading": "かわしも",
    "file": "word-5ddd-3057-3082.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "d59ff592b855a2349785b060a1589f646c9b1763664aec85aadf79b437e8acef"
  },
  {
    "kind": "synthesized",
    "itemId": "word:川べり",
    "reading": "かわべり",
    "file": "word-5ddd-3079-308a.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "266147b734ee0de2f7ce72f2f685b9a388e83690951127289afd6d47aae54a16"
  },
  {
    "kind": "synthesized",
    "itemId": "word:田んぼ",
    "reading": "たんぼ",
    "file": "word-7530-3093-307c.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "337515b56441a0c54f0da99a108897766883fb8c3a0dda2b1cd97be0b4f9d511"
  },
  {
    "kind": "synthesized",
    "itemId": "word:水田",
    "reading": "すいでん",
    "file": "word-6c34-7530.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "97c8008f914ce7169a65e8936cd8b097210f1fceb36de2ac8ce38a3f11199d76"
  },
  {
    "kind": "synthesized",
    "itemId": "word:田うえ",
    "reading": "たうえ",
    "file": "word-7530-3046-3048.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "2f25d1d4d04c92af5eb9269aad84fef5890d9a924c724eac2961a0ab6ee8885c"
  },
  {
    "kind": "synthesized",
    "itemId": "word:年より",
    "reading": "としより",
    "file": "word-5e74-3088-308a.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "f057421638d0bbff54f6cd770a3704447fe50bbae9f1ad3bfbaf166a835ed7a7"
  },
  {
    "kind": "synthesized",
    "itemId": "word:空色",
    "reading": "そらいろ",
    "file": "word-7a7a-8272.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "699918ae5281b62c9dbc7bd774a09a42de9e8582de2f69673de5497991cb0d0f"
  },
  {
    "kind": "synthesized",
    "itemId": "word:空ばこ",
    "reading": "からばこ",
    "file": "word-7a7a-3070-3053.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8612e7df86de2d95c1998ba691bbe6f589efc080bc484974ae36e238cbee6221"
  },
  {
    "kind": "synthesized",
    "itemId": "word:天の川",
    "reading": "あまのがわ",
    "file": "word-5929-306e-5ddd.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "be5704385b37176ee5434a17b15b1dc3ce11b0ad76a6bdb807ba6dcf5a3921c6"
  },
  {
    "kind": "synthesized",
    "itemId": "word:白ぐみ",
    "reading": "しろぐみ",
    "file": "word-767d-3050-307f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "54ba41cef55f400f59f95d509ef6e729cc748d32069418ac18f1369b1c61780e"
  },
  {
    "kind": "synthesized",
    "itemId": "word:白い花",
    "reading": "しろいはな",
    "file": "word-767d-3044-82b1.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "85979544ce7a2de55c726fab23bfcef43f081117e998ffe9d09d0c6ac6ff641b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:空白",
    "reading": "くうはく",
    "file": "word-7a7a-767d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "3eb5bd2726ffe10dfb68ee1ee24320c9ba97da1d3ea0ff630fd8c88c40218727"
  },
  {
    "kind": "synthesized",
    "itemId": "word:一日中",
    "reading": "いちにちじゅう",
    "file": "word-4e00-65e5-4e2d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "17aec870e199672dce706846ebccd82f5b76805cc6c5feba251677d9382f0f60"
  },
  {
    "kind": "synthesized",
    "itemId": "word:中庭",
    "reading": "なかにわ",
    "file": "word-4e2d-306b-308f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "70b023cf19c8b1200019decda6b3bde95eb1548410faad2412789d906c423654"
  },
  {
    "kind": "synthesized",
    "itemId": "word:左足",
    "reading": "ひだりあし",
    "file": "word-5de6-8db3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "ddf27ab045499622899cbfe898e72e50f79ebf8a7dac17faaadb8dee8ad90e89"
  },
  {
    "kind": "synthesized",
    "itemId": "word:円けい",
    "reading": "えんけい",
    "file": "word-5186-3051-3044.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "0fe5aac046777341706c010525183351f180ce84553424589f99d5c404b00d7a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:目と口",
    "reading": "めとくち",
    "file": "word-76ee-3068-53e3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "292a802a361efd245618d4f5cd67564cfb950d6124108cef9dbb914f8d1a39ae"
  },
  {
    "kind": "synthesized",
    "itemId": "word:目つき",
    "reading": "めつき",
    "file": "word-76ee-3064-304d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "e638c1022fe70c4d4e4118369723c0d727c5cf824ccac3fcbd834e9c6fed258b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:見学",
    "reading": "けんがく",
    "file": "word-898b-5b66.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "97815893d6f7af4daa02f0382cfa414542af5f1945bcf713ea0c8d3b3f12d93d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:き立",
    "reading": "きりつ",
    "file": "word-304d-7acb.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "ec4b524fe64d4b78b738216aa973ddbfb6ab5104259811265268beaf85186b55"
  },
  {
    "kind": "synthesized",
    "itemId": "word:休める",
    "reading": "やすめる",
    "file": "word-4f11-3081-308b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "efbd3a57e7c7958a5fd6febe219159b8e9f56c4624a884a3f8c2d88032e15509"
  },
  {
    "kind": "synthesized",
    "itemId": "word:女と男",
    "reading": "おんなとおとこ",
    "file": "word-5973-3068-7537.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "dda714ce1a8c5edb3a8f3fd2893755ded600beadccac6bc7cead2d5f529ff81b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:男子",
    "reading": "だんし",
    "file": "word-7537-5b50.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "80a9c0524bd3e023559071babd21a325ddfb9cc03900133d4e557638f3e43bbd"
  },
  {
    "kind": "synthesized",
    "itemId": "word:本名",
    "reading": "ほんみょう",
    "file": "word-672c-540d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "e790995162842d908a884d9c0ca6e43d8487f2f180128a541f8fa2afd9d400a9"
  },
  {
    "kind": "synthesized",
    "itemId": "word:え本",
    "reading": "えほん",
    "file": "word-3048-672c.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "acc85e8f9f9dbc4b631e0ec0e2005f5197ac92b3b1eb2e1c4910bc03b00aa878"
  },
  {
    "kind": "synthesized",
    "itemId": "word:早足",
    "reading": "はやあし",
    "file": "word-65e9-8db3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "a8ba2f50b22ea5623a9be6008df733044471cb30641ac791f7fffb04e1db7bad"
  },
  {
    "kind": "synthesized",
    "itemId": "word:早める",
    "reading": "はやめる",
    "file": "word-65e9-3081-308b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c4bd9ed3b7a8893d461418a4e6057dc3492c1a25c6fc7361afe0afa54bc85c9c"
  },
  {
    "kind": "synthesized",
    "itemId": "word:村の人",
    "reading": "むらのひと",
    "file": "word-6751-306e-4eba.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "cc67b777bf2a4194a0d1855a6afb85c814aa28fe44907a96cd9b7ad022fe3a2e"
  },
  {
    "kind": "synthesized",
    "itemId": "word:町と村",
    "reading": "まちとむら",
    "file": "word-753a-3068-6751.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "a33991e9e4effede66b91ad3863d0da5bc044dc24c5ec6e7fb704032d475ff9c"
  },
  {
    "kind": "synthesized",
    "itemId": "word:山村",
    "reading": "さんそん",
    "file": "word-5c71-6751.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "7b46b7fbae3cb406226a8b5331c558401a85e5afb0d016dd9df10ccffb72fa0c"
  },
  {
    "kind": "synthesized",
    "itemId": "word:町なみ",
    "reading": "まちなみ",
    "file": "word-753a-306a-307f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "adff13e00558dd3fa8cf86657d54b5ca2341a3cbb32de3e64cd24075d1c23bd3"
  },
  {
    "kind": "synthesized",
    "itemId": "word:町の中",
    "reading": "まちのなか",
    "file": "word-753a-306e-4e2d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "0f0076500de6a334ec5bc3cbb0384e78b98c9c0794cee30eb6b10c260b925d39"
  },
  {
    "kind": "synthesized",
    "itemId": "word:町村",
    "reading": "ちょうそん",
    "file": "word-753a-6751.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "7785491d5e209958990be5bc81c2c82b3a3bfab11f9569ce58493daebacdf217"
  },
  {
    "kind": "recorded",
    "itemId": "word:水どう",
    "reading": "すいどう",
    "file": "word-6c34-3069-3046.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%B0%B4%E9%81%93%E3%80%90%E3%81%99%E3%81%84%E3%81%A9%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "687ef9c59e0c482b76bdadcb3318297ecccbd1ea"
  },
  {
    "kind": "recorded",
    "itemId": "word:花だん",
    "reading": "かだん",
    "file": "word-82b1-3060-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%8A%B1%E5%A3%87%E3%80%90%E3%81%8B%E3%81%A0%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "746fb2b1b5b00ad20c141eed229dca1c54fac73c"
  },
  {
    "kind": "recorded",
    "itemId": "word:じ石",
    "reading": "じしゃく",
    "file": "word-3058-77f3.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%A3%81%E7%9F%B3%E3%80%90%E3%81%98%E3%81%97%E3%82%83%E3%81%8F%E3%80%91.mp3",
    "gitBlobSha": "bf387d41c05bbf2ac44955ee8a98f2cbeb40d073"
  },
  {
    "kind": "recorded",
    "itemId": "word:ほう石",
    "reading": "ほうせき",
    "file": "word-307b-3046-77f3.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%AE%9D%E7%9F%B3%E3%80%90%E3%81%BB%E3%81%86%E3%81%9B%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "e84a52ba66eac21d52f96e7050abcf785b244da9"
  },
  {
    "kind": "recorded",
    "itemId": "word:青い",
    "reading": "あおい",
    "file": "word-9752-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E9%9D%92%E3%81%84%E3%80%90%E3%81%82%E3%81%8A%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "33dc14222a989d970b8ad66263313fe7cefb2225"
  },
  {
    "kind": "recorded",
    "itemId": "word:青年",
    "reading": "せいねん",
    "file": "word-9752-5e74.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E9%9D%92%E5%B9%B4%E3%80%90%E3%81%9B%E3%81%84%E3%81%AD%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "0e13ad7694630a97c691674959cea7ced5f2f424"
  },
  {
    "kind": "recorded",
    "itemId": "word:青空",
    "reading": "あおぞら",
    "file": "word-9752-7a7a.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E9%9D%92%E7%A9%BA%E3%80%90%E3%81%82%E3%81%8A%E3%81%9E%E3%82%89%E3%80%91.mp3",
    "gitBlobSha": "0989ff3dc6dce93ea3fbacf0852079a2d2dfaa01"
  },
  {
    "kind": "recorded",
    "itemId": "word:赤ちゃん",
    "reading": "あかちゃん",
    "file": "word-8d64-3061-3083-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%B5%A4%E3%81%A1%E3%82%83%E3%82%93%E3%80%90%E3%81%82%E3%81%8B%E3%81%A1%E3%82%83%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "11050a879578ebb1697051cefd83ffff2f82d0cd"
  },
  {
    "kind": "recorded",
    "itemId": "word:小学校",
    "reading": "しょうがっこう",
    "file": "word-5c0f-5b66-6821.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B0%8F%E5%AD%A6%E6%A0%A1%E3%80%90%E3%81%97%E3%82%87%E3%81%86%E3%81%8C%E3%81%A3%E3%81%93%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "df421dbb39f7625d65cdcb1fe24aec4eccdf7b82"
  },
  {
    "kind": "recorded",
    "itemId": "word:小さい",
    "reading": "ちいさい",
    "file": "word-5c0f-3055-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%B0%8F%E3%81%95%E3%81%84%E3%80%90%E3%81%A1%E3%81%84%E3%81%95%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "bd0d2000354933446e0c64f9601b1b41c9f1d3ff"
  },
  {
    "kind": "recorded",
    "itemId": "word:下げる",
    "reading": "さげる",
    "file": "word-4e0b-3052-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%B8%8B%E3%81%92%E3%82%8B%E3%80%90%E3%81%95%E3%81%92%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "8302e8e0891cbedf7bbde304e374cc79c7188407"
  },
  {
    "kind": "recorded",
    "itemId": "word:口ぶえ",
    "reading": "くちぶえ",
    "file": "word-53e3-3076-3048.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8F%A3%E7%AC%9B%E3%80%90%E3%81%8F%E3%81%A1%E3%81%B6%E3%81%88%E3%80%91.mp3",
    "gitBlobSha": "55f04038f1236d738bbd7a3123c76237fd4d30a1"
  },
  {
    "kind": "recorded",
    "itemId": "word:口べに",
    "reading": "くちべに",
    "file": "word-53e3-3079-306b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%8F%A3%E7%B4%85%E3%80%90%E3%81%8F%E3%81%A1%E3%81%B9%E3%81%AB%E3%80%91.mp3",
    "gitBlobSha": "edcf5e7a8eb358bcce789da838bdca8973b3c1cf"
  },
  {
    "kind": "recorded",
    "itemId": "word:人口",
    "reading": "じんこう",
    "file": "word-4eba-53e3.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BA%BA%E5%8F%A3%E3%80%90%E3%81%98%E3%82%93%E3%81%93%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "e5145f5ec2de4a7ece85212c165f92f5637df175"
  },
  {
    "kind": "recorded",
    "itemId": "word:手くび",
    "reading": "てくび",
    "file": "word-624b-304f-3073.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%89%8B%E9%A6%96%E3%80%90%E3%81%A6%E3%81%8F%E3%81%B3%E3%80%91.mp3",
    "gitBlobSha": "2cd21e57a5e40e291e679d03abbf93b03a37f258"
  },
  {
    "kind": "recorded",
    "itemId": "word:はく手",
    "reading": "はくしゅ",
    "file": "word-306f-304f-624b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%8B%8D%E6%89%8B%E3%80%90%E3%81%AF%E3%81%8F%E3%81%97%E3%82%85%E3%80%91.mp3",
    "gitBlobSha": "bf3010580e4e193e97d2c430a2c6e68ddea20927"
  },
  {
    "kind": "recorded",
    "itemId": "word:足あと",
    "reading": "あしあと",
    "file": "word-8db3-3042-3068.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%B6%B3%E8%B7%A1%E3%80%90%E3%81%82%E3%81%97%E3%81%82%E3%81%A8%E3%80%91.mp3",
    "gitBlobSha": "556c62c226513f8acc0801d7be21e491ffee1261"
  },
  {
    "kind": "recorded",
    "itemId": "word:足くび",
    "reading": "あしくび",
    "file": "word-8db3-304f-3073.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%B6%B3%E9%A6%96%E3%80%90%E3%81%82%E3%81%97%E3%81%8F%E3%81%B3%E3%80%91.mp3",
    "gitBlobSha": "1cf6a8e67326fc4820fd534fbc064e7b9cea21d8"
  },
  {
    "kind": "recorded",
    "itemId": "word:耳うち",
    "reading": "みみうち",
    "file": "word-8033-3046-3061.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%80%B3%E6%89%93%E3%81%A1%E3%80%90%E3%81%BF%E3%81%BF%E3%81%86%E3%81%A1%E3%80%91.mp3",
    "gitBlobSha": "453122988ae9d7cb085145357fdeaaed31d4e2f6"
  },
  {
    "kind": "recorded",
    "itemId": "word:出る",
    "reading": "でる",
    "file": "word-51fa-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%87%BA%E3%82%8B%E3%80%90%E3%81%A7%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "129305068059bb99a56a4fa7f13c7efdad8dc52a"
  },
  {
    "kind": "recorded",
    "itemId": "word:出す",
    "reading": "だす",
    "file": "word-51fa-3059.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%87%BA%E3%81%99%E3%80%90%E3%81%A0%E3%81%99%E3%80%91.mp3",
    "gitBlobSha": "92789af6e8f252ea5ec53f60d2e6d682c436215d"
  },
  {
    "kind": "recorded",
    "itemId": "word:出ぱつ",
    "reading": "しゅっぱつ",
    "file": "word-51fa-3071-3064.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%87%BA%E7%99%BA%E3%80%90%E3%81%97%E3%82%85%E3%81%A3%E3%81%B1%E3%81%A4%E3%80%91.mp3",
    "gitBlobSha": "8d844687b9c4e1c64fda92955d2297a9eb748c9c"
  },
  {
    "kind": "recorded",
    "itemId": "word:かん字",
    "reading": "かんじ",
    "file": "word-304b-3093-5b57.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%BC%A2%E5%AD%97%E3%80%90%E3%81%8B%E3%82%93%E3%81%98%E3%80%91.mp3",
    "gitBlobSha": "ee824db2342bc59944a36bdda96adfe0732510a1"
  },
  {
    "kind": "recorded",
    "itemId": "word:すう字",
    "reading": "すうじ",
    "file": "word-3059-3046-5b57.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%95%B0%E5%AD%97%E3%80%90%E3%81%99%E3%81%86%E3%81%98%E3%80%91.mp3",
    "gitBlobSha": "2de19dd045653f79d751e21af9659c9413d7185c"
  },
  {
    "kind": "recorded",
    "itemId": "word:さく文",
    "reading": "さくぶん",
    "file": "word-3055-304f-6587.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E4%BD%9C%E6%96%87%E3%80%90%E3%81%95%E3%81%8F%E3%81%B6%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "f2f292512c9354a55ca27a5ac887e04dc0f55035"
  },
  {
    "kind": "recorded",
    "itemId": "word:文学",
    "reading": "ぶんがく",
    "file": "word-6587-5b66.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%96%87%E5%AD%A6%E3%80%90%E3%81%B6%E3%82%93%E3%81%8C%E3%81%8F%E3%80%91.mp3",
    "gitBlobSha": "bcde0d9258f1ed757cad59e08812734ff848455f"
  },
  {
    "kind": "recorded",
    "itemId": "word:生む",
    "reading": "うむ",
    "file": "word-751f-3080.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%94%9F%E3%82%80%E3%80%90%E3%81%86%E3%82%80%E3%80%91.mp3",
    "gitBlobSha": "5eb8f4e1f940500e20a7e126f38b41e3fc8537ad"
  },
  {
    "kind": "recorded",
    "itemId": "word:生きる",
    "reading": "いきる",
    "file": "word-751f-304d-308b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%94%9F%E3%81%8D%E3%82%8B%E3%80%90%E3%81%84%E3%81%8D%E3%82%8B%E3%80%91.mp3",
    "gitBlobSha": "79145f7c85a93959c0aa2125b966b45c09bafca2"
  },
  {
    "kind": "recorded",
    "itemId": "word:正しい",
    "reading": "ただしい",
    "file": "word-6b63-3057-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%AD%A3%E3%81%97%E3%81%84%E3%80%90%E3%81%9F%E3%81%A0%E3%81%97%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "00294a4c5fcf3b45678c6cc6ae518163a7c32383"
  },
  {
    "kind": "recorded",
    "itemId": "word:正じき",
    "reading": "しょうじき",
    "file": "word-6b63-3058-304d.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%AD%A3%E7%9B%B4%E3%80%90%E3%81%97%E3%82%87%E3%81%86%E3%81%98%E3%81%8D%E3%80%91.mp3",
    "gitBlobSha": "4cf4134d052df51ab30ccfc025c6c8b159a96f9b"
  },
  {
    "kind": "recorded",
    "itemId": "word:正かい",
    "reading": "せいかい",
    "file": "word-6b63-304b-3044.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E6%AD%A3%E8%A7%A3%E3%80%90%E3%81%9B%E3%81%84%E3%81%8B%E3%81%84%E3%80%91.mp3",
    "gitBlobSha": "7f8663b66f916261c1e7c91eeb212a2c0b60d653"
  },
  {
    "kind": "recorded",
    "itemId": "word:王さま",
    "reading": "おうさま",
    "file": "word-738b-3055-307e.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%8E%8B%E6%A7%98%E3%80%90%E3%81%8A%E3%81%86%E3%81%95%E3%81%BE%E3%80%91.mp3",
    "gitBlobSha": "6d1b76827732f3277320846e2865c29133435c9a"
  },
  {
    "kind": "recorded",
    "itemId": "word:王かん",
    "reading": "おうかん",
    "file": "word-738b-304b-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E7%8E%8B%E5%86%A0%E3%80%90%E3%81%8A%E3%81%86%E3%81%8B%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "812268512f485e1c7bd85d1ae53b17f4b67ad0f1"
  },
  {
    "kind": "recorded",
    "itemId": "word:こく王",
    "reading": "こくおう",
    "file": "word-3053-304f-738b.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E5%9B%BD%E7%8E%8B%E3%80%90%E3%81%93%E3%81%8F%E3%81%8A%E3%81%86%E3%80%91.mp3",
    "gitBlobSha": "d8dd9b830b39ae4369e8ef46813cb009e6d42be5"
  },
  {
    "kind": "recorded",
    "itemId": "word:でん車",
    "reading": "でんしゃ",
    "file": "word-3067-3093-8eca.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E9%9B%BB%E8%BB%8A%E3%80%90%E3%81%A7%E3%82%93%E3%81%97%E3%82%83%E3%80%91.mp3",
    "gitBlobSha": "5abcfc908981b64251fa79d1ea14c4cfeb145f51"
  },
  {
    "kind": "recorded",
    "itemId": "word:車りん",
    "reading": "しゃりん",
    "file": "word-8eca-308a-3093.mp3",
    "sourceUrl": "https://github.com/tofugu/japanese-vocabulary-pronunciation-audio/blob/master/lib/mp3/%E8%BB%8A%E8%BC%AA%E3%80%90%E3%81%97%E3%82%83%E3%82%8A%E3%82%93%E3%80%91.mp3",
    "gitBlobSha": "1f43c4f03a4112cb7ba2858ec9401794b7fbdef7"
  },
  {
    "kind": "synthesized",
    "itemId": "word:水玉",
    "reading": "みずたま",
    "file": "word-6c34-7389.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c574cdd411f1c45d50e9caee815d2039c9df02bafdcd6d5ea86e9ce8d4400a93"
  },
  {
    "kind": "synthesized",
    "itemId": "word:水草",
    "reading": "みずくさ",
    "file": "word-6c34-8349.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "13c6489def387b291e0319090f87668ae9d228c440cac273809c2877f59b637f"
  },
  {
    "kind": "synthesized",
    "itemId": "word:竹林",
    "reading": "たけばやし",
    "file": "word-7af9-6797.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "9cca12d9c6a629e76a5da4919e0386f44ce5b5cbd4940f6fb46edfaa96156853"
  },
  {
    "kind": "synthesized",
    "itemId": "word:まつ林",
    "reading": "まつばやし",
    "file": "word-307e-3064-6797.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "0c1c3e26d02726ec72637852b7defdd872f5afdfef03e53074030fa569948f54"
  },
  {
    "kind": "synthesized",
    "itemId": "word:山林",
    "reading": "さんりん",
    "file": "word-5c71-6797.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "64c92b02892bed71bf651570fb03f47c00b7a152fab3753a122406b8fc91d562"
  },
  {
    "kind": "synthesized",
    "itemId": "word:森の中",
    "reading": "もりのなか",
    "file": "word-68ee-306e-4e2d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "a1dc45cd71a248fcf256fdf70b45e2e5dcc8324b7a46d37bc7702c719514187d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:森林",
    "reading": "しんりん",
    "file": "word-68ee-6797.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "aa57cc214eb6b07811a82d74a28aced684168512f31ced04dadcc398b4268e88"
  },
  {
    "kind": "synthesized",
    "itemId": "word:青森",
    "reading": "あおもり",
    "file": "word-9752-68ee.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "dde4db15d78430b3e6e621352e7538946a1001ef19bf929b6edad93159daa8a6"
  },
  {
    "kind": "synthesized",
    "itemId": "word:竹うま",
    "reading": "たけうま",
    "file": "word-7af9-3046-307e.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c9c73e4b7840c5b7050604ef0806de5bc90c73c535664db0d2e79ca4e726b4ad"
  },
  {
    "kind": "synthesized",
    "itemId": "word:竹やぶ",
    "reading": "たけやぶ",
    "file": "word-7af9-3084-3076.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "b4e2bd48ed511a9ca17d48def3ba813071b7046ee2ad56195a15315cd4c6bf04"
  },
  {
    "kind": "synthesized",
    "itemId": "word:竹わ",
    "reading": "ちくわ",
    "file": "word-7af9-308f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "ecb396006c9232c981a5a180ba250b2d1d0dc892b07ca0ab7557f4670734c267"
  },
  {
    "kind": "synthesized",
    "itemId": "word:花びら",
    "reading": "はなびら",
    "file": "word-82b1-3073-3089.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "a11949426e7aa30cd7e2a58ebdd1c1486ada2d74421fbd7b430cc85fc1d9d039"
  },
  {
    "kind": "synthesized",
    "itemId": "word:花たば",
    "reading": "はなたば",
    "file": "word-82b1-305f-3070.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8d6088a74b54cf16017e36ee875f8592eb4d2ec5cfc0c2ccb6520f1763d99bb1"
  },
  {
    "kind": "synthesized",
    "itemId": "word:草はら",
    "reading": "くさはら",
    "file": "word-8349-306f-3089.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "5c96e66816d1466f282a9030af3934c5b7439a065fe22f7f795e17969b7a34b4"
  },
  {
    "kind": "synthesized",
    "itemId": "word:草もち",
    "reading": "くさもち",
    "file": "word-8349-3082-3061.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "2267bfd765057b0d592b7add5a267be1f64bf4cd7373eca14aa39ff4f66e6e30"
  },
  {
    "kind": "synthesized",
    "itemId": "word:ざっ草",
    "reading": "ざっそう",
    "file": "word-3056-3063-8349.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "50bf36b42d1dc96423a8a9e5dab4a5ffa41e2bf35ac4b1ecf9fc524b102258c4"
  },
  {
    "kind": "synthesized",
    "itemId": "word:小石",
    "reading": "こいし",
    "file": "word-5c0f-77f3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "830bc46aa2fe4842d1cea4769aedda1e97cbee8410a8823d27d9fff21a8f91e1"
  },
  {
    "kind": "synthesized",
    "itemId": "word:貝がら",
    "reading": "かいがら",
    "file": "word-8c9d-304c-3089.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "270e2d9cfa03356519e5a5a004ddac79c797822bff34517b62b75a0b460752cc"
  },
  {
    "kind": "synthesized",
    "itemId": "word:まき貝",
    "reading": "まきがい",
    "file": "word-307e-304d-8c9d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "1190f7bee7c88f229ad39992ea0783ea60dd467338aed53a0ba053155bc9081a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:ほら貝",
    "reading": "ほらがい",
    "file": "word-307b-3089-8c9d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "b1220d8e77195fbd268669a7447fb466e77494ef6315c7f4d4015bfdf1e70aae"
  },
  {
    "kind": "synthesized",
    "itemId": "word:すず虫",
    "reading": "すずむし",
    "file": "word-3059-305a-866b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "1a7f6e9c6b64a08256edfa1c3747db99d109b3c51ebd532e91f604248fc8dc53"
  },
  {
    "kind": "synthesized",
    "itemId": "word:こん虫",
    "reading": "こんちゅう",
    "file": "word-3053-3093-866b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "db9fb29c2d0118d7f904fcb1ccb9230051128acc70460347f553109478c7762d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:虫かご",
    "reading": "むしかご",
    "file": "word-866b-304b-3054.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c81d106b39a9e76459d40dc4b46e1bd27ee8748e62536d0d0dc0333bc265d30f"
  },
  {
    "kind": "synthesized",
    "itemId": "word:名犬",
    "reading": "めいけん",
    "file": "word-540d-72ac.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "67bd2fba8768e84a5a8a9febbe3373869d064fe95db163290bf871a2bd0f9012"
  },
  {
    "kind": "synthesized",
    "itemId": "word:白い犬",
    "reading": "しろいいぬ",
    "file": "word-767d-3044-72ac.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c4a501aced7e040af94b969768082d8f409f779a862778ef9e82f9ffe98db845"
  },
  {
    "kind": "synthesized",
    "itemId": "word:犬ぞり",
    "reading": "いぬぞり",
    "file": "word-72ac-305e-308a.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8d83d6a8e1d6ea89c754a8e38045bdef12302fdf3bc3ee8c68aca11c3de3fa18"
  },
  {
    "kind": "synthesized",
    "itemId": "word:雨天",
    "reading": "うてん",
    "file": "word-96e8-5929.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "af6913f4fc52fc7f9ff7f2009808b622781af45308149b3608a8ac3d96ac3c40"
  },
  {
    "kind": "synthesized",
    "itemId": "word:雨ふり",
    "reading": "あめふり",
    "file": "word-96e8-3075-308a.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "d69201631c49326ad920eb7a10c24906bb059f93a26e3fefb927803a162c8f66"
  },
  {
    "kind": "synthesized",
    "itemId": "word:雨ぐも",
    "reading": "あまぐも",
    "file": "word-96e8-3050-3082.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "dc40dd84222e6da931c210427fa4d6f0a0ad5bfc78f3f4f28bc3fded710e85a6"
  },
  {
    "kind": "synthesized",
    "itemId": "word:夕日",
    "reading": "ゆうひ",
    "file": "word-5915-65e5.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "cad5797694b8efa5268555edfbd5d797f497c11c44edc7fc6587563c48f380c0"
  },
  {
    "kind": "synthesized",
    "itemId": "word:夕がた",
    "reading": "ゆうがた",
    "file": "word-5915-304c-305f.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "878ea701263db2f286e6fd065a3c1409aa781b632ed7cbb90715d13027f0ddd3"
  },
  {
    "kind": "synthesized",
    "itemId": "word:夕ぐれ",
    "reading": "ゆうぐれ",
    "file": "word-5915-3050-308c.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "5db3ca05c8a56ba88ff4e3243918e7fc732401c8caa758ea118f36be983631e0"
  },
  {
    "kind": "synthesized",
    "itemId": "word:赤い車",
    "reading": "あかいくるま",
    "file": "word-8d64-3044-8eca.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "40cd2308f524c2952735983693a14a6af35799258e161927fc53b64a7f469d76"
  },
  {
    "kind": "synthesized",
    "itemId": "word:赤はん",
    "reading": "せきはん",
    "file": "word-8d64-306f-3093.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "12fed0eae06959d4653a59d1eb04edf4025c438302f1f6d0c84079292de104d9"
  },
  {
    "kind": "synthesized",
    "itemId": "word:木の上",
    "reading": "きのうえ",
    "file": "word-304d-306e-4e0a.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "f376bb8b355e092a2d76f948c274b062f4be4a34b912eecc89d9c4f73b56ecf5"
  },
  {
    "kind": "synthesized",
    "itemId": "word:上ぎ",
    "reading": "うわぎ",
    "file": "word-4e0a-304e.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "3029fd03aed6b83a41d4396b01d22d659eab012832b2ed392c0076c2dddb2c33"
  },
  {
    "kind": "synthesized",
    "itemId": "word:木の下",
    "reading": "きのした",
    "file": "word-6728-306e-4e0b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "6d632fc90b2b0ae40c455843b4a43f014be72b3c6c6a6c0db2b180cbf9d2c59a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:下校",
    "reading": "げこう",
    "file": "word-4e0b-6821.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "6f2fb12d461fa1d626f4094c7a4d455585e543f2483ea3427d6ecbc6e458a379"
  },
  {
    "kind": "synthesized",
    "itemId": "word:力もち",
    "reading": "ちからもち",
    "file": "word-529b-3082-3061.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "06faabfa302b074128c2f2c86663500163f90fdc4eb6644d1f730ca4514f2079"
  },
  {
    "kind": "synthesized",
    "itemId": "word:学力",
    "reading": "がくりょく",
    "file": "word-5b66-529b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "4ea9f0db7f7b65b27ea94fd49003397a62750329f7fe8dab8914ded05662dd0b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:かい力",
    "reading": "かいりき",
    "file": "word-304b-3044-529b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "15b142dcdf7a35e1a8ee7c29d277c01c4da516c3ff00326ef54443d9406b4d25"
  },
  {
    "kind": "synthesized",
    "itemId": "word:一足",
    "reading": "いっそく",
    "file": "word-4e00-8db3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "2d158e86e786c8852835249d4901bab874cbc124fa908fd20db85bf8fedf4313"
  },
  {
    "kind": "synthesized",
    "itemId": "word:耳たぶ",
    "reading": "みみたぶ",
    "file": "word-8033-305f-3076.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "1b6395270c41cdbb2a87461b556cf57cd42d7649b23fa6d62ae9df7ed4c555ce"
  },
  {
    "kind": "synthesized",
    "itemId": "word:目と耳",
    "reading": "めとみみ",
    "file": "word-76ee-3068-8033.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "63f5d01c908c5828456ed9119241bd707834d1759dbe04f672dafdea73fe9a6b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:音ぷ",
    "reading": "おんぷ",
    "file": "word-97f3-3077.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "c63a95258d8e52490d7ce936ffbff3bf11c84067d0fefd481ae94be174dfea34"
  },
  {
    "kind": "synthesized",
    "itemId": "word:雨の音",
    "reading": "あめのおと",
    "file": "word-96e8-306e-97f3.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "78cb6b1b3352e0b761595a7ffa49096fe71f7acd9070321600d9be0a7142d3d7"
  },
  {
    "kind": "synthesized",
    "itemId": "word:音色",
    "reading": "ねいろ",
    "file": "word-97f3-3044-308d.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "d97a4847cbaf068645636cf930a46aabba7d4df6681317da45e92dc37ee3bc0d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:てん字",
    "reading": "てんじ",
    "file": "word-3066-3093-5b57.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "bf126e11bb8649a3650cacf34124bca22c6203b2288ef30908bec8921c16349a"
  },
  {
    "kind": "synthesized",
    "itemId": "word:文なし",
    "reading": "もんなし",
    "file": "word-6587-306a-3057.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "05d0d229b114e79be100f5aedd93a7f94beaf2db2e4201ce7b6394075bdb5039"
  },
  {
    "kind": "synthesized",
    "itemId": "word:校庭",
    "reading": "こうてい",
    "file": "word-6821-3066-3044.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "b9c850a327c05282f85a5aaf36714e80b7eb257dd54b0099fb6865360b95acbe"
  },
  {
    "kind": "synthesized",
    "itemId": "word:てん校",
    "reading": "てんこう",
    "file": "word-3066-3093-6821.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "6e64aea6be42fb9742f5b783478a55101ef49232482b6347c4a1ab5955b3fdbc"
  },
  {
    "kind": "synthesized",
    "itemId": "word:先とう",
    "reading": "せんとう",
    "file": "word-5148-3068-3046.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "07909c36c36a9f9adbc4b1591024387c7aed9af635d746c056bd3646bfb8030d"
  },
  {
    "kind": "synthesized",
    "itemId": "word:足の先",
    "reading": "あしのさき",
    "file": "word-8db3-306e-5148.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "fdc7ad6fd2e34f8c2f8d75dac738e21ba709a0f36482bfda06e8fe8d219df4bd"
  },
  {
    "kind": "synthesized",
    "itemId": "word:生もの",
    "reading": "なまもの",
    "file": "word-751f-3082-306e.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "fce74c0316b224d1afb16b933cd141730af43743dbbeb46a1a2804ffe0a5037b"
  },
  {
    "kind": "synthesized",
    "itemId": "word:玉虫",
    "reading": "たまむし",
    "file": "word-7389-866b.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "8ba8ebc31b4cab16b334c88f10a3efa8700784bcbda98016572c0a3609214ea3"
  },
  {
    "kind": "synthesized",
    "itemId": "word:百円玉",
    "reading": "ひゃくえんだま",
    "file": "word-767e-5186-7389.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "2dd355bc58c0a18f456ba8ef73a2a4430649f9b7f6abb3398dfbdfcd1c395d5c"
  },
  {
    "kind": "synthesized",
    "itemId": "word:玉手ばこ",
    "reading": "たまてばこ",
    "file": "word-7389-624b-3070-3053.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "d55194e382678da760bea82f785e3007b0bc949dd09e03edaa13cf3a7c0b98b8"
  },
  {
    "kind": "synthesized",
    "itemId": "word:白い糸",
    "reading": "しろいいと",
    "file": "word-767d-3044-7cf8.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "7c83ca0a70fdd669a77f9d51fcc15fab33ae245c1316fb0678ffdd0793d2ff06"
  },
  {
    "kind": "synthesized",
    "itemId": "word:赤い糸",
    "reading": "あかいいと",
    "file": "word-8d64-3044-7cf8.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "72505d07bd9065f52536c38151398d74f31bf025b5445fcc8c8586dfe53ad517"
  },
  {
    "kind": "synthesized",
    "itemId": "word:きぬ糸",
    "reading": "きぬいと",
    "file": "word-304d-306c-7cf8.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "cd933413321e43cf2cf05a98f516d02d16365d6cc6e1a8e76651af1cc0bce060"
  },
  {
    "kind": "synthesized",
    "itemId": "word:青い車",
    "reading": "あおいくるま",
    "file": "word-9752-3044-8eca.wav",
    "sourceUrl": "https://voicevox.hiroshiba.jp/nemo/",
    "sha256": "0930427fb8930f1d63e55e0c67a719c3a4d4b9ec11272c9ff261bf65a5b4ab62"
  }
] as const satisfies readonly Pronunciation[];

const byItemId = new Map<string, Pronunciation>(pronunciations.map((clip) => [clip.itemId, clip]));

/** Keep the written form AND reading aligned, including words with multiple readings. */
export function getPronunciation(item: VocabularyStudyItem): Pronunciation | undefined {
  const clip = byItemId.get(item.id);
  return clip?.reading === item.reading ? clip : undefined;
}
