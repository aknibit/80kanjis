import { difficultyLabels } from './lib/difficulty.ts';
import { createKanjiReferences, wordKanjiParts, type KanjiReference } from './lib/kanji-reference.ts';
import { loadKanjiSentences } from './lib/content.ts';
import { kanjiNeighbours, kanjiParameter } from './lib/kanji-sequence.ts';
import { vocabularyItemId } from './lib/study-catalog.ts';
import { sentenceAudioFile, type SentenceGroup } from './lib/audio.ts';
import { meaningButton, setupMeaningFilter } from './meaning-ui.ts';
import type { PronunciationControls } from './pronunciation-ui.ts';
import type { ContentExample, KanjiSentences } from './content-types.ts';
import type { CollectionDocument, KanjiReadings } from './types.ts';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const result = document.createElement(tag);
  result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

function japanese(text: string, className = ''): HTMLElement {
  const result = node('span', className, text);
  result.lang = 'ja';
  return result;
}

function renderKanjiReadings(readings: KanjiReadings, character: string): HTMLElement {
  const list = node('dl', 'kanji-dialog-readings');
  list.tabIndex = 0;
  list.setAttribute('aria-label', 'Lecturas On y Kun');
  for (const [label, values] of [['On · origen chino', readings.onyomi], ['Kun · japonesa', readings.kunyomi]] as const) {
    if (values.length === 0) continue;
    const group = node('div', 'kanji-reading-group');
    const value = node('dd', '');
    value.lang = 'ja';
    const items = node('ul', 'kanji-reading-list');
    items.setAttribute('role', 'list');
    for (const reading of values) {
      const item = node('li', 'kanji-reading');
      const [stem, ending] = reading.split('.');
      if (ending) {
        const writing = japanese('', 'kanji-reading-text kanji-reading-writing');
        const kanji = node('ruby', 'kanji-reading-root');
        kanji.append(japanese(character), node('rp', '', '（'), node('rt', '', stem), node('rp', '', '）'));
        writing.append(kanji, japanese(ending, 'kanji-reading-ending'));
        item.append(writing);
      } else {
        item.append(japanese(reading, 'kanji-reading-text kanji-reading-pronunciation'));
      }
      items.append(item);
    }
    value.append(items);
    group.append(node('dt', '', label), value);
    list.append(group);
  }
  return list;
}

function renderReadingHint(readings: KanjiReadings, character: string): HTMLElement {
  const hint = node('p', 'kanji-dialog-reading-hint');
  const withEnding = readings.kunyomi.find((reading) => reading.includes('.'));
  if (!withEnding) {
    hint.textContent = 'La pronunciación depende de la palabra. Más abajo tienes los ejemplos de la colección.';
    return hint;
  }
  const [stem, ending] = withEnding.split('.');
  hint.append('En ', japanese(character + ending), ', ', japanese(character), ' se lee ',
    japanese(stem), '; ', japanese(ending), ' se escribe en hiragana.');
  return hint;
}

/** The page's status is behind the modal, so playback errors are announced inside it. */
function audioStatus(): HTMLElement {
  const status = node('p', 'audio-status kanji-dialog-audio-status');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  return status;
}

type SentenceAudio = (example: ContentExample, group: SentenceGroup, index: number) => HTMLElement | undefined;
/** How a sentence is written out: with its kanji highlighted, or also with buttons for the other kanji. */
type SentenceText = (written: string) => Node;

/** In the dialog only its kanji stands out: the sentence is plain text, so a screen reader reads it in one go. */
function highlightKanji(character: string): SentenceText {
  return (written) => {
    const fragment = document.createDocumentFragment();
    written.split(character).forEach((part, index) => {
      if (index > 0) fragment.append(node('span', 'kanji-sentence-target', character));
      fragment.append(part);
    });
    return fragment;
  };
}

/**
 * What goes at the right of a word or a sentence, in the dialog and in the full-screen view: the button that shows its
 * meaning, in a column between the Japanese and Audio, and its Audio button.
 */
function itemControls(meaning: HTMLElement, audio: HTMLElement | undefined): HTMLElement {
  const controls = node('div', 'kanji-item-controls');
  controls.append(meaningButton(meaning));
  if (audio) controls.append(audio);
  return controls;
}

