import type { ContentEntry, ContentGroup, CounterEntry, LexiconEntry, KanaEntry, NavigationSection, StudyDocument } from './content-types.ts';
import { searchContent } from './lib/content.ts';
import { fitPlaceholder } from './search-placeholder.ts';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className = '', text?: string) {
  const result = document.createElement(tag);
  result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

function japanese<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text: string) {
  const result = node(tag, className, text);
  result.lang = 'ja';
  return result;
}

function renderCounter(entry: CounterEntry): HTMLElement {
  const details = node('details', 'counter-entry');
  details.dataset.entryId = entry.id;
  const summary = node('summary', 'counter-summary');
  const name = node('span', 'counter-name');
  const heading = node('span', 'counter-heading');
  heading.append(node('span', 'counter-title', entry.title), node('span', 'counter-description', entry.description));
  name.append(japanese('span', 'counter-symbol', entry.written), heading);
  // The most common endings, as chips in their own column; CSS prefixes each with 〜, like the counter symbol.
  const endings = node('span', 'counter-endings');
  const endingList = japanese('span', 'counter-ending-list', '');
  for (const ending of entry.endings) endingList.append(node('span', 'counter-ending', ending));
  endings.append(node('span', 'counter-endings-label', 'Terminaciones'), endingList);
  summary.append(name, endings, node('span', 'counter-form-count', `${entry.forms.length} formas`));
  const body = node('div', 'counter-body');
  for (const note of entry.notes) body.append(node('p', 'counter-note', note));
  const table = node('table', 'counter-table');
  table.append(node('caption', 'visually-hidden', `${entry.title}: ejemplos, escritura y lecturas`));
  const head = node('thead');
  const headers = node('tr');
  for (const label of ['Ejemplo', 'Escritura', 'Lectura']) {
    const cell = node('th', '', label);
    cell.scope = 'col';
    headers.append(cell);
  }
  head.append(headers);
  const rows = node('tbody');
  for (const form of entry.forms) {
    const row = node('tr', form.special ? 'counter-special' : '');
    const quantity = node('th', '', form.meaning);
    quantity.scope = 'row';
    const reading = node('td', 'counter-reading-cell');
    reading.append(japanese('span', 'word-reading', form.readings.join(' · ')));
    if (form.special) reading.append(node('span', 'special-reading', 'Lectura especial'));
    row.append(quantity, japanese('td', 'counter-written', form.written), reading);
    rows.append(row);
  }
  const question = node('tr', 'counter-question');
  const questionLabel = node('th', '', entry.question.meaning);
  questionLabel.scope = 'row';
  question.append(questionLabel, japanese('td', 'counter-written', entry.question.written),
    japanese('td', 'word-reading', entry.question.readings.join(' · ')));
  rows.append(question);
  table.append(head, rows);
  body.append(table);
  details.append(summary, body);
  return details;
}

function renderWord(entry: LexiconEntry, group: string): HTMLElement {
  const row = node('li', 'lexicon-row');
  row.dataset.entryId = entry.id;
  const term = node('div', 'lexicon-term');
  term.append(japanese('h3', 'lexicon-written', entry.written), japanese('p', 'word-reading', entry.reading),
    node('p', 'entry-romaji', entry.romaji));
  const explanation = node('div', 'lexicon-explanation');
  explanation.append(node('p', 'lexicon-meaning', entry.meaning));
  if (entry.note) explanation.append(node('p', 'entry-note', entry.note));
  row.append(term, explanation, node('span', 'entry-group', group));
  return row;
}

function renderKana(entry: KanaEntry): HTMLElement {
  const item = node('div', 'kana-entry');
  item.dataset.entryId = entry.id;
  const letters = node('div', 'kana-letters');
  const hiragana = japanese('span', 'kana-hiragana', entry.hiragana);
  hiragana.setAttribute('aria-label', `Hiragana: ${entry.hiragana}`);
  const katakana = japanese('span', 'kana-katakana', entry.katakana);
  katakana.setAttribute('aria-label', `Katakana: ${entry.katakana}`);
  letters.append(hiragana, katakana);
  item.append(letters, node('span', 'entry-romaji', entry.romaji));
  return item;
}

