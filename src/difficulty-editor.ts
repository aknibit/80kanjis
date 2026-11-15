import type { Kanji } from './types.ts';
import {
  createDifficultyFileWriter, createDifficultyStore, difficultyLabels,
  isDifficulty, parseRatings, type LocalDifficultyFile, type Ratings, type DifficultyTarget,
} from './lib/difficulty.ts';

type PickerWindow = Window & {
  showOpenFilePicker?: (options: {
    multiple: boolean;
    types: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<LocalDifficultyFile[]>;
};

export function setupDifficultyEditor(collection: readonly Kanji[]) {
  document.querySelector('.collection-actions')!.insertAdjacentHTML('beforeend', '<span class="editor-mode">Edición</span><button id="open-difficulties" class="text-button" type="button">Mis dificultades →</button>');
  document.body.insertAdjacentHTML('beforeend', `  <dialog id="difficulties-dialog" aria-labelledby="difficulties-title">
    <div class="dialog-header"><span class="eyebrow">TU CLASIFICACIÓN</span><button id="close-difficulties" class="clear-button" type="button" aria-label="Cerrar dificultades"><span aria-hidden="true">×</span></button></div>
    <h2 id="difficulties-title">A tu ritmo.</h2>
    <p id="difficulty-summary"></p>
    <p>Marca el kanji y cada palabra por separado como fácil, medio o difícil. Las palabras repetidas comparten su dificultad. Las marcas se guardan automáticamente en este navegador.</p>
    <p>Para guardarlas directamente en tu proyecto, vincula <code>public/difficulties.json</code>. Se cargarán sus marcas y cada cambio se escribirá en él. Las marcas del archivo tienen prioridad; las que no incluya se conservan.</p>
    <div class="difficulty-actions">
      <button id="link-file" class="action-button" type="button">Vincular archivo local</button>
      <button id="unlink-file" class="text-button" type="button" hidden>Desvincular</button>
      <button id="retry-file" class="action-button" type="button" hidden>Reintentar guardado</button>
    </div>
    <p id="file-support-note" class="dialog-note">El navegador te pedirá permiso. La vinculación dura hasta que recargues la página. Guardar en tu disco no modifica el archivo alojado en el CDN.</p>
    <div class="difficulty-actions">
      <button id="export-difficulties" class="text-button" type="button">Exportar JSON ↓</button>
      <button id="import-difficulties" class="text-button" type="button">Importar JSON ↑</button>
      <input id="import-file" class="visually-hidden" type="file" accept=".json,application/json" tabindex="-1" aria-label="Archivo de dificultades" />
    </div>
    <p id="difficulty-feedback" class="dialog-note" role="status" aria-live="polite">Puedes compartir el archivo exportado para que usemos tus marcas después.</p>
  </dialog>`);
  const store = createDifficultyStore(collection, () => window.localStorage);
  const dialog = document.querySelector<HTMLDialogElement>('#difficulties-dialog')!;
  const status = document.querySelector<HTMLElement>('#difficulty-status')!;
  const feedback = document.querySelector<HTMLElement>('#difficulty-feedback')!;
  const summary = document.querySelector<HTMLElement>('#difficulty-summary')!;
  const linkButton = document.querySelector<HTMLButtonElement>('#link-file')!;
  const unlinkButton = document.querySelector<HTMLButtonElement>('#unlink-file')!;
  const retryButton = document.querySelector<HTMLButtonElement>('#retry-file')!;
  const importButton = document.querySelector<HTMLButtonElement>('#import-difficulties')!;
  const fileInput = document.querySelector<HTMLInputElement>('#import-file')!;
  const pickerWindow = window as PickerWindow;
  let linkedFile: ReturnType<typeof createDifficultyFileWriter> | null = null;
  let loaded = false;
  let linking = false;
  let saving = 0;
  let failedSave = false;
  let failedLoad = false;
  let pendingFileEdits: Ratings = {};
  const listeners = new Set<() => void>();
  let lastRatings = '';

  function update() {
    const ratings = Object.entries(store.snapshot());
    const kanjiCount = ratings.filter(([key, value]) => key.startsWith('kanji:') && value !== null).length;
    const wordCount = ratings.filter(([key, value]) => key.startsWith('word:') && value !== null).length;
    const wordTotal = ratings.filter(([key]) => key.startsWith('word:')).length;
    const progress = `${kanjiCount}/${collection.length} kanji · ${wordCount}/${wordTotal} palabras`;
    summary.textContent = progress;
    let message = 'Cargando dificultades…';
    if (loaded) {
      if (saving) message = `Guardando en el archivo… · ${progress}`;
      else if (failedSave) message = `No se pudo guardar en el archivo. Reintenta o exporta tus marcas. · ${progress}`;
      else if (!store.storageAvailable && !linkedFile) message = `Solo en esta sesión: exporta tus marcas para conservarlas. · ${progress}`;
      else if (linkedFile) message = `Archivo vinculado: ${linkedFile.name} · ${progress}`;
      else if (failedLoad) message = `No se pudo cargar el archivo inicial; se muestran tus marcas del navegador. · ${progress}`;
      else message = `Guardado en este navegador · ${progress}`;
    }
    status.textContent = message;
    status.classList.toggle('save-warning', failedSave || failedLoad || (!store.storageAvailable && !linkedFile));
    const busy = linking || saving > 0 || !loaded;
    linkButton.disabled = busy;
    importButton.disabled = busy;
    unlinkButton.disabled = busy;
    unlinkButton.hidden = linkedFile === null;
    retryButton.hidden = !failedSave;
    retryButton.disabled = busy;
    document.querySelector<HTMLButtonElement>('#export-difficulties')!.disabled = !loaded;
    document.querySelectorAll<HTMLSelectElement>('[data-difficulty-key]').forEach((select) => {
      const value = store.get(select.dataset.difficultyKey!) ?? '';
      select.value = value;
      select.dataset.difficulty = value;
      select.disabled = !loaded || linking;
    });
    const currentRatings = JSON.stringify(store.snapshot());
    if (currentRatings !== lastRatings) {
      lastRatings = currentRatings;
      listeners.forEach((listener) => listener());
    }
  }

  async function saveToLinkedFile(patch: Ratings) {
    const writer = linkedFile;
    if (!writer) return;
    pendingFileEdits = { ...pendingFileEdits, ...patch };
    const pending = { ...pendingFileEdits };
    saving += 1;
    update();
    try {
      const saved = await writer.write(pending);
      store.loadDefaults(saved);
      for (const [character, value] of Object.entries(pending)) {
        if (pendingFileEdits[character] === value) delete pendingFileEdits[character];
      }
      failedSave = false;
    } catch {
      failedSave = true;
      feedback.textContent = 'No se ha podido escribir en el archivo. Tus marcas siguen disponibles para exportar; puedes volver a vincularlo si ha cambiado el permiso.';
    } finally {
      saving -= 1;
      update();
    }
  }

  document.querySelector('#open-difficulties')!.addEventListener('click', () => dialog.showModal());
  document.querySelector('#close-difficulties')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  if (typeof pickerWindow.showOpenFilePicker !== 'function') {
    linkButton.hidden = true;
    document.querySelector<HTMLElement>('#file-support-note')!.textContent = 'Este navegador no permite vincular archivos para escribir directamente. Puedes importar y exportar tu clasificación.';
  }

  linkButton.addEventListener('click', async () => {
    if (!pickerWindow.showOpenFilePicker) return;
    linking = true;
    update();
    try {
      // The picker and permission prompt must be initiated by this user gesture.
      const [handle] = await pickerWindow.showOpenFilePicker({
        multiple: false,
        types: [{ description: 'Dificultades de 80 kanjis', accept: { 'application/json': ['.json'] } }],
      });
      if (await handle.requestPermission({ mode: 'readwrite' }) !== 'granted') {
        throw new Error('No se ha concedido permiso para escribir. Puedes seguir usando la exportación.');
      }
      const text = await (await handle.getFile()).text();
      parseRatings(text, collection);
      store.import(text);
      linkedFile = createDifficultyFileWriter(handle, collection);
      pendingFileEdits = {};
      failedSave = false;
      failedLoad = false;
      feedback.textContent = `Vinculado: ${handle.name}. Cada cambio se guardará en este archivo. Al recargar la página tendrás que volver a vincularlo para escribir.`;
      await saveToLinkedFile(store.snapshot());
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        feedback.textContent = error instanceof Error ? error.message : 'No se ha podido vincular el archivo.';
      }
    } finally {
      linking = false;
      update();
    }
  });

  unlinkButton.addEventListener('click', () => {
    linkedFile = null;
    pendingFileEdits = {};
    failedSave = false;
    feedback.textContent = 'Archivo desvinculado. Las marcas se siguen guardando en este navegador.';
    update();
  });
  retryButton.addEventListener('click', () => { void saveToLinkedFile(store.snapshot()); });

  document.querySelector('#export-difficulties')!.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([store.export()], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'difficulties.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    feedback.textContent = 'Descarga solicitada. Puedes compartir este archivo o sustituir public/difficulties.json con él.';
  });
  importButton.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    try {
      const patch = store.import(await file.text());
      feedback.textContent = `Clasificación importada de ${file.name}.`;
      update();
      await saveToLinkedFile(patch);
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : 'No se ha podido importar el archivo.';
    }
  });

  // A public JSON file can be replaced on the CDN without rebuilding the app.
  const ready = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(new URL('./difficulties.json', document.baseURI), { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo cargar la clasificación.');
      store.loadDefaults(await response.text());
    } catch { failedLoad = true; }
    finally { clearTimeout(timeout); loaded = true; update(); }
  })();

  return {
    ready,
    get: store.get,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    createIndicator(target: DifficultyTarget) {
      const label = document.createElement('label');
      label.className = 'difficulty-control';
      const caption = document.createElement('span');
      caption.textContent = `Dificultad de ${target.label}`;
      caption.className = 'visually-hidden';
      const select = document.createElement('select');
      select.dataset.difficultyKey = target.key;
      select.setAttribute('aria-label', `Dificultad de ${target.label}`);
      for (const [value, text] of [['', 'Sin marcar'], ...Object.entries(difficultyLabels)]) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        select.append(option);
      }
      select.value = store.get(target.key) ?? '';
      select.dataset.difficulty = select.value;
      select.disabled = !loaded || linking;
      select.addEventListener('change', () => {
        const difficulty = select.value || null;
        if (!isDifficulty(difficulty)) return;
        store.set(target.key, difficulty);
        update();
        void saveToLinkedFile({ [target.key]: difficulty });
      });
      label.append(caption, select);
      return label;
    },
  };
}
