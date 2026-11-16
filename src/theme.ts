/**
 * Light/dark toggle. The inline script in index.html applies the saved or system theme
 * before the first paint; keep its storage key and values in sync with this module.
 * The theme preference is the only thing this site stores in the browser (see AGENTS.md).
 */
type Theme = 'light' | 'dark';

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function savedTheme(): Theme | null {
  try {
    const value = localStorage.getItem('80kanjis-theme');
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return systemDark.matches ? 'dark' : 'light';
}

export function setupThemeToggle(button: HTMLButtonElement) {
  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const apply = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.title = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    themeColor?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--page').trim());
  };
  apply(savedTheme() ?? systemTheme());
  button.addEventListener('click', () => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    // Picking the system theme clears the override, so the page follows the system again.
    try {
      if (next === systemTheme()) localStorage.removeItem('80kanjis-theme');
      else localStorage.setItem('80kanjis-theme', next);
    } catch {
      // Blocked storage (private mode): the choice lasts until the page changes.
    }
    apply(next);
  });
  systemDark.addEventListener('change', () => {
    if (!savedTheme()) apply(systemTheme());
  });
}
