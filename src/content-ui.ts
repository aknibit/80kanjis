import type { ContentEntry, ContentGroup, CounterEntry, CounterExample, ExampleForm, LexiconEntry, KanaEntry, NavigationSection, StudyDocument } from './content-types.ts';
import { difficulties, filterByGroupAndDifficulty, parseDifficultyFilter, searchContent, shuffled, type DifficultyFilter } from './lib/content.ts';
import { difficultyIcon, difficultyLabels } from './lib/difficulty.ts';
import { setupMasonry } from './masonry.ts';
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

/** Text that may wrap after each slash, so that 高校／高等学校 or contemplación/festival never splits inside a word. */
function slashed<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text: string) {
  const result = node(tag, className);
  for (const part of text.split(/(?<=[/／])/)) {
    if (result.firstChild) result.append(document.createElement('wbr'));
    result.append(part);
  }
  return result;
}

const formLabels: Record<ExampleForm, string> = {
  'present-affirmative': 'Presente afirmativo',
  'past-affirmative': 'Pasado afirmativo',
  'present-negative': 'Presente negativo',
  'past-negative': 'Pasado negativo',
};

/** The example or sentence of a form: written, its reading in kana and the translation, one under the other. */
function renderCounterExample(example: CounterExample, kind: 'example' | 'sentence'): HTMLElement {
  const cell = node('td', `counter-${kind}`);
  cell.setAttribute('role', 'cell');
  cell.append(japanese('span', 'counter-example-written', example.written),
    japanese('span', 'counter-example-reading', example.reading), node('span', 'counter-example-meaning', example.meaning));
  return cell;
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
  // Its difficulty, with the dots of the kanji cards, above the number of forms.
  const meta = node('span', 'counter-meta');
  const level = difficultyLabels[entry.difficulty];
  const badge = node('span', 'difficulty-badge counter-difficulty');
  badge.innerHTML = difficultyIcon(entry.difficulty);
  badge.dataset.difficulty = entry.difficulty;
  badge.title = `Dificultad: ${level}`;
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', `Dificultad: ${level}`);
  meta.append(badge, node('span', 'counter-form-count', `${entry.forms.length} formas`));
  summary.append(name, endings, meta);
  const body = node('div', 'counter-body');
  for (const note of entry.notes) body.append(node('p', 'counter-note', note));
  // Phones lay the table out as a grid, which can drop its semantics in some screen readers; explicit roles keep them.
  const table = node('table', 'counter-table');
  table.setAttribute('role', 'table');
  table.append(node('caption', 'visually-hidden', `${entry.title}: escritura, lecturas, ejemplos y frases`));
  const head = node('thead');
  const headers = node('tr');
  head.setAttribute('role', 'rowgroup'); headers.setAttribute('role', 'row');
  for (const label of ['Escritura', 'Lectura', 'Ejemplo', 'Frase']) {
    const cell = node('th', '', label);
    cell.scope = 'col';
    cell.setAttribute('role', 'columnheader');
    headers.append(cell);
  }
  head.append(headers);
  const rows = node('tbody');
  rows.setAttribute('role', 'rowgroup');
  // Each row is headed by its writing, which pairs with the reading next to it.
  const row = (className: string, item: { written: string; readings: readonly string[]; example: CounterExample; sentence: CounterExample },
    special = false) => {
    const line = node('tr', className);
    line.setAttribute('role', 'row');
    const written = japanese('th', 'counter-written', item.written);
    written.scope = 'row';
    written.setAttribute('role', 'rowheader');
    const reading = node('td', 'counter-reading-cell');
    reading.setAttribute('role', 'cell');
    reading.append(japanese('span', 'word-reading', item.readings.join(' · ')));
    if (special) reading.append(node('span', 'special-reading', 'Lectura especial'));
    line.append(written, reading, renderCounterExample(item.example, 'example'), renderCounterExample(item.sentence, 'sentence'));
    return line;
  };
  for (const form of entry.forms) rows.append(row(form.special ? 'counter-special' : '', form, form.special));
  rows.append(row('counter-question', entry.question));
  table.append(head, rows);
  body.append(table);
  details.append(summary, body);
  return details;
}

/**
 * A lexicon entry as a row, or as a card for sections with "layout": "cards". Its group shows as a tag, unless `group`
 * is undefined: cards leave it out while a group is selected, since the filter already names it.
 */
