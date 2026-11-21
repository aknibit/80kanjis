"""Draw the images of src/icons/ from the site's own fonts: the cover of the system's player and the apple-touch-icon.

Both use the seal of the header: 八 in Noto Serif JP 500, cream on the site's green. They are drawn by Google Chrome
through Playwright for Python (`python3 -m pip install playwright`); the fonts go in as data URLs, because a page
without an address cannot load local files.

    npm run icons
"""

import base64
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / 'src' / 'fonts'
ICONS = ROOT / 'src' / 'icons'
GREEN, CREAM, MINT, PALE = '#175c45', '#fffaf1', '#74c4a0', '#a6e3c6'
# The heights of the waveform beside the name, in percent.
WAVE = [14, 30, 52, 76, 44, 92, 64, 36, 70, 100, 58, 28, 48, 80, 40, 22, 12]


def font(name: str) -> str:
    return 'data:font/woff2;base64,' + base64.b64encode((FONTS / name).read_bytes()).decode()


# Names of their own: a canvas reads «Serif» as the generic serif family, not as a loaded font.
FACES = f"""
@font-face {{ font-family: 'Seal DM Sans'; src: url('{font('dm-sans.woff2')}') format('woff2'); font-weight: 400 700; }}
@font-face {{ font-family: 'Seal Noto Serif JP'; src: url('{font('noto-serif-jp.woff2')}') format('woff2'); font-weight: 400 600; }}
"""

# The cover of what plays, as a podcast's: the seal's kanji, large, and «80kanjis.» with a waveform under «AUDIOS».
COVER = f"""<!doctype html><html><head><style>{FACES}
html, body {{ margin: 0; }}
.cover {{ position: relative; width: 1024px; height: 1024px; overflow: hidden; background: {GREEN}; color: {CREAM}; font-family: 'Seal DM Sans'; }}
.label {{ position: absolute; left: 88px; top: 92px; display: flex; align-items: center; gap: 22px; font-size: 40px; font-weight: 650; letter-spacing: .24em; color: {PALE}; }}
.label .ja {{ font-family: 'Seal Noto Serif JP'; font-weight: 500; letter-spacing: .12em; font-size: 38px; }}
.label .rule {{ width: 56px; height: 3px; background: {PALE}; opacity: .6; }}
.seal {{ position: absolute; right: 70px; top: 150px; font-family: 'Seal Noto Serif JP'; font-weight: 500; font-size: 560px; line-height: 1; }}
.brand {{ position: absolute; left: 84px; bottom: 84px; font-size: 128px; font-weight: 700; letter-spacing: -5px; line-height: 1; }}
.brand .light {{ font-weight: 450; }}
.brand .dot {{ color: {MINT}; }}
.wave {{ position: absolute; right: 88px; bottom: 100px; display: flex; align-items: center; gap: 9px; height: 92px; }}
.wave i {{ display: block; width: 9px; border-radius: 5px; background: {PALE}; }}
</style></head><body><div class="cover">
  <div class="label"><span>AUDIOS</span><span class="rule"></span><span class="ja" lang="ja">音声</span></div>
  <div class="seal" lang="ja">八</div>
  <div class="brand">80<span class="light">kanjis</span><span class="dot">.</span></div>
  <div class="wave">{''.join(f'<i style="height: {height}%"></i>' for height in WAVE)}</div>
</div></body></html>"""

# The home-screen icon, drawn on the cover's page, which has the fonts: the seal alone, centred on its glyph and 56 % of
# the side. Full bleed: iOS rounds the corners.
ICON = """async (size) => {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  context.fillStyle = '%s';
  context.fillRect(0, 0, size, size);
  context.font = `500 ${size * 0.56}px 'Seal Noto Serif JP'`;
  context.fillStyle = '%s';
  const glyph = context.measureText('八');
  const width = glyph.actualBoundingBoxLeft + glyph.actualBoundingBoxRight;
  const height = glyph.actualBoundingBoxAscent + glyph.actualBoundingBoxDescent;
  context.fillText('八', (size - width) / 2 + glyph.actualBoundingBoxLeft, (size - height) / 2 + glyph.actualBoundingBoxAscent);
  return canvas.toDataURL('image/png');
}""" % (GREEN, CREAM)


def main() -> None:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel='chrome')
        page = browser.new_page(viewport={'width': 1024, 'height': 1024})
        page.set_content(COVER)
        page.evaluate("""Promise.all([document.fonts.load("700 10px 'Seal DM Sans'"),
          document.fonts.load("500 10px 'Seal Noto Serif JP'", '八音声')])""")
        for family in ['Seal DM Sans', 'Seal Noto Serif JP']:
            if not page.evaluate(f"document.fonts.check(\"500 10px '{family}'\", '八')" if 'Serif' in family
                                 else f"document.fonts.check(\"700 10px '{family}'\")"):
                raise SystemExit(f'{family} did not load.')
        page.screenshot(path=ICONS / 'now-playing.png')
        icon = page.evaluate(ICON, 180)
        (ICONS / 'apple-touch-icon.png').write_bytes(base64.b64decode(icon.split(',', 1)[1]))
        browser.close()
    print('Wrote src/icons/now-playing.png (1024 px) and src/icons/apple-touch-icon.png (180 px).')


if __name__ == '__main__':
    main()
