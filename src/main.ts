import { kanji } from './data/kanji.ts';
import { studyItemTarget } from './lib/difficulty.ts';
import { createKanjiSearch } from './lib/search.ts';
import { setupDifficulties } from './difficulties-ui.ts';
import { studyCatalog } from './data/study.ts';
import type { Kanji, StudyItem } from './types.ts';
import './style.css';

const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>';
const arrowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#collection">Saltar a la colección</a>
  <header class="site-header shell" id="top">
    <a class="brand" href="./" aria-label="80 kanjis, inicio">
      <span class="brand-seal" lang="ja" aria-hidden="true">八</span>
      <span>80<span class="brand-light">kanjis</span><span class="brand-dot">.</span></span>
    </a>
    <div class="header-right">
      <span class="language-pair"><span lang="ja">日本語</span><span class="language-line"></span>ESPAÑOL</span>
      <button class="about-button" id="open-about" type="button" aria-label="Sobre esta colección">?</button>
    </div>
  </header>
  <main class="shell">
    <section class="intro" aria-labelledby="page-title">
      <div class="intro-copy">
        <p class="eyebrow"><span class="tiny-line"></span> TU PEQUEÑA COLECCIÓN DE JAPONÉS</p>
        <h1 id="page-title">Un kanji.<br><span>Tres nuevas palabras.</span></h1>
        <p class="intro-description">Los primeros pasos se dan poco a poco. Explora 80 kanji<br class="desktop-break"> con sus lecturas y significados, una palabra a la vez.</p>
        <div class="collection-facts"><span><strong>80</strong> kanji</span><span class="fact-dot">·</span><span><strong>240</strong> ejemplos</span><span class="fact-dot">·</span><span>Un buen comienzo</span></div>
      </div>
      <div class="intro-art" aria-hidden="true">
        <div class="practice-square"><span>学</span></div>
        <span class="art-caption">まなぶ <span>aprender</span></span>
        <span class="art-stamp">一歩<br>ずつ</span>
      </div>
    </section>

    <section class="collection" id="collection" aria-labelledby="collection-title" tabindex="-1">
      <form class="search-form" role="search" autocomplete="off">
        <label class="visually-hidden" for="search">Buscar por kanji, lectura o significado</label>
        <div class="search-box">
          ${searchIcon}
          <input id="search" type="search" placeholder="Busca un kanji, una lectura o un significado…" spellcheck="false" aria-controls="kanji-grid" aria-describedby="search-hint" />
          <button id="clear-search" class="clear-button" type="button" aria-label="Borrar búsqueda" hidden>${closeIcon}</button>
          <kbd id="search-shortcut" aria-hidden="true">/</kbd>
        </div>
        <div class="search-hints" id="search-hint"><span>Prueba con</span><button type="button" data-query="agua">agua ${arrowIcon}</button><button type="button" data-query="山" lang="ja">山 ${arrowIcon}</button><button type="button" data-query="ひと" lang="ja">ひと ${arrowIcon}</button><span class="search-note">En japonés o en español</span></div>
      </form>

      <div class="collection-toolbar">
        <div class="collection-heading"><h2 id="collection-title">La colección</h2><span id="result-count" role="status" aria-live="polite" aria-atomic="true">80 de 80 kanji</span></div>
        <div class="collection-actions">
          <label class="reading-control" for="show-readings"><input id="show-readings" type="checkbox" checked /><span class="switch-track" aria-hidden="true"></span>Mostrar lecturas</label>
        </div>
      </div>
      <p id="difficulty-status" class="difficulty-status" role="status" aria-live="polite">Cargando dificultades…</p>
      <div id="kanji-grid" class="kanji-grid"></div>
      <div id="empty-state" class="empty-state" hidden>
        <span class="empty-character" lang="ja" aria-hidden="true">空</span>
        <h3>No encontramos ese kanji.</h3>
        <p>Prueba otra lectura o un significado en español.</p>
        <button class="reset-button" id="reset-search" type="button">Ver toda la colección ${arrowIcon}</button>
      </div>
      <p class="collection-end" id="collection-end"><span></span><span lang="ja">一歩ずつ</span> Paso a paso, palabra a palabra.<span></span></p>
    </section>
  </main>
  <footer class="site-footer shell"><span><strong>80kanjis.</strong> Una pequeña colección, un gran comienzo.</span><a href="#top">Volver arriba <span aria-hidden="true">↑</span></a></footer>

  <dialog id="about-dialog" aria-labelledby="about-title">
    <div class="dialog-header"><span class="eyebrow">SOBRE LA COLECCIÓN</span><button id="close-about" class="clear-button" type="button" aria-label="Cerrar información">${closeIcon}</button></div>
    <h2 id="about-title">Un pequeño paso cada día.</h2>
    <p>80 kanji y tres ejemplos por carácter, con lecturas en hiragana y significados en español, a partir de <cite>80 kanjis x 3 palabras.pdf</cite>.</p>
    <p>Busca por carácter, palabra, lectura o significado. Puedes escribir sin tildes y usar hiragana o katakana. Oculta las lecturas si quieres ponerte a prueba.</p>
    <p class="dialog-note">Se conserva la escritura simplificada del documento. Los ejemplos marcados como duplicados se han completado con su lectura y significado de la misma colección.</p>
    <div class="dialog-shortcut"><kbd>/</kbd> Buscar <kbd>Esc</kbd> Borrar la búsqueda o cerrar esta ventana</div>
  </dialog>

