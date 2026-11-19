/**
 * The difficulty filter shared by every section: one hand-made drop-down, floated to the right of the page title,
 * instead of a row per section. It is a select-only combobox (WAI-ARIA APG): a button shows the choice in the tint of
 * its level, and a list of options, each with its tint and count, opens below it. A native <select> could not keep
 * those colours, since browsers draw its list themselves.
 * The choice is kept in the browser (`80kanjis-difficulty`) and in the address (`?difficulty=`). An address that names
 * a level wins and is kept too, so a shared link opens at its level and the next section follows it. Each page with
 * difficulties connects to the selector, reports its counts and redraws when the choice changes; Kana leaves it hidden.
 * Keep the storage key in sync with scripts/check-build.mjs and AGENTS.md.
 */
import { difficultyIcon } from './lib/difficulty.ts';
import { initialRowDifficultyFilter, parseRowDifficultyFilter, rowDifficultyFilters, type RowDifficultyFilter } from './lib/row-difficulty.ts';

type DifficultyChoice = RowDifficultyFilter;

export interface DifficultySelector {
  /** The current choice. */
  readonly value: DifficultyChoice;
  /** Show the selector for a page; `describedBy` is the id of an optional hint. */
  connect(onChange: () => void, describedBy?: string): void;
  /**
   * What each choice would show on this page. A choice without a count is hidden; if it was selected, Todas takes its
   * place without calling `onChange`, since the page is already drawing: read `value` after this call.
   */
  showCounts(counts: Partial<Record<DifficultyChoice, number>>): void;
  /** Select a choice, as picking it would (the empty state's «Ver todo»). */
  select(choice: DifficultyChoice): void;
  /** Follow the address after going back or forward in the history, without calling `onChange`. */
  followUrl(): void;
}

function savedChoice(): string | null {
  try {
    return localStorage.getItem('80kanjis-difficulty');
  } catch {
    return null;
  }
}

function saveChoice(choice: DifficultyChoice) {
  try {
    if (choice === 'all') localStorage.removeItem('80kanjis-difficulty');
    else localStorage.setItem('80kanjis-difficulty', choice);
  } catch {
    // Blocked storage (private mode): the choice still travels in the address while the page stays open.
  }
}

