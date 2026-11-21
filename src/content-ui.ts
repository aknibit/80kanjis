import type { ContentEntry, ContentGroup, CounterEntry, CounterExample, ExampleForm, LexiconEntry, KanaEntry, NavigationSection, StudyDocument } from './content-types.ts';
import type { Difficulty } from './types.ts';
import { difficulties, filterByGroupAndDifficulty, searchContent, shuffled, type DifficultyFilter } from './lib/content.ts';
import type { DifficultySelector } from './difficulty-selector.ts';
import { difficultyIcon, difficultyLabels } from './lib/difficulty.ts';
import { counterSentenceAudioFile, exampleAudioFile } from './lib/audio.ts';
import { setupMasonry } from './masonry.ts';
import { meaningButton, setupMeaningFilter } from './meaning-ui.ts';
import type { PronunciationControls } from './pronunciation-ui.ts';
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

/** The dots of the kanji cards, named for screen readers and in a tooltip. */
function difficultyBadge(difficulty: Difficulty, className: string): HTMLElement {
  const level = difficultyLabels[difficulty];
  const badge = node('span', `difficulty-badge ${className}`);
  badge.innerHTML = difficultyIcon(difficulty);
  badge.dataset.difficulty = difficulty;
  badge.title = `Dificultad: ${level}`;
  badge.setAttribute('role', 'img');
  badge.setAttribute('aria-label', `Dificultad: ${level}`);
  return badge;
}

/** The kanji dialog, on the pages whose kanji open it: the counters and the verbs. */
export interface StudyKanji {
  /** Japanese with the 80 kanji in blue and the support kanji in red, as buttons that open their dialog. */
  renderText(written: string): Node;
  /** After going back or forward in the history: open, change or close the full-screen kanji. */
  followUrl(): void;
}

/** What a study page can use besides its content. */
export interface StudyTools {
  /** The kanji dialog: the kanji of the page's sentences become blue and red buttons that open it. */
  readonly kanji?: StudyKanji;
  /**
   * The audio of the sentences, in the counters and the verbs: the player, shared with the kanji dialog, and the
   * folder of public/audio/ with the recordings. Those sections also hide the translations of their sentences as sand.
   */
  readonly audio?: { readonly pronunciation: PronunciationControls; readonly directory: string };
}

/** How a page writes Japanese: with its kanji as buttons, or as plain text. */
type WriteJapanese = (written: string) => Node | string;
const plainText: WriteJapanese = (written) => written;

/** How a page shows the sentences of its entries. */
interface SentenceTools {
  readonly write: WriteJapanese;
  /** Whether their translations are sand, with a «Significado» button, as in the kanji dialog. */
  readonly veiled: boolean;
  /** The Audio button of a sentence, from its file in the section's folder. */
  readonly audio?: (file: string, written: string) => HTMLElement;
}

/**
 * The translation of a sentence as sand, with its «Significado» button and, if it has one, its Audio: at its right, or
 * under it when there is no room.
 */
function meaningLine(meaning: HTMLElement, audio?: HTMLElement): HTMLElement {
  const controls = node('span', 'example-controls');
  controls.append(meaningButton(meaning));
  if (audio) controls.append(audio);
  const line = node(meaning.tagName === 'P' ? 'div' : 'span', 'example-meaning-line');
  line.append(meaning, controls);
  return line;
}

/** The translation of a sentence: in clear, or as sand with its buttons. */
function renderMeaning(meaning: HTMLElement, tools: SentenceTools, audioFile?: string, written = ''): HTMLElement {
  if (!tools.veiled) return meaning;
  return meaningLine(meaning, audioFile === undefined ? undefined : tools.audio?.(audioFile, written));
}

/**
 * The example or sentence of a form: written, its reading in kana and the translation, one under the other. Only the
 * sentence has Audio.
 */
function renderCounterExample(example: CounterExample, kind: 'example' | 'sentence', tools: SentenceTools,
  audioFile?: string): HTMLElement {
  const cell = node('td', `counter-${kind}`);
  cell.setAttribute('role', 'cell');
  const written = japanese('span', 'counter-example-written', '');
  written.append(tools.write(example.written));
  cell.append(written, japanese('span', 'counter-example-reading', example.reading),
    renderMeaning(node('span', 'counter-example-meaning', example.meaning), tools, audioFile, example.written));
  return cell;
}

