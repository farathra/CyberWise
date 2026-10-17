// src/search/search.js
// Global Search UI controller for CyberWise
// Accessible overlay, keyboard navigation (/ and Ctrl+K, Arrow keys, Enter, Esc),
// focus management, category filter chips, and instant results.

import { searchContent, initSearchIndex, invalidateNotesIndex, escapeHtml } from './searchIndex.js';
import { navigate } from '../router.js';

let modalElement = null;
let inputElement = null;
let resultsContainer = null;
let activeFilter = 'all';
let currentQuery = '';
let currentResults = [];
let selectedIndex = -1;
let debounceTimer = null;
let lastFocusedElement = null;
let isSearchOpen = false;

// Quick search topic suggestions in Indonesian
const QUICK_TOPICS = [
  'Triad CIA',
  'Malware',
  'Phishing',
  'Enkripsi',
  '2FA',
  'Ransomware',
  'Kata Sandi',
  'Social Engineering'
];

/**
 * Initializes the global search interface and keyboard shortcuts
 */
export function initSearch() {
  createSearchModal();
  bindGlobalShortcuts();
  bindHeaderButton();

  // Ensure button is attached even if header renders or hydrates later
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindHeaderButton);
    }
    window.addEventListener('load', bindHeaderButton);
  }

  // Pre-warm search index in background after page loads
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => initSearchIndex());
    } else {
      setTimeout(() => initSearchIndex(), 1000);
    }
  }
}

/**
 * External notification when notes change in db
 */
export function notifyNotesChanged() {
  invalidateNotesIndex();
}

/**
 * Builds the search modal DOM structure and appends to body
 */
function createSearchModal() {
  if (document.getElementById('global-search-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'global-search-modal';
  modal.className = 'search-modal-backdrop';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Pencarian Global CyberWise');
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="search-modal-card" role="document">
      <!-- Search Input Header -->
      <div class="search-input-header">
        <svg class="search-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>

        <input
          type="search"
          id="global-search-input"
          class="search-input-field"
          placeholder="Cari materi, konsep, kuis, atau catatan... (Tekan Esc untuk tutup)"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-autocomplete="list"
          aria-controls="search-results-list"
        />

        <button
          type="button"
          id="global-search-clear"
          class="search-clear-btn"
          title="Hapus pencarian"
          aria-label="Hapus kata kunci pencarian"
          style="display: none;"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <button
          type="button"
          id="global-search-close"
          class="search-close-btn"
          title="Tutup (Esc)"
          aria-label="Tutup jendela pencarian"
        >
          <kbd class="search-esc-badge">Esc</kbd>
        </button>
      </div>

      <!-- Filter Categories -->
      <div class="search-filter-bar" role="tablist" aria-label="Filter kategori pencarian">
        <button type="button" class="search-filter-pill active" data-filter="all" role="tab" aria-selected="true">
          Semua
        </button>
        <button type="button" class="search-filter-pill" data-filter="learn" role="tab" aria-selected="false">
          Materi
        </button>
        <button type="button" class="search-filter-pill" data-filter="quiz" role="tab" aria-selected="false">
          Kuis
        </button>
        <button type="button" class="search-filter-pill" data-filter="notes" role="tab" aria-selected="false">
          Catatan
        </button>
      </div>

      <!-- Results Body -->
      <div id="search-results-container" class="search-results-container">
        <!-- Rendered dynamically -->
      </div>

      <!-- Search Footer with Keyboard Hints -->
      <footer class="search-modal-footer">
        <div class="search-footer-hints">
          <span class="search-hint-item"><kbd>↑</kbd><kbd>↓</kbd> Pilih</span>
          <span class="search-hint-item"><kbd>↵</kbd> Buka</span>
          <span class="search-hint-item"><kbd>Esc</kbd> Tutup</span>
        </div>
        <span class="search-footer-brand">CyberWise Offline Search</span>
      </footer>
    </div>
  `;

  document.body.appendChild(modal);

  modalElement = modal;
  inputElement = modal.querySelector('#global-search-input');
  resultsContainer = modal.querySelector('#search-results-container');

  // Backdrop click closes
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeSearch();
    }
  });

  // Close button
  modal.querySelector('#global-search-close')?.addEventListener('click', closeSearch);

  // Clear button
  const clearBtn = modal.querySelector('#global-search-clear');
  clearBtn?.addEventListener('click', () => {
    if (inputElement) {
      inputElement.value = '';
      inputElement.focus();
      handleQueryChange('');
    }
  });

  // Input change with debounce
  inputElement?.addEventListener('input', (e) => {
    const val = e.target.value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      handleQueryChange(val);
    }, 120);
  });

  // Keyboard navigation within input and dialog
  modal.addEventListener('keydown', handleModalKeydown);

  // Filter tabs
  modal.querySelectorAll('.search-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.search-filter-pill').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      performSearch();
    });
  });
}

/**
 * Ensures search button exists in header and attaches click handler
 */
export function bindHeaderButton() {
  let btn = document.getElementById('global-search-btn');
  const headerActions = document.querySelector('.header-actions');
  const themeToggle = document.getElementById('theme-toggle');

  if (!btn && headerActions) {
    btn = document.createElement('button');
    btn.id = 'global-search-btn';
    btn.className = 'search-trigger-btn';
    btn.setAttribute('aria-label', 'Cari materi, kuis, atau catatan');
    btn.setAttribute('title', 'Cari (Tekan / atau Ctrl+K)');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span class="search-trigger-label">Cari...</span>
      <kbd class="search-kbd-shortcut">/</kbd>
    `;

    if (themeToggle && themeToggle.parentNode === headerActions) {
      headerActions.insertBefore(btn, themeToggle);
    } else {
      headerActions.appendChild(btn);
    }
  }

  if (btn) {
    btn.onclick = (e) => {
      e.preventDefault();
      openSearch();
    };
  }
}

/**
 * Global keyboard shortcuts (/ and Ctrl+K / Cmd+K)
 */
function bindGlobalShortcuts() {
  window.addEventListener('keydown', (e) => {
    // If search is open, let modal handler deal with it
    if (isSearchOpen) return;

    // Check if user is typing in a form input, textarea, or contentEditable
    const active = document.activeElement;
    const isInput = active && (
      active.tagName === 'INPUT' ||
      active.tagName === 'TEXTAREA' ||
      active.tagName === 'SELECT' ||
      active.isContentEditable
    );

    // '/' shortcut (when not in an input)
    if (e.key === '/' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      openSearch();
      return;
    }

    // 'Ctrl+K' or 'Cmd+K' shortcut
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      openSearch();
    }
  });
}

