import type { Kanji } from './types.ts';
import { createDifficultyView, difficultyLabels, type DifficultyTarget } from './lib/difficulty.ts';

export function setupDifficultyViewer(collection: readonly Kanji[]) {
  const view = createDifficultyView(collection);
  const status = document.querySelector<HTMLElement>('#difficulty-status')!;
  let loaded = false;
  let failed = false;

  function updateBadge(badge: HTMLElement) {
    const value = view.get(badge.dataset.difficultyKey!);
    const text = failed ? 'No disponible' : !loaded ? 'Cargando…' : value === null ? 'Sin marcar' : difficultyLabels[value];
    badge.textContent = text;
    badge.dataset.difficulty = value ?? '';
    badge.setAttribute('aria-label', `Dificultad de ${badge.dataset.difficultyLabel}: ${text}`);
  }

  const ready = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(new URL('./difficulties.json', document.baseURI), { cache: 'no-store', signal: controller.signal });
      if (!response.ok) throw new Error('No se pudo cargar la clasificación.');
      view.loadDefaults(await response.text());
    } catch {
      failed = true;
      status.textContent = 'No se han podido cargar las dificultades. Recarga la página para volver a intentarlo.';
      status.classList.add('save-warning');
    } finally {
      clearTimeout(timeout);
      loaded = true;
      status.hidden = !failed;
      document.querySelectorAll<HTMLElement>('.difficulty-badge').forEach(updateBadge);
    }
  })();

  return {
    ready,
    createIndicator(target: DifficultyTarget) {
      const badge = document.createElement('span');
      badge.className = 'difficulty-badge';
      badge.dataset.difficultyKey = target.key;
      badge.dataset.difficultyLabel = target.label;
      updateBadge(badge);
      return badge;
    },
  };
}
