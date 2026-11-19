import { difficultyLabels } from './lib/difficulty.ts';
import { createKanjiReferences, wordKanjiParts } from './lib/kanji-reference.ts';
import { loadKanjiSentences } from './lib/content.ts';
import { vocabularyItemId } from './lib/study-catalog.ts';
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

/** The kanji of the dialog stands out; the rest of the sentence keeps its own spelling. */
function renderSentence(example: ContentExample, character: string): HTMLLIElement {
  const item = node('li', 'kanji-sentence');
  const written = node('p', 'kanji-sentence-written');
  written.lang = 'ja';
  example.written.split(character).forEach((part, index) => {
    if (index > 0) written.append(node('span', 'kanji-sentence-target', character));
    written.append(part);
  });
  const reading = node('p', 'kanji-sentence-reading', example.reading);
  reading.lang = 'ja';
  item.append(written, reading, node('p', 'kanji-sentence-meaning', example.meaning));
  return item;
}

function renderSentences(sentences: KanjiSentences): DocumentFragment {
  const fragment = document.createDocumentFragment();
  for (const [label, list] of [['Sencillas', sentences.simple], ['Con adjetivos, adverbios y contadores', sentences.advanced]] as const) {
    const items = node('ul', 'kanji-sentence-list');
    items.setAttribute('aria-label', `Frases ${label.toLowerCase()}`);
    for (const example of list) items.append(renderSentence(example, sentences.kanji));
    fragment.append(node('p', 'kanji-sentence-group', label), items);
  }
  return fragment;
}

type KanjiTab = 'vocabulary' | 'sentences';
const kanjiTabs: Readonly<Record<KanjiTab, string>> = { vocabulary: 'Vocabulario', sentences: 'Frases' };

