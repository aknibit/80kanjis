import { difficultyLabels } from './lib/difficulty.ts';
import { createKanjiReferences, wordKanjiParts } from './lib/kanji-reference.ts';
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

/** One native dialog for every kanji; the source owns all reference content. */
export function setupKanjiDetails(source: CollectionDocument) {
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

  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
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
    body.replaceChildren(hero);

    body.append(renderKanjiReadings(reference.definition, character), renderReadingHint(reference.definition, character));
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
    for (const word of reference.vocabulary) {
      const example = node('li', '');
      const japanese = node('div', 'kanji-dialog-word');
      japanese.lang = 'ja';
      const written = node('span', 'kanji-dialog-written');
      written.append(renderWord(word.written, character));
      japanese.append(written, node('span', 'word-reading', word.reading));
      example.append(japanese, node('p', '', word.meaning));
      examples.append(example);
    }
    body.append(examplesTitle, examples);
    const attribution = node('p', 'kanji-dialog-source');
    const link = node('a', '', 'Consultar fuente del kanji');
    link.href = reference.definition.sourceUrl;
    link.target = '_blank';
    link.rel = 'noopener';
    attribution.append(link);
    body.append(attribution);
    if (!dialog.open) {
      opener = trigger;
      dialog.showModal();
    }
    dialog.scrollTop = 0;
    close.focus({ preventScroll: true });
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

  function createInfoButton(character: string): HTMLButtonElement {
    const button = createTrigger(character, 'study-action info-button');
    button.innerHTML = '<svg class="study-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/><path d="M10.5 11H12v6m-1.5 0h3"/></svg><span class="study-action-label">Info</span>';
    button.title = `Ver pronunciaciones e información de ${character}`;
    button.setAttribute('aria-label', button.title);
    return button;
  }

  return { renderWord, createInfoButton, createKanjiButton: (character: string) => createTrigger(character, 'kanji-character-button') };
}
