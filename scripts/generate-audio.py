#!/usr/bin/env python3
"""Genera el audio de las palabras y de las frases con AivisSpeech (voz morioki).

    python3 -m pip install lameenc   # una vez
    npm run audio                    # solo lo nuevo o cambiado
    npm run audio -- --all           # todo

Escribe un MP3 por palabra del vocabulario (public/collection.json) en public/audio/words/,
uno por frase de los kanji (public/content/kanji-sentences.json) en public/audio/sentences/
uno por frase de los contadores (la columna «Frase» de public/content/counters.json) en
public/audio/counters/, uno por cada una de las cuatro formas de los verbos
(public/content/verbs.json) en public/audio/verbs/ y uno por cada ejemplo de los adjetivos
y los adverbios (public/content/modifiers.json) en public/audio/modifiers/, cada carpeta con
su registro en generation.json. El nombre de una
palabra sale de sus caracteres (4e00-3064.mp3 es 一つ); el de una frase de un kanji, del
kanji y de su posición (4e00-s1.mp3 es la primera sencilla de 一), y el de una frase de un
contador, del contador y del número (hon-3.mp3 es la de 三本; hon-q.mp3, la de la pregunta),
y el de un verbo o un adjetivo, de su id y de la forma (verb-okimasu-past-negative.mp3 es
起きませんでした), o de su posición si no tiene forma (adverb-totemo-1.mp3),
igual que en src/lib/audio.ts: si cambias uno, cambia el otro.

El motor (AivisSpeech Engine) y la voz (el modelo morioki, de AivisHub) se descargan de
versiones fijas, se comprueba su SHA-256 y se guardan en tmp/aivisspeech/, que Git ignora.
El motor se arranca con una carpeta de usuario propia (HOME), donde guarda sus modelos y
el diccionario de usuario, así que no toca ninguna instalación de AivisSpeech. La primera
vez descarga además su modelo BERT y sus voces por defecto (algo más de 1 GB).

La síntesis no es determinista: el mismo texto da cada vez un audio algo distinto. Por
eso solo se regeneran las palabras y frases nuevas, las cambiadas y las que el motor
leería de otra forma (por ejemplo, tras cambiar el diccionario); --all lo rehace todo y
cambia todos los MP3.

Antes de sintetizar, el script comprueba que lo que leería el motor coincide con la
lectura en kana de cada palabra y cada frase. Si no coincide, no escribe nada y las
lista: corrígelas con una palabra del diccionario (DICTIONARY), una escritura estándar
(WORD_SPELLINGS, solo para palabras) o una sustitución (REPLACEMENTS, solo para frases).
El motor respeta el acento del diccionario, pero la comprobación no lo ve: revísalo al
añadir palabras.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import platform
import shutil
import signal
import socket
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import uuid
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COLLECTION = ROOT / 'public/collection.json'
SENTENCES = ROOT / 'public/content/kanji-sentences.json'
COUNTERS = ROOT / 'public/content/counters.json'
VERBS = ROOT / 'public/content/verbs.json'
MODIFIERS = ROOT / 'public/content/modifiers.json'
AUDIO = ROOT / 'public/audio'
WORK = ROOT / 'tmp/aivisspeech'

ENGINE_VERSION = '1.2.0'
ENGINE_URL = f'https://github.com/Aivis-Project/AivisSpeech-Engine/releases/download/{ENGINE_VERSION}/AivisSpeech-Engine-macOS-arm64-{ENGINE_VERSION}.7z.001'
ENGINE_SHA256 = '581a7f34afb2c5343ff8b27d6d88859083375868607657de95fad506939185df'
# The voice: the morioki model of AivisHub, under the Aivis Common Model License (ACML) 1.0.
MODEL_UUID = 'baaae3c0-7b22-4605-8ba5-80c959b41a48'
MODEL_VERSION = '1.0.0'
MODEL_URL = f'https://api.aivis-project.com/v1/aivm-models/{MODEL_UUID}/download?model_type=AIVMX'
MODEL_SHA256 = '352858a737b23fe0bd0b7bd73a4956be262aad9bb24a7bf0d1eae9a71a466469'
MODEL_PAGE = f'https://hub.aivis-project.com/aivm-models/{MODEL_UUID}'
LICENSE = 'ACML 1.0'
VOICE = 'morioki'
STYLE = 'ノーマル'
SPEAKER = 497929760
# At 1.0 morioki speaks about 12 % faster than the previous voice (VOICEVOX Nemo 女声1);
# this keeps its pace, which suits the level of the class.
SPEED = 0.89
# 24 kHz like the previous voice; at 32 kbps LAME takes it to 22.05 kHz.
SAMPLE_RATE = 24000
# MPEG-2 Layer III: about 11 KB per sentence.
BITRATE = 32

# Text the engine receives instead of the written sentence, where its dictionary
# cannot be steered. Each one keeps the reading of the sentence.
REPLACEMENTS = [
    {'from': '描き', 'to': '書き',
     'reason': 'La lectura es かきます; el motor lee えがきます. 書きます suena igual, con el mismo acento.'},
    {'from': 'かれは', 'to': '彼は',
     'reason': 'En hiragana, el motor lee かれは como 枯れ葉 («kareha»). 彼は suena igual, con el acento [1] de かれの.'},
    {'from': 'わたしは えが', 'to': 'わたしは 絵が',
     'reason': 'En hiragana, el motor une は y え en はえ (蝿). 絵が suena igual.'},
    {'from': 'ちちは うたが', 'to': 'ちちは 歌が',
     'reason': 'En hiragana, el motor une は y うた: ちち / はうたが. 歌が suena igual; ははは うたが ya lo lee bien.'},
    {'from': '先月は えを', 'to': '先月は 絵を',
     'reason': 'En hiragana, el motor une は y え en はえ (蝿). 絵を suena igual.'},
    {'from': 'は えいご', 'to': 'は 英語',
     'reason': 'Tras は, el motor une は y え (はえ, mosca): わたしはえ / いごの. 英語 suena igual.'},
    {'from': 'かしま', 'to': '貸しま',
     'reason': 'El motor agrupa にさつか / しました. 貸しました suena igual; en las cuatro formas del verbo, para que suenen igual.'},
    {'from': '先しゅう', 'to': '先週',
     'reason': 'El motor lee 先 como さき (さきしゅう). 先週 suena igual: せんしゅう.'},
    {'from': ' いしゃ', 'to': ' 医者',
     'reason': 'Tras は, el motor oye はいしゃ (歯医者). 医者 suena igual; una palabra いしゃ en el diccionario partiría かいしゃ.'},
    {'from': '下で', 'to': 'したで',
     'reason': 'El motor lee 下で como もとで. したで suena igual; una palabra 下 en el diccionario estropearía 川下, 下校 y 下手.'},
    {'from': '今しゅう', 'to': '今週',
     'reason': 'El motor lee 今 como いま (いま しゅう). 今週 suena igual: こんしゅう.'},
    {'from': '十まで', 'to': 'とおまで',
     'reason': 'Contando con つ, diez es とお; el motor dice じゅうまで.'},
    {'from': 'かいしゃいんが', 'to': '会社員が',
     'reason': 'El motor parte かいしゃいん en かい y しゃいん. 会社員 suena igual; en かいしゃいんです ya acierta.'},
    {'from': 'かいしゃいんは', 'to': '会社員は', 'reason': 'Como en かいしゃいんが: el motor agrupa その かい / しゃいんは.'},
    # Words in hiragana that the engine cuts in the wrong place, although the moras are right.
    {'from': 'きのう まんがを', 'to': '昨日 まんがを', 'reason': 'El motor agrupa きの / うまんがを. 昨日 suena igual.'},
    {'from': 'にわに カラス', 'to': '庭に カラス', 'reason': 'Tras まいあさ, el motor oye に わに (cocodrilo). 庭に suena igual.'},
    {'from': 'どうぶつえん', 'to': '動物園', 'reason': 'El motor agrupa どう / ぶつえん. 動物園 suena igual, con su acento [4].'},
    {'from': 'あさ 五時', 'to': '朝 五時', 'reason': 'El motor agrupa あ / さごじに. 朝 suena igual.'},
    {'from': 'あさの ぎゅうにゅう', 'to': '朝の ぎゅうにゅう', 'reason': 'El motor agrupa あ / さの. 朝 suena igual.'},
    {'from': 'えきの 人', 'to': '駅の 人', 'reason': 'El motor agrupa え / きのひとは. 駅 suena igual.'},
    {'from': '一時 九分', 'to': '一時 きゅうふん',
     'reason': 'El motor agrupa いち / じきゅうふん, también con cifras; así, いちじ / きゅうふん, aunque sin la caída de キュ\'ウフン.'},
    # A numeral in figures takes the engine's own rules for counters (sound changes and accent), which it skips
    # with some kanji numerals. Only in these sentences: 三分の一, for example, is さんぶんのいち.
    {'from': '八本', 'to': '8本', 'reason': 'El motor dice はちほん; con la cifra, はっぽん.'},
    {'from': '四足', 'to': '4足', 'reason': 'El motor dice しそく; con la cifra, よんそく.'},
    {'from': '十月 十日', 'to': '10月 10日',
     'reason': 'El motor une los bloques en 十月十日 (とつきとおか); con cifras, じゅうがつ とおか.'},
    {'from': '二月 十四日', 'to': '二月 14日',
     'reason': 'El motor dice とよひ; con la cifra, じゅうよっか. Solo aquí: 二十四日 ya lo lee bien.'},
    {'from': '三十日', 'to': '30日', 'reason': 'El motor dice みそか; con la cifra, さんじゅうにち.'},
    {'from': '十時 六分', 'to': 'じゅうじ 6分',
     'reason': 'El motor dice ととき ろくぶ; con 10時 6分 agrupa じゅう / じろっぷん, y así, じゅうじ / ろっぷん.'},
    {'from': '十時', 'to': '10時', 'reason': 'El motor dice ととき; con la cifra, じゅうじ.'},
    {'from': '二分 休み', 'to': '2分 休み', 'reason': 'El motor dice にぶん (la mitad); con la cifra, にふん.'},
    {'from': '三分です', 'to': '3分です', 'reason': 'El motor dice さんぶ; con la cifra, さんぷん.'},
    {'from': '五分です', 'to': '5分です', 'reason': 'El motor dice ごぶ; con la cifra, ごふん.'},
    {'from': '八分の', 'to': '8分の', 'reason': 'El motor dice はちぶ; con la cifra, はっぷん.'},
]

# User-dictionary words: how the engine reads a spelling of the words and the sentences. The
# accent is the number of the mora where the pitch falls (0: no fall). A word of the vocabulary
# with an entry here is spoken from its own spelling, so it sounds the same alone and in a sentence.
DICTIONARY = [
    {'surface': '日本', 'pronunciation': 'ニホン', 'accentType': 2, 'wordType': 'PROPER_NOUN',
     'reason': 'Se enseña «nihon», con acento [2]; la palabra evita «nippon».'},
    {'surface': '日本人', 'pronunciation': 'ニホンジン', 'accentType': 4, 'wordType': 'PROPER_NOUN',
     'reason': 'Acento de 日本人 [4] (ニホンジ\'ン); el motor dice ニホ\'ンジン.'},
    {'surface': '七色', 'pronunciation': 'ナナイロ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee なないろ, con acento [2] (ナナ\'イロ); el motor dice ななしょく.'},
    {'surface': '竹林', 'pronunciation': 'タケバヤシ', 'accentType': 4, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee たけばやし; el motor dice ちくりん.'},
    {'surface': 'まつ林', 'pronunciation': 'マツバヤシ', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [3] de 松林; el motor dice まつりん.'},
    {'surface': '空ばこ', 'pronunciation': 'カラバコ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee からばこ, con acento [2] (カラ\'バコ); el motor dice そらばこ.'},
    {'surface': '土き', 'pronunciation': 'ドキ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [1] de 土器; el motor dice つちき.'},
    {'surface': 'まき貝', 'pronunciation': 'マキガイ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [2] de 巻貝; el motor dice まきかい.'},
    {'surface': 'ほら貝', 'pronunciation': 'ホラガイ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [2] de 法螺貝; el motor dice ほらかい.'},
    {'surface': 'こん虫', 'pronunciation': 'コンチュウ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 昆虫, sin caída; el motor dice こんむし.'},
    {'surface': '先とう', 'pronunciation': 'セントウ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 先頭, sin caída; el motor dice さきだとう.'},
    {'surface': '文なし', 'pronunciation': 'モンナシ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 文無し, sin caída; el motor dice ぶんなし.'},
    {'surface': '上ぎ', 'pronunciation': 'ウワギ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 上着, sin caída; el motor dice うえぎ.'},
    {'surface': '赤はん', 'pronunciation': 'セキハン', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [3] de 赤飯; el motor dice あかはん.'},
    {'surface': '雨ぐも', 'pronunciation': 'アマグモ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 雨雲, sin caída; el motor dice あめぐも.'},
    {'surface': 'ほう石', 'pronunciation': 'ホウセキ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 宝石 en el diccionario del motor; el motor dice ほういし.'},
    {'surface': 'でん車', 'pronunciation': 'デンシャ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 電車 en el diccionario del motor; el motor dice でんくるま.'},
    {'surface': '車りん', 'pronunciation': 'シャリン', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 車輪 en el diccionario del motor; el motor dice くるまりん.'},
    {'surface': '正かい', 'pronunciation': 'セイカイ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 正解 en el diccionario del motor; el motor dice ただしかい.'},
    {'surface': '正じき', 'pronunciation': 'ショウジキ', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 正直 en el diccionario del motor; el motor dice せいじき.'},
    {'surface': 'らい月', 'pronunciation': 'ライゲツ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 来月 en el diccionario del motor; el motor dice らいつき.'},
    {'surface': '白板', 'pronunciation': 'ハクバン', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee はくばん; el motor dice しらいた.'},
    {'surface': '目と口', 'pronunciation': 'メトクチ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Ante は, el motor lee もくとこう.'},
    {'surface': 'はは', 'pronunciation': 'ハハ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'En hiragana, el motor lee las dos は como partículas: «wa wa».'},
    {'surface': '草はら', 'pronunciation': 'クサハラ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 草原 (くさはら), sin caída; el motor dice くさわら.'},
    {'surface': '年より', 'pronunciation': 'トシヨリ', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [3] de 年寄り; el motor dice ねんより.'},
    {'surface': '三歳', 'pronunciation': 'サンサイ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [1] (サ\'ンサイ), como en いっさい o にさい; el motor dice みとせ.'},
    {'surface': '十本', 'pronunciation': 'ジュッポン', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 十本 en el diccionario del motor [1], con la lectura じゅっぽん de la colección; el motor dice じっぽん.'},
    {'surface': '靴', 'pronunciation': 'クツ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 靴 en el diccionario del motor; tras きれいな, el motor dice ぐつ.'},
    {'surface': '千年', 'pronunciation': 'センネン', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee せんねん; el motor dice ちとせ. Con el número, el motor pone el acento [1] (セ\'ンネン) aunque se le pida otro.'},
    {'surface': '靴下', 'pronunciation': 'クツシタ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'La palabra 靴 de este diccionario partía 靴下 (くつか). Acento [2], el del diccionario del motor.'},
    {'surface': '七人', 'pronunciation': 'ナナニン', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Los contadores lo leen ななにん, con acento [2] (ナナ\'ニン); el motor dice しちにん.'},
    {'surface': '三羽', 'pronunciation': 'サンバ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Los contadores lo leen さんば; el motor dice さんわ. Acento [1], el que da a さんわ.'},
    {'surface': '十羽', 'pronunciation': 'ジュッパ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Los contadores lo leen じゅっぱ; el motor dice じゅうわ. Acento [1], el que da a じゅうわ.'},
    {'surface': '何羽', 'pronunciation': 'ナンバ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Los contadores lo leen なんば; el motor dice なんわ. Acento [1], el que da a なんわ.'},
    {'surface': '何足', 'pronunciation': 'ナンゾク', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Los contadores lo leen なんぞく; el motor dice なんそく. Acento [1], el que da a なんそく.'},
    {'surface': 'まあまあ', 'pronunciation': 'マアマア', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'El motor dice まあ / まあ, en dos grupos; así es una palabra, con acento [1] (マ\'アマア).'},
]

# What the engine receives for a word of the vocabulary written partly in kana: the standard
# spelling, so that it reads the word alone with its reading and the accent of its dictionary.
# They are the spellings of the previous audio (the recordings of Tofugu and WaniKani and the
# VOICEVOX voice), matched to the same word and reading. Words with an entry in DICTIONARY
# do not need one.
WORD_SPELLINGS = {
    '一ぴき': '一匹', 'まん月': '満月', '火じ': '火事', 'ちょ金': '貯金', '天ごく': '天国', '気もち': '気持ち', 'げん気': '元気', '大すき': '大好き',
    '大へん': '大変', '左がわ': '左側', '右がわ': '右側', '円ばん': '円盤', '目てき': '目的', '子ども': '子供', '人ごみ': '人込み', '人げん': '人間',
    '本だな': '本棚', '本とう': '本当', '水どう': '水道', '花だん': '花壇', 'じ石': '磁石', '口ぶえ': '口笛', '口べに': '口紅', '手くび': '手首',
    'はく手': '拍手', '足あと': '足跡', '足くび': '足首', '耳うち': '耳打ち', '出ぱつ': '出発', 'かん字': '漢字', 'すう字': '数字', 'さく文': '作文',
    '王さま': '王様', '王かん': '王冠', 'こく王': '国王', '五わ': '五羽', '火のこ': '火の粉', '木かげ': '木陰', '山いも': '山芋', '田うえ': '田植え',
    '白ぐみ': '白組', '円けい': '円形', 'き立': '起立', 'え本': '絵本', '町なみ': '町並み', '竹うま': '竹馬', '竹やぶ': '竹藪', '竹わ': '竹輪',
    '花たば': '花束', '草もち': '草餅', 'ざっ草': '雑草', '貝がら': '貝殻', 'すず虫': '鈴虫', '虫かご': '虫籠', '雨ふり': '雨降り', '夕がた': '夕方',
    '夕ぐれ': '夕暮れ', '力もち': '力持ち', 'かい力': '怪力', '音ぷ': '音符', 'てん字': '点字', 'てん校': '転校', '玉手ばこ': '玉手箱',
    'きぬ糸': '絹糸',
}


def word_file(written: str) -> str:
    """Same rule as wordAudioFile() in src/lib/audio.ts."""
    return '-'.join(f'{ord(character):x}' for character in written) + '.mp3'


def sentence_file(kanji: str, group: str, index: int) -> str:
    """Same rule as sentenceAudioFile() in src/lib/audio.ts."""
    return f"{ord(kanji):x}-{'s' if group == 'simple' else 'a'}{index + 1}.mp3"


def counter_file(counter: str, value: int | str) -> str:
    """Same rule as counterSentenceAudioFile() in src/lib/audio.ts."""
    return f"{counter}-{'q' if value == 'question' else value}.mp3"


def example_file(entry: str, example: dict, index: int) -> str:
    """Same rule as exampleAudioFile() in src/lib/audio.ts."""
    return f"{entry}-{example.get('form') or index + 1}.mp3"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# --- Reading check -----------------------------------------------------------------

ROWS = {
    'a': 'アカサタナハマヤラワガザダバパァャ', 'i': 'イキシチニヒミリギジヂビピィ',
    'u': 'ウクスツヌフムユルグズヅブプゥュ', 'e': 'エケセテネヘメレゲゼデベペェ',
    'o': 'オコソトノホモヨロヲゴゾドボポォョ',
}
VOWEL_OF = {kana: vowel for vowel, row in ROWS.items() for kana in row}
VOWEL_KANA = {'a': 'ア', 'i': 'イ', 'u': 'ウ', 'e': 'エ', 'o': 'オ'}
PUNCTUATION = set('。、？！?!「」')


def katakana(text: str) -> str:
    return ''.join(chr(ord(c) + 0x60) if 'ぁ' <= c <= 'ゖ' else c for c in text)


def sounds(text: str) -> str:
    """Kana as spoken: long vowels written out, ぢ/づ as じ/ず."""
    out: list[str] = []
    for c in katakana(text).replace('ヂ', 'ジ').replace('ヅ', 'ズ'):
        previous = VOWEL_OF.get(out[-1]) if out else None
        if c == 'ー' and previous:
            c = VOWEL_KANA[previous]
        elif c == 'ウ' and previous == 'o':
            c = 'オ'
        elif c == 'イ' and previous == 'e':
            c = 'エ'
        out.append(c)
    return ''.join(out)


def expected_sounds(reading: str) -> str:
    """The reading of a sentence as spoken: blocks end in their particle, so a final は or へ is wa or e, and so is
    the へ of へも and へは (どこへも)."""
    blocks = []
    for block in reading.split():
        core = ''.join(c for c in block if c not in PUNCTUATION)
        if core.endswith(('へも', 'へは')):
            core = core[:-2] + 'え' + core[-1]
        if core.endswith('は'):
            core = core[:-1] + 'わ'
        elif core.endswith('へ'):
            core = core[:-1] + 'え'
        blocks.append(core.replace('を', 'お'))
    return sounds(''.join(blocks))


def spoken_moras(phrase: dict) -> list[str]:
    """The moras of an accent phrase, without the pause moras AivisSpeech gives to punctuation."""
    return [mora['text'] for mora in phrase['moras'] if mora['vowel'] != 'pau']


def spoken_sounds(query: dict) -> str:
    return sounds(''.join(''.join(spoken_moras(phrase)) for phrase in query['accent_phrases']))


def spoken_kana(query: dict) -> str:
    """What the engine will say, with its accent: ' after the mora where the pitch falls, / between accent phrases."""
    return '/'.join(
        ''.join(mora + ("'" if place == phrase['accent'] else '') for place, mora in enumerate(spoken_moras(phrase), 1))
        for phrase in query['accent_phrases'])


