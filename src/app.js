// src/app.js
// App shell: theme management, tab navigation, language selector, header/footer
import { get, set } from './storage.js';
import { currentPath, refreshCurrentRoute } from './router.js';
import { initI18n, getLanguage, setLanguage, onLanguageChange, t } from './i18n.js';

export function initApp() {
  initI18n();
  initTheme();
  initLanguageSelector();
  initTabNav();
  updateAppShellText();

  // React to language switches immediately
  onLanguageChange(() => {
    updateAppShellText();
    updateLanguageButtons();
    refreshCurrentRoute();
  });
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
      updateThemeToggleText();
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', theme === 'dark' ? '#101820' : '#F2EFE8');
  }
}

function initLanguageSelector() {
  const container = document.getElementById('lang-selector');
  if (!container) return;

  container.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = btn.getAttribute('data-lang');
      if (lang) {
        setLanguage(lang);
      }
    });
  });

  updateLanguageButtons();
}

function updateLanguageButtons() {
  const current = getLanguage();
  const container = document.getElementById('lang-selector');
  if (!container) return;

  container.setAttribute('aria-label', t('lang.selectorAria'));

  container.querySelectorAll('.lang-btn').forEach(btn => {
    const lang = btn.getAttribute('data-lang');
    const isActive = lang === current;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    if (lang === 'en') {
      btn.setAttribute('aria-label', t('lang.switchToEn'));
      btn.setAttribute('title', 'English');
    } else if (lang === 'id') {
      btn.setAttribute('aria-label', t('lang.switchToId'));
      btn.setAttribute('title', 'Bahasa Indonesia');
    }
  });
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

function updateThemeToggleText() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const current = document.documentElement.getAttribute('data-theme');
  const label = current === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark');
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}

export function updateAppShellText() {
  // Navigation tabs
  const tabMap = {
    learn: t('nav.learn'),
    quiz: t('nav.quiz'),
    notes: t('nav.notes'),
    glossary: t('nav.glossary')
  };

  document.querySelectorAll('#tab-nav .tab-link').forEach(link => {
    const tab = link.getAttribute('data-tab');
    if (tabMap[tab]) {
      // Keep SVG icon, update text node
      const svg = link.querySelector('svg');
      link.innerHTML = '';
      if (svg) link.appendChild(svg);
      link.appendChild(document.createTextNode(' ' + tabMap[tab]));
    }
  });

  const tabNav = document.getElementById('tab-nav');
  if (tabNav) {
    tabNav.setAttribute('aria-label', t('nav.mainNavAria'));
  }

  // Brand link
  const brandLink = document.querySelector('.brand-link');
  if (brandLink) {
    brandLink.setAttribute('aria-label', t('brand.homeAria'));
  }

  // Header search trigger
  const searchBtn = document.getElementById('global-search-btn');
  if (searchBtn) {
    searchBtn.setAttribute('aria-label', t('search.triggerAria'));
    searchBtn.setAttribute('title', t('search.triggerTitle'));
    const labelSpan = searchBtn.querySelector('.search-trigger-label');
    if (labelSpan) {
      labelSpan.textContent = t('search.triggerLabel');
    }
  }

  // Theme toggle
  updateThemeToggleText();

  // Footer
  const footerInner = document.querySelector('#site-footer .footer-inner');
  if (footerInner) {
    footerInner.innerHTML = `<p>${t('footer.madeBy')} <strong>Fardhan Athallah Raditya</strong></p>`;
  }

  updateLanguageButtons();
}