/**
 * A counter opens to its table. Its kanji are buttons in the body, not in the summary: a button inside it would be
 * a control within a control, and the symbol's kanji is in every row anyway.
 */
function renderCounter(entry: CounterEntry, tools: SentenceTools): HTMLElement {
  const { write } = tools;
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
  meta.append(difficultyBadge(entry.difficulty, 'counter-difficulty'), node('span', 'counter-form-count', `${entry.forms.length} formas`));
  summary.append(name, endings, meta);
  const body = node('div', 'counter-body');
  for (const note of entry.notes) {
    const paragraph = node('p', 'counter-note');
    paragraph.append(write(note));
    body.append(paragraph);
  }
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
  const row = (className: string, value: number | 'question',
    item: { written: string; readings: readonly string[]; example: CounterExample; sentence: CounterExample }, special = false) => {
    const line = node('tr', className);
    line.setAttribute('role', 'row');
    const written = japanese('th', 'counter-written', '');
    written.append(write(item.written));
    written.scope = 'row';
    written.setAttribute('role', 'rowheader');
    // Each cell of the row is announced with its header: 一本, not the names of the buttons of its kanji.
    if (write !== plainText) written.setAttribute('aria-label', item.written);
    const reading = node('td', 'counter-reading-cell');
    reading.setAttribute('role', 'cell');
    reading.append(japanese('span', 'word-reading', item.readings.join(' · ')));
    if (special) reading.append(node('span', 'special-reading', 'Lectura especial'));
    line.append(written, reading, renderCounterExample(item.example, 'example', tools),
      renderCounterExample(item.sentence, 'sentence', tools, counterSentenceAudioFile(entry.id, value)));
    return line;
  };
  for (const form of entry.forms) rows.append(row(form.special ? 'counter-special' : '', form.value, form, form.special));
  rows.append(row('counter-question', 'question', entry.question));
  table.append(head, rows);
  body.append(table);
  details.append(summary, body);
  return details;
}

/**
 * Whether the vocabulary cards were left as flashcards. The browser keeps it (`80kanjis-flashcards`), as it keeps the
 * theme and the difficulty; keep the key in sync with scripts/check-build.mjs and AGENTS.md.
 */
function savedFlashcards(): boolean {
  try {
    return localStorage.getItem('80kanjis-flashcards') === 'on';
  } catch {
    return false;
  }
}

function saveFlashcards(on: boolean) {
  try {
    if (on) localStorage.setItem('80kanjis-flashcards', 'on');
    else localStorage.removeItem('80kanjis-flashcards');
  } catch {
    // Blocked storage (private mode): the mode still travels in the address while the page stays open.
  }
}

/** The writing of a lexicon entry, which may wrap after each slash. */
function lexiconWritten(entry: LexiconEntry, tag: 'h3' | 'span'): HTMLElement {
  const written = slashed(tag, 'lexicon-written', entry.written);
  written.lang = 'ja';
  return written;
}

/**
 * The writing of an entry with its reading and romaji under it. A word in hiragana (あさ, でんわをかけます) is its own
 * reading, as in the examples; katakana keeps it (バス, ばす).
 */
function lexiconTerm(entry: LexiconEntry, block: 'div' | 'span', line: 'p' | 'span', heading: 'h3' | 'span'): HTMLElement {
  const term = node(block, 'lexicon-term');
  term.append(lexiconWritten(entry, heading));
  if (entry.written.replace(/\s/gu, '') !== entry.reading.replace(/\s/gu, '')) {
    const reading = slashed(line, 'word-reading', entry.reading);
    reading.lang = 'ja';
    term.append(reading);
  }
  term.append(node(line, 'entry-romaji', entry.romaji));
  return term;
}

