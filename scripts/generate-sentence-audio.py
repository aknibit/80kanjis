#!/usr/bin/env python3
"""Genera el audio de las frases de los kanji con AivisSpeech (voz morioki).

    python3 -m pip install lameenc   # una vez
    npm run audio:sentences          # solo las frases nuevas o cambiadas
    npm run audio:sentences -- --all # todas

Lee public/content/kanji-sentences.json y escribe un MP3 por frase en
public/audio/sentences/, con su registro en generation.json. El nombre sale del
kanji y de la posición de la frase (4e00-s1.mp3 es la primera sencilla de 一), igual
que en src/lib/sentence-audio.ts: si cambias uno, cambia el otro.

El motor (AivisSpeech Engine) y la voz (el modelo morioki, de AivisHub) se descargan de
versiones fijas, se comprueba su SHA-256 y se guardan en tmp/aivisspeech/, que Git ignora.
El motor se arranca con una carpeta de usuario propia (HOME), donde guarda sus modelos y
el diccionario de usuario, así que no toca ninguna instalación de AivisSpeech. La primera
vez descarga además su modelo BERT y sus voces por defecto (algo más de 1 GB).

La síntesis no es determinista: la misma frase da cada vez un audio algo distinto. Por
eso solo se regeneran las frases nuevas, las cambiadas y las que el motor leería de otra
forma (por ejemplo, tras cambiar el diccionario); --all las rehace todas y cambia todos los MP3.

Antes de sintetizar, el script comprueba que lo que leería el motor coincide con
la lectura en kana de cada frase. Si no coincide, no escribe nada y lista las frases:
corrígelas con una sustitución (REPLACEMENTS) o una palabra del diccionario (DICTIONARY).
El motor respeta el acento del diccionario, pero la comprobación no lo ve: revísalo al añadir palabras.
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
SENTENCES = ROOT / 'public/content/kanji-sentences.json'
OUTPUT = ROOT / 'public/audio/sentences'
GENERATION = OUTPUT / 'generation.json'
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
# MPEG-2 Layer III, like the human recordings: about 11 KB per sentence.
BITRATE = 32

# Text the engine receives instead of the written sentence, where its dictionary
# cannot be steered. Each one keeps the reading of the sentence.
REPLACEMENTS = [
    {'from': '描きます', 'to': '書きます',
     'reason': 'La lectura es かきます; el motor lee えがきます. 書きます suena igual, con el mismo acento.'},
    {'from': 'かれは', 'to': '彼は',
     'reason': 'En hiragana, el motor lee かれは como 枯れ葉 («kareha»). 彼は suena igual, con el acento [1] de かれの.'},
    {'from': 'わたしは えが', 'to': 'わたしは 絵が',
     'reason': 'En hiragana, el motor une は y え en はえ (蝿). 絵が suena igual.'},
    {'from': ' いしゃです', 'to': ' 医者です',
     'reason': 'Tras は, el motor oye はいしゃ (歯医者). 医者 suena igual; una palabra いしゃ en el diccionario partiría かいしゃ.'},
    {'from': '下で', 'to': 'したで',
     'reason': 'El motor lee 下で como もとで. したで suena igual; una palabra 下 en el diccionario estropearía 川下, 下校 y 下手.'},
]

# User-dictionary words: how the engine reads a spelling of the sentences. The accent is
# the number of the mora where the pitch falls (0: no fall). Words that have a synthesized
# audio of their own keep its accent, so they sound the same alone and in a sentence.
DICTIONARY = [
    {'surface': '日本', 'pronunciation': 'ニホン', 'accentType': 2, 'wordType': 'PROPER_NOUN',
     'reason': 'Se enseña «nihon», con acento [2]; la palabra evita «nippon».'},
    {'surface': '日本人', 'pronunciation': 'ニホンジン', 'accentType': 4, 'wordType': 'PROPER_NOUN',
     'reason': 'Acento de 日本人 [4] (ニホンジ\'ン); el motor dice ニホ\'ンジン.'},
    {'surface': '七色', 'pronunciation': 'ナナイロ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (ナナ\'イロ); el motor dice ななしょく.'},
    {'surface': '竹林', 'pronunciation': 'タケバヤシ', 'accentType': 4, 'wordType': 'COMMON_NOUN',
     'reason': 'La colección lo lee たけばやし, como el audio de la palabra; el motor dice ちくりん.'},
    {'surface': 'まつ林', 'pronunciation': 'マツバヤシ', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (松林); el motor dice まつりん.'},
    {'surface': '空ばこ', 'pronunciation': 'カラバコ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (カラ\'バコ); el motor dice そらばこ.'},
    {'surface': '土き', 'pronunciation': 'ドキ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (土器); el motor dice つちき.'},
    {'surface': 'まき貝', 'pronunciation': 'マキガイ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (巻貝); el motor dice まきかい.'},
    {'surface': 'ほら貝', 'pronunciation': 'ホラガイ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (法螺貝); el motor dice ほらかい.'},
    {'surface': 'こん虫', 'pronunciation': 'コンチュウ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (昆虫); el motor dice こんむし.'},
    {'surface': '先とう', 'pronunciation': 'セントウ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (先頭); el motor dice さきだとう.'},
    {'surface': '文なし', 'pronunciation': 'モンナシ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (文無し); el motor dice ぶんなし.'},
    {'surface': '上ぎ', 'pronunciation': 'ウワギ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (上着); el motor dice うえぎ.'},
    {'surface': '赤はん', 'pronunciation': 'セキハン', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (赤飯); el motor dice あかはん.'},
    {'surface': '雨ぐも', 'pronunciation': 'アマグモ', 'accentType': 0, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (雨雲); el motor dice あめぐも.'},
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
     'reason': 'Como el audio de la palabra (sin caída); el motor dice くさわら.'},
    {'surface': '年より', 'pronunciation': 'トシヨリ', 'accentType': 3, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (年寄り); el motor dice ねんより.'},
    {'surface': '三歳', 'pronunciation': 'サンサイ', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento [1] (サ\'ンサイ), como en いっさい o にさい; el motor dice みとせ.'},
    {'surface': '十本', 'pronunciation': 'ジュッポン', 'accentType': 1, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 十本 en el diccionario del motor [1], con la lectura じゅっぽん de la colección; el motor dice じっぽん.'},
    {'surface': '靴', 'pronunciation': 'クツ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Acento de 靴 en el diccionario del motor; tras きれいな, el motor dice ぐつ.'},
]


def file_name(kanji: str, group: str, index: int) -> str:
    """Same rule as sentenceAudioFile() in src/lib/sentence-audio.ts."""
    return f"{ord(kanji):x}-{'s' if group == 'simple' else 'a'}{index + 1}.mp3"


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
    """The reading as spoken: blocks end in their particle, so a final は or へ is wa or e."""
    blocks = []
    for block in reading.split():
        core = ''.join(c for c in block if c not in PUNCTUATION)
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

# What makes every sentence sound different. The replacements and the dictionary only
# change the sentences that use them, which the reading and the spoken kana detect.
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
        'replacements': REPLACEMENTS, 'dictionary': DICTIONARY,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--all', action='store_true', help='vuelve a sintetizar todas las frases')
    arguments = parser.parse_args()
    try:
        import lameenc  # noqa: F401
    except ImportError:
        sys.exit('Falta lameenc: python3 -m pip install lameenc')

    document = json.loads(SENTENCES.read_text(encoding='utf-8'))
    sentences = [
        {'file': file_name(entry['kanji'], group, index), 'written': sentence['written'], 'reading': sentence['reading']}
        for entry in document['entries'] for group in ('simple', 'advanced')
        for index, sentence in enumerate(entry[group])
    ]
    previous = json.loads(GENERATION.read_text(encoding='utf-8')) if GENERATION.exists() else {}
    old = {entry['file']: entry for entry in previous.get('entries', [])}
    current = settings()
    same_settings = all(previous.get(key) == value for key, value in current.items())
    same_voice = all(previous.get(key) == current[key] for key in VOICE_SETTINGS)

    def up_to_date(sentence: dict) -> bool:
        entry = old.get(sentence['file'])
        path = OUTPUT / sentence['file']
        return bool(entry) and entry['written'] == sentence['written'] and entry['reading'] == sentence['reading'] \
            and entry['sourceText'] == source_text(sentence['written']) and path.exists() and sha256(path.read_bytes()) == entry['sha256']

    expected = {sentence['file'] for sentence in sentences}
    orphans = [path for path in OUTPUT.glob('*.mp3') if path.name not in expected]
    if not arguments.all and same_settings and not orphans and all(map(up_to_date, sentences)):
        print(f'Los {len(sentences)} audios de las frases están al día.')
        return

    with Engine() as engine:
        queries = {}
        wrong = []
        for sentence in sentences:
            source = source_text(sentence['written'])
            query = engine.query(source)
            if spoken_sounds(query) != expected_sounds(sentence['reading']):
                wrong.append(f"  {sentence['written']}\n    lectura: {sentence['reading']}\n    motor:   {spoken_kana(query)}")
            queries[sentence['file']] = (source, query)
        if wrong:
            sys.exit('El motor no leería estas frases como su lectura. Corrígelas en REPLACEMENTS o DICTIONARY:\n' + '\n'.join(wrong))

        pending = [sentence for sentence in sentences
                   if arguments.all or not same_voice or not up_to_date(sentence)
                   or old[sentence['file']]['kana'] != spoken_kana(queries[sentence['file']][1])]
        OUTPUT.mkdir(parents=True, exist_ok=True)
        for done, sentence in enumerate(pending, 1):
            (OUTPUT / sentence['file']).write_bytes(encode_mp3(engine.synthesize(queries[sentence['file']][1])))
            if done % 50 == 0:
                print(f'  {done} de {len(pending)}…')
        entries = []
        for sentence in sentences:
            source, query = queries[sentence['file']]
            path = OUTPUT / sentence['file']
            entries.append({**sentence, 'sourceText': source, 'kana': spoken_kana(query), 'sha256': sha256(path.read_bytes())})

    for path in orphans:
        path.unlink()
    GENERATION.write_text(json.dumps({**current, 'entries': entries}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{len(pending)} audios generados, {len(orphans)} borrados; {len(entries)} frases con audio.')


if __name__ == '__main__':
    main()
