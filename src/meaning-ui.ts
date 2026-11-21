/**
 * The meanings hidden as sand, so you can guess them first: in the kanji dialog, in its full-screen view and in the
 * tables of the counters. A «Significado» button brings each one into focus, and blows it away as smoke when it
 * hides it again.
 */

function node<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const result = document.createElement(tag);
  result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}

const eyeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
const eyeOffIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10.6 5.1A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.6 3.6M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18"/></svg>';
let meaningCount = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
/**
 * Turns a hidden meaning into sand: the words merge into soft mounds (blur and a low threshold), fine noise cuts them
 * into grains with crisp edges, and a second channel of the same noise gives each grain its own shade. The colour is
 * the text's own yellow, so it works in both themes.
 */
const gravelFilter = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'
  + '<filter id="meaning-gravel" x="-4%" y="-35%" width="108%" height="170%" color-interpolation-filters="sRGB">'
  + '<feGaussianBlur in="SourceGraphic" stdDeviation="2" result="soft"/>'
  + '<feComponentTransfer in="soft" result="shape"><feFuncA type="discrete" tableValues="0 1 1 1 1 1 1 1 1 1 1 1"/></feComponentTransfer>'
  + '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="7" result="noise"/>'
  + '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 30 0 0 0 -11.5" result="grains"/>'
  + '<feComposite in="shape" in2="grains" operator="in" result="sand"/>'
  + '<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.2 0 0 0.15" result="shade"/>'
  + '<feComposite in="sand" in2="shade" operator="in"/>'
  + '</filter></svg>';

/**
 * Puts the sand filter in the page, once. Call it before any meaning exists: without it, the copy that wears it
 * (`.meaning-gravel`) would show the meaning in clear text.
 */
export function setupMeaningFilter(): void {
  if (!document.querySelector('#meaning-gravel')) document.body.insertAdjacentHTML('beforeend', gravelFilter);
}

/**
 * How long the smoke takes: the last letter starts after `smokeStagger` and fades for `smokeLetter`. The gravel that
 * it leaves behind is timed to match in style.css (`meaning-gravel-in`).
 */
const smokeStagger = 350;
const smokeLetter = 900;

/**
 * The clear meaning drifts away like smoke, letter by letter, and leaves the gravel behind (style.css). The
 * letters are a copy for the eye only, laid over the text: the text itself stays whole. Returns what stops it early.
 */
function smoke(meaning: HTMLElement, text: string): () => void {
  const cloud = node('span', 'meaning-smoke');
  cloud.setAttribute('aria-hidden', 'true');
  const letters = text.replace(/\s/gu, '').length;
  let index = 0;
  text.split(' ').forEach((word, position) => {
    if (position > 0) cloud.append(' ');
    // Lines only break between words, as in the text below.
    const block = node('span', 'meaning-smoke-word');
    for (const letter of word) {
      const span = node('span', 'meaning-smoke-letter', letter);
      const delay = (index++ / Math.max(1, letters - 1)) * smokeStagger + Math.random() * 80;
      span.style.setProperty('--smoke-delay', `${Math.round(delay)}ms`);
      span.style.setProperty('--smoke-x', `${(Math.random() * 22 - 6).toFixed(1)}px`);
      span.style.setProperty('--smoke-y', `${(-12 - Math.random() * 16).toFixed(1)}px`);
      span.style.setProperty('--smoke-turn', `${(Math.random() * 60 - 30).toFixed(0)}deg`);
      block.append(span);
    }
    cloud.append(block);
  });
  meaning.append(cloud);
  meaning.classList.add('meaning-veil--smoke');
  const timer = window.setTimeout(stop, smokeStagger + smokeLetter + 120);
  function stop() {
    window.clearTimeout(timer);
    cloud.remove();
    meaning.classList.remove('meaning-veil--smoke');
  }
  return stop;
}

/**
 * Hides `meaning` as sand and returns the button that shows it. The hidden text is hidden from screen readers too.
 * The label stays «Significado»: the state is in `aria-pressed` and the eye.
 */
export function meaningButton(meaning: HTMLElement): HTMLButtonElement {
  meaning.id = `meaning-${++meaningCount}`;
  const words = meaning.textContent ?? '';
  const text = node('span', 'meaning-text', words);
  // The gravel is a copy laid over the text: a filter cannot fade into no filter, but two layers can cross-fade.
  const gravel = node('span', 'meaning-gravel', words);
  gravel.setAttribute('aria-hidden', 'true');
  meaning.replaceChildren(text, gravel);
  meaning.classList.add('meaning-veil');
  let stopSmoke: (() => void) | undefined;
  const button = node('button', 'meaning-button');
  button.type = 'button';
  button.setAttribute('aria-controls', meaning.id);
  button.innerHTML = `<span class="meaning-button-icon meaning-button-icon--show">${eyeIcon}</span>`
    + `<span class="meaning-button-icon meaning-button-icon--hide">${eyeOffIcon}</span>Significado`;
  const paint = (shown: boolean) => {
    meaning.dataset.shown = String(shown);
    text.setAttribute('aria-hidden', String(!shown));
    button.setAttribute('aria-pressed', String(shown));
    button.title = shown ? 'Ocultar significado' : 'Mostrar significado';
  };
  paint(false);
  button.addEventListener('click', () => {
    const show = meaning.dataset.shown !== 'true';
    stopSmoke?.();
    stopSmoke = undefined;
    paint(show);
    if (!show && !reducedMotion.matches) stopSmoke = smoke(meaning, words);
  });
  return button;
}