/** The meaning of an entry and its note, if it has one. */
function lexiconExplanation(entry: LexiconEntry, block: 'div' | 'span', line: 'p' | 'span'): HTMLElement {
  const explanation = node(block, 'lexicon-explanation');
  explanation.append(slashed(line, 'lexicon-meaning', entry.meaning));
  if (entry.note) explanation.append(slashed(line, 'entry-note', entry.note));
  return explanation;
}

/**
 * A card as a flashcard: the front shows the word with its reading and romaji, and pressing the card turns it over
 * to the meaning and its note, under the same writing. Both faces share the card's place, so it is as tall as the
 * taller one and the masonry does not move when it turns. Only the face in view is exposed to screen readers; the
 * button that turns it covers the whole card and comes last, after the word it belongs to.
 */
function renderFlashcard(entry: LexiconEntry, group: string | undefined): HTMLElement {
  const card = node('li', 'lexicon-card lexicon-card--flash');
  card.dataset.entryId = entry.id;
  const face = (side: 'front' | 'back', ...content: HTMLElement[]) => {
    const result = node('div', `flashcard-face flashcard-${side}`);
    const body = node('div', 'flashcard-content');
    body.append(...content);
    result.append(body, difficultyBadge(entry.difficulty, 'lexicon-difficulty'));
    if (group !== undefined) result.append(node('span', 'entry-group', group));
    return result;
  };
  const writing = node('div', 'lexicon-term');
  writing.append(lexiconWritten(entry, 'h3'));
  const front = face('front', lexiconTerm(entry, 'div', 'p', 'h3'));
  const back = face('back', writing, lexiconExplanation(entry, 'div', 'p'));
  back.setAttribute('aria-hidden', 'true');
  const faces = node('div', 'flashcard');
  faces.append(front, back);
  const turn = node('button', 'flashcard-turn');
  turn.type = 'button';
  turn.setAttribute('aria-pressed', 'false');
  turn.append(node('span', 'visually-hidden', 'Ver significado'));
  turn.addEventListener('click', () => {
    const turned = card.classList.toggle('is-turned');
    turn.setAttribute('aria-pressed', String(turned));
    if (turned) { front.setAttribute('aria-hidden', 'true'); back.removeAttribute('aria-hidden'); }
    else { back.setAttribute('aria-hidden', 'true'); front.removeAttribute('aria-hidden'); }
  });
  card.append(faces, turn);
  return card;
}

/**
 * A lexicon entry as a row, or as a card for sections with "layout": "cards". Its group shows as a tag, unless `group`
 * is undefined: cards leave it out while a group is selected, since the filter already names it.
 */
