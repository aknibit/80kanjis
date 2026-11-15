import { kanji } from './data/kanji.ts';
import { studyItemTarget } from './lib/difficulty.ts';
import { createKanjiSearch } from './lib/search.ts';
import { setupDifficulties } from './difficulties-ui.ts';
import { studyCatalog } from './data/study.ts';
import { getPronunciation, pronunciations, pronunciationSource } from './data/pronunciations.ts';
import { setupPronunciation } from './pronunciation-ui.ts';
import { getRowDifficulty, matchesRowDifficulty, parseRowDifficultyFilter, rowDifficultyFilters, type RowDifficultyFilter } from './lib/row-difficulty.ts';
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
      <h1 id="page-title">Un kanji. <span>Tres nuevas palabras.</span></h1>
      <p class="intro-description">80 kanji y 240 ejemplos para aprender a tu ritmo.</p>
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
        <p class="search-hints" id="search-hint">Busca en japonés o en español, por escritura, lectura o significado.</p>
      </form>

      <div class="collection-toolbar">
        <div class="collection-heading"><h2 id="collection-title">La colección</h2><span id="result-count" role="status" aria-live="polite" aria-atomic="true">80 de 80 kanji</span></div>
        <div class="collection-actions">
          <button id="filter-audio" class="audio-filter" type="button" aria-pressed="false" aria-controls="kanji-grid">Probar audio · ${pronunciations.length}</button>
          <label class="reading-control" for="show-readings"><input id="show-readings" type="checkbox" checked /><span class="switch-track" aria-hidden="true"></span>Mostrar lecturas</label>
        </div>
      </div>
      <div id="row-filters" class="row-filters" role="group" aria-label="Filtrar filas por dificultad" aria-describedby="row-filter-hint">
        ${Object.entries(rowDifficultyFilters).map(([value, label]) => `<button type="button" class="row-filter" data-row-filter="${value}" aria-pressed="${value === 'all'}" aria-controls="kanji-grid">${label} <span class="filter-count">—</span></button>`).join('')}
      </div>
      <p id="row-filter-hint" class="filter-hint">La dificultad más alta de la fila decide. Fácil requiere las cuatro entradas en fácil.</p>
      <p id="difficulty-status" class="difficulty-status" role="status" aria-live="polite">Cargando dificultades…</p>
      <p class="audio-note">Escucha una muestra de ${pronunciations.length} palabras con el botón de altavoz. <a href="audio/CREDITS.txt" target="_blank" rel="noopener">Créditos del audio</a></p>
      <p id="audio-status" class="audio-status" role="status" aria-live="polite"></p>
      <div id="kanji-grid" class="kanji-grid"></div>
      <div id="empty-state" class="empty-state" hidden>
        <span class="empty-character" lang="ja" aria-hidden="true">空</span>
        <h3>No encontramos resultados.</h3>
        <p>Prueba otra búsqueda o cambia los filtros de dificultad y audio.</p>
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
    <p>Los filtros conservan la fila entera: Difícil si cualquier entrada es difícil; Medio si hay alguna media y ninguna difícil; Fácil solo si las cuatro son fáciles. Sin completar agrupa las filas que solo tienen entradas fáciles o sin marcar y todavía no están completas.</p>
    <p class="dialog-note">Se conserva la escritura simplificada del documento. Los ejemplos marcados como duplicados se han completado con su lectura y significado de la misma colección.</p>
    <p class="dialog-note">Muestra de pronunciación: grabaciones de <a href="${pronunciationSource.url}" target="_blank" rel="noopener">${pronunciationSource.name}</a>, bajo <a href="${pronunciationSource.licenseUrl}" target="_blank" rel="noopener">${pronunciationSource.license}</a>, sin modificar. La colección original combina voces japonesas con acentos de Tokio y Kansai. Estas muestras están pendientes de revisión de pronunciación. <a href="audio/CREDITS.txt" target="_blank" rel="noopener">Fuentes de cada audio</a>.</p>
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
const audioFilter = document.querySelector<HTMLButtonElement>('#filter-audio')!;
const pronunciation = setupPronunciation(document.querySelector('#audio-status')!);
let onlyAudio = new URLSearchParams(window.location.search).get('audio') === '1';
let difficultyFilter = parseRowDifficultyFilter(new URLSearchParams(window.location.search).get('difficulty'));
const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-row-filter]')];
let difficultiesLoaded = false;
const rowsWithAudio = new Set(studyCatalog.rows.filter((row) => row.itemIds.some((id) => {
  const item = studyCatalog.byId.get(id)!;
  return item.type === 'vocabulary' && getPronunciation(item);
})).map((row) => row.id));

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
  if (item.type === 'vocabulary') {
    const audioButton = pronunciation.createButton(item);
    if (audioButton) footer.append(audioButton);
  }
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
  pronunciation.stop();
  document.querySelector<HTMLElement>('#audio-status')!.textContent = '';
  const focused = document.activeElement instanceof HTMLSelectElement ? document.activeElement : null;
  const focusedKey = focused?.dataset.difficultyKey;
  const focusedRow = focused?.closest<HTMLElement>('[data-study-row-id]')?.dataset.studyRowId;
  const candidates = search(input.value).filter((entry) => !onlyAudio || rowsWithAudio.has(entry.id));
  const rowRatings = new Map(studyCatalog.rows.map((row) => [row.id, getRowDifficulty(row, difficulties.get)]));
  const results = candidates.filter((entry) => matchesRowDifficulty(rowRatings.get(entry.id) ?? null, difficultyFilter));
  audioFilter.setAttribute('aria-pressed', String(onlyAudio));
  document.querySelector<HTMLElement>('.audio-note')!.hidden = !onlyAudio;
  filterButtons.forEach((button) => {
    const filter = button.dataset.rowFilter as RowDifficultyFilter;
    button.setAttribute('aria-pressed', String(filter === difficultyFilter));
    button.disabled = !difficultiesLoaded;
    button.querySelector('.filter-count')!.textContent = difficultiesLoaded
      ? String(candidates.filter((entry) => matchesRowDifficulty(rowRatings.get(entry.id) ?? null, filter)).length)
      : '—';
  });
  grid.replaceChildren(...results.map(createRow));
  if (focusedKey && focusedRow) {
    const replacement = grid.querySelector<HTMLSelectElement>(`[data-study-row-id="${CSS.escape(focusedRow)}"] [data-difficulty-key="${CSS.escape(focusedKey)}"]`);
    (replacement ?? filterButtons.find((button) => button.dataset.rowFilter === difficultyFilter))?.focus({ preventScroll: true });
  }
  count.textContent = `${results.length} de ${kanji.length} kanji`;
  clearButton.hidden = !input.value;
  shortcut.hidden = Boolean(input.value);
  emptyState.hidden = results.length > 0;
  collectionEnd.hidden = results.length === 0;
  grid.hidden = results.length === 0;
}

let urlTimer: ReturnType<typeof setTimeout>;
function updateSearch() {
  render();
  clearTimeout(urlTimer);
  urlTimer = setTimeout(() => {
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    if (onlyAudio) url.searchParams.set('audio', '1');
    else url.searchParams.delete('audio');
    if (difficultyFilter !== 'all') url.searchParams.set('difficulty', difficultyFilter);
    else url.searchParams.delete('difficulty');
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
document.querySelector('#reset-search')!.addEventListener('click', () => {
  onlyAudio = false;
  difficultyFilter = 'all';
  resetSearch();
});
audioFilter.addEventListener('click', () => {
  onlyAudio = !onlyAudio;
  updateSearch();
});
filterButtons.forEach((button) => button.addEventListener('click', () => {
  difficultyFilter = button.dataset.rowFilter as RowDifficultyFilter;
  updateSearch();
}));
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
  onlyAudio = new URLSearchParams(window.location.search).get('audio') === '1';
  difficultyFilter = parseRowDifficultyFilter(new URLSearchParams(window.location.search).get('difficulty'));
  render();
});
difficulties.subscribe(() => { if (difficultiesLoaded) render(); });
void difficulties.ready.then(() => { difficultiesLoaded = true; render(); });
render();