def source_text(written: str) -> str:
    for replacement in REPLACEMENTS:
        written = written.replace(replacement['from'], replacement['to'])
    return written


def word_text(written: str) -> str:
    if any(word['surface'] == written for word in DICTIONARY):
        return written
    return WORD_SPELLINGS.get(written, written)


# --- What to generate --------------------------------------------------------------

def words() -> list[dict]:
    collection = json.loads(COLLECTION.read_text(encoding='utf-8'))
    return [{'file': word_file(word['written']), 'written': word['written'], 'reading': word['reading'],
             'text': word_text(word['written']), 'expected': sounds(word['reading'])}
            for word in collection['vocabulary']]


def sentences() -> list[dict]:
    document = json.loads(SENTENCES.read_text(encoding='utf-8'))
    return [{'file': sentence_file(entry['kanji'], group, index), 'written': sentence['written'],
             'reading': sentence['reading'], 'text': source_text(sentence['written']),
             'expected': expected_sounds(sentence['reading'])}
            for entry in document['entries'] for group in ('simple', 'advanced')
            for index, sentence in enumerate(entry[group])]


def counter_sentences() -> list[dict]:
    """Only the sentences of the counters, the last column of their tables: their examples have no audio."""
    document = json.loads(COUNTERS.read_text(encoding='utf-8'))
    return [{'file': counter_file(entry['id'], value), 'written': sentence['written'],
             'reading': sentence['reading'], 'text': source_text(sentence['written']),
             'expected': expected_sounds(sentence['reading'])}
            for entry in document['entries']
            for value, sentence in [*((form['value'], form['sentence']) for form in entry['forms']),
                                    ('question', entry['question']['sentence'])]]


