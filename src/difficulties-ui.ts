import { setupDifficultyEditor } from './difficulty-editor.ts';
import { setupDifficultyViewer } from './difficulty-viewer.ts';

// Vite replaces this constant; the unused implementation is removed from each build.
export const setupDifficulties = __EDITABLE_DIFFICULTIES__
  ? setupDifficultyEditor
  : setupDifficultyViewer;
