import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

const files = (await readdir('dist/assets')).filter((file) => file.endsWith('.js'));
assert.ok(files.length > 0, 'Run npm run build first.');
const script = (await Promise.all(files.map((file) => readFile(`dist/assets/${file}`, 'utf8')))).join('\n');

for (const removed of ['showOpenFilePicker', 'createWritable',
  'difficulties-dialog', 'open-difficulties', 'import-file', 'createElement("select")',
  'show-readings', '__EDITABLE_DIFFICULTIES__']) {
  assert.ok(!script.includes(removed), `Removed capability is still bundled: ${removed}`);
}
assert.ok(script.includes('difficulty-badge'), 'Difficulty badges must remain visible.');
assert.ok(script.includes('word-reading'), 'Vocabulary readings must remain visible.');
assert.ok(!script.includes('una cosa'), 'Study content must load from JSON, not a bundled duplicate.');
assert.equal(await readFile('dist/collection.json', 'utf8'), await readFile('public/collection.json', 'utf8'));
assert.ok(!(await readdir('dist')).includes('difficulties.json'));
for (const file of await readdir('public/audio')) {
  assert.deepEqual(await readFile(`dist/audio/${file}`), await readFile(`public/audio/${file}`),
    `Missing or changed audio asset: ${file}`);
}
for (const file of await readdir('public/data')) {
  assert.deepEqual(await readFile(`dist/data/${file}`), await readFile(`public/data/${file}`),
    `Missing or changed dictionary credit/license: ${file}`);
}
for (const file of await readdir('public/content')) {
  assert.deepEqual(await readFile(`dist/content/${file}`), await readFile(`public/content/${file}`),
    `Missing or changed canonical section content: ${file}`);
}
const html = await readFile('dist/index.html', 'utf8');
// The theme and the shared difficulty are the only browser storage allowed (AGENTS.md).
for (const [name, code] of [['Bundle', script], ['index.html', html]]) {
  assert.doesNotMatch(code, /sessionStorage|indexedDB|document\.cookie/, `${name} must not use browser storage.`);
  const uses = code.match(/localStorage/g)?.length ?? 0;
  const allowedUses = code.match(/localStorage\.(?:getItem|setItem|removeItem)\(["']80kanjis-(?:theme|difficulty)["']/g)?.length ?? 0;
  assert.equal(uses, allowedUses, `${name} may only use localStorage for the 80kanjis-theme and 80kanjis-difficulty preferences.`);
}
assert.match(html, /<script>[\s\S]*localStorage\.getItem\('80kanjis-theme'\)[\s\S]*<\/script>[\s\S]*<script type="module"/,
  'index.html must apply the theme in an inline script before the app bundle.');
assert.match(html, /<script\b[^>]*\bsrc="\.\/assets\/index-[^"]+\.js"/);
assert.doesNotMatch(html, /(?:src|href)="\/(?:src|assets)\//,
  'Production HTML must use compiled, relative assets for GitHub project Pages.');
for (const file of ['content/navigation.json', 'collection.json']) {
  assert.ok(html.includes(`<link rel="preload" href="./${file}" as="fetch" crossorigin`),
    `${file} must be requested by the HTML, not after the app bundle runs.`);
}
const assets = await readdir('dist/assets');
const css = (await Promise.all(assets.filter((file) => file.endsWith('.css')).map((file) => readFile(`dist/assets/${file}`, 'utf8')))).join('\n');
assert.doesNotMatch(css, /@import|fonts\.googleapis|fonts\.gstatic/, 'Fonts must be self-hosted, without third-party CSS.');
const fonts = [...css.matchAll(/url\(\.\/([^)]+\.woff2)\)/g)].map((match) => match[1]);
assert.equal(fonts.length, 3, 'Expected DM Sans, Noto Sans JP and Noto Serif JP.');
for (const font of fonts) assert.ok(assets.includes(font), `Missing font: ${font}`);
const preloadedFont = html.match(/<link rel="preload" href="\.\/assets\/([^"]+\.woff2)" as="font" type="font\/woff2" crossorigin/)?.[1];
assert.ok(preloadedFont && fonts.includes(preloadedFont), 'The preloaded font must be the file the stylesheet uses.');
console.log('Static build verified: canonical collection and sections, audio, visible readings, read-only difficulties, theme and difficulty storage only, preloads, and self-hosted fonts.');
