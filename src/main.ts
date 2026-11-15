import { collectionRows, loadCollection } from './lib/collection.ts';
import { collectionDifficulties, difficultyLabels } from './lib/difficulty.ts';
import { createKanjiSearch } from './lib/search.ts';
import { createStudyCatalog } from './lib/study-catalog.ts';
import { pronunciationSource, synthesizedSource } from './data/pronunciations.ts';
import { setupPronunciation } from './pronunciation-ui.ts';
import { getRowDifficulty, getRowFilterState, matchesRowDifficulty, parseRowDifficultyFilter, rowDifficultyFilters, type RowDifficultyFilter } from './lib/row-difficulty.ts';
import type { Difficulty, Kanji, StudyItem, StudyItemId } from './types.ts';
import './style.css';

const searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>';
const arrowIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const closeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';

function difficultyIcon(value: Difficulty | null): string {
  const filled = value === 'easy' ? 1 : value === 'medium' ? 2 : value === 'hard' ? 3 : 0;
  return `<svg class="difficulty-icon" viewBox="0 0 32 16" aria-hidden="true" focusable="false">${[6, 16, 26].map((x, index) => `<circle cx="${x}" cy="8" r="3.2"${index < filled ? ' class="is-filled"' : ''}/>`).join('')}</svg>`;
}

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
      </div>
      <div id="row-filters" class="row-filters" role="group" aria-label="Filtrar filas por dificultad" aria-describedby="row-filter-hint">
        ${Object.entries(rowDifficultyFilters).map(([value, label]) => `<button type="button" class="row-filter" data-row-filter="${value}" aria-pressed="${value === 'all'}" aria-controls="kanji-grid" disabled${value === 'unrated' ? ' hidden' : ''}>${label} <span class="filter-count">—</span></button>`).join('')}
      </div>
      <p id="row-filter-hint" class="filter-hint">La dificultad más alta de la fila decide. Fácil requiere las cuatro entradas en fácil.</p>
      <p id="collection-status" class="collection-status" role="status" aria-live="polite">Cargando la colección…</p>
      <p id="audio-status" class="audio-status" role="status" aria-live="polite"></p>
      <div id="kanji-grid" class="kanji-grid"></div>
      <div id="empty-state" class="empty-state" hidden>
        <span class="empty-character" lang="ja" aria-hidden="true">空</span>
        <h3>No encontramos resultados.</h3>
        <p>Prueba otra búsqueda o cambia el filtro de dificultad.</p>
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
    <p>Busca por carácter, palabra, lectura o significado. Puedes escribir sin tildes y usar hiragana o katakana. Las lecturas se muestran siempre junto a las palabras.</p>
    <p>Los filtros conservan la fila entera: Difícil si cualquier entrada es difícil; Medio si hay alguna media y ninguna difícil; Fácil solo si las cuatro son fáciles. Sin completar agrupa las filas que solo tienen entradas fáciles o sin marcar y todavía no están completas.</p>
    <p>En las fichas, uno, dos o tres puntos destacados indican fácil, medio y difícil. Tres puntos atenuados indican que la dificultad está sin marcar.</p>
    <p class="dialog-note">Se conserva la escritura simplificada del documento. Los ejemplos marcados como duplicados se han completado con su lectura y significado de la misma colección.</p>
    <p class="dialog-note">Pronunciación: grabaciones de <a href="${pronunciationSource.url}" target="_blank" rel="noopener">${pronunciationSource.name}</a>, bajo <a href="${pronunciationSource.licenseUrl}" target="_blank" rel="noopener">${pronunciationSource.license}</a>, sin modificar, con voces de Tokio y Kansai. Los botones con «IA» usan voz generada por <a href="${synthesizedSource.url}" target="_blank" rel="noopener">${synthesizedSource.name}</a> (${synthesizedSource.voice}), bajo sus <a href="${synthesizedSource.termsUrl}" target="_blank" rel="noopener">condiciones de uso</a>. Los audios están pendientes de revisión por un hablante nativo. <a href="audio/CREDITS.txt" target="_blank" rel="noopener">Fuentes y créditos de cada audio</a>.</p>
    <div class="dialog-shortcut"><kbd>/</kbd> Buscar <kbd>Esc</kbd> Borrar la búsqueda o cerrar esta ventana</div>
  </dialog>

