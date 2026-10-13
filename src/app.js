// src/app.js
// App shell: theme management, tab navigation, header/footer
import { get, set } from './storage.js';
import { currentPath } from './router.js';

export function initApp() {
  initTheme();
  initTabNav();
}

function initTheme() {
  const saved = get('theme', null);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(theme);

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      set('theme', next);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

function initTabNav() {
  updateActiveTab();
  window.addEventListener('hashchange', updateActiveTab);
}

export function updateActiveTab() {
  const path = currentPath();
  const links = document.querySelectorAll('#tab-nav .tab-link');
  links.forEach(link => {
    const tab = link.getAttribute('data-tab');
    const isActive = path.startsWith('/' + tab);
    link.classList.toggle('active', isActive);
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}