function renderWord(entry: LexiconEntry, group: string | undefined, card: boolean, tools: SentenceTools): HTMLElement {
  const row = node('li', card ? 'lexicon-card' : 'lexicon-row');
  row.dataset.entryId = entry.id;
  // An entry with examples opens like a counter. A summary only admits phrasing content, so it uses spans
  // where the static row has a heading and paragraphs.
  const opens = Boolean(entry.examples?.length);
  const block = opens ? 'span' : 'div';
  const line = opens ? 'span' : 'p';
  const term = lexiconTerm(entry, block, line, opens ? 'span' : 'h3');
  const explanation = lexiconExplanation(entry, block, line);
  const tags = group === undefined ? [] : [node('span', 'entry-group', group)];
  // Its difficulty: in the upper-right corner of a card, read after the meaning; in a row, above the group tag, like
  // the dots of a counter above its number of forms.
  let extras = [difficultyBadge(entry.difficulty, 'lexicon-difficulty'), ...tags];
  if (!card) {
    const meta = node('span', 'lexicon-meta');
    meta.append(...extras);
    extras = [meta];
  }
  if (!opens) {
    row.append(term, explanation, ...extras);
    return row;
  }
  row.classList.add('lexicon-row--opens');
  const details = node('details', 'lexicon-details');
  const summary = node('summary', 'lexicon-summary');
  summary.append(term, explanation, ...extras);
  const body = node('div', 'lexicon-body');
  // The four forms of an adjective read as a table: present above past, affirmative to the left of negative.
  const list = node('ul', entry.examples![0].form ? 'lexicon-examples lexicon-examples--forms' : 'lexicon-examples');
  list.id = `examples-${entry.id}`;
  const label = node('p', 'lexicon-examples-label', 'Ejemplos');
  label.id = `${list.id}-label`;
  list.setAttribute('aria-labelledby', label.id);
  entry.examples!.forEach((example, index) => {
    const item = node('li', 'lexicon-example');
    if (example.form) item.append(node('p', 'lexicon-example-form', formLabels[example.form]));
    const written = japanese('p', 'lexicon-example-written', '');
    written.append(tools.write(example.written));
    item.append(written);
    // A sentence without kanji (テニスが できます。) needs no reading line, as in the guides.
    if (example.reading !== example.written) item.append(japanese('p', 'lexicon-example-reading', example.reading));
    item.append(renderMeaning(node('p', 'lexicon-example-meaning', example.meaning), tools,
      exampleAudioFile(entry.id, example, index), example.written));
    list.append(item);
  });
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

export function renderStudyPage(host: HTMLElement, data: StudyDocument, section: NavigationSection,
  difficulty: DifficultySelector, { kanji, audio }: StudyTools = {}): void {
  const pronunciation = audio?.pronunciation;
  // The hidden meanings wear this filter; it is in the page before any.
  if (audio) setupMeaningFilter();
  // Playback errors of the sentences, announced on the page.
  const audioStatus = node('p', 'audio-status');
  audioStatus.setAttribute('role', 'status');
  audioStatus.setAttribute('aria-live', 'polite');
  const sentenceTools: SentenceTools = {
    write: kanji ? (written) => kanji.renderText(written) : plainText,
    veiled: Boolean(audio),
    audio: audio && ((file, written) => audio.pronunciation.createSentenceButton(`${audio.directory}:${file}`, written, file,
      audioStatus, audio.directory)),
  };
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
  // Counters and lexicon sections also filter by difficulty, with the drop-down that every section shares
  // (difficulty-selector.ts). It combines with the groups: easy objects.
  const leveled = data.kind === 'counters' || data.kind === 'lexicon';
  toolbar.append(filters, count);
  // Cards can also be flashcards, with the meaning on the back: a switch beside the difficulty drop-down, aligned with
  // its button. Like the difficulty, the browser keeps the choice and the address shows it (?mode=flashcards): an
  // address that asks for flashcards wins and is kept; without it, the kept choice applies.
  let flashcards = false;
  const readFlashcards = (params: URLSearchParams) => {
    if (!cards) return false;
    if (params.get('mode') !== 'flashcards') return savedFlashcards();
    saveFlashcards(true);
    return true;
  };
  const flashSwitch = node('input');
  const flashHint = node('p', 'filter-hint flashcard-hint', 'Pulsa una ficha para darle la vuelta.');
  if (cards) {
    const toggle = node('label', 'flashcard-toggle');
    flashSwitch.type = 'checkbox';
    flashSwitch.setAttribute('role', 'switch');
    flashSwitch.setAttribute('aria-controls', 'study-results');
    flashHint.id = 'flashcard-hint';
    flashSwitch.setAttribute('aria-describedby', flashHint.id);
    toggle.append(flashSwitch, node('span', '', 'Flashcards'));
    flashSwitch.addEventListener('change', () => {
      flashcards = flashSwitch.checked;
      saveFlashcards(flashcards);
      render(); updateUrl();
    });
    toolbar.append(flashHint);
    // A float before the title sits to the left of the drop-down. On phones they do not fit beside the title, so it
    // goes on its own line under the description.
    const phone = window.matchMedia('(max-width: 600px)');
    const place = () => { if (phone.matches) intro.append(toggle); else intro.prepend(toggle); };
    place();
    phone.addEventListener('change', place);
  }
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
  if (pronunciation) {
    collection.append(audioStatus);
    // Folding an entry hides the Parar button of its sentence, so it stops too. Toggle does not bubble: capture it.
    results.addEventListener('toggle', (event) => {
      const details = event.target as HTMLDetailsElement;
      if (!details.open && details.querySelector('.audio-button[aria-pressed="true"]')) pronunciation.stop();
    }, true);
  }
  collection.append(results, empty, renderSources(data));
  host.replaceChildren(intro, collection);

  const groups = new Map(data.groups.map((group) => [group.id, group.label]));
  // Cards under «Todo» come in a random order, shuffled once per visit so that searching keeps it.
  // A selected group shows its entries in their thematic order.
  const randomOrder = cards ? shuffled<ContentEntry>(data.entries) : data.entries;
  const placeCards = cards ? setupMasonry(results) : undefined;
  const filterButtons = new Map<string, HTMLButtonElement>();
  let selectedGroup = 'all';
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

  function updateUrl() {
    clearTimeout(urlTimer);
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim()); else url.searchParams.delete('q');
    if (selectedGroup !== 'all') url.searchParams.set('group', selectedGroup); else url.searchParams.delete('group');
    if (flashcards) url.searchParams.set('mode', 'flashcards'); else url.searchParams.delete('mode');
    window.history.replaceState(null, '', url);
  }

  function render() {
    // The Parar button of what was playing is about to go.
    pronunciation?.stop();
    audioStatus.textContent = '';
    const matching = searchContent<ContentEntry>(selectedGroup === 'all' ? randomOrder : data.entries, input.value);
    // Each button counts what it would show with the other filter: Objetos counts easy objects while Fácil is on.
    // Sin completar only exists on the kanji page: here it shows everything, and the shared drop-down falls back to Todas.
    const level: DifficultyFilter = leveled && difficulty.value !== 'unrated' ? difficulty.value : 'all';
    const { entries, groupCounts, difficultyCounts } = filterByGroupAndDifficulty(matching, selectedGroup, level);
    for (const [id, button] of filterButtons) {
      button.setAttribute('aria-pressed', String(id === selectedGroup));
      button.querySelector('.filter-count')!.textContent = String(groupCounts(id));
    }
    if (leveled) difficulty.showCounts(Object.fromEntries((['all', ...difficulties] as const).map((id) => [id, difficultyCounts(id)])));
    const fragment = document.createDocumentFragment();
    if (data.kind === 'kana') {
      for (const group of data.groups) {
        const groupEntries = (entries as readonly KanaEntry[]).filter((entry) => entry.group === group.id);
        if (groupEntries.length > 0) fragment.append(renderKanaChart(groupEntries, group, data.entries));
      }
    } else {
      // Rows always show their group; cards only under «Todo».
      const tagged = !cards || selectedGroup === 'all';
      for (const entry of entries) {
        const group = tagged ? groups.get(entry.group)! : undefined;
        fragment.append('forms' in entry ? renderCounter(entry, sentenceTools)
          : flashcards ? renderFlashcard(entry as LexiconEntry, group)
            : renderWord(entry as LexiconEntry, group, cards, sentenceTools));
      }
    }
    flashHint.hidden = !flashcards;
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
    flashcards = readFlashcards(params);
    flashSwitch.checked = flashcards;
    render();
  }
  function clearSearch() { input.value = ''; render(); updateUrl(); input.focus(); }
  clear.addEventListener('click', clearSearch);
  reset.addEventListener('click', () => { selectedGroup = 'all'; if (leveled) difficulty.select('all'); clearSearch(); });
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
  window.addEventListener('popstate', () => {
    clearTimeout(urlTimer);
    const params = new URL(window.location.href).searchParams;
    const level = difficulty.value;
    if (leveled) difficulty.followUrl();
    // Opening or closing the full-screen kanji only changes ?kanji=: the entries stay, with the counters left open
    // and the focus.
    const group = groups.has(params.get('group') ?? '') ? params.get('group')! : 'all';
    if ((params.get('q') ?? '') !== input.value.trim() || group !== selectedGroup || readFlashcards(params) !== flashcards
      || difficulty.value !== level) restoreUrl();
    kanji?.followUrl();
  });
  if (leveled) difficulty.connect(render);
  restoreUrl();
  // Flashcards kept in the browser show in the address too, as the difficulty does.
  if (flashcards) updateUrl();
}
