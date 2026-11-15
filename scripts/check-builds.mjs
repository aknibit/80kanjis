import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

async function readScripts(directory) {
  const files = (await readdir(`${directory}/assets`)).filter((file) => file.endsWith('.js'));
  assert.ok(files.length > 0, `Missing JavaScript in ${directory}. Run both builds first.`);
  return (await Promise.all(files.map((file) => readFile(`${directory}/assets/${file}`, 'utf8')))).join('\n');
}

const [production, editor, source] = await Promise.all([
  readScripts('dist'), readScripts('dist-dev'), readFile('public/difficulties.json', 'utf8'),
]);

// The public build must omit the editor itself, not merely hide its controls.
for (const editorOnly of ['showOpenFilePicker', 'createWritable', 'localStorage',
  'difficulties-dialog', 'open-difficulties', 'import-file', 'createElement("select")']) {
  assert.ok(editor.includes(editorOnly), `Editor capability is missing: ${editorOnly}`);
  assert.ok(!production.includes(editorOnly), `Editor capability leaked into production: ${editorOnly}`);
}
assert.ok(production.includes('difficulty-badge'), 'Production must render status badges.');
for (const directory of ['dist', 'dist-dev']) {
  assert.equal(await readFile(`${directory}/difficulties.json`, 'utf8'), source,
    `${directory} does not contain the current dynamic ratings file.`);
  assert.match(await readFile(`${directory}/index.html`, 'utf8'), /\.\/assets\/index-/,
    `${directory} must retain relative CDN asset paths.`);
}
console.log('Both builds verified: editing is exclusive to dist-dev; dist has read-only badges and no draft storage or file-writing APIs.');
