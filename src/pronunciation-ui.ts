import { sentenceAudioDirectory, wordAudioDirectory, wordAudioFile } from './lib/audio.ts';
import type { VocabularyStudyItem } from './types.ts';

const speakerIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false"><path d="m11 5-6 4H2v6h3l6 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
const stopIcon = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

/** What a button needs to find and name a recording: a collection row's word or one from the kanji dialog. */
export type SpokenWord = Pick<VocabularyStudyItem, 'id' | 'written'>;

export type PronunciationControls = ReturnType<typeof setupPronunciation>;

/** A recording behind an Audio button: its file in public/audio/, its text, where its errors go and its button's states. */
interface Recording {
  readonly file: string;
  readonly written: string;
  readonly report: HTMLElement;
  readonly reset: () => void;
  readonly showPlaying: () => void;
}

// What plays also shows in the system's player (the lock screen and Control Center on iOS, the media controls of
// desktop browsers) as a podcast's: the text spoken, «80kanjis audios» and a cover, instead of the page title and its
// favicon.
const mediaSession = 'mediaSession' in navigator && typeof MediaMetadata === 'function' ? navigator.mediaSession : undefined;
const artwork = new URL('./icons/now-playing.png', import.meta.url).href;

/** One active recording across the page and the kanji dialog; no download until a user presses play. */
export function setupPronunciation(status: HTMLElement) {
  // One element plays every recording and keeps the last one after it ends or stops, because the system's player stays
  // attached to it: its play button, also on the lock screen of a locked iPhone, plays that recording again. An element
  // emptied at the end, as it was before, left that button with nothing to play.
  const player = new Audio();
  player.preload = 'none';
  // What plays now, if anything, and what played last, which the system's player can play again.
  let active: Recording | undefined;
  let last: Recording | undefined;
  // Each start's own number: a play promise rejected because another recording started is not an error.
  let attempt = 0;

  function stop() {
    if (!active) return;
    const previous = active;
    active = undefined;
    player.pause();
    previous.reset();
    // The system's player stays with what played last, cover included, as a paused podcast: without its metadata, the
    // iPhone would go back to the page title and the apple-touch-icon.
    if (mediaSession) mediaSession.playbackState = 'paused';
  }

  function start(recording: Recording) {
    stop();
    recording.report.textContent = '';
    active = last = recording;
    recording.showPlaying();
    const url = new URL(`audio/${recording.file}`, document.baseURI).href;
    // The same recording again starts over without downloading it again, unless it failed.
    if (player.src === url && !player.error) player.currentTime = 0;
    else player.src = url;
    if (mediaSession) {
      mediaSession.metadata = new MediaMetadata({ title: recording.written, artist: '80kanjis audios',
        artwork: [{ src: artwork, sizes: '1024x1024', type: 'image/png' }] });
      mediaSession.playbackState = 'playing';
    }
    const current = ++attempt;
    void player.play().catch(() => { if (current === attempt) fail(); });
  }

  function fail() {
    if (!active) return;
    const failed = active;
    stop();
    // Quoted: a sentence already ends in 。.
    failed.report.textContent = `No se pudo reproducir «${failed.written}». Pulsa el botón para volver a intentarlo.`;
  }

  player.addEventListener('ended', stop);
  player.addEventListener('error', fail);
  // Pausing or stopping from the system's player stops it as Parar does, so the button does not stay on Parar; its play
  // button plays the last recording again, also when its own button has left the page.
  const actions: [MediaSessionAction, () => void][] = [['pause', stop], ['stop', stop], ['play', () => { if (last) start(last); }]];
  for (const [action, handler] of actions) {
    try { mediaSession?.setActionHandler(action, handler); } catch { /* An action this browser does not offer. */ }
  }

  /**
   * Every word of the vocabulary and every kanji sentence has a generated recording; npm run check:content makes sure
   * it matches the text and reading. `report` shows playback errors; the dialog has its own, because the page behind
   * it is inert.
   */
  function createButton(item: SpokenWord, report: HTMLElement = status): HTMLButtonElement {
    return createPlayer(item.id, item.written, `${wordAudioDirectory}/${wordAudioFile(item.written)}`, report);
  }

  /** A sentence of a kanji dialog, or of another `directory` of public/audio/: counters/ for the counter tables. */
  function createSentenceButton(id: string, written: string, file: string, report: HTMLElement,
    directory = sentenceAudioDirectory): HTMLButtonElement {
    return createPlayer(id, written, `${directory}/${file}`, report);
  }

  function createPlayer(id: string, written: string, file: string, report: HTMLElement): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'study-action audio-button';
    button.type = 'button';
    button.dataset.audioItemId = id;
    const icon = document.createElement('span');
    icon.className = 'study-action-icon';
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    label.className = 'study-action-label';
    button.append(icon, label);

    function reset() {
      icon.innerHTML = speakerIcon;
      label.textContent = 'Audio';
      button.setAttribute('aria-label', `Escuchar ${written}`);
      button.setAttribute('aria-pressed', 'false');
      button.title = `Escuchar ${written}`;
    }
    function showPlaying() {
      icon.innerHTML = stopIcon;
      label.textContent = 'Parar';
      button.setAttribute('aria-pressed', 'true');
      button.setAttribute('aria-label', `Detener audio de ${written}`);
      button.title = `Detener audio de ${written}`;
    }
    reset();

    const recording: Recording = { file, written, report, reset, showPlaying };
    button.addEventListener('click', () => {
      if (active !== recording) start(recording);
      else {
        stop();
        report.textContent = '';
      }
    });
    return button;
  }

  return { createButton, createSentenceButton, stop };
}
