import { getPronunciation } from './data/pronunciations.ts';
import type { VocabularyStudyItem } from './types.ts';

const speakerIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const stopIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

/** One active recording across the collection; no download until a user presses play. */
export function setupPronunciation(status: HTMLElement) {
  let active: { audio: HTMLAudioElement; reset: () => void } | undefined;

  function stop() {
    if (!active) return;
    const previous = active;
    active = undefined;
    previous.audio.pause();
    previous.audio.removeAttribute('src');
    previous.audio.load();
    previous.reset();
  }

  function createButton(item: VocabularyStudyItem): HTMLButtonElement | undefined {
    const clip = getPronunciation(item);
    if (!clip) return;
    const button = document.createElement('button');
    button.className = `study-action audio-button${clip.kind === 'synthesized' ? ' audio-button--synthesized' : ''}`;
    button.type = 'button';
    button.dataset.audioItemId = item.id;
    button.dataset.audioKind = clip.kind;
    const origin = clip.kind === 'synthesized' ? 'Voz generada con VOICEVOX Nemo' : 'Grabación humana';

    function reset() {
      button.innerHTML = speakerIcon;
      button.setAttribute('aria-label', `Escuchar ${item.written} · ${origin}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `Escuchar ${item.written} · ${origin}`;
    }
    reset();

    button.addEventListener('click', () => {
      const wasPlaying = button.getAttribute('aria-pressed') === 'true';
      stop();
      status.textContent = '';
      if (wasPlaying) return;
      const audio = new Audio(new URL(`audio/${clip.file}`, document.baseURI).href);
      audio.preload = 'none';
      active = { audio, reset };
      button.innerHTML = stopIcon;
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', `Detener audio de ${item.written}`);
      button.title = `Detener audio de ${item.written}`;

      const failed = () => {
        // Ignore an old play promise rejected when a different word starts playing.
        if (active?.audio !== audio) return;
        stop();
        status.textContent = `No se pudo reproducir ${item.written}. Pulsa el botón para volver a intentarlo.`;
      };
      audio.addEventListener('ended', () => { if (active?.audio === audio) stop(); });
      audio.addEventListener('error', failed);
      void audio.play().catch(failed);
    });
    return button;
  }

  return { createButton, stop };
}