function renderWord(entry: LexiconEntry, group: string | undefined, card = false): HTMLElement {
  const row = node('li', card ? 'lexicon-card' : 'lexicon-row');
  row.dataset.entryId = entry.id;
  // An entry with examples opens like a counter. A summary only admits phrasing content, so it uses spans
  // where the static row has a heading and paragraphs.
  const opens = Boolean(entry.examples?.length);
  const block = opens ? 'span' : 'div';
  const line = opens ? 'span' : 'p';
  const term = node(block, 'lexicon-term');
  const written = slashed(opens ? 'span' : 'h3', 'lexicon-written', entry.written);
  written.lang = 'ja';
  term.append(written);
  // A word in hiragana (あさ, でんわをかけます) is its own reading, as in the examples; katakana keeps it (バス, ばす).
  if (entry.written.replace(/\s/gu, '') !== entry.reading.replace(/\s/gu, '')) {
    const reading = slashed(line, 'word-reading', entry.reading);
    reading.lang = 'ja';
    term.append(reading);
  }
  term.append(node(line, 'entry-romaji', entry.romaji));
  const explanation = node(block, 'lexicon-explanation');
  explanation.append(slashed(line, 'lexicon-meaning', entry.meaning));
  if (entry.note) explanation.append(slashed(line, 'entry-note', entry.note));
  const tags = group === undefined ? [] : [node('span', 'entry-group', group)];
  if (!opens) {
    row.append(term, explanation, ...tags);
    return row;
  }
  row.classList.add('lexicon-row--opens');
  const details = node('details', 'lexicon-details');
  const summary = node('summary', 'lexicon-summary');
  summary.append(term, explanation, ...tags);
  const body = node('div', 'lexicon-body');
  // The four forms of an adjective read as a table: present above past, affirmative to the left of negative.
  const list = node('ul', entry.examples![0].form ? 'lexicon-examples lexicon-examples--forms' : 'lexicon-examples');
  list.id = `examples-${entry.id}`;
  const label = node('p', 'lexicon-examples-label', 'Ejemplos');
  label.id = `${list.id}-label`;
  list.setAttribute('aria-labelledby', label.id);
  for (const example of entry.examples!) {
    const item = node('li', 'lexicon-example');
    if (example.form) item.append(node('p', 'lexicon-example-form', formLabels[example.form]));
    item.append(japanese('p', 'lexicon-example-written', example.written));
    // A sentence without kanji (テニスが できます。) needs no reading line, as in the guides.
    if (example.reading !== example.written) item.append(japanese('p', 'lexicon-example-reading', example.reading));
    item.append(node('p', 'lexicon-example-meaning', example.meaning));
    list.append(item);
  }
  body.append(label, list);
  details.append(summary, body);
  row.append(details);
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
  const cards = data.kind === 'lexicon' && section.layout === 'cards';
  if (cards) collection.classList.add('study-collection--cards');
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
  // Counters also filter by difficulty, in a second row that combines with the groups: easy objects. The row has
  // no visible title: its buttons take the tint of their level, like the difficulty dots.
  const leveled = data.kind === 'counters';
  const difficultyFilters = node('div', 'row-filters difficulty-filters');
  if (leveled) {
    const rows = node('div', 'filter-rows');
    difficultyFilters.setAttribute('role', 'group'); difficultyFilters.setAttribute('aria-label', 'Filtrar por dificultad');
    rows.append(filters, difficultyFilters);
    toolbar.append(rows, count);
  } else toolbar.append(filters, count);
  const results = node(data.kind === 'lexicon' ? 'ul' : 'div', `study-results study-results--${data.kind}`);
  if (cards) results.classList.add('study-results--cards');
  // Every row keeps a column for + / − when some entry opens, so meanings and tags stay aligned.
  else if (data.kind === 'lexicon' && data.entries.some((entry) => entry.examples?.length)) results.classList.add('study-results--opens');
  results.id = 'study-results';
  if (data.kind === 'lexicon') results.setAttribute('role', 'list');
  if (data.kind === 'kana') {
    results.classList.add('kana-chart-scroll');
    results.tabIndex = 0;
    results.setAttribute('role', 'region');
    results.setAttribute('aria-labelledby', title.id);
  }
  const empty = node('div', 'empty-state');
  empty.append(node('h3', '', 'No encontramos resultados.'), node('p', '', `Prueba otra búsqueda o cambia ${leveled ? 'los filtros' : 'el grupo'}.`));
  const reset = node('button', 'reset-button', 'Ver todo'); reset.type = 'button'; empty.append(reset);
  collection.append(form, toolbar);
  if (data.guides.length) collection.append(renderGuides(data));
  collection.append(results, empty, renderSources(data));
  host.replaceChildren(intro, collection);

  const groups = new Map(data.groups.map((group) => [group.id, group.label]));
  // Cards under «Todo» come in a random order, shuffled once per visit so that searching keeps it.
  // A selected group shows its entries in their thematic order.
  const randomOrder = cards ? shuffled<ContentEntry>(data.entries) : data.entries;
  const placeCards = cards ? setupMasonry(results) : undefined;
  const filterButtons = new Map<string, HTMLButtonElement>();
  const difficultyButtons = new Map<DifficultyFilter, HTMLButtonElement>();
  let selectedGroup = 'all';
  let selectedDifficulty: DifficultyFilter = 'all';
  let urlTimer: ReturnType<typeof setTimeout> | undefined;
  const filterButton = (label: string, onClick: () => void) => {
    const button = node('button', 'row-filter');
    button.type = 'button';
    button.setAttribute('aria-controls', results.id);
    button.append(node('span', '', label), node('span', 'filter-count'));
    button.addEventListener('click', () => { onClick(); render(); updateUrl(); });
    return button;
  };
  for (const group of [{ id: 'all', label: 'Todo' }, ...data.groups]) {
    const button = filterButton(group.label, () => { selectedGroup = group.id; });
    button.dataset.contentGroup = group.id;
    filters.append(button); filterButtons.set(group.id, button);
  }
  if (leveled) {
    for (const level of ['all', ...difficulties] as const) {
      const button = filterButton(level === 'all' ? 'Todas' : difficultyLabels[level], () => { selectedDifficulty = level; });
      button.dataset.difficultyFilter = level;
      difficultyFilters.append(button); difficultyButtons.set(level, button);
    }
  }

  function updateUrl() {
    clearTimeout(urlTimer);
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    if (selectedGroup !== 'all') url.searchParams.set('group', selectedGroup); else url.searchParams.delete('group');
    if (selectedDifficulty !== 'all') url.searchParams.set('difficulty', selectedDifficulty); else url.searchParams.delete('difficulty');
    window.history.replaceState(null, '', url);
  }

  function render() {
    const matching = searchContent<ContentEntry>(selectedGroup === 'all' ? randomOrder : data.entries, input.value);
    // Each button counts what it would show with the other filter: Objetos counts easy objects while Fácil is on.
    const { entries, groupCounts, difficultyCounts } = filterByGroupAndDifficulty(matching, selectedGroup, selectedDifficulty);
    for (const [id, button] of filterButtons) {
      button.setAttribute('aria-pressed', String(id === selectedGroup));
      button.querySelector('.filter-count')!.textContent = String(groupCounts(id));
    }
    for (const [id, button] of difficultyButtons) {
      button.setAttribute('aria-pressed', String(id === selectedDifficulty));
      button.querySelector('.filter-count')!.textContent = String(difficultyCounts(id));
    }
    const fragment = document.createDocumentFragment();
    if (data.kind === 'kana') {
      for (const group of data.groups) {
        const groupEntries = (entries as readonly KanaEntry[]).filter((entry) => entry.group === group.id);
        if (groupEntries.length > 0) fragment.append(renderKanaChart(groupEntries, group, data.entries));
      }
    } else {
      // Rows always show their group; cards only under «Todo».
      const tagged = !cards || selectedGroup === 'all';
      for (const entry of entries) fragment.append('forms' in entry ? renderCounter(entry)
        : renderWord(entry as LexiconEntry, tagged ? groups.get(entry.group)! : undefined, cards));
    }
    results.replaceChildren(fragment);
    clear.hidden = !input.value;
    empty.hidden = entries.length > 0; results.hidden = entries.length === 0;
    placeCards?.();
    const noun = data.kind === 'counters' ? 'grupos' : data.kind === 'kana' ? 'sonidos' : 'entradas';
    count.textContent = `${entries.length} de ${data.entries.length} ${noun}`;
  }

  function restoreUrl() {
    const params = new URL(window.location.href).searchParams;
    input.value = params.get('q') ?? '';
    selectedGroup = groups.has(params.get('group') ?? '') ? params.get('group')! : 'all';
    selectedDifficulty = leveled ? parseDifficultyFilter(params.get('difficulty')) : 'all';
    render();
  }
  function clearSearch() { input.value = ''; render(); updateUrl(); input.focus(); }
  clear.addEventListener('click', clearSearch);
  reset.addEventListener('click', () => { selectedGroup = 'all'; selectedDifficulty = 'all'; clearSearch(); });
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
