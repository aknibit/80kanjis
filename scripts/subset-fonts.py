#!/usr/bin/env python3
"""Build the self-hosted font subsets in src/fonts/.

The study content is a closed set, so each family ships as a single WOFF2 with
only the characters used by public/ content and the interface source. DM Sans
also keeps Latin-1 and common punctuation for typed searches. Run it again after
adding characters; `npm run check:content` fails until the subsets cover them.

    python3 -m pip install fonttools brotli
    npm run fonts
"""

import hashlib
import json
import pathlib
import sys
import unicodedata
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'src' / 'fonts'
CACHE = ROOT / 'tmp' / 'font-sources'
# Pinned google/fonts revision; the hashes reject any other download.
REVISION = 'cc39c4c2c304bc368c9b7c311ea2bcc6013299fe'
# Printable ASCII, Latin-1 and typographic punctuation for anything typed in search.
LATIN = ''.join(map(chr, [*range(0x20, 0x7f), *range(0xa0, 0x100),
                          0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2026, 0x20ac]))
FONTS = [
    # (output, source, sha256, axes, extra characters)
    # Google Fonts serves DM Sans with opsz fixed at 14; keep that look.
    ('dm-sans.woff2', 'ofl/dmsans/DMSans%5Bopsz,wght%5D.ttf',
     '8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d',
     {'opsz': 14, 'wght': (400, 700)}, LATIN),
    ('noto-sans-jp.woff2', 'ofl/notosansjp/NotoSansJP%5Bwght%5D.ttf',
     'c2f3b4d463500a2ddcd3849cded1fceeb9fd6d1c32e6cbecd568453ba50fc68f',
     {'wght': 400}, ''),
    ('noto-serif-jp.woff2', 'ofl/notoserifjp/NotoSerifJP%5Bwght%5D.ttf',
     '2fd527ba12b6a44ec30d796d633360da0aeba6c5d4af1304ce12bb4dc15a7dfc',
     {'wght': (400, 600)}, ''),
]


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def characters():
    """Characters the site can display. Keep in sync with scripts/check-content.ts."""
    found = set()
    for path in [ROOT / 'public' / 'collection.json', *sorted((ROOT / 'public' / 'content').glob('*.json'))]:
        if path.name != 'study.schema.json':
            found.update(''.join(strings(json.loads(path.read_text('utf-8')))))
    for path in [ROOT / 'index.html', ROOT / 'src' / 'style.css', *sorted((ROOT / 'src').rglob('*.ts'))]:
        if not path.name.endswith('.test.ts'):
            found.update(path.read_text('utf-8'))
    return ''.join(sorted(c for c in found if not unicodedata.category(c).startswith('C')))


def source(path, sha256):
    local = CACHE / pathlib.PurePosixPath(path).name.replace('%5B', '[').replace('%5D', ']')
    if not local.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        url = f'https://raw.githubusercontent.com/google/fonts/{REVISION}/{path}'
        print(f'Downloading {url}')
        with urllib.request.urlopen(url) as response:
            local.write_bytes(response.read())
    if hashlib.sha256(local.read_bytes()).hexdigest() != sha256:
        local.unlink()
        sys.exit(f'Unexpected checksum for {path}; the download was removed.')
    return local


def main():
    text = characters()
    OUT.mkdir(parents=True, exist_ok=True)
    cmaps = []
    for output, path, sha256, axes, extra in FONTS:
        font = TTFont(source(path, sha256), recalcTimestamp=False)
        family = font['name'].getDebugName(16)
        options = subset.Options()
        # Keep copyright, names and the OFL notice (IDs 13 and 14) inside the file.
        options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14]
        subsetter = subset.Subsetter(options)
        subsetter.populate(text=text + extra)
        subsetter.subset(font)
        # Subset before instancing: it is faster and avoids a gvar error in Noto Serif JP.
        font = instantiateVariableFont(font, axes)
        # Replace the default-instance names (such as "Noto Sans JP Thin") shown in DevTools.
        for name_id, value in ((1, family), (2, 'Regular'), (4, family), (6, family.replace(' ', ''))):
            font['name'].setName(value, name_id, 3, 1, 0x409)
        font.flavor = 'woff2'
        font.save(OUT / output)
        print(f'{output}: {len(font.getGlyphOrder())} glyphs, {(OUT / output).stat().st_size / 1024:.1f} KB')
        cmaps.append(font.getBestCmap())
    (OUT / 'characters.txt').write_text(text + '\n', 'utf-8')
    print(f'{len(text)} characters written to src/fonts/characters.txt')
    # Subsetting cannot add glyphs a family never had (emoji, rare kanji, symbols).
    uncovered = ''.join(c for c in text if not any(ord(c) in cmap for cmap in cmaps))
    if uncovered:
        print(f'Warning: no font has {uncovered}; browsers will draw them with system fonts.')


if __name__ == '__main__':
    main()