/** One native dialog for every kanji; the source owns all reference content. Its words share the page's audio player. */
export function setupKanjiDetails(source: CollectionDocument, pronunciation?: PronunciationControls) {
  const references = createKanjiReferences(source);
  const dialog = node('dialog', 'kanji-dialog');
  dialog.id = 'kanji-dialog';
  dialog.setAttribute('aria-labelledby', 'kanji-dialog-title');
  dialog.setAttribute('aria-describedby', 'kanji-dialog-description');
  const header = node('div', 'dialog-header');
  const category = node('span', 'eyebrow');
  const close = node('button', 'clear-button kanji-dialog-close', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Cerrar información del kanji');
  header.append(category, close);
  const body = node('div', 'kanji-dialog-body');
  dialog.append(header, body);
  document.body.append(dialog);
  let opener: HTMLElement | null = null;
  let shown = '';
  // The tab stays chosen while the page is open, also from one kanji to the next. It is not stored in the browser.
  let selectedTab: KanjiTab = 'vocabulary';
  // Requested the first time a dialog opens and kept for the visit; a failed request is retried on the next opening.
  let sentences: Promise<ReadonlyMap<string, KanjiSentences>> | null = null;
  const requestSentences = () => sentences ??= loadKanjiSentences(source.kanji.map((entry) => entry.character))
    .then((data) => new Map(data.entries.map((entry) => [entry.kanji, entry])))
    .catch((error: unknown) => { sentences = null; throw error; });

  close.addEventListener('click', () => dialog.close());
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
    const advanced = reference.kind === 'advanced';
    // A word playing in the previous kanji, or on the page, would lose its Parar button.
    pronunciation?.stop();
    shown = character;
    dialog.dataset.kind = reference.kind;
    category.textContent = advanced ? 'KANJI AVANZADO · DE APOYO'
      : `KANJI ${String(reference.position).padStart(2, '0')} DE ${source.kanji.length}`;
    const hero = node('div', 'kanji-dialog-hero');
    const glyph = node('span', 'kanji-dialog-character', character);
    glyph.lang = 'ja';
    glyph.setAttribute('aria-hidden', 'true');
    const summary = node('div', 'kanji-dialog-summary');
    const title = node('h2', '', reference.definition.meanings.join(' · '));
    title.id = 'kanji-dialog-title';
    const spokenCharacter = node('span', 'visually-hidden', `${character}: `);
    spokenCharacter.lang = 'ja';
    title.prepend(spokenCharacter);
    const description = node('p', 'kanji-dialog-description', advanced
      ? `Fuera de los ${source.kanji.length} kanji principales. Se incluye como apoyo al vocabulario.`
      : `Forma parte de los ${source.kanji.length} kanji de la colección.`);
    description.id = 'kanji-dialog-description';
    summary.append(title, description);
    hero.append(glyph, summary);
    body.replaceChildren(hero, renderKanjiReadings(reference.definition, character), renderReadingHint(reference.definition, character));
    if (reference.definition.note) {
      const note = reference.definition.note.replace(/([ぁ-ゖー])\.(?=[ぁ-ゖー])/gu, '$1');
      body.append(node('p', 'kanji-dialog-note', note));
    }
    if (reference.kind === 'collection') {
      body.append(node('p', 'kanji-dialog-difficulty', `Dificultad: ${reference.definition.difficulty === null
        ? 'Sin marcar' : difficultyLabels[reference.definition.difficulty]}`));
    }

    const examplesTitle = node('h3', 'kanji-dialog-examples-title', 'Lecturas en el vocabulario de la colección');
    const examples = node('ul', 'kanji-dialog-examples');
    // The page's status is behind the modal, so playback errors are announced here.
    const audioStatus = node('p', 'audio-status kanji-dialog-audio-status');
    audioStatus.setAttribute('role', 'status');
    audioStatus.setAttribute('aria-live', 'polite');
    for (const word of reference.vocabulary) {
      const example = node('li', '');
      const japanese = node('div', 'kanji-dialog-word');
      japanese.lang = 'ja';
      const written = node('span', 'kanji-dialog-written');
      written.append(renderWord(word.written, character));
      japanese.append(written, node('span', 'word-reading', word.reading));
      example.append(japanese, node('p', '', word.meaning));
      const audio = pronunciation?.createButton({ id: vocabularyItemId(word.written), written: word.written, reading: word.reading }, audioStatus);
      if (audio) example.append(audio);
      examples.append(example);
    }
    const attribution = node('p', 'kanji-dialog-source');
    const link = node('a', '', 'Consultar fuente del kanji');
    link.href = reference.definition.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    attribution.append(link);
    // The 80 kanji show their vocabulary or their sentences, one at a time; support kanji only have vocabulary.
    if (reference.kind === 'collection') {
      const vocabulary = node('div', 'kanji-dialog-panel');
      vocabulary.append(audioStatus, examples);
      body.append(...renderTabs({ vocabulary, sentences: renderSentencePanel(character) }));
    } else body.append(examplesTitle, audioStatus, examples);
    body.append(attribution);
    if (!dialog.open) {
      opener = trigger;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
  }

  /** Filled once the sentences arrive, unless another kanji is shown by then. */
  function renderSentencePanel(character: string): HTMLElement {
    const panel = node('div', 'kanji-dialog-panel');
    const status = node('p', 'kanji-sentence-status', 'Cargando frases…');
    status.setAttribute('role', 'status');
    panel.append(status);
    requestSentences().then((all) => {
      if (shown !== character) return;
      const entry = all.get(character);
      if (entry) panel.replaceChildren(renderSentences(entry));
      else status.textContent = 'Este kanji todavía no tiene frases.';
    }, () => {
      if (shown === character) status.textContent = 'No se pudieron cargar las frases. Vuelve a abrir el kanji para intentarlo de nuevo.';
    });
    return panel;
  }

  /** WAI-ARIA tabs: arrows, Home and End move between them, and the chosen panel is the only one shown. */
  function renderTabs(panels: Readonly<Record<KanjiTab, HTMLElement>>): HTMLElement[] {
    const list = node('div', 'kanji-dialog-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Contenido del kanji');
    const tabs = Object.keys(kanjiTabs) as KanjiTab[];
    const buttons = tabs.map((tab) => {
      const button = node('button', 'kanji-dialog-tab', kanjiTabs[tab]);
      button.type = 'button';
      button.id = `kanji-dialog-tab-${tab}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `kanji-dialog-panel-${tab}`);
      button.addEventListener('click', () => select(tab));
      const panel = panels[tab];
      panel.id = `kanji-dialog-panel-${tab}`;
      panel.tabIndex = 0;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', button.id);
      return button;
    });
    const select = (tab: KanjiTab, focus = false) => {
      selectedTab = tab;
      tabs.forEach((item, index) => {
        buttons[index].setAttribute('aria-selected', String(item === tab));
        buttons[index].tabIndex = item === tab ? 0 : -1;
        panels[item].hidden = item !== tab;
      });
      if (focus) buttons[tabs.indexOf(tab)].focus();
    };
    list.addEventListener('keydown', (event) => {
      const index = tabs.indexOf(selectedTab);
      const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[(next + tabs.length) % tabs.length], true);
    });
    list.append(...buttons);
    select(selectedTab);
    return [list, ...tabs.map((tab) => panels[tab])];
  }

  function createTrigger(character: string, className: string): HTMLButtonElement {
    const reference = references.get(character)!;
    const button = node('button', `kanji-detail-trigger ${className}`);
    button.type = 'button';
    button.lang = 'es';
    const glyph = node('span', '', character);
    glyph.lang = 'ja';
    button.append(glyph);
    button.dataset.kanji = character;
    const category = reference.kind === 'advanced' ? `Avanzado, fuera de los ${source.kanji.length}` : `De los ${source.kanji.length} kanji`;
    const label = `${character}: ${reference.definition.meanings.join(', ')}. ${category}. Ver información`;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', dialog.id);
    button.addEventListener('click', () => open(character, button));
    return button;
  }

  function renderWord(written: string, target?: string): DocumentFragment {
    const fragment = document.createDocumentFragment();
    for (const part of wordKanjiParts(written, references, target)) {
      fragment.append(part.kind === 'text' ? document.createTextNode(part.text)
        : createTrigger(part.text, `kanji-link kanji-link--${part.kind}`));
    }
    return fragment;
  }

  /** «Info kanji 01»: the visible label leads the accessible name, so voice control can say it. */
  function createInfoButton(character: string, position: number): HTMLButtonElement {
    const button = createTrigger(character, 'study-action info-button');
    const label = `Info kanji ${String(position).padStart(2, '0')}`;
    button.innerHTML = `<svg class="study-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/><path d="M10.5 11H12v6m-1.5 0h3"/></svg><span class="study-action-label">${label}</span>`;
    button.title = `Ver pronunciaciones e información de ${character}`;
    button.setAttribute('aria-label', `${label}: pronunciaciones e información de ${character}`);
    return button;
  }

  return { renderWord, createInfoButton, createKanjiButton: (character: string) => createTrigger(character, 'kanji-character-button') };
}