function renderKanaChart(entries: readonly KanaEntry[], group: ContentGroup, frame: readonly KanaEntry[]): HTMLElement {
  const section = node('section', 'kana-chart-group');
  const title = node('h2', 'kana-chart-title', group.label);
  title.id = `kana-chart-${group.id}`;
  const surface = node('div', 'kana-chart-surface');
  const table = node('table', 'kana-chart');
  table.dir = 'rtl';
  table.append(node('caption', 'visually-hidden', `${group.label}: columnas de derecha a izquierda, sonidos de arriba abajo.`));
  const columns = [...new Set(frame.map((entry) => entry.position.column))].sort((a, b) => a - b);
  const rowCount = Math.max(...frame.filter((entry) => entry.group === group.id).map((entry) => entry.position.row));
  table.style.setProperty('--kana-columns', String(columns.length));
  if (entries.some((entry) => entry.hiragana.length > 1)) table.classList.add('kana-chart--combined');
  const cells = new Map(entries.map((entry) => [`${entry.position.column}:${entry.position.row}`, entry]));
  const body = node('tbody');
  for (let row = 1; row <= rowCount; row += 1) {
    const line = node('tr');
    for (const column of columns) {
      const cell = node('td');
      const entry = cells.get(`${column}:${row}`);
      if (entry) cell.append(renderKana(entry));
      else cell.setAttribute('aria-label', 'Sin kana en esta posición');
      line.append(cell);
    }
    body.append(line);
  }
  table.append(body); surface.append(table); section.append(title, surface);
  return section;
}

function renderGuides(data: StudyDocument): HTMLElement {
  const details = node('details', 'study-guides');
  details.append(node('summary', '', 'Notas para estudiar'));
  for (const guide of data.guides) {
    const article = node('section', 'study-guide');
    article.append(node('h3', '', guide.title));
    for (const paragraph of guide.paragraphs) article.append(node('p', '', paragraph));
    for (const example of guide.examples ?? []) {
      const sample = node('div', 'guide-example');
      sample.append(japanese('p', 'guide-written', example.written));
      if (example.reading !== example.written) sample.append(japanese('p', 'word-reading', example.reading));
      sample.append(node('p', '', example.meaning));
      article.append(sample);
    }
    details.append(article);
  }
  return details;
}

function renderSources(data: StudyDocument): HTMLElement {
  const details = node('details', 'study-sources');
  details.append(node('summary', '', 'Fuentes de esta sección'));
  const list = node('ul');
  for (const source of data.sources) {
    const item = node('li');
    if (source.url) {
      const link = node('a', '', source.label);
      link.href = source.url;
      link.target = '_blank'; link.rel = 'noopener';
      item.append(link);
    } else item.textContent = source.label;
    list.append(item);
  }
  details.append(list);
  return details;
}