const urlChoice = () => new URL(window.location.href).searchParams.get('difficulty');
const chevron = '<svg class="difficulty-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m4 6 4 4 4-4"/></svg>';
// The dots of each level, as on the cards; Todas has none and Sin completar the faded ones of an unmarked entry.
const icon = (choice: DifficultyChoice) => (choice === 'all' ? '' : difficultyIcon(choice === 'unrated' ? null : choice));
// Type-ahead matches the first letter without its accent.
const initial = (text: string) => text.normalize('NFD').charAt(0).toLowerCase();

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function setupDifficultySelector(host: HTMLElement): DifficultySelector {
  let value = initialRowDifficultyFilter(urlChoice(), savedChoice());
  // An address with a level becomes the choice for the next sections too.
  if (urlChoice() === value) saveChoice(value);
  let listener: (() => void) | undefined;
  let active: DifficultyChoice = value;

  const label = element('span', 'difficulty-selector-label', 'Dificultad');
  label.id = 'difficulty-selector-label';
  const trigger = element('button', 'difficulty-trigger');
  trigger.type = 'button';
  trigger.id = 'difficulty-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'difficulty-options');
  trigger.setAttribute('aria-labelledby', label.id);
  const triggerIcon = element('span', 'difficulty-choice-icon');
  const triggerText = element('span', 'difficulty-trigger-text');
  trigger.append(triggerIcon, triggerText);
  trigger.insertAdjacentHTML('beforeend', chevron);
  const list = element('ul', 'difficulty-options');
  list.id = 'difficulty-options';
  list.setAttribute('role', 'listbox');
  list.setAttribute('aria-labelledby', label.id);
  list.hidden = true;
  const options = new Map<DifficultyChoice, HTMLLIElement>();
  for (const [choice, text] of Object.entries(rowDifficultyFilters) as [DifficultyChoice, string][]) {
    const option = element('li', 'difficulty-option');
    option.id = `difficulty-option-${choice}`;
    option.setAttribute('role', 'option');
    option.dataset.difficultyFilter = choice;
    option.hidden = choice === 'unrated';
    const optionIcon = element('span', 'difficulty-choice-icon');
    optionIcon.innerHTML = icon(choice);
    option.append(optionIcon, element('span', 'difficulty-option-text', text), element('span', 'filter-count'));
    option.addEventListener('click', () => { select(choice); close(); trigger.focus(); });
    list.append(option); options.set(choice, option);
  }
  // Clicking an option keeps the focus on the button, as in a native select.
  list.addEventListener('mousedown', (event) => event.preventDefault());
  host.replaceChildren(label, trigger, list);

  const visible = () => [...options].filter(([, option]) => !option.hidden).map(([choice]) => choice);
  function writeUrl() {
    const url = new URL(window.location.href);
    if (value !== 'all') url.searchParams.set('difficulty', value); else url.searchParams.delete('difficulty');
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, '', url);
  }
  function paint() {
    trigger.dataset.difficultyFilter = value;
    triggerIcon.innerHTML = icon(value);
    triggerText.textContent = rowDifficultyFilters[value];
    for (const [choice, option] of options) option.setAttribute('aria-selected', String(choice === value));
  }
  function highlight(choice: DifficultyChoice) {
    active = choice;
    for (const [id, option] of options) option.classList.toggle('is-active', id === choice);
    trigger.setAttribute('aria-activedescendant', options.get(choice)!.id);
    options.get(choice)!.scrollIntoView({ block: 'nearest' });
  }
  const isOpen = () => !list.hidden;
  function open(choice: DifficultyChoice = value) {
    list.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    highlight(visible().includes(choice) ? choice : visible()[0]);
  }
  function close() {
    list.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    for (const option of options.values()) option.classList.remove('is-active');
  }
  // `quiet` when the page is already drawing and reads the new value itself.
  function select(choice: DifficultyChoice, quiet = false) {
    if (choice === value) return;
    value = choice;
    saveChoice(value);
    paint();
    if (!listener) return;
    writeUrl();
    if (!quiet) listener();
  }
  paint();

  trigger.addEventListener('click', () => (isOpen() ? close() : open()));
  trigger.addEventListener('keydown', (event) => {
    const choices = visible();
    const index = choices.indexOf(active);
    const move = (to: number) => highlight(choices[Math.max(0, Math.min(choices.length - 1, to))]);
    if (!isOpen()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) { event.preventDefault(); open(); }
      else if (event.key === 'Home') { event.preventDefault(); open(choices[0]); }
      else if (event.key === 'End') { event.preventDefault(); open(choices.at(-1)); }
      return;
    }
    if (event.key === 'ArrowDown') { event.preventDefault(); if (event.altKey) return; move(index + 1); }
    else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.altKey) { select(active); close(); } else move(index - 1);
    } else if (event.key === 'Home' || event.key === 'PageUp') { event.preventDefault(); move(0); }
    else if (event.key === 'End' || event.key === 'PageDown') { event.preventDefault(); move(choices.length - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(active); close(); }
    else if (event.key === 'Escape') { event.preventDefault(); close(); }
    else if (event.key === 'Tab') { select(active); close(); }
    else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Type-ahead: the next option whose name starts with that letter (f: Fácil, d: Difícil).
      const after = [...choices.slice(index + 1), ...choices.slice(0, index + 1)];
      const match = after.find((choice) => initial(rowDifficultyFilters[choice]) === initial(event.key));
      if (match) { event.preventDefault(); highlight(match); }
    }
  });
  // Focus moving to another control closes the list. A tap on an option moves it nowhere (no related target), so the
  // list stays open until its click arrives.
  trigger.addEventListener('focusout', (event) => {
    if (event.relatedTarget instanceof Node && !host.contains(event.relatedTarget)) close();
  });
  // A tap or click anywhere else closes the list without changing the choice.
  document.addEventListener('pointerdown', (event) => {
    if (isOpen() && !host.contains(event.target as Node)) close();
  });

  return {
    get value() { return value; },
    connect(onChange, describedBy) {
      listener = onChange;
      if (describedBy) trigger.setAttribute('aria-describedby', describedBy);
      host.hidden = false;
      writeUrl();
    },
    showCounts(counts) {
      for (const [choice, option] of options) {
        const count = counts[choice];
        option.hidden = count === undefined;
        option.querySelector('.filter-count')!.textContent = String(count ?? 0);
      }
      if (counts[value] === undefined) select('all', true);
    },
    select: (choice) => select(choice),
    followUrl() {
      const choice = parseRowDifficultyFilter(urlChoice());
      if (choice === urlChoice()) select(choice, true);
      else writeUrl();
    },
  };
}