def lexicon_sentences(path: Path) -> list[dict]:
    """The examples of a lexicon section: the four forms of a verb or an adjective, or the examples of an adverb."""
    document = json.loads(path.read_text(encoding='utf-8'))
    return [{'file': example_file(entry['id'], example, index), 'written': example['written'],
             'reading': example['reading'], 'text': source_text(example['written']),
             'expected': expected_sounds(example['reading'])}
            for entry in document['entries'] for index, example in enumerate(entry.get('examples', []))]


KINDS = {'words': words, 'sentences': sentences, 'counters': counter_sentences,
         'verbs': lambda: lexicon_sentences(VERBS), 'modifiers': lambda: lexicon_sentences(MODIFIERS)}
LABELS = {'words': 'las palabras', 'sentences': 'las frases de los kanji', 'counters': 'las frases de los contadores',
          'verbs': 'las frases de los verbos', 'modifiers': 'las frases de los adjetivos y los adverbios'}


# --- Engine and voice ----------------------------------------------------------------

def download(url: str, target: Path, digest: str, what: str) -> None:
    """Downloads once into tmp/ and checks the SHA-256 every time."""
    if not target.exists():
        print(f'Descargando {what}…')
        target.parent.mkdir(parents=True, exist_ok=True)
        partial = target.with_name(target.name + '.part')
        with urllib.request.urlopen(url) as response, partial.open('wb') as output:
            shutil.copyfileobj(response, output)
        partial.rename(target)
    actual = hashlib.sha256()
    with target.open('rb') as data:
        for chunk in iter(lambda: data.read(1 << 20), b''):
            actual.update(chunk)
    if actual.hexdigest() != digest:
        target.unlink()
        sys.exit(f'El SHA-256 de {target.name} no coincide; se ha borrado. Vuelve a ejecutar el script.')


