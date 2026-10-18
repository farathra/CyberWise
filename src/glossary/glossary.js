// src/glossary/glossary.js
// CyberWise Cybersecurity Glossary Controller
// Accessible terminology explorer, live search, category filtering,
// alphabetical browsing, and deep-linking to Learn subchapters.

import { GLOSSARY_DATA, GLOSSARY_CATEGORIES, LESSON_INFO } from './glossaryData.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';

let currentSearch = '';
let currentCategory = 'Semua';
let currentLetter = 'ALL';
let focusedTermId = null;

/**
 * Escapes characters for safe HTML output
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Returns container element
 */
function getContainer() {
  return document.getElementById('page-container');
}

/**
 * Returns category CSS badge class
 */
function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Malware & Ancaman':
      return 'cat-malware';
    case 'Proteksi & Kriptografi':
      return 'cat-protection';
    case 'Privasi & Identitas':
      return 'cat-privacy';
    case 'Serangan & Penipuan':
      return 'cat-attacks';
    case 'Dasar Keamanan Data':
    default:
      return 'cat-basics';
  }
}

/**
 * Extracts set of available first letters from dataset
 */
function getAvailableLetters(terms) {
  const letters = new Set();
  terms.forEach(t => {
    const firstChar = t.term.trim().charAt(0).toUpperCase();
    if (/[A-Z]/.test(firstChar)) {
      letters.add(firstChar);
    }
  });
  return letters;
}

/**
 * Main render function for Glossary page
 * @param {string|null} termId Optional term ID to highlight or focus
 */