export function renderStudyPage(host: HTMLElement, data: StudyDocument, section: NavigationSection): void {
  const intro = node('section', 'intro');
  const title = node('h1', '', data.title);
  title.id = 'study-page-title';
  intro.setAttribute('aria-labelledby', title.id);
  intro.append(title, node('p', 'intro-description', data.description));
  const collection = node('section', 'study-collection');
  collection.setAttribute('aria-label', data.title);
  const form = node('form', 'search-form');
  form.setAttribute('role', 'search');
  const label = node('label', 'visually-hidden', `Buscar en ${section.label}`);
  label.htmlFor = 'study-search';
  const box = node('div', 'search-box');
  const icon = node('span', 'study-search-icon');
  icon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></svg>';
  const input = node('input');
  input.id = 'study-search'; input.type = 'search'; input.autocomplete = 'off'; input.spellcheck = false;
  if (data.kind === 'kana') fitPlaceholder(input, 'Busca un kana o su lectura en letras latinas…', 'Kana o lectura: ka, shi…');
  else if (data.kind === 'counters') fitPlaceholder(input, 'Busca qué contar, un contador o una lectura…', 'Qué contar o lectura…');
  else fitPlaceholder(input, 'Busca en japonés o español: escritura, lectura o significado…', 'Palabra, lectura o significado…');
  input.setAttribute('aria-controls', 'study-results');
  const clear = node('button', 'clear-button', '×');
  clear.type = 'button'; clear.setAttribute('aria-label', 'Borrar búsqueda');
  box.append(icon, input, clear); form.append(label, box);
  const toolbar = node('div', 'collection-toolbar');
  const filters = node('div', 'row-filters');
  filters.setAttribute('role', 'group'); filters.setAttribute('aria-label', 'Filtrar por grupo');
  const count = node('span', 'study-result-count');
  count.setAttribute('role', 'status'); count.setAttribute('aria-live', 'polite'); count.setAttribute('aria-atomic', 'true');
  toolbar.append(filters, count);
  const results = node(data.kind === 'lexicon' ? 'ul' : 'div', `study-results study-results--${data.kind}`);
  results.id = 'study-results';
  if (data.kind === 'lexicon') results.setAttribute('role', 'list');
  if (data.kind === 'kana') {
    results.classList.add('kana-chart-scroll');
    results.tabIndex = 0;
    results.setAttribute('role', 'region');
    results.setAttribute('aria-labelledby', title.id);
  }
  const empty = node('div', 'empty-state');
  empty.append(node('h3', '', 'No encontramos resultados.'), node('p', '', 'Prueba otra búsqueda o cambia el grupo.'));
  const reset = node('button', 'reset-button', 'Ver todo'); reset.type = 'button'; empty.append(reset);
  collection.append(form, toolbar);
  if (data.guides.length) collection.append(renderGuides(data));
  collection.append(results, empty, renderSources(data));
  host.replaceChildren(intro, collection);

  const groups = new Map(data.groups.map((group) => [group.id, group.label]));
  const filterButtons = new Map<string, HTMLButtonElement>();
  let selectedGroup = 'all';
  let urlTimer: ReturnType<typeof setTimeout> | undefined;
  for (const group of [{ id: 'all', label: 'Todo' }, ...data.groups]) {
    const button = node('button', 'row-filter');
    button.type = 'button'; button.dataset.contentGroup = group.id;
    button.setAttribute('aria-controls', results.id);
    button.append(node('span', '', group.label), node('span', 'filter-count'));
    button.addEventListener('click', () => { selectedGroup = group.id; render(); updateUrl(); });
    filters.append(button); filterButtons.set(group.id, button);
  }

  function updateUrl() {
    clearTimeout(urlTimer);
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    if (selectedGroup !== 'all') url.searchParams.set('group', selectedGroup); else url.searchParams.delete('group');
    window.history.replaceState(null, '', url);
  }

  function render() {
    const matching = searchContent<ContentEntry>(data.entries, input.value);
    const entries = matching.filter((entry) => selectedGroup === 'all' || entry.group === selectedGroup);
    for (const [id, button] of filterButtons) {
      button.setAttribute('aria-pressed', String(id === selectedGroup));
      button.querySelector('.filter-count')!.textContent = String(id === 'all' ? matching.length : matching.filter((entry) => entry.group === id).length);
    }
    const fragment = document.createDocumentFragment();
    if (data.kind === 'kana') {
      for (const group of data.groups) {
        const groupEntries = (entries as readonly KanaEntry[]).filter((entry) => entry.group === group.id);
        if (groupEntries.length > 0) fragment.append(renderKanaChart(groupEntries, group, data.entries));
      }
    } else {
      for (const entry of entries) fragment.append('forms' in entry ? renderCounter(entry)
        : renderWord(entry as LexiconEntry, groups.get(entry.group)!));
    }
    results.replaceChildren(fragment);
    clear.hidden = !input.value;
    empty.hidden = entries.length > 0; results.hidden = entries.length === 0;
    const noun = data.kind === 'counters' ? 'grupos' : data.kind === 'kana' ? 'sonidos' : 'entradas';
    count.textContent = `${entries.length} de ${data.entries.length} ${noun}`;
  }

  function restoreUrl() {
    const params = new URL(window.location.href).searchParams;
    input.value = params.get('q') ?? '';
    selectedGroup = groups.has(params.get('group') ?? '') ? params.get('group')! : 'all';
    render();
  }
  function clearSearch() { input.value = ''; render(); updateUrl(); input.focus(); }
  clear.addEventListener('click', clearSearch);
  reset.addEventListener('click', () => { selectedGroup = 'all'; clearSearch(); });
  form.addEventListener('submit', (event) => event.preventDefault());
  input.addEventListener('input', (event) => {
    if (event instanceof InputEvent && event.isComposing) return;
    render(); clearTimeout(urlTimer); urlTimer = setTimeout(updateUrl, 200);
  });
  input.addEventListener('compositionend', () => { render(); updateUrl(); });
  input.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !event.isComposing) { event.preventDefault(); clearSearch(); } });
  document.addEventListener('keydown', (event) => {
    const target = event.target as HTMLElement;
    if (event.key === '/' && !event.isComposing && !event.metaKey && !event.ctrlKey && !event.altKey
      && !document.querySelector('dialog[open]') && !target.closest('input, textarea, [contenteditable="true"]')) {
      event.preventDefault(); input.focus();
    }
  });
  window.addEventListener('popstate', () => { clearTimeout(urlTimer); restoreUrl(); });
  restoreUrl();
}