def engine_executable() -> Path:
    if platform.system() != 'Darwin' or platform.machine() != 'arm64':
        sys.exit('El motor fijado es el de macOS con Apple Silicon. En otro sistema, cambia ENGINE_URL y ENGINE_SHA256.')
    target = WORK / f'engine-{ENGINE_VERSION}'
    run = target / 'macOS-arm64' / 'run'
    if run.exists():
        return run
    archive = WORK / Path(urllib.parse.urlparse(ENGINE_URL).path).name
    download(ENGINE_URL, archive, ENGINE_SHA256, f'AivisSpeech Engine {ENGINE_VERSION} (unos 200 MB)')
    partial = target.with_name(target.name + '.part')
    shutil.rmtree(partial, ignore_errors=True)
    partial.mkdir(parents=True)
    # A 7-Zip archive: the bsdtar that comes with macOS reads it and keeps permissions and links.
    subprocess.run(['bsdtar', '-xf', str(archive), '-C', str(partial)], check=True)
    partial.rename(target)
    return run


def voice_model() -> Path:
    path = WORK / 'models' / f'{VOICE}-{MODEL_VERSION}.aivmx'
    download(MODEL_URL, path, MODEL_SHA256, f'la voz {VOICE} {MODEL_VERSION} (unos 240 MB)')
    return path