/**
 * Opens search dialog
 */
export function openSearch(initialQuery = '') {
  if (!modalElement) createSearchModal();

  lastFocusedElement = document.activeElement;
  isSearchOpen = true;

  modalElement.style.display = 'flex';
  document.body.classList.add('search-modal-open');

  if (inputElement) {
    if (initialQuery) {
      inputElement.value = initialQuery;
      currentQuery = initialQuery;
    }
    inputElement.focus();
    inputElement.select();
  }

  performSearch();
}

/**
 * Closes search dialog and restores focus
 */
export function closeSearch() {
  if (!modalElement) return;

  isSearchOpen = false;
  modalElement.style.display = 'none';
  document.body.classList.remove('search-modal-open');

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    try {
      lastFocusedElement.focus();
    } catch {
      // ignore
    }
  }
}

/**
 * Handles input changes
 */
function handleQueryChange(val) {
  currentQuery = val;
  const clearBtn = modalElement?.querySelector('#global-search-clear');
  if (clearBtn) {
    clearBtn.style.display = val.trim().length > 0 ? 'inline-flex' : 'none';
  }
  performSearch();
}

/**
 * Executes search and updates UI
 */
async function performSearch() {
  const query = currentQuery.trim();

  // If empty query, render initial suggestions
  if (!query) {
    renderEmptyState();
    return;
  }

  // Show small loading state if indexing
  resultsContainer.innerHTML = `
    <div class="search-loading-state">
      <div class="spinner" style="width:24px;height:24px;border-width:2.5px;"></div>
      <span>Mencari di materi, kuis, dan catatan...</span>
    </div>
  `;

  try {
    const { results, total } = await searchContent(query, activeFilter);
    currentResults = results;
    selectedIndex = results.length > 0 ? 0 : -1;
    renderResults(results, total, query);
  } catch (err) {
    console.error('[Search] Search error:', err);
    const detailMsg = err && err.message ? escapeHtml(err.message) : '';
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <p class="search-empty-title">Terjadi Kesalahan</p>
        <p class="search-empty-desc">Tidak dapat memuat hasil pencarian. Silakan coba lagi.${detailMsg ? `<br><small style="opacity:0.75;font-size:0.8rem;margin-top:6px;display:inline-block;">(${detailMsg})</small>` : ''}</p>
      </div>
    `;
  }
}

/**
 * Renders empty state with quick suggestion chips
 */
function renderEmptyState() {
  currentResults = [];
  selectedIndex = -1;

  resultsContainer.innerHTML = `
    <div class="search-initial-state">
      <div class="search-suggestions-header">
        <span class="search-section-label">Topik Populer & Konsep Kunci</span>
      </div>
      <div class="search-chips-grid">
        ${QUICK_TOPICS.map(topic => `
          <button type="button" class="search-topic-chip" data-topic="${topic}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:13px;height:13px;" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span>${topic}</span>
          </button>
        `).join('')}
      </div>

      <div class="search-features-info">
        <div class="search-info-card">
          <span class="info-icon">📚</span>
          <div class="info-text">
            <strong>Materi & Definisi</strong>
            <p>Temukan penjelasan lengkap, studi kasus, dan istilah keamanan siber.</p>
          </div>
        </div>
        <div class="search-info-card">
          <span class="info-icon">✍️</span>
          <div class="info-text">
            <strong>Catatan Belajar</strong>
            <p>Cari teks dan rangkuman dalam catatan pribadi yang Anda simpan di perangkat ini.</p>
          </div>
        </div>
        <div class="search-info-card">
          <span class="info-icon">🎯</span>
          <div class="info-text">
            <strong>Kuis & Evaluasi</strong>
            <p>Akses cepat ke kuis sub-bab dan latihan soal terkait.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach chip click listeners
  resultsContainer.querySelectorAll('.search-topic-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const topic = chip.getAttribute('data-topic');
      if (topic && inputElement) {
        inputElement.value = topic;
        handleQueryChange(topic);
        inputElement.focus();
      }
    });
  });
}

