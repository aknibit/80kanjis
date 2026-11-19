#!/usr/bin/env python3
"""Genera el audio de las frases de los kanji con VOICEVOX Nemo (voz 女声1).

    python3 -m pip install lameenc   # una vez
    npm run audio:sentences          # solo las frases nuevas o cambiadas
    npm run audio:sentences -- --all # todas

Lee public/content/kanji-sentences.json y escribe un MP3 por frase en
public/audio/sentences/, con su registro en generation.json. El nombre sale del
kanji y de la posición de la frase (4e00-s1.mp3 es la primera sencilla de 一), igual
que en src/lib/sentence-audio.ts: si cambias uno, cambia el otro.

El motor se descarga de un release fijo, se comprueba su SHA-256 y se guarda en
tmp/voicevox-nemo/, que Git ignora. Se arranca con una carpeta de usuario propia,
así que su diccionario de usuario no toca ninguna instalación de VOICEVOX.

Antes de sintetizar, el script comprueba que lo que leería el motor coincide con
la lectura en kana de cada frase. Si no coincide, no escribe nada y lista las frases:
corrígelas con una sustitución (REPLACEMENTS) o una palabra del diccionario (DICTIONARY).
Eso no comprueba el acento: revísalo al añadir palabras al diccionario.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import platform
import shutil
import socket
import stat
import subprocess
import sys
import time
import urllib.parse
import urllib.request
import wave
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SENTENCES = ROOT / 'public/content/kanji-sentences.json'
OUTPUT = ROOT / 'public/audio/sentences'
GENERATION = OUTPUT / 'generation.json'
WORK = ROOT / 'tmp/voicevox-nemo'

ENGINE_VERSION = '0.26.0'
ENGINE_URL = f'https://github.com/VOICEVOX/voicevox_nemo_engine/releases/download/{ENGINE_VERSION}/voicevox_engine-macos-arm64-{ENGINE_VERSION}.vvpp'
ENGINE_SHA256 = '70c8e26be64684008264b23705f1439f8f19259a9571cbbeac930452e89b4ce2'
TERMS_URL = 'https://voicevox.hiroshiba.jp/nemo/term/'
# The same voice as the synthesized vocabulary (public/audio/generation.json).
SPEAKER = 10005
VOICE = '女声1'
# MPEG-2 Layer III, like the human recordings: about 11 KB per sentence.
BITRATE = 32

# Text the engine receives instead of the written sentence, where its dictionary
# cannot be steered. Each one keeps the reading of the sentence.
REPLACEMENTS = [
    {'from': '日本人', 'to': 'にほんじん',
     'reason': 'El motor dice «nippon» aunque el diccionario diga 日本; にほんじん lleva el acento [4] del diccionario.'},
    {'from': '描きます', 'to': '書きます',
     'reason': 'La lectura es かきます; el motor lee えがきます. 書きます suena igual, con el mismo acento.'},
]

# User-dictionary words: how the engine reads a spelling of the sentences. The accent is
# the number of the mora where the pitch falls (0: no fall). Words that have a synthesized
# audio of their own keep its accent, so they sound the same alone and in a sentence.
DICTIONARY = [
    {'surface': '日本', 'pronunciation': 'ニホン', 'accentType': 2, 'wordType': 'PROPER_NOUN',
     'reason': 'Se enseña «nihon»; el motor dice «nippon».'},
    {'surface': 'にほんじん', 'pronunciation': 'ニホンジン', 'accentType': 4, 'wordType': 'PROPER_NOUN',
     'reason': 'Acento de 日本人 [4]; sin esta palabra, el kana sale sin caída.'},
    {'surface': '七色', 'pronunciation': 'ナナイロ', 'accentType': 2, 'wordType': 'COMMON_NOUN',
     'reason': 'Como el audio de la palabra (ナナ\'イロ); el motor dice なないろ con otro acento o ななしょく.'},
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


def spoken_sounds(query: dict) -> str:
    return sounds(''.join(mora['text'] for phrase in query['accent_phrases'] for mora in phrase['moras']))


def source_text(written: str) -> str:
    for replacement in REPLACEMENTS:
        written = written.replace(replacement['from'], replacement['to'])
    return written


# --- Engine ------------------------------------------------------------------------

def engine_dir() -> Path:
    if platform.system() != 'Darwin' or platform.machine() != 'arm64':
        sys.exit('El motor fijado es el de macOS con Apple Silicon. En otro sistema, cambia ENGINE_URL y ENGINE_SHA256.')
    archive = WORK / Path(urllib.parse.urlparse(ENGINE_URL).path).name
    target = WORK / f'engine-{ENGINE_VERSION}'
    if (target / 'run').exists():
        return target
    WORK.mkdir(parents=True, exist_ok=True)
    if not archive.exists():
        print(f'Descargando VOICEVOX Nemo {ENGINE_VERSION} (unos 150 MB)…')
        partial = archive.with_suffix('.part')
        with urllib.request.urlopen(ENGINE_URL) as response, partial.open('wb') as output:
            shutil.copyfileobj(response, output)
        partial.rename(archive)
    digest = hashlib.sha256()
    with archive.open('rb') as data:
        for chunk in iter(lambda: data.read(1 << 20), b''):
            digest.update(chunk)
    if digest.hexdigest() != ENGINE_SHA256:
        archive.unlink()
        sys.exit(f'El SHA-256 de {archive.name} no coincide; se ha borrado. Vuelve a ejecutar el script.')
    partial_dir = target.with_name(target.name + '.part')
    shutil.rmtree(partial_dir, ignore_errors=True)
    # extractall() would turn the bundle's symbolic links (some dylibs) into text files.
    with zipfile.ZipFile(archive) as bundle:
        for info in bundle.infolist():
            mode = info.external_attr >> 16
            destination = partial_dir / info.filename
            if stat.S_ISLNK(mode):
                destination.parent.mkdir(parents=True, exist_ok=True)
                os.symlink(bundle.read(info).decode(), destination)
            else:
                bundle.extract(info, partial_dir)
                if mode & 0o777 and not info.is_dir():
                    destination.chmod(mode & 0o777)
    (partial_dir / 'run').chmod(0o755)
    partial_dir.rename(target)
    return target


class Engine:
    """A private engine: its own port and HOME, so the user dictionary starts empty and stays here."""

    def __enter__(self) -> 'Engine':
        directory = engine_dir()
        home = WORK / 'home'
        shutil.rmtree(home, ignore_errors=True)
        home.mkdir(parents=True)
        with socket.socket() as probe:
            probe.bind(('127.0.0.1', 0))
            port = probe.getsockname()[1]
        self.base = f'http://127.0.0.1:{port}'
        self.log = (WORK / 'engine.log').open('wb')
        self.process = subprocess.Popen([str(directory / 'run'), '--host', '127.0.0.1', '--port', str(port)],
                                        cwd=directory, env={**os.environ, 'HOME': str(home)},
                                        stdout=self.log, stderr=subprocess.STDOUT)
        print('Arrancando el motor…')
        for _ in range(240):
            if self.process.poll() is not None:
                raise SystemExit(f'El motor se ha cerrado; mira {WORK / "engine.log"}.')
            try:
                version = json.loads(self.request('GET', '/version'))
                break
            except OSError:
                time.sleep(0.5)
        else:
            raise SystemExit('El motor no ha respondido en dos minutos.')
        if version != ENGINE_VERSION:
            raise SystemExit(f'Versión inesperada del motor: {version}.')
        voices = {style['id']: speaker['name'] for speaker in json.loads(self.request('GET', '/speakers')) for style in speaker['styles']}
        if voices.get(SPEAKER) != VOICE:
            raise SystemExit(f'La voz {SPEAKER} no es {VOICE}.')
        for word in DICTIONARY:
            self.request('POST', '/user_dict_word', surface=word['surface'], pronunciation=word['pronunciation'],
                         accent_type=word['accentType'], word_type=word['wordType'], priority=10)
        return self

    def __exit__(self, *_: object) -> None:
        self.process.terminate()
        try:
            self.process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            self.process.kill()
        self.log.close()

    def request(self, method: str, path: str, body: bytes | None = None, **params: object) -> bytes:
        query = f'?{urllib.parse.urlencode(params)}' if params else ''
        headers = {'Content-Type': 'application/json'} if body else {}
        request = urllib.request.Request(self.base + path + query, data=body, method=method, headers=headers)
        with urllib.request.urlopen(request, timeout=120) as response:
            return response.read()

    def query(self, text: str) -> dict:
        return json.loads(self.request('POST', '/audio_query', speaker=SPEAKER, text=text))

    def synthesize(self, query: dict) -> bytes:
        return self.request('POST', '/synthesis', json.dumps(query).encode(), speaker=SPEAKER)


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

def settings() -> dict:
    import importlib.metadata
    return {
        'engine': 'VOICEVOX Nemo', 'engineVersion': ENGINE_VERSION, 'engineSha256': ENGINE_SHA256,
        'voice': VOICE, 'speaker': SPEAKER, 'termsUrl': TERMS_URL,
        'encoder': f'LAME (lameenc {importlib.metadata.version("lameenc")}), MP3 {BITRATE} kbps mono',
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
                wrong.append(f"  {sentence['written']}\n    lectura: {sentence['reading']}\n    motor:   {query['kana']}")
            queries[sentence['file']] = (source, query)
        if wrong:
            sys.exit('El motor no leería estas frases como su lectura. Corrígelas en REPLACEMENTS o DICTIONARY:\n' + '\n'.join(wrong))

        OUTPUT.mkdir(parents=True, exist_ok=True)
        entries, generated = [], 0
        for sentence in sentences:
            source, query = queries[sentence['file']]
            entry = {**sentence, 'sourceText': source, 'kana': query['kana']}
            before = old.get(sentence['file'])
            path = OUTPUT / sentence['file']
            if arguments.all or not same_settings or not up_to_date(sentence) or before['kana'] != query['kana']:
                path.write_bytes(encode_mp3(engine.synthesize(query)))
                generated += 1
            entries.append({**entry, 'sha256': sha256(path.read_bytes())})

    for path in orphans:
        path.unlink()
    GENERATION.write_text(json.dumps({**current, 'entries': entries}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{generated} audios generados, {len(orphans)} borrados; {len(entries)} frases con audio.')


if __name__ == '__main__':
    main()