export function renderGlossary(termId = null) {
  const container = getContainer();
  if (!container) return;

  if (termId) {
    focusedTermId = termId.toLowerCase();
    // If targeted term belongs to specific letter/category, reset filters to show it
    const targetItem = GLOSSARY_DATA.find(t => t.id === focusedTermId);
    if (targetItem) {
      currentSearch = '';
      currentCategory = 'Semua';
      currentLetter = 'ALL';
    }
  }

  renderGlossaryView(container);

  // If termId was specified, scroll smoothly to the targeted card
  if (focusedTermId) {
    setTimeout(() => {
      const card = document.getElementById(`term-${focusedTermId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.classList.add('highlighted');
        setTimeout(() => card.classList.remove('highlighted'), 2500);
      }
    }, 100);
  }
}

/**
 * Internal view renderer
 */
function renderGlossaryView(container) {
  const allAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const availableLetters = getAvailableLetters(GLOSSARY_DATA);

  // Filter terms
  const filteredTerms = GLOSSARY_DATA.filter(item => {
    // 1. Category filter
    if (currentCategory !== 'Semua' && item.category !== currentCategory) {
      return false;
    }

    // 2. Alphabetical filter
    if (currentLetter !== 'ALL') {
      const firstChar = item.term.trim().charAt(0).toUpperCase();
      if (firstChar !== currentLetter) {
        return false;
      }
    }

    // 3. Search query filter
    if (currentSearch.trim()) {
      const q = currentSearch.trim().toLowerCase();
      const inTerm = item.term.toLowerCase().includes(q);
      const inDef = item.definition.toLowerCase().includes(q);
      const inEx = item.example.toLowerCase().includes(q);
      const inCat = item.category.toLowerCase().includes(q);
      const inId = item.id.toLowerCase().includes(q);
      return inTerm || inDef || inEx || inCat || inId;
    }

    return true;
  });

  // Sort alphabetically by term
  filteredTerms.sort((a, b) => a.term.localeCompare(b.term, 'id'));

  const totalTerms = GLOSSARY_DATA.length;
  const isFiltered = currentSearch.trim() || currentCategory !== 'Semua' || currentLetter !== 'ALL';

  container.innerHTML = `
    <div class="glossary-module">
      <!-- Hero Section -->
      <header class="glossary-hero">
        <div class="glossary-hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span>${t('glossary.heroBadge')}</span>
        </div>
        <h1 class="glossary-title">${t('glossary.title')}</h1>
        <p class="glossary-subtitle">${t('glossary.subtitle')}</p>
        <div class="glossary-metrics">
          <div class="glossary-metric-pill">
            <span>📚 Total:</span>
            <strong>${t('glossary.totalTerms', { count: totalTerms })}</strong>
          </div>
          <div class="glossary-metric-pill">
            <span>🏷️ ${t('glossary.totalCategories', { count: GLOSSARY_CATEGORIES.length - 1 })}</span>
          </div>
          <div class="glossary-metric-pill">
            <span>🔗 ${t('glossary.integratedLabel')}</span>
            <strong>${t('glossary.integrated')}</strong>
          </div>
        </div>
      </header>

      <!-- Controls: Search, Category Pills, Alphabet Bar -->
      <section class="glossary-controls" aria-label="${t('glossary.toolsAria')}">
        <!-- Search Input -->
        <div class="glossary-search-wrap">
          <svg class="glossary-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search"
            id="glossary-search"
            class="glossary-search-input"
            placeholder="${t('glossary.searchPlaceholder')}"
            value="${escapeHtml(currentSearch)}"
            aria-label="${t('glossary.searchAria')}"
            autocomplete="off"
            spellcheck="false"
          />
          ${currentSearch.trim() ? `
            <button type="button" id="glossary-clear-search" class="glossary-clear-btn" title="${t('glossary.clearSearch')}" aria-label="${t('glossary.clearSearchAria')}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          ` : ''}
        </div>

        <!-- Category Filter Pills -->
        <div class="glossary-categories" role="tablist" aria-label="${t('glossary.filterCategoriesAria')}">
          ${GLOSSARY_CATEGORIES.map(cat => `
            <button
              type="button"
              class="glossary-cat-pill ${cat === currentCategory ? 'active' : ''}"
              data-cat="${escapeHtml(cat)}"
              role="tab"
              aria-selected="${cat === currentCategory ? 'true' : 'false'}"
            >
              ${cat === 'Semua' ? t('glossary.allCategories') : escapeHtml(cat)}
            </button>
          `).join('')}
        </div>

        <!-- Alphabetical Bar -->
        <nav class="glossary-alpha-bar" aria-label="${t('glossary.alphaNavAria')}">
          <button
            type="button"
            class="glossary-alpha-pill all-btn ${currentLetter === 'ALL' ? 'active' : ''}"
            data-letter="ALL"
            title="${t('glossary.allAlphaTitle')}"
          >
            ${t('glossary.allAlpha')}
          </button>
          ${allAlphabet.map(letter => {
            const hasItems = availableLetters.has(letter);
            const isActive = currentLetter === letter;
            return `
              <button
                type="button"
                class="glossary-alpha-pill ${hasItems ? 'has-items' : 'disabled'} ${isActive ? 'active' : ''}"
                data-letter="${letter}"
                ${!hasItems ? 'disabled aria-disabled="true"' : ''}
                title="${hasItems ? t('glossary.alphaWithItems', { letter }) : t('glossary.alphaNoItems', { letter })}"
              >
                ${letter}
              </button>
            `;
          }).join('')}
        </nav>
      </section>

      <!-- Status Bar -->
      <div class="glossary-status-bar">
        <span>
          ${t('glossary.showing', { count: filteredTerms.length, total: totalTerms })}
          ${currentCategory !== 'Semua' ? ` ${t('glossary.inCategory', { category: escapeHtml(currentCategory) })}` : ''}
          ${currentLetter !== 'ALL' ? ` ${t('glossary.letterFilter', { letter: currentLetter })}` : ''}
        </span>
        ${isFiltered ? `
          <button type="button" id="glossary-reset-all" class="glossary-reset-link">
            ${t('glossary.resetAll')}
          </button>
        ` : ''}
      </div>

      <!-- Terms Content Grid -->
      ${filteredTerms.length === 0 ? `
        <!-- Empty State -->
        <div class="glossary-empty">
          <span class="glossary-empty-icon" aria-hidden="true">📖</span>
          <h2 class="glossary-empty-title">${t('glossary.emptyTitle')}</h2>
          <p class="glossary-empty-desc">
            ${t('glossary.emptyDesc', {
              query: escapeHtml(currentSearch),
              cat: currentCategory !== 'Semua' ? ` ${t('glossary.inCategory', { category: escapeHtml(currentCategory) })}` : ''
            })}
          </p>
          <button type="button" id="glossary-empty-reset" class="btn btn-primary">
            ${t('glossary.resetSearchBtn')}
          </button>
        </div>
      ` : `
        <div class="glossary-grid" role="list">
          ${filteredTerms.map(item => renderGlossaryCard(item)).join('')}
        </div>
      `}
    </div>
  `;

  attachEventListeners(container);
}

/**
 * Renders individual glossary card
 */
function renderGlossaryCard(item) {
  const badgeClass = getCategoryBadgeClass(item.category);
  const isTargeted = focusedTermId === item.id;

  return `
    <article
      class="glossary-card ${isTargeted ? 'highlighted' : ''}"
      id="term-${escapeHtml(item.id)}"
      role="listitem"
    >
      <div class="glossary-card-top">
        <span class="glossary-cat-badge ${badgeClass}">${escapeHtml(item.category)}</span>
        <span class="glossary-card-id">#${escapeHtml(item.id)}</span>
      </div>

      <h3 class="glossary-term-title">${escapeHtml(item.term)}</h3>
      <p class="glossary-term-def">${escapeHtml(item.definition)}</p>

      <div class="glossary-expandable">
        ${item.example ? `
          <div class="glossary-example-box">
            <div class="glossary-example-label">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>${t('glossary.exampleLabel')}</span>
            </div>
            <div>${escapeHtml(item.example)}</div>
          </div>
        ` : ''}

        <div class="glossary-relations">
          ${item.relatedLessons && item.relatedLessons.length > 0 ? `
            <div class="glossary-related-title">${t('glossary.relatedLessons')}</div>
            ${item.relatedLessons.map(lessonId => {
              const meta = LESSON_INFO[lessonId] || { title: `Sub-bab ${lessonId}`, chapter: '' };
              return `
                <a href="#/learn/${escapeHtml(lessonId)}" class="glossary-lesson-link" title="${t('glossary.openLessonTitle', { title: escapeHtml(meta.title) })}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;" aria-hidden="true">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  <span>${escapeHtml(meta.chapter ? `${meta.chapter}: ${meta.title}` : meta.title)}</span>
                </a>
              `;
            }).join('')}
          ` : ''}

          ${item.relatedTerms && item.relatedTerms.length > 0 ? `
            <div class="glossary-related-title" style="margin-top:6px;">${t('glossary.relatedTerms')}</div>
            <div class="glossary-terms-chips">
              ${item.relatedTerms.map(relId => {
                const relItem = GLOSSARY_DATA.find(t => t.id === relId);
                const label = relItem ? relItem.term : relId;
                return `
                  <button type="button" class="glossary-term-chip" data-jump-term="${escapeHtml(relId)}" title="${t('glossary.viewTermTitle', { term: escapeHtml(label) })}">
                    ${escapeHtml(label)}
                  </button>
                `;
              }).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Attaches user interaction listeners
 */
function attachEventListeners(container) {
  // 1. Search input handling
  const searchInput = container.querySelector('#glossary-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        currentSearch = e.target.value;
        currentLetter = 'ALL'; // Reset letter filter on typing search
        focusedTermId = null;
        renderGlossaryView(container);
        const input = container.querySelector('#glossary-search');
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 150);
    });
  }

  // 2. Clear search button
  container.querySelector('#glossary-clear-search')?.addEventListener('click', () => {
    currentSearch = '';
    focusedTermId = null;
    renderGlossaryView(container);
    container.querySelector('#glossary-search')?.focus();
  });

  // 3. Category pills
  container.querySelectorAll('.glossary-cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-cat') || 'Semua';
      focusedTermId = null;
      renderGlossaryView(container);
    });
  });

  // 4. Alphabet navigation pills
  container.querySelectorAll('.glossary-alpha-pill.has-items, .glossary-alpha-pill.all-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLetter = btn.getAttribute('data-letter') || 'ALL';
      focusedTermId = null;
      renderGlossaryView(container);
    });
  });

  // 5. Related term chips (jump to related term)
  container.querySelectorAll('.glossary-term-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const targetId = chip.getAttribute('data-jump-term');
      if (targetId) {
        navigate(`#/glossary/${targetId}`);
      }
    });
  });

  // 6. Reset all filters
  const resetHandler = () => {
    currentSearch = '';
    currentCategory = 'Semua';
    currentLetter = 'ALL';
    focusedTermId = null;
    navigate('#/glossary');
  };

  container.querySelector('#glossary-reset-all')?.addEventListener('click', resetHandler);
  container.querySelector('#glossary-empty-reset')?.addEventListener('click', resetHandler);
}
