import { difficultyLabels } from './lib/difficulty.ts';
import { createKanjiReferences, wordKanjiParts } from './lib/kanji-reference.ts';
import type { CollectionDocument } from './types.ts';

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const result = document.createElement(tag);
  result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
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

    if (reference.kind === 'advanced') {
      const readings = node('dl', 'kanji-dialog-readings');
      for (const [label, values] of [['Lectura on', reference.definition.onyomi], ['Lectura kun', reference.definition.kunyomi]] as const) {
        if (values.length === 0) continue;
        const group = node('div', '');
        const value = node('dd', '', values.join(' · '));
        value.lang = 'ja';
        group.append(node('dt', '', label), value);
        readings.append(group);
      }
      body.append(readings, node('p', 'kanji-dialog-note', reference.definition.note));
    } else {
      body.append(node('p', 'kanji-dialog-difficulty', `Dificultad: ${reference.definition.difficulty === null
        ? 'Sin marcar' : difficultyLabels[reference.definition.difficulty]}`));
    }

    const examplesTitle = node('h3', 'kanji-dialog-examples-title', advanced ? 'En el vocabulario de la colección' : 'Las tres palabras de su fila');
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
    if (reference.kind === 'advanced') {
      const attribution = node('p', 'kanji-dialog-source');
      const link = node('a', '', 'Consultar fuente del kanji');
      link.href = reference.definition.sourceUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      attribution.append(link);
      body.append(attribution);
    }
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

  return { renderWord, createKanjiButton: (character: string) => createTrigger(character, 'kanji-character-button') };
}