`;

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function start() {
  const source = await loadCollection();
  const kanji = collectionRows(source);
  const studyCatalog = createStudyCatalog(kanji);
  const input = document.querySelector<HTMLInputElement>('#search')!;
  const grid = document.querySelector<HTMLDivElement>('#kanji-grid')!;
  const count = document.querySelector<HTMLSpanElement>('#result-count')!;
  const clearButton = document.querySelector<HTMLButtonElement>('#clear-search')!;
  const shortcut = document.querySelector<HTMLElement>('#search-shortcut')!;
  const emptyState = document.querySelector<HTMLDivElement>('#empty-state')!;
  const collectionEnd = document.querySelector<HTMLParagraphElement>('#collection-end')!;
  const dialog = document.querySelector<HTMLDialogElement>('#about-dialog')!;
  const search = createKanjiSearch(kanji);
  const positions = new Map<string, number>(kanji.map((entry, index) => [entry.id, index + 1]));
  const difficulties = collectionDifficulties(source);
  const getDifficulty = (id: StudyItemId) => difficulties.get(id) ?? null;
  const rowRatings = new Map(studyCatalog.rows.map((row) => [row.id, getRowDifficulty(row, getDifficulty)]));
  const studyRows = new Map(studyCatalog.rows.map((row) => [row.id, row]));
  const pronunciation = setupPronunciation(document.querySelector('#audio-status')!);
  let difficultyFilter = parseRowDifficultyFilter(new URLSearchParams(window.location.search).get('difficulty'));
  const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-row-filter]')];

  function createStudyBlock(item: StudyItem, entry: Kanji, blockIndex: number): HTMLElement {
    const block = element('article', `study-block study-block--${item.type}`);
    block.dataset.studyItemId = item.id;
    block.dataset.studyItemType = item.type;
    // A repeated vocabulary item shares its data ID but needs a unique DOM heading ID.
    const headingId = `${entry.id}-item-${blockIndex}`;
    block.setAttribute('aria-labelledby', headingId);

    const meta = element('div', 'study-meta');
    const identity = element('div', 'study-identity');
    identity.append(element('span', 'study-type', item.type === 'kanji' ? 'Kanji' : 'Vocabulario'));
    if (item.type === 'kanji') identity.append(element('span', 'study-number', String(positions.get(entry.id)).padStart(2, '0')));
    meta.append(identity);

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
      japanese.append(written, reading);
      content.append(japanese, element('p', 'study-meaning', item.meanings.join(' · ')));
    }
    const controls = element('div', 'study-controls');
    const value = getDifficulty(item.id);
    const label = value === null ? 'Sin marcar' : difficultyLabels[value];
    const badge = element('span', 'difficulty-badge');
    badge.innerHTML = difficultyIcon(value);
    badge.dataset.difficulty = value ?? '';
    badge.title = label;
    badge.setAttribute('role', 'img');
    badge.setAttribute('aria-label', `Dificultad de ${item.type === 'kanji' ? item.character : item.written}: ${label}`);
    controls.append(badge);
    if (item.type === 'vocabulary') {
      const audioButton = pronunciation.createButton(item);
      if (audioButton) controls.append(audioButton);
    }
    meta.append(controls);
    block.append(meta, content);
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
    const candidates = search(input.value);
    const filters = getRowFilterState(candidates.map((entry) => rowRatings.get(entry.id) ?? null), difficultyFilter);
    if (filters.selected !== difficultyFilter) {
      difficultyFilter = filters.selected;
      updateUrl();
    }
    const results = candidates.filter((entry) => matchesRowDifficulty(rowRatings.get(entry.id) ?? null, difficultyFilter));
    filterButtons.forEach((button) => {
      const filter = button.dataset.rowFilter as RowDifficultyFilter;
      button.setAttribute('aria-pressed', String(filter === difficultyFilter));
      button.disabled = false;
      button.hidden = !filters.available.includes(filter);
      button.querySelector('.filter-count')!.textContent = String(filters.counts[filter]);
    });
    grid.replaceChildren(...results.map(createRow));
    count.textContent = `${results.length} de ${kanji.length} kanji`;
    clearButton.hidden = !input.value;
    shortcut.hidden = Boolean(input.value);
    emptyState.hidden = results.length > 0;
    collectionEnd.hidden = results.length === 0;
    grid.hidden = results.length === 0;
  }

  let urlTimer: ReturnType<typeof setTimeout>;
  function updateUrl() {
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    if (difficultyFilter !== 'all') url.searchParams.set('difficulty', difficultyFilter);
    else url.searchParams.delete('difficulty');
    window.history.replaceState(null, '', url);
  }
  function updateSearch() {
    render();
    clearTimeout(urlTimer);
    urlTimer = setTimeout(updateUrl, 200);
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
    difficultyFilter = 'all';
    resetSearch();
  });
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    difficultyFilter = button.dataset.rowFilter as RowDifficultyFilter;
    updateSearch();
  }));
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
    if (event.key === '/' && !event.isComposing && !event.metaKey && !event.ctrlKey && !event.altKey && !document.querySelector('dialog[open]') && !target.closest('input, textarea, [contenteditable="true"]')) {
      event.preventDefault();
      input.focus();
    }
  });
  window.addEventListener('popstate', () => {
    clearTimeout(urlTimer);
    input.value = new URLSearchParams(window.location.search).get('q') ?? '';
    difficultyFilter = parseRowDifficultyFilter(new URLSearchParams(window.location.search).get('difficulty'));
    render();
  });
  document.querySelector<HTMLElement>('#collection-status')!.hidden = true;
  render();
}

void start().catch(() => {
  const status = document.querySelector<HTMLElement>('#collection-status')!;
  status.hidden = false;
  status.textContent = 'No se pudo cargar la colección. Recarga la página para volver a intentarlo.';
  status.classList.add('load-error');
  document.querySelector<HTMLElement>('#result-count')!.textContent = 'No disponible';
  document.querySelectorAll<HTMLInputElement | HTMLButtonElement>('.collection input, .collection button').forEach((control) => { control.disabled = true; });
});