class Engine:
    """A private engine: its own port and HOME, where it keeps its models and a user dictionary that starts empty."""

    def __enter__(self) -> 'Engine':
        run = engine_executable()
        model = voice_model()
        home = WORK / 'home'
        # Deleting words through the API leaves the last one loaded: the dictionary starts from no file instead.
        (home / 'Library/Application Support/AivisSpeech-Engine/user_dict.json').unlink(missing_ok=True)
        home.mkdir(parents=True, exist_ok=True)
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', 0))
            port = probe.getsockname()[1]
        self.base = f'http://127.0.0.1:{port}'
        self.log = (WORK / 'engine.log').open('wb')
        # Its own process group, so that stopping it also stops the processes it starts.
        self.process = subprocess.Popen(
            [str(run), '--host', '127.0.0.1', '--port', str(port), '--disable_sentry', '--output_log_utf8'],
            cwd=run.parent, env={**os.environ, 'HOME': str(home)}, stdout=self.log, stderr=subprocess.STDOUT,
            start_new_session=True)
        print('Arrancando el motor… La primera vez descarga su modelo BERT y sus voces por defecto (algo más de 1 GB).')
        for _ in range(1800):
            if self.process.poll() is not None:
                raise SystemExit(f'El motor se ha cerrado; mira {WORK / "engine.log"}.')
            try:
                version = json.loads(self.request('GET', '/version'))
                break
            except OSError:
                time.sleep(0.5)
        else:
            raise SystemExit('El motor no ha respondido en 15 minutos.')
        if version != ENGINE_VERSION:
            raise SystemExit(f'Versión inesperada del motor: {version}.')
        installed = json.loads(self.request('GET', '/aivm_models')).get(MODEL_UUID)
        if not installed or installed['manifest']['version'] != MODEL_VERSION:
            self.install(model)
        voices = {style['id']: (speaker['name'], style['name'])
                  for speaker in json.loads(self.request('GET', '/speakers')) for style in speaker['styles']}
        if voices.get(SPEAKER) != (VOICE, STYLE):
            raise SystemExit(f'El estilo {SPEAKER} no es {VOICE} ({STYLE}).')
        for word in DICTIONARY:
            self.request('POST', '/user_dict_word', surface=word['surface'], pronunciation=word['pronunciation'],
                         accent_type=word['accentType'], word_type=word['wordType'], priority=10)
        return self

    def __exit__(self, *_: object) -> None:
        os.killpg(self.process.pid, signal.SIGTERM)
        try:
            self.process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            os.killpg(self.process.pid, signal.SIGKILL)
        self.log.close()

    def request(self, method: str, path: str, body: bytes | None = None, headers: dict | None = None,
                **params: object) -> bytes:
        query = f'?{urllib.parse.urlencode(params)}' if params else ''
        headers = headers or ({'Content-Type': 'application/json'} if body else {})
        request = urllib.request.Request(self.base + path + query, data=body, method=method, headers=headers)
        with urllib.request.urlopen(request, timeout=600) as response:
            return response.read()

    def install(self, model: Path) -> None:
        print(f'Instalando la voz {VOICE} {MODEL_VERSION} en el motor…')
        boundary = uuid.uuid4().hex
        body = (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{model.name}"\r\n'
                'Content-Type: application/octet-stream\r\n\r\n').encode() + model.read_bytes() + f'\r\n--{boundary}--\r\n'.encode()
        self.request('POST', '/aivm_models/install', body, {'Content-Type': f'multipart/form-data; boundary={boundary}'})

    def query(self, text: str) -> dict:
        return json.loads(self.request('POST', '/audio_query', speaker=SPEAKER, text=text))

    def synthesize(self, query: dict) -> bytes:
        body = {**query, 'speedScale': SPEED, 'outputSamplingRate': SAMPLE_RATE, 'outputStereo': False}
        return self.request('POST', '/synthesis', json.dumps(body).encode(), speaker=SPEAKER)