function renderSentence(example: ContentExample, text: SentenceText, audio: HTMLElement | undefined): HTMLLIElement {
  const item = node('li', 'kanji-sentence');
  const written = node('p', 'kanji-sentence-written');
  written.lang = 'ja';
  written.append(text(example.written));
  const reading = node('p', 'kanji-sentence-reading', example.reading);
  reading.lang = 'ja';
  const meaning = node('p', 'kanji-sentence-meaning', example.meaning);
  item.append(written, reading, meaning, itemControls(meaning, audio));
  return item;
}

function renderSentences(sentences: KanjiSentences, text: SentenceText, audio?: SentenceAudio): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const [group, label] of [['simple', 'Sencillas'], ['advanced', 'Con adjetivos, adverbios y contadores']] as const) {
    const items = node('ul', 'kanji-sentence-list');
    items.setAttribute('aria-label', `Frases ${label.toLowerCase()}`);
    sentences[group].forEach((example, index) => items.append(renderSentence(example, text, audio?.(example, group, index))));
    fragment.append(node('p', 'kanji-sentence-group', label), items);
  }
  return fragment;
}

type KanjiTab = 'vocabulary' | 'sentences';
const kanjiTabs: Readonly<Record<KanjiTab, string>> = { vocabulary: 'Vocabulario', sentences: 'Frases' };

/** How a word's own kanji opens: in the dialog, in the full-screen view, or not at all (the kanji the view shows). */
type KanjiOpening = 'dialog' | 'focus' | 'none';
/** Where a kanji's details are shown: the dialog or the full-screen view. Both can be open at once. */
type KanjiView = 'dialog' | 'focus';

/** What the full-screen view needs from the kanji page. */
export interface KanjiPage {
  /** The kanji on screen, in collection order: the view steps through them. */
  onScreen(): readonly string[];
  /** The row of a kanji, which the page shows again when the view closes on it. */
  row(character: string): HTMLElement | null;
}

export interface KanjiDetailsOptions {
  /**
   * The kanji page: the green kanji of its rows, the large kanji and «Info kanji 01» open the full-screen view, whose
   * arrows step through the kanji on screen. Without it, they open the dialog.
   */
  readonly page?: KanjiPage;
  /** What the full-screen view's back button says on a page without rows of kanji: where it goes back to. */
  readonly backLabel?: string;
}