`;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const input = document.querySelector<HTMLInputElement>('#search')!;
const grid = document.querySelector<HTMLDivElement>('#kanji-grid')!;
const count = document.querySelector<HTMLSpanElement>('#result-count')!;
const clearButton = document.querySelector<HTMLButtonElement>('#clear-search')!;
const shortcut = document.querySelector<HTMLElement>('#search-shortcut')!;
const emptyState = document.querySelector<HTMLDivElement>('#empty-state')!;
const collectionEnd = document.querySelector<HTMLParagraphElement>('#collection-end')!;
const readingsToggle = document.querySelector<HTMLInputElement>('#show-readings')!;
const dialog = document.querySelector<HTMLDialogElement>('#about-dialog')!;
const search = createKanjiSearch(kanji);
const positions = new Map<string, number>(kanji.map((entry, index) => [entry.id, index + 1]));
const difficulties = setupDifficulties(kanji);
const studyRows = new Map(studyCatalog.rows.map((row) => [row.id, row]));

function createStudyBlock(item: StudyItem, entry: Kanji, blockIndex: number): HTMLElement {
  const block = element('article', `study-block study-block--${item.type}`);
  block.dataset.studyItemId = item.id;
  block.dataset.studyItemType = item.type;
  // A repeated vocabulary item shares its data ID but needs a unique DOM heading ID.
  const headingId = `${entry.id}-item-${blockIndex}`;
  block.setAttribute('aria-labelledby', headingId);

  const meta = element('div', 'study-meta');
  meta.append(element('span', 'study-type', item.type === 'kanji' ? 'Kanji' : 'Vocabulario'));
  if (item.type === 'kanji') meta.append(element('span', 'study-number', String(positions.get(entry.id)).padStart(2, '0')));

  const content = element('div', 'study-content');
  if (item.type === 'kanji') {
    const character = element('h3', 'kanji-character', item.character);
    character.id = headingId;
    character.lang = 'ja';
    content.append(character, element('p', 'study-meaning kanji-meaning', item.meanings.join(' · ')));
  } else {
    const japanese = element('div', 'word-japanese');
    japanese.lang = 'ja';
    const written = element('h3', 'word-written');
    written.id = headingId;
    const parts = item.written.split(entry.character);
    parts.forEach((part, index) => {
      if (index > 0) written.append(element('b', 'target-kanji', entry.character));
      written.append(document.createTextNode(part));
    });
    const reading = element('span', 'word-reading', item.reading);
    reading.hidden = !readingsToggle.checked;
    japanese.append(written, reading);
    content.append(japanese, element('p', 'study-meaning', item.meanings.join(' · ')));
  }
  const footer = element('div', 'study-footer');
  footer.append(difficulties.createIndicator(studyItemTarget(item)));
  block.append(meta, content, footer);
  return block;
}

function createRow(entry: Kanji): HTMLElement {
  const row = element('section', 'study-row');
  row.dataset.studyRowId = entry.id;
  row.setAttribute('aria-label', `Kanji ${entry.character} y tres ejemplos de vocabulario`);
  const source = studyRows.get(entry.id)!;
  source.itemIds.forEach((id, index) => {
    row.append(createStudyBlock(studyCatalog.byId.get(id)!, entry, index));
  });
  return row;
}

function render() {
  const results = search(input.value);
  grid.replaceChildren(...results.map(createRow));
  count.textContent = `${results.length} de ${kanji.length} kanji`;
  clearButton.hidden = !input.value;
  shortcut.hidden = Boolean(input.value);
  emptyState.hidden = results.length > 0;
  collectionEnd.hidden = results.length === 0;
  grid.hidden = results.length === 0;
  document.querySelectorAll<HTMLButtonElement>('[data-query]').forEach((button) => {
    button.setAttribute('aria-pressed', String(input.value === button.dataset.query));
  });
}

let urlTimer: ReturnType<typeof setTimeout>;
function updateSearch() {
  render();
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  }, 200);
}

function resetSearch() {
  input.value = '';
  updateSearch();
  input.focus();
}

input.value = new URLSearchParams(window.location.search).get('q') ?? '';
input.addEventListener('input', (event) => {
  if (!(event instanceof InputEvent) || !event.isComposing) updateSearch();
});
input.addEventListener('compositionend', updateSearch);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !event.isComposing) {
    event.preventDefault();
    resetSearch();
  }
});
document.querySelector('form')!.addEventListener('submit', (event) => event.preventDefault());
clearButton.addEventListener('click', resetSearch);
document.querySelector('#reset-search')!.addEventListener('click', resetSearch);
document.querySelectorAll<HTMLButtonElement>('[data-query]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.query!;
    updateSearch();
    input.focus();
  });
});
readingsToggle.addEventListener('change', () => {
  grid.querySelectorAll<HTMLElement>('.word-reading').forEach((reading) => {
    reading.hidden = !readingsToggle.checked;
  });
});
document.querySelector('#open-about')!.addEventListener('click', () => dialog.showModal());
document.querySelector('#close-about')!.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }
});
document.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement;
  if (event.key === '/' && !event.isComposing && !event.metaKey && !event.ctrlKey && !event.altKey && !document.querySelector('dialog[open]') && !target.closest('input, textarea, select, [contenteditable="true"]')) {
    event.preventDefault();
    input.focus();
  }
});
window.addEventListener('popstate', () => {
  clearTimeout(urlTimer);
  input.value = new URLSearchParams(window.location.search).get('q') ?? '';
  render();
});
render();