def encode_mp3(wav: bytes) -> bytes:
    import lameenc
    with wave.open(io.BytesIO(wav)) as audio:
        pcm, rate, channels = audio.readframes(audio.getnframes()), audio.getframerate(), audio.getnchannels()
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(BITRATE)
    encoder.set_in_sample_rate(rate)
    encoder.set_channels(channels)
    encoder.set_quality(2)
    return encoder.encode(pcm) + encoder.flush()


# --- Main --------------------------------------------------------------------------

# What makes every file sound different. The other settings only change the words and
# sentences that use them, which their text and their spoken kana detect.
VOICE_SETTINGS = ('engine', 'engineVersion', 'engineSha256', 'voice', 'style', 'speaker', 'model',
                  'speedScale', 'sampleRate', 'encoder')


def settings() -> dict:
    import importlib.metadata
    return {
        'engine': 'AivisSpeech Engine', 'engineVersion': ENGINE_VERSION, 'engineSha256': ENGINE_SHA256,
        'voice': VOICE, 'style': STYLE, 'speaker': SPEAKER,
        'model': {'uuid': MODEL_UUID, 'version': MODEL_VERSION, 'sha256': MODEL_SHA256, 'license': LICENSE,
                  'url': MODEL_PAGE},
        'speedScale': SPEED, 'sampleRate': SAMPLE_RATE,
        'encoder': f'LAME (lameenc {importlib.metadata.version("lameenc")}), MP3 {BITRATE} kbps mono',
        'deterministic': False,
        'dictionary': DICTIONARY, 'wordSpellings': WORD_SPELLINGS, 'replacements': REPLACEMENTS,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--all', action='store_true', help='vuelve a sintetizar todas las palabras y frases')
    arguments = parser.parse_args()
    try:
        import lameenc  # noqa: F401
    except ImportError:
        sys.exit('Falta lameenc: python3 -m pip install lameenc')

    current = settings()
    plans = []
    for kind, items in KINDS.items():
        output = AUDIO / kind
        generation = output / 'generation.json'
        previous = json.loads(generation.read_text(encoding='utf-8')) if generation.exists() else {}
        old = {entry['file']: entry for entry in previous.get('entries', [])}

        def up_to_date(item: dict, old: dict = old, output: Path = output) -> bool:
            entry = old.get(item['file'])
            path = output / item['file']
            return bool(entry) and entry['written'] == item['written'] and entry['reading'] == item['reading'] \
                and entry['sourceText'] == item['text'] and path.exists() and sha256(path.read_bytes()) == entry['sha256']

        listed = items()
        expected = {item['file'] for item in listed}
        plans.append({
            'kind': kind, 'output': output, 'generation': generation, 'items': listed, 'old': old,
            'up_to_date': up_to_date,
            'same_settings': all(previous.get(key) == value for key, value in current.items()),
            'same_voice': all(previous.get(key) == current[key] for key in VOICE_SETTINGS),
            'orphans': [path for path in output.glob('*.mp3') if path.name not in expected],
        })
    if not arguments.all and all(plan['same_settings'] and not plan['orphans'] and all(map(plan['up_to_date'], plan['items']))
                                 for plan in plans):
        print('Están al día: ' + ', '.join(f"los {len(plan['items'])} audios de {LABELS[plan['kind']]}" for plan in plans) + '.')
        return

    with Engine() as engine:
        wrong = []
        for plan in plans:
            for item in plan['items']:
                item['query'] = engine.query(item['text'])
                if spoken_sounds(item['query']) != item['expected']:
                    wrong.append(f"  {item['written']}\n    lectura: {item['reading']}\n    motor:   {spoken_kana(item['query'])}")
        if wrong:
            sys.exit('El motor no leería estas palabras o frases como su lectura. '
                     'Corrígelas en DICTIONARY, WORD_SPELLINGS o REPLACEMENTS:\n' + '\n'.join(wrong))

        for plan in plans:
            old = plan['old']
            pending = [item for item in plan['items']
                       if arguments.all or not plan['same_voice'] or not plan['up_to_date'](item)
                       or old[item['file']]['kana'] != spoken_kana(item['query'])]
            plan['output'].mkdir(parents=True, exist_ok=True)
            for done, item in enumerate(pending, 1):
                (plan['output'] / item['file']).write_bytes(encode_mp3(engine.synthesize(item['query'])))
                if done % 50 == 0:
                    print(f"  {plan['kind']}: {done} de {len(pending)}…")
            plan['generated'] = len(pending)

    for plan in plans:
        for path in plan['orphans']:
            path.unlink()
        entries = [{'file': item['file'], 'written': item['written'], 'reading': item['reading'], 'sourceText': item['text'],
                    'kana': spoken_kana(item['query']), 'sha256': sha256((plan['output'] / item['file']).read_bytes())}
                   for item in plan['items']]
        plan['generation'].write_text(json.dumps({**current, 'entries': entries}, ensure_ascii=False, indent=2) + '\n',
                                      encoding='utf-8')
        print(f"{LABELS[plan['kind']].capitalize()}: {plan['generated']} audios generados, "
              f"{len(plan['orphans'])} borrados; {len(entries)} con audio.")


if __name__ == '__main__':
    main()