/**
 * Renders search results list
 */
function renderResults(results, total, query) {
  if (results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-icon">🔍</div>
        <p class="search-empty-title">Tidak ada hasil ditemukan</p>
        <p class="search-empty-desc">
          Tidak ditemukan kecocokan untuk <strong>"${escapeHtml(query)}"</strong>.
          Coba periksa ejaan kata atau gunakan istilah keamanan siber yang lebih umum.
        </p>
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = `
    <div class="search-results-summary">
      <span>Ditemukan <strong>${total}</strong> hasil</span>
    </div>
    <ul class="search-results-list" role="listbox" id="search-results-list">
      ${results.map((item, idx) => `
        <li
          class="search-result-item ${idx === selectedIndex ? 'selected' : ''}"
          role="option"
          aria-selected="${idx === selectedIndex ? 'true' : 'false'}"
          data-index="${idx}"
          data-route="${item.route}"
        >
          <div class="search-result-main">
            <div class="search-result-meta">
              <span class="search-category-badge badge-${item.category}">${item.categoryLabel}</span>
              ${item.contextSubtitle ? `<span class="search-context-text">${escapeHtml(item.contextSubtitle)}</span>` : ''}
            </div>
            <div class="search-result-title">${item.titleHtml}</div>
            ${item.snippetHtml ? `<div class="search-result-snippet">${item.snippetHtml}</div>` : ''}
          </div>
          <svg class="search-arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </li>
      `).join('')}
    </ul>
  `;

  // Item click listeners
  resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      selectResult(idx);
    });
    item.addEventListener('mouseenter', () => {
      const idx = parseInt(item.getAttribute('data-index'), 10);
      updateSelection(idx, false);
    });
  });
}

/**
 * Updates highlighted item via keyboard or hover
 */
function updateSelection(newIdx, scrollIntoView = true) {
  if (currentResults.length === 0) return;
  if (newIdx < 0) newIdx = 0;
  if (newIdx >= currentResults.length) newIdx = currentResults.length - 1;

  selectedIndex = newIdx;

  const items = resultsContainer.querySelectorAll('.search-result-item');
  items.forEach((item, idx) => {
    const isSelected = idx === selectedIndex;
    item.classList.toggle('selected', isSelected);
    item.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    if (isSelected && scrollIntoView) {
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });
}

/**
 * Activates and navigates to the selected result
 */
function selectResult(index) {
  if (index < 0 || index >= currentResults.length) return;
  const item = currentResults[index];
  if (!item || !item.route) return;

  closeSearch();
  navigate(item.route);
}

/**
 * Handles keyboard events inside modal (Escape, ArrowDown, ArrowUp, Enter)
 */
function handleModalKeydown(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    closeSearch();
    return;
  }

  if (currentResults.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    updateSelection(selectedIndex + 1, true);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    updateSelection(selectedIndex - 1, true);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < currentResults.length) {
      selectResult(selectedIndex);
    }
  }
}
