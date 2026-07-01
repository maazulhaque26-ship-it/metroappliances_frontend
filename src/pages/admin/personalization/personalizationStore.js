// Central localStorage layer for all personalization features.
// All write operations dispatch 'ma:personalization' so live components can react.

export const KEYS = {
  FAV_PAGES:      'ma_erp_fav_pages',
  FAV_MODULES:    'ma_erp_workspace_favorites', // shared with FavoriteModules.jsx
  SHORTCUTS:      'ma_erp_shortcuts',
  LAYOUT:         'ma_erp_workspace_layout',
  THEME:          'ma_erp_theme_pref',
};

function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function emit(key, value) {
  try { window.dispatchEvent(new CustomEvent('ma:personalization', { detail: { key, value } })); } catch {}
}

// ── Favorite Pages (Feature 1) ─────────────────────────────────────────────
export function getFavPages()       { return load(KEYS.FAV_PAGES, []); }
export function setFavPages(arr)    { save(KEYS.FAV_PAGES, arr); emit('favPages', arr); }
export function isFavPage(path)     { return getFavPages().includes(path); }
export function toggleFavPage(path) {
  const curr = getFavPages();
  const next = curr.includes(path) ? curr.filter(p => p !== path) : [...curr, path];
  setFavPages(next);
  return next;
}

// ── Shortcuts (Feature 6) ──────────────────────────────────────────────────
const DEFAULT_SHORTCUTS = [
  { id: 'sc-1', path: '/admin/orders',            label: 'Orders'       },
  { id: 'sc-2', path: '/admin/inventory/stock',   label: 'Inventory'    },
  { id: 'sc-3', path: '/admin/hr',                label: 'HR Dashboard' },
  { id: 'sc-4', path: '/admin/finance',           label: 'Finance'      },
  { id: 'sc-5', path: '/admin/projects/dashboard',label: 'Projects'     },
  { id: 'sc-6', path: '/admin/ai/dashboard',      label: 'AI Copilot'   },
];
export function getShortcuts()    { return load(KEYS.SHORTCUTS, DEFAULT_SHORTCUTS); }
export function setShortcuts(arr) { save(KEYS.SHORTCUTS, arr); emit('shortcuts', arr); }

// ── Workspace Layout (Feature 9) ───────────────────────────────────────────
export function getLayout()    { return load(KEYS.LAYOUT, 'comfortable'); }
export function setLayout(val) { save(KEYS.LAYOUT, val); emit('layout', val); }

// ── Theme Preference (Feature 10) ─────────────────────────────────────────
export function getThemePref() { return load(KEYS.THEME, 'system'); }
export function applyTheme(pref) {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  const dark = pref === 'dark' || (pref === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
  save(KEYS.THEME, pref);
  emit('theme', pref);
}

// ── Export / Import (Feature 8) ────────────────────────────────────────────
export function exportPersonalization() {
  return {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    favPages:   getFavPages(),
    favModules: load(KEYS.FAV_MODULES, []),
    shortcuts:  getShortcuts(),
    layout:     getLayout(),
    theme:      getThemePref(),
  };
}
export function importPersonalization(data) {
  if (!data || typeof data !== 'object') return false;
  try {
    if (Array.isArray(data.favPages))   setFavPages(data.favPages);
    if (Array.isArray(data.favModules)) { save(KEYS.FAV_MODULES, data.favModules); emit('favModules', data.favModules); }
    if (Array.isArray(data.shortcuts))  setShortcuts(data.shortcuts);
    if (data.layout) setLayout(data.layout);
    if (data.theme)  applyTheme(data.theme);
    return true;
  } catch { return false; }
}

// ── Reset helpers (Feature 8) ──────────────────────────────────────────────
export function resetFavorites() {
  setFavPages([]);
  save(KEYS.FAV_MODULES, []);
  emit('favModules', []);
}
export function resetShortcuts() { setShortcuts(DEFAULT_SHORTCUTS); }
export function resetRecent() {
  try { localStorage.removeItem('ma_erp_recent_pages'); }    catch {}
  try { localStorage.removeItem('ma_erp_recent_searches'); } catch {}
  emit('recent', null);
}
export function resetLayout() { setLayout('comfortable'); }
export function resetAll() {
  resetFavorites();
  resetShortcuts();
  resetRecent();
  resetLayout();
  applyTheme('system');
}