const icon = (path: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${path}"/></svg>`;
const backIcon = icon('M19 12H5m6-6-6 6 6 6');
const stepIcons = { previous: icon('m15 5-7 7 7 7'), next: icon('m9 5 7 7-7 7') } as const;
const expandIcon = icon('M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5');

const addressKanji = () => new URL(window.location.href).searchParams.get(kanjiParameter);
function address(character: string | null): URL {
  const url = new URL(window.location.href);
  if (character === null) url.searchParams.delete(kanjiParameter);
  else url.searchParams.set(kanjiParameter, character);
  return url;
}

/**
 * One native dialog for every kanji; the source owns all reference content. Its words share the page's audio player.
 * Its header opens the same kanji in a full-screen view. With a `page`, the green kanji of a row opens that view
 * directly, and its arrows step through the kanji on screen.
 */
export function setupKanjiDetails(source: CollectionDocument, pronunciation?: PronunciationControls,
  options: KanjiDetailsOptions = {}) {
  const { page } = options;
  const references = createKanjiReferences(source);
  const dialog = node('dialog', 'kanji-dialog');
  dialog.id = 'kanji-dialog';
  dialog.setAttribute('aria-labelledby', 'kanji-dialog-title');
  dialog.setAttribute('aria-describedby', 'kanji-dialog-description');
  const header = node('div', 'dialog-header');
  const category = node('span', 'eyebrow');
  // The label shows when it fits; on phones only the icon does, and the name stays the same.
  const expand = node('button', 'kanji-dialog-expand');
  expand.type = 'button';
  expand.innerHTML = `${expandIcon}<span class="kanji-dialog-expand-label">Pantalla completa</span>`;
  expand.title = 'Ver a pantalla completa';
  expand.setAttribute('aria-label', 'Ver a pantalla completa');
  expand.setAttribute('aria-haspopup', 'dialog');
  expand.setAttribute('aria-controls', 'kanji-focus');
  const close = node('button', 'clear-button kanji-dialog-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Cerrar información del kanji');
  const actions = node('div', 'kanji-dialog-actions');
  actions.append(expand, close);
  header.append(category, actions);
  const body = node('div', 'kanji-dialog-body');
  dialog.append(header, body);
  document.body.append(dialog);
  // The hidden meanings of the dialog and of the full-screen view wear this filter; it is in the page before any.
  setupMeaningFilter();
  let opener: HTMLElement | null = null;
  // The tab stays chosen while the page is open, also from one kanji to the next and between the dialog and the
  // full-screen view. It is not stored in the browser.
  let selectedTab: KanjiTab = 'vocabulary';
  // Requested the first time a kanji opens and kept for the visit; a failed request is retried on the next opening.
  let sentences: Promise<ReadonlyMap<string, KanjiSentences>> | null = null;
  const requestSentences = () => sentences ??= loadKanjiSentences(source.kanji.map((entry) => entry.character))
    .then((data) => new Map(data.entries.map((entry) => [entry.kanji, entry])))
    .catch((error: unknown) => { sentences = null; throw error; });
  const eyebrow = (reference: KanjiReference) => (reference.kind === 'advanced' ? 'KANJI AVANZADO · DE APOYO'
    : `KANJI ${String(reference.position).padStart(2, '0')} DE ${source.kanji.length}`);

  close.addEventListener('click', () => dialog.close());
  // The view takes over from the dialog: closing it later gives the focus back to what opened the dialog.
  expand.addEventListener('click', () => {
    const character = dialog.dataset.kanji;
    const trigger = opener;
    opener = null;
    dialog.close();
    if (character) focusView.open(character, trigger);
  });
  dialog.addEventListener('close', () => {
    pronunciation?.stop();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
    opener = null;
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  function open(character: string, trigger: HTMLElement) {
    const reference = references.get(character);
    if (!reference) return;
    // A word playing in the previous kanji, or on the page, would lose its Parar button.
    pronunciation?.stop();
    dialog.dataset.kind = reference.kind;
    dialog.dataset.kanji = character;
    category.textContent = eyebrow(reference);
    const details = renderDetails(character, reference, 'dialog');
    body.replaceChildren(...details.summary, ...details.study, details.source);
    if (!dialog.open) {
      opener = trigger;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
  }

  /**
   * What the dialog and the full-screen view show of a kanji: its summary, its vocabulary (and sentences, in tabs) and
   * its source. Ids start with the view's own prefix, since both can be open at once.
   */
  function renderDetails(character: string, reference: KanjiReference, view: KanjiView) {
    const prefix = `kanji-${view}`;
    // The full-screen view already shows its kanji: it stays green there, without being a button.
    const opening: KanjiOpening = view === 'focus' ? 'none' : 'dialog';
    const advanced = reference.kind === 'advanced';
    const hero = node('div', 'kanji-dialog-hero');
    const glyph = node('span', 'kanji-dialog-character', character);
    glyph.lang = 'ja';
    glyph.setAttribute('aria-hidden', 'true');
    const summary = node('div', 'kanji-dialog-summary');
    const title = node('h2', '', reference.definition.meanings.join(' · '));
    title.id = `${prefix}-title`;
    const spokenCharacter = node('span', 'visually-hidden', `${character}: `);
    spokenCharacter.lang = 'ja';
    title.prepend(spokenCharacter);
    const description = node('p', 'kanji-dialog-description', advanced
      ? `Fuera de los ${source.kanji.length} kanji principales. Se incluye como apoyo al vocabulario.`
      : `Forma parte de los ${source.kanji.length} kanji de la colección.`);
    description.id = `${prefix}-description`;
    summary.append(title, description);
    hero.append(glyph, summary);
    const intro: HTMLElement[] = [hero, renderKanjiReadings(reference.definition, character),
      renderReadingHint(reference.definition, character)];
    if (reference.definition.note) {
      const note = reference.definition.note.replace(/([ぁ-ゖー])\.(?=[ぁ-ゖー])/gu, '$1');
      intro.push(node('p', 'kanji-dialog-note', note));
    }
    if (reference.kind === 'collection') {
      intro.push(node('p', 'kanji-dialog-difficulty', `Dificultad: ${reference.definition.difficulty === null
        ? 'Sin marcar' : difficultyLabels[reference.definition.difficulty]}`));
    }

    const examplesTitle = node('h3', 'kanji-dialog-examples-title', 'Lecturas en el vocabulario de la colección');
    const examples = node('ul', 'kanji-dialog-examples');
    const wordStatus = audioStatus();
    for (const word of reference.vocabulary) {
      const example = node('li', '');
      const japanese = node('div', 'kanji-dialog-word');
      japanese.lang = 'ja';
      const written = node('span', 'kanji-dialog-written');
      written.append(renderParts(word.written, character, opening));
      japanese.append(written, node('span', 'word-reading', word.reading));
      const meaning = node('p', '', word.meaning);
      example.append(japanese, meaning);
      const audio = pronunciation?.createButton({ id: vocabularyItemId(word.written), written: word.written }, wordStatus);
      example.append(itemControls(meaning, audio));
      examples.append(example);
    }
    const attribution = node('p', 'kanji-dialog-source');
    const link = node('a', '', 'Consultar fuente del kanji');
    link.href = reference.definition.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    attribution.append(link);
    // The 80 kanji show their vocabulary or their sentences, one at a time; support kanji only have vocabulary.
    let study: HTMLElement[];
    if (reference.kind === 'collection') {
      const vocabulary = node('div', 'kanji-dialog-panel');
      vocabulary.append(wordStatus, examples);
      // In the full-screen view the other kanji of the sentences open the dialog, as in its vocabulary.
      const text = view === 'focus' ? linkKanji(character) : highlightKanji(character);
      study = renderTabs(prefix, { vocabulary, sentences: renderSentencePanel(character, text) });
    } else study = [examplesTitle, wordStatus, examples];
    return { summary: intro, study, source: attribution };
  }

  /** Filled once the sentences arrive, unless the panel has made way for another kanji by then. */
  function renderSentencePanel(character: string, text: SentenceText): HTMLElement {
    const panel = node('div', 'kanji-dialog-panel');
    const status = node('p', 'kanji-sentence-status', 'Cargando frases…');
    status.setAttribute('role', 'status');
    panel.append(status);
    requestSentences().then((all) => {
      if (!panel.isConnected) return;
      const entry = all.get(character);
      const status = audioStatus();
      if (entry) panel.replaceChildren(status, renderSentences(entry, text, pronunciation &&((example, group, index) =>
        pronunciation.createSentenceButton(`sentence:${character}:${group}:${index + 1}`, example.written,
          sentenceAudioFile(character, group, index), status))));
      else status.textContent = 'Este kanji todavía no tiene frases.';
    }, () => {
      if (panel.isConnected) status.textContent = 'No se pudieron cargar las frases. Vuelve a abrir el kanji para intentarlo de nuevo.';
    });
    return panel;
  }

  /** WAI-ARIA tabs: arrows, Home and End move between them, and the chosen panel is the only one shown. */
  function renderTabs(prefix: string, panels: Readonly<Record<KanjiTab, HTMLElement>>): HTMLElement[] {
    const list = node('div', 'kanji-dialog-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Contenido del kanji');
    const tabs = Object.keys(kanjiTabs) as KanjiTab[];
    const buttons = tabs.map((tab) => {
      const button = node('button', 'kanji-dialog-tab', kanjiTabs[tab]);
      button.type = 'button';
      button.id = `${prefix}-tab-${tab}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `${prefix}-panel-${tab}`);
      button.addEventListener('click', () => select(tab));
      const panel = panels[tab];
      panel.id = `${prefix}-panel-${tab}`;
      panel.tabIndex = 0;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      return button;
    });
    // These tabs' own choice: the shared one may have changed in the dialog open on top of the full-screen view.
    let current: KanjiTab | undefined;
    const select = (tab: KanjiTab, focus = false) => {
      // The other panel is hidden, and with it the Parar button of what was playing.
      if (current !== undefined && tab !== current) pronunciation?.stop();
      current = selectedTab = tab;
      tabs.forEach((item, index) => {
        buttons[index].setAttribute('aria-selected', String(item === tab));
        buttons[index].tabIndex = item === tab ? 0 : -1;
        panels[item].hidden = item !== tab;
      });
      if (focus) buttons[tabs.indexOf(tab)].focus();
    };
    list.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(current ?? selectedTab);
      const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
    list.append(...buttons);
    select(selectedTab);
    return [list, ...tabs.map((tab) => panels[tab])];
  }

  const focusView = setupFocusView();

  /**
   * The full-screen view of a kanji, opened from the dialog's header or, on the kanji page, from its row. It is a modal
   * dialog the size of the window, so the dialog of another kanji opens on top of it. Its kanji travels in the address
   * (`?kanji=水`): the browser's Back closes it, and a link or a reload opens it again.
   */
  function setupFocusView() {
    const view = node('dialog', 'kanji-dialog kanji-focus');
    view.id = 'kanji-focus';
    view.setAttribute('aria-labelledby', 'kanji-focus-title');
    view.setAttribute('aria-describedby', 'kanji-focus-description');
    const bar = node('div', 'kanji-focus-bar');
    const barContent = node('div', 'kanji-focus-bar-content shell');
    const back = node('button', 'kanji-focus-back');
    back.type = 'button';
    back.setAttribute('aria-keyshortcuts', 'Escape');
    // On narrow phones only «Todos» shows; a screen reader still reads «Todos los kanji». Other pages name themselves.
    const backLabel = node('span', '', page ? 'Todos' : options.backLabel ?? 'Volver');
    if (page) backLabel.append(node('span', 'kanji-focus-back-more', ' los kanji'));
    back.innerHTML = backIcon;
    back.append(backLabel);
    const steps = node('nav', 'kanji-focus-nav');
    steps.setAttribute('aria-label', 'Kanji de la lista');
    const previous = createStep('previous');
    const next = createStep('next');
    const position = node('span', 'kanji-focus-position');
    steps.append(previous, position, next);
    barContent.append(back, steps);
    bar.append(barContent);
    // Stepping keeps the focus on the arrow, so the new kanji is announced here.
    const announcement = node('p', 'visually-hidden');
    announcement.setAttribute('role', 'status');
    const content = node('div', 'kanji-focus-body shell');
    view.append(bar, announcement, content);
    document.body.append(view);

    let shown = '';
    let opener: HTMLElement | null = null;
    let openedWith = '';
    // Whether this page added the view's address to the history: closing then goes back to the list.
    let pushed = false;
    let pageTitle = document.title;
    const positionOf = (character: string) => {
      const reference = references.get(character);
      return reference?.kind === 'collection' ? reference.position : 0;
    };
    const meanings = (character: string) => references.get(character)!.definition.meanings.join(', ');

    function createStep(direction: keyof typeof stepIcons): HTMLButtonElement {
      const button = node('button', `kanji-focus-step kanji-focus-step--${direction}`);
      button.type = 'button';
      button.setAttribute('aria-keyshortcuts', direction === 'previous' ? 'ArrowLeft' : 'ArrowRight');
      button.addEventListener('click', () => step(button));
      return button;
    }

    /** An arrow without a kanji stays focusable: a disabled button would drop the focus at the end of the list. */
    function paintStep(button: HTMLButtonElement, direction: keyof typeof stepIcons, character: string | undefined) {
      const name = direction === 'previous' ? 'anterior' : 'siguiente';
      button.innerHTML = stepIcons[direction];
      if (character) {
        const glyph = japanese(character, 'kanji-focus-step-kanji');
        if (direction === 'previous') button.append(glyph);
        else button.prepend(glyph);
      }
      const label = character ? `Kanji ${name}: ${character}, ${meanings(character)}` : `No hay kanji ${name} en la lista`;
      button.dataset.kanji = character ?? '';
      button.setAttribute('aria-disabled', String(!character));
      button.setAttribute('aria-label', label);
      button.title = label;
    }

    function show(character: string): boolean {
      const reference = references.get(character);
      if (!reference) return false;
      pronunciation?.stop();
      shown = character;
      // Support kanji are red here too, as in their dialog.
      view.dataset.kind = reference.kind;
      const details = renderDetails(character, reference, 'focus');
      const intro = node('div', 'kanji-focus-intro');
      intro.append(node('p', 'eyebrow', eyebrow(reference)), ...details.summary);
      const study = node('div', 'kanji-focus-study');
      study.append(...details.study);
      content.replaceChildren(intro, study, details.source);
      // The arrows step through the rows of the kanji page; support kanji and other pages have no list to step through.
      const listed = page !== undefined && reference.kind === 'collection';
      steps.hidden = !listed;
      const onScreen = listed ? page.onScreen() : [];
      const neighbours = kanjiNeighbours(onScreen, positionOf, character);
      position.textContent = !listed ? '' : neighbours.index === -1 ? 'Fuera de la lista' : `${neighbours.index + 1} de ${onScreen.length}`;
      paintStep(previous, 'previous', neighbours.previous);
      paintStep(next, 'next', neighbours.next);
      document.title = `${character} · 80kanjis`;
      view.scrollTop = 0;
      return true;
    }

    function present(character: string): boolean {
      const title = document.title;
      if (!show(character)) return false;
      if (!view.open) {
        pageTitle = title;
        openedWith = character;
        view.showModal();
      }
      back.focus({ preventScroll: true });
      return true;
    }

    function step(button: HTMLButtonElement) {
      const character = button.dataset.kanji;
      if (!character || !show(character)) return;
      history.replaceState(history.state, '', address(character));
      announcement.textContent = `${character}, ${meanings(character)}. ${position.textContent}.`;
    }

    /**
     * Back on the page: at the button that opened the view while it shows the same kanji; otherwise, on the kanji page,
     * at the row of the last kanji seen, on its Info button. A support kanji has no row: the opener again, if it is there.
     */
    function returnFocus() {
      const row = shown === openedWith && opener?.isConnected ? null : page?.row(shown);
      if (!row) {
        if (opener?.isConnected) opener.focus({ preventScroll: true });
        return;
      }
      const bounds = row.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > window.innerHeight) row.scrollIntoView({ block: 'start', behavior: 'instant' });
      row.querySelector<HTMLElement>('.kanji-focus-trigger')?.focus({ preventScroll: true });
    }

    back.addEventListener('click', () => view.close());
    view.addEventListener('close', () => {
      pronunciation?.stop();
      document.title = pageTitle;
      // The address of the list again: the entry before the view's, or the same one without the kanji.
      if (addressKanji() !== null) {
        if (pushed) history.back();
        else history.replaceState(history.state, '', address(null));
      }
      pushed = false;
      returnFocus();
      opener = null;
      announcement.textContent = '';
    });
    view.addEventListener('keydown', (event) => {
      const button = event.key === 'ArrowLeft' ? previous : event.key === 'ArrowRight' ? next : null;
      if (!button || steps.hidden || event.defaultPrevented || event.isComposing
        || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      // The arrows already move between the tabs, which prevent the default, and scroll the readings.
      if ((event.target as Element).closest('.kanji-dialog-readings')) return;
      event.preventDefault();
      step(button);
    });

    /** Follow the address: open, change or close the view. `pushedEntry` says whether the view's entry is this page's. */
    function follow(pushedEntry: boolean) {
      const character = addressKanji();
      if (character === null || !references.has(character)) {
        // A character without a dialog has no full-screen view either.
        if (character !== null) history.replaceState(history.state, '', address(null));
        if (view.open) view.close();
        return;
      }
      if (view.open && character === shown) return;
      if (!view.open) opener = null;
      if (present(character)) pushed = pushedEntry;
    }

    return {
      /**
       * Open the view on a kanji, or change it if the view is already open (from the dialog on top of it): then it
       * replaces the address, as the arrows do, and keeps what opened it.
       */
      open(character: string, trigger: HTMLElement | null) {
        const wasOpen = view.open;
        if (!present(character)) return;
        if (wasOpen) {
          history.replaceState(history.state, '', address(character));
          announcement.textContent = `${character}, ${meanings(character)}.`;
          return;
        }
        opener = trigger;
        history.pushState(history.state, '', address(character));
        pushed = true;
      },
      follow,
    };
  }

  function createTrigger(character: string, className: string, opening: 'dialog' | 'focus' = 'dialog'): HTMLButtonElement {
    const reference = references.get(character)!;
    // Without the kanji page, its rows open the dialog, as before the full-screen view existed.
    const focus = opening === 'focus' && page ? focusView : undefined;
    const button = node('button', `kanji-detail-trigger ${className}${focus ? ' kanji-focus-trigger' : ''}`);
    button.type = 'button';
    button.lang = 'es';
    const glyph = node('span', '', character);
    glyph.lang = 'ja';
    button.append(glyph);
    button.dataset.kanji = character;
    const category = reference.kind === 'advanced' ? `Avanzado, fuera de los ${source.kanji.length}` : `De los ${source.kanji.length} kanji`;
    const label = `${character}: ${reference.definition.meanings.join(', ')}. ${category}. ${focus ? 'Ver a pantalla completa' : 'Ver información'}`;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', focus ? 'kanji-focus' : dialog.id);
    button.addEventListener('click', () => (focus ? focus.open(character, button) : open(character, button)));
    return button;
  }

  /** The kanji of a word as buttons; `target`, the kanji of the row or of the open dialog, opens as `opening` says. */
  function renderParts(written: string, target: string | undefined, opening: KanjiOpening): DocumentFragment {
    const fragment = document.createDocumentFragment();
    for (const part of wordKanjiParts(written, references, target)) {
      const className = `kanji-link kanji-link--${part.kind}`;
      if (part.kind === 'text') fragment.append(part.text);
      // The kanji the full-screen view already shows keeps its colour (green, or red for a support kanji), without
      // being a button.
      else if (opening === 'none') {
        fragment.append(part.text === target ? node('span', `${className} kanji-link--current`, part.text)
          : createTrigger(part.text, className));
      } else fragment.append(createTrigger(part.text, className, part.kind === 'target' ? opening : 'dialog'));
    }
    return fragment;
  }

  /**
   * A sentence of the full-screen view, whose other kanji are buttons. A button lets the line break around it, so each
   * block between spaces stays on one line (`.kanji-sentence-block`): sentences only break at those spaces.
   */
  function linkKanji(character: string | undefined): SentenceText {
    return (written) => {
      const fragment = document.createDocumentFragment();
      written.split(' ').forEach((part, index) => {
        if (index > 0) fragment.append(' ');
        const block = node('span', 'kanji-sentence-block');
        block.append(renderParts(part, character, 'none'));
        fragment.append(block);
      });
      return fragment;
    };
  }

  /** A word of a row: its own kanji, in green, opens the full-screen view if there is one, and the rest the dialog. */
  function renderWord(written: string, target?: string): DocumentFragment {
    return renderParts(written, target, 'focus');
  }

  /**
   * «Info kanji 01», which opens the full-screen view; on the kanji page it covers the whole kanji column of its row
   * (style.css). The visible label leads the accessible name, so voice control can say it.
   */
  function createInfoButton(character: string, position: number): HTMLButtonElement {
    const button = createTrigger(character, 'study-action info-button', 'focus');
    const label = `Info kanji ${String(position).padStart(2, '0')}`;
    const detail = `pronunciaciones e información de ${character}${page ? ' a pantalla completa' : ''}`;
    button.innerHTML = `<svg class="study-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/><path d="M10.5 11H12v6m-1.5 0h3"/></svg><span class="study-action-label">${label}</span>`;
    button.title = `Ver ${detail}`;
    button.setAttribute('aria-label', `${label}: ${detail}`);
    return button;
  }

  /**
   * Japanese of another section (the counters), with the 80 kanji in blue and the support kanji in red as buttons that
   * open their dialog. Like the sentences of the full-screen view, it only breaks at the spaces between blocks.
   */
  function renderText(written: string): Node {
    const linked = wordKanjiParts(written, references).some((part) => part.kind !== 'text');
    return linked ? linkKanji(undefined)(written) : document.createTextNode(written);
  }

  return {
    renderWord,
    renderText,
    createInfoButton,
    /** After going back or forward in the history: open, change or close the full-screen view as the address says. */
    followUrl: () => focusView.follow(true),
    /** On load: open the full-screen view of the kanji in the address, if any. */
    openFromUrl: () => focusView.follow(false),
  };
}
