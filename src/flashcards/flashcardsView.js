// src/flashcards/flashcardsView.js
// Flashcards Dashboard and Interactive Study Player View Controller

import { t } from '../i18n.js';
import { navigate } from '../router.js';
import {
  getDeckStatistics,
  getCardsWithProgress,
  getSessionDeck,
  rateCard,
  toggleCardBookmark,
  shuffleArray,
  syncFlashcardsWithBackup
} from './srsEngine.js';

let currentFilterChapter = 'all';
let currentFilterState = 'all'; // 'all' | 'due' | 'new' | 'bookmarked' | 'difficult'
let currentSearchQuery = '';

// Active Study Session State
let sessionState = {
  active: false,
  mode: 'due',
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  showHint: false,
  reviewedInSession: [] // { cardId, rating }
};

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
 * Main render function for Flashcards route (#/flashcards)
 */
export async function renderFlashcards() {
  const container = document.getElementById('page-container');
  if (!container) return;

  // Sync with IndexedDB backup on render
  await syncFlashcardsWithBackup();

  renderDashboardView(container);
}

/**
 * Main render function for Flashcards Study Session (#/flashcards/study/:mode?)
 */
export async function renderFlashcardsStudy(mode = 'due') {
  const container = document.getElementById('page-container');
  if (!container) return;

  await syncFlashcardsWithBackup();

  startStudySession(container, mode);
}

/**
 * Renders Flashcards Dashboard
 */
function renderDashboardView(container) {
  const stats = getDeckStatistics();
  const allCards = getCardsWithProgress();

  // Filter cards for deck preview list
  const filteredCards = allCards.filter(card => {
    // 1. Chapter filter
    if (currentFilterChapter !== 'all' && card.chapterId !== currentFilterChapter) {
      return false;
    }
    // 2. State filter
    if (currentFilterState === 'due' && !card.progress.isDue) return false;
    if (currentFilterState === 'new' && card.progress.status !== 'new') return false;
    if (currentFilterState === 'bookmarked' && !card.progress.isBookmarked) return false;
    if (currentFilterState === 'difficult') {
      const isDiff = card.progress.status !== 'new' && (card.progress.easeFactor < 2.1 || card.progress.lapses > 0);
      if (!isDiff) return false;
    }
    // 3. Search query
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      const inFront = card.front.toLowerCase().includes(q);
      const inBack = card.back.toLowerCase().includes(q);
      const inSub = card.subchapterTitle.toLowerCase().includes(q);
      if (!inFront && !inBack && !inSub) return false;
    }
    return true;
  });

  container.innerHTML = `
    <div class="flashcards-container" role="region" aria-label="${t('flashcards.title')}">
      <!-- Header -->
      <header class="flashcards-header">
        <div class="flashcards-header-content">
          <div class="flashcards-badge-row">
            <span class="badge badge-primary">Spaced Repetition System</span>
            <span class="badge badge-outline">${stats.totalCards} ${t('flashcards.totalCardsBadge')}</span>
          </div>
          <h1 class="flashcards-title">${t('flashcards.title')}</h1>
          <p class="flashcards-subtitle">${t('flashcards.subtitle')}</p>
        </div>
      </header>

      <!-- KPI Statistics Grid -->
      <section class="flashcards-kpi-grid" aria-label="${t('flashcards.kpiAria')}">
        <!-- Due Today -->
        <div class="kpi-card ${stats.dueTodayCount > 0 ? 'highlight-due' : ''}">
          <div class="kpi-icon-wrap icon-due">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">${t('flashcards.kpiDueToday')}</span>
            <div class="kpi-value-row">
              <span class="kpi-value">${stats.dueTodayCount}</span>
            </div>
            <span class="kpi-subtext">${t('flashcards.kpiDueSub')}</span>
          </div>
        </div>

        <!-- New Cards -->
        <div class="kpi-card">
          <div class="kpi-icon-wrap icon-new">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">${t('flashcards.kpiNewCards')}</span>
            <div class="kpi-value-row">
              <span class="kpi-value">${stats.newCardsCount}</span>
            </div>
            <span class="kpi-subtext">${t('flashcards.kpiNewSub')}</span>
          </div>
        </div>

        <!-- Reviewed Today -->
        <div class="kpi-card">
          <div class="kpi-icon-wrap icon-reviewed">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">${t('flashcards.kpiReviewedToday')}</span>
            <div class="kpi-value-row">
              <span class="kpi-value">${stats.reviewedTodayCount}</span>
            </div>
            <span class="kpi-subtext">${t('flashcards.kpiReviewedSub')}</span>
          </div>
        </div>

        <!-- Mastered -->
        <div class="kpi-card">
          <div class="kpi-icon-wrap icon-mastered">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">${t('flashcards.kpiMastered')}</span>
            <div class="kpi-value-row">
              <span class="kpi-value">${stats.masteredCount}</span>
              <span class="kpi-total">/ ${stats.totalCards}</span>
              <span class="kpi-pct-badge">${stats.masteryPct}%</span>
            </div>
            <span class="kpi-subtext">${t('flashcards.kpiMasteredSub')}</span>
          </div>
        </div>
      </section>

      <!-- Primary Action Callout Banner -->
      <section class="flashcards-action-banner">
        <div class="banner-body">
          ${stats.dueTodayCount > 0 ? `
            <div class="banner-icon" aria-hidden="true">⏰</div>
            <div class="banner-text">
              <h2>${t('flashcards.bannerDueTitle', { count: stats.dueTodayCount })}</h2>
              <p>${t('flashcards.bannerDueDesc')}</p>
            </div>
            <div class="banner-buttons">
              <a href="#/flashcards/study/due" class="btn btn-primary btn-lg">${t('flashcards.startReviewBtn')} (${stats.dueTodayCount}) →</a>
              ${stats.newCardsCount > 0 ? `
                <a href="#/flashcards/study/new" class="btn btn-outline">${t('flashcards.studyNewBtn')} (${stats.newCardsCount})</a>
              ` : ''}
            </div>
          ` : `
            <div class="banner-icon" aria-hidden="true">🎉</div>
            <div class="banner-text">
              <h2>${t('flashcards.bannerAllCaughtUpTitle')}</h2>
              <p>${stats.newCardsCount > 0 ? t('flashcards.bannerAllCaughtUpWithNewDesc') : t('flashcards.bannerAllCompletedDesc')}</p>
            </div>
            <div class="banner-buttons">
              ${stats.newCardsCount > 0 ? `
                <a href="#/flashcards/study/new" class="btn btn-primary">${t('flashcards.studyNewBtn')} (${stats.newCardsCount}) →</a>
              ` : ''}
              <a href="#/flashcards/study/all" class="btn btn-outline">${t('flashcards.reviewAllBtn')}</a>
            </div>
          `}
        </div>
      </section>

      <!-- Spaced Repetition Logic Explanation Collapsible -->
      <details class="flashcards-srs-explainer">
        <summary class="srs-explainer-summary">
          <span>🧠 ${t('flashcards.howSrsWorksTitle')}</span>
          <span class="summary-arrow" aria-hidden="true">▼</span>
        </summary>
        <div class="srs-explainer-content">
          <p>${t('flashcards.howSrsWorksDesc')}</p>
          <div class="srs-ratings-grid">
            <div class="srs-rating-pill rating-again">
              <strong>[1] ${t('flashcards.rateAgain')}</strong>
              <span>${t('flashcards.rateAgainDesc')}</span>
            </div>
            <div class="srs-rating-pill rating-hard">
              <strong>[2] ${t('flashcards.rateHard')}</strong>
              <span>${t('flashcards.rateHardDesc')}</span>
            </div>
            <div class="srs-rating-pill rating-good">
              <strong>[3] ${t('flashcards.rateGood')}</strong>
              <span>${t('flashcards.rateGoodDesc')}</span>
            </div>
            <div class="srs-rating-pill rating-easy">
              <strong>[4] ${t('flashcards.rateEasy')}</strong>
              <span>${t('flashcards.rateEasyDesc')}</span>
            </div>
          </div>
        </div>
      </details>

      <!-- Deck Explorer & Filter Section -->
      <section class="flashcards-deck-section" aria-labelledby="deck-heading">
        <div class="deck-section-header">
          <h2 id="deck-heading" class="section-title">
            <span class="section-title-icon" aria-hidden="true">🗂️</span>
            ${t('flashcards.deckExplorerTitle')}
          </h2>
          <span class="deck-count-badge">${filteredCards.length} ${t('flashcards.cardsFound')}</span>
        </div>

        <!-- Filter Controls Bar -->
        <div class="deck-filters-toolbar">
          <!-- Status Filter Pills -->
          <div class="filter-pills-row status-pills" role="tablist" aria-label="${t('flashcards.filterStatePrompt')}">
            <button type="button" class="filter-pill ${currentFilterState === 'all' ? 'active' : ''}" data-state="all">
              ${t('flashcards.filterStateAll')} <span class="pill-badge">${stats.totalCards}</span>
            </button>
            <button type="button" class="filter-pill ${currentFilterState === 'due' ? 'active' : ''} ${stats.dueTodayCount > 0 ? 'pill-due' : ''}" data-state="due">
              ⏰ ${t('flashcards.filterStateDue')} <span class="pill-badge">${stats.dueTodayCount}</span>
            </button>
            <button type="button" class="filter-pill ${currentFilterState === 'new' ? 'active' : ''}" data-state="new">
              🌱 ${t('flashcards.filterStateNew')} <span class="pill-badge">${stats.newCardsCount}</span>
            </button>
            <button type="button" class="filter-pill ${currentFilterState === 'bookmarked' ? 'active' : ''}" data-state="bookmarked">
              ⭐ ${t('flashcards.filterStateBookmarked')} <span class="pill-badge">${stats.bookmarkedCount}</span>
            </button>
            <button type="button" class="filter-pill ${currentFilterState === 'difficult' ? 'active' : ''}" data-state="difficult">
              ⚠️ ${t('flashcards.filterStateDifficult')} <span class="pill-badge">${stats.difficultCount}</span>
            </button>
          </div>

          <!-- Chapter Filter Pills & Live Search -->
          <div class="filter-sub-row">
            <div class="filter-pills-row chapter-pills" role="tablist" aria-label="${t('flashcards.filterChapterPrompt')}">
              <button type="button" class="filter-pill ch-pill ${currentFilterChapter === 'all' ? 'active' : ''}" data-chapter="all">
                ${t('flashcards.filterChapterAll')}
              </button>
              <button type="button" class="filter-pill ch-pill ${currentFilterChapter === '1' ? 'active' : ''}" data-chapter="1">
                Bab 1
              </button>
              <button type="button" class="filter-pill ch-pill ${currentFilterChapter === '2' ? 'active' : ''}" data-chapter="2">
                Bab 2
              </button>
              <button type="button" class="filter-pill ch-pill ${currentFilterChapter === '3' ? 'active' : ''}" data-chapter="3">
                Bab 3
              </button>
              <button type="button" class="filter-pill ch-pill ${currentFilterChapter === '4' ? 'active' : ''}" data-chapter="4">
                Bab 4
              </button>
            </div>

            <!-- Search Input -->
            <div class="search-input-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="search"
                id="flashcards-search-input"
                class="search-input"
                placeholder="${t('flashcards.searchPlaceholder')}"
                value="${escapeHtml(currentSearchQuery)}"
                aria-label="${t('flashcards.searchPlaceholder')}"
              />
            </div>
          </div>
        </div>

        <!-- Cards List Grid -->
        ${filteredCards.length > 0 ? `
          <div class="deck-cards-grid">
            ${filteredCards.map(c => {
              const statusClass = `status-${c.progress.status}`;
              const isDue = c.progress.isDue;
              return `
                <article class="deck-card ${statusClass} ${isDue ? 'is-due' : ''}" id="card-item-${c.id}">
                  <div class="deck-card-top">
                    <span class="subchapter-badge">${c.subchapterId}</span>
                    <div class="card-status-tags">
                      ${isDue ? `<span class="badge badge-warning">⏰ ${t('flashcards.tagDue')}</span>` : ''}
                      <span class="badge badge-${c.progress.status}">${getStatusLabel(c.progress.status)}</span>
                      <button
                        type="button"
                        class="btn-bookmark ${c.progress.isBookmarked ? 'bookmarked' : ''}"
                        data-id="${c.id}"
                        aria-label="${c.progress.isBookmarked ? t('flashcards.unbookmarkAria') : t('flashcards.bookmarkAria')}"
                        title="${c.progress.isBookmarked ? t('flashcards.unbookmarkAria') : t('flashcards.bookmarkAria')}"
                      >
                        ${c.progress.isBookmarked ? '★' : '☆'}
                      </button>
                    </div>
                  </div>

                  <h3 class="deck-card-question">${escapeHtml(c.front)}</h3>

                  <div class="deck-card-footer">
                    <span class="deck-card-interval">
                      ${c.progress.status === 'new'
                        ? t('flashcards.notStudiedYet')
                        : `${t('flashcards.intervalLabel')}: ${c.progress.interval} ${t('flashcards.daysUnit')}`}
                    </span>
                    <a href="#/flashcards/study/card-${c.id}" class="btn-quick-study">
                      ${t('flashcards.studyCardBtn')} →
                    </a>
                  </div>
                </article>
              `;
            }).join('')}
          </div>
        ` : `
          <div class="deck-empty-state">
            <span class="empty-icon" aria-hidden="true">🔍</span>
            <h3>${t('flashcards.noCardsMatchTitle')}</h3>
            <p>${t('flashcards.noCardsMatchDesc')}</p>
            <button type="button" class="btn btn-outline btn-sm" id="reset-deck-filters-btn">
              ${t('flashcards.resetFiltersBtn')}
            </button>
          </div>
        `}
      </section>
    </div>
  `;

  attachDashboardEvents(container);
}

/**
 * Attaches dashboard filter and bookmark events
 */
function attachDashboardEvents(container) {
  // State filter pills
  container.querySelectorAll('.filter-pill[data-state]').forEach(pill => {
    pill.addEventListener('click', () => {
      currentFilterState = pill.getAttribute('data-state');
      renderDashboardView(container);
    });
  });

  // Chapter filter pills
  container.querySelectorAll('.filter-pill[data-chapter]').forEach(pill => {
    pill.addEventListener('click', () => {
      currentFilterChapter = pill.getAttribute('data-chapter');
      renderDashboardView(container);
    });
  });

  // Search input
  const searchInput = container.querySelector('#flashcards-search-input');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        currentSearchQuery = e.target.value;
        renderDashboardView(container);
        const inputNow = container.querySelector('#flashcards-search-input');
        if (inputNow) {
          inputNow.focus();
          inputNow.setSelectionRange(inputNow.value.length, inputNow.value.length);
        }
      }, 200);
    });
  }

  // Reset filters
  container.querySelector('#reset-deck-filters-btn')?.addEventListener('click', () => {
    currentFilterChapter = 'all';
    currentFilterState = 'all';
    currentSearchQuery = '';
    renderDashboardView(container);
  });

  // Bookmark toggle
  container.querySelectorAll('.btn-bookmark').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const cardId = btn.getAttribute('data-id');
      const newState = await toggleCardBookmark(cardId);
      btn.classList.toggle('bookmarked', newState);
      btn.innerHTML = newState ? '★' : '☆';
      btn.setAttribute('aria-label', newState ? t('flashcards.unbookmarkAria') : t('flashcards.bookmarkAria'));
    });
  });
}

function getSessionBadge(mode) {
  if (mode === 'due') return `⏰ ${t('flashcards.modeDueBadge')}`;
  if (mode === 'new') return `🌱 ${t('flashcards.modeNewBadge')}`;
  if (mode === 'all') return `🗂️ ${t('flashcards.modeAllBadge')}`;
  if (mode === 'bookmarked') return `⭐ ${t('flashcards.filterStateBookmarked')}`;
  if (mode === 'difficult') return `⚠️ ${t('flashcards.filterStateDifficult')}`;
  if (mode && mode.startsWith('card-')) return `🎯 ${t('flashcards.modeSingleBadge')}`;
  return `🃏 Flashcards`;
}

/**
 * Starts and renders an interactive Flashcard Study Session
 */
function startStudySession(container, mode) {
  let cards = [];

  if (mode && mode.startsWith('card-')) {
    const singleId = mode.replace('card-', '');
    const all = getCardsWithProgress();
    const single = all.find(c => c.id === singleId);
    cards = single ? [single] : [];
  } else {
    cards = getSessionDeck(mode);
  }

  if (cards.length === 0) {
    renderEmptySessionView(container, mode);
    return;
  }

  sessionState = {
    active: true,
    mode,
    cards,
    currentIndex: 0,
    isFlipped: false,
    showHint: false,
    reviewedInSession: []
  };

  renderStudyCardView(container);
}

/**
 * Renders the active study card screen
 */
function renderStudyCardView(container) {
  const { cards, currentIndex, isFlipped, showHint, mode } = sessionState;
  const currentCard = cards[currentIndex];
  const total = cards.length;
  const progressPct = Math.round(((currentIndex + 1) / total) * 100);

  container.innerHTML = `
    <div class="flashcard-study-module" role="region" aria-label="${t('flashcards.sessionAria')}">
      <!-- Session Navigation Top Bar -->
      <div class="study-top-bar">
        <button type="button" class="btn btn-outline btn-sm btn-exit-session" id="exit-session-btn">
          ← ${t('flashcards.exitSessionBtn')}
        </button>

        <div class="study-progress-box">
          <div class="study-progress-meta">
            <span class="study-mode-badge">${getSessionBadge(mode)}</span>
            <span class="study-progress-text">${t('flashcards.progressFraction', { current: currentIndex + 1, total })}</span>
          </div>
          <div class="study-progress-track" aria-hidden="true">
            <div class="study-progress-fill" style="width: ${progressPct}%;"></div>
          </div>
        </div>

        <div class="study-actions-top">
          <button
            type="button"
            class="btn-icon btn-bookmark-session ${currentCard.progress.isBookmarked ? 'bookmarked' : ''}"
            id="session-bookmark-btn"
            aria-label="${currentCard.progress.isBookmarked ? t('flashcards.unbookmarkAria') : t('flashcards.bookmarkAria')}"
            title="${t('flashcards.bookmarkTooltip')}"
          >
            ${currentCard.progress.isBookmarked ? '★' : '☆'}
          </button>
          <button
            type="button"
            class="btn-icon btn-shuffle-session"
            id="session-shuffle-btn"
            aria-label="${t('flashcards.shuffleBtn')}"
            title="${t('flashcards.shuffleBtn')}"
          >
            🔀
          </button>
        </div>
      </div>

      <!-- Main Flashcard Stage (3D Flip Card Container) -->
      <div class="flashcard-stage">
        <div
          class="flashcard-3d-wrap ${isFlipped ? 'flipped' : ''}"
          id="flashcard-element"
          tabindex="0"
          role="button"
          aria-pressed="${isFlipped}"
          aria-label="${isFlipped ? t('flashcards.cardBackAria') : t('flashcards.cardFrontAria')}"
        >
          <!-- Front Side -->
          <div class="flashcard-face flashcard-front">
            <div class="card-face-header">
              <span class="badge badge-primary">${currentCard.subchapterId} · ${escapeHtml(currentCard.subchapterTitle)}</span>
              <span class="badge badge-outline">${escapeHtml(currentCard.chapterTitle)}</span>
            </div>

            <div class="card-face-body">
              <h2 class="card-prompt-question">${escapeHtml(currentCard.front)}</h2>

              ${currentCard.hint ? `
                <div class="card-hint-box ${showHint ? 'hint-visible' : ''}">
                  <button type="button" class="btn-toggle-hint" id="toggle-hint-btn">
                    💡 ${showHint ? t('flashcards.hideHintBtn') : t('flashcards.showHintBtn')}
                  </button>
                  ${showHint ? `<p class="hint-text">${escapeHtml(currentCard.hint)}</p>` : ''}
                </div>
              ` : ''}
            </div>

            <div class="card-face-footer">
              <span class="card-flip-prompt">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
                ${t('flashcards.flipInstruction')}
              </span>
            </div>
          </div>

          <!-- Back Side -->
          <div class="flashcard-face flashcard-back">
            <div class="card-face-header">
              <span class="badge badge-success">✓ Jawaban</span>
              <span class="badge badge-outline">${currentCard.subchapterId}</span>
            </div>

            <div class="card-face-body">
              <div class="card-answer-box">
                <h3 class="card-answer-text">${escapeHtml(currentCard.back)}</h3>
              </div>

              <div class="card-explanation-box">
                <span class="explanation-heading">${t('flashcards.explanationHeading')}:</span>
                <p class="explanation-text">${escapeHtml(currentCard.explanation)}</p>
              </div>

              ${currentCard.lessonUrl ? `
                <a href="${currentCard.lessonUrl}" class="link-learn-related" id="card-lesson-link">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  ${t('flashcards.learnLessonLink')} →
                </a>
              ` : ''}
            </div>

            <div class="card-face-footer">
              <span class="card-flip-prompt">
                ${t('flashcards.rateInstruction')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Contextual Action Dock -->
      ${!isFlipped ? `
        <!-- Front Mode: Primary Action is Reveal Answer -->
        <div class="study-action-dock front-dock">
          <div class="study-primary-btn-wrap">
            <button type="button" class="btn btn-primary btn-lg btn-reveal-answer btn-flip-trigger">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;" aria-hidden="true"><path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
              <span>${t('flashcards.showAnswerBtn')}</span>
              <kbd class="kbd-hint">Space</kbd>
            </button>
          </div>

          <div class="study-steppers-row">
            <button type="button" class="btn btn-outline btn-sm" id="prev-card-btn" ${currentIndex === 0 ? 'disabled' : ''}>
              ← ${t('flashcards.prevBtn')}
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="next-card-btn" ${currentIndex === total - 1 ? 'disabled' : ''}>
              ${t('flashcards.skipBtn')} →
            </button>
          </div>
        </div>
      ` : `
        <!-- Back Mode: Primary Action is Rating & Progression -->
        <div class="study-action-dock back-dock">
          <div class="rating-prompt-bar">
            <span class="rating-prompt-title">🧠 ${t('flashcards.rateInstruction')}</span>
            <button type="button" class="btn btn-outline btn-sm btn-flip-trigger">
              ↺ ${t('flashcards.flipToFront')}
            </button>
          </div>

          <div class="rating-buttons-group" role="group" aria-label="${t('flashcards.ratingsAria')}">
            <button type="button" class="btn-rating rating-again" data-rating="again">
              <span class="rating-num">[1]</span>
              <span class="rating-title">${t('flashcards.rateAgain')}</span>
              <span class="rating-interval">${t('flashcards.intervalAgain')}</span>
            </button>
            <button type="button" class="btn-rating rating-hard" data-rating="hard">
              <span class="rating-num">[2]</span>
              <span class="rating-title">${t('flashcards.rateHard')}</span>
              <span class="rating-interval">${t('flashcards.intervalHard')}</span>
            </button>
            <button type="button" class="btn-rating rating-good" data-rating="good">
              <span class="rating-num">[3]</span>
              <span class="rating-title">${t('flashcards.rateGood')}</span>
              <span class="rating-interval">${t('flashcards.intervalGood')}</span>
            </button>
            <button type="button" class="btn-rating rating-easy" data-rating="easy">
              <span class="rating-num">[4]</span>
              <span class="rating-title">${t('flashcards.rateEasy')}</span>
              <span class="rating-interval">${t('flashcards.intervalEasy')}</span>
            </button>
          </div>
        </div>
      `}
    </div>
  `;

  attachStudyEvents(container);
}

/**
 * Attaches study session keyboard and click events
 */
function attachStudyEvents(container) {
  const cardEl = container.querySelector('#flashcard-element');
  const exitBtn = container.querySelector('#exit-session-btn');
  const bookmarkBtn = container.querySelector('#session-bookmark-btn');
  const shuffleBtn = container.querySelector('#session-shuffle-btn');
  const toggleHintBtn = container.querySelector('#toggle-hint-btn');
  const flipBtn = container.querySelector('#flip-card-btn');
  const prevBtn = container.querySelector('#prev-card-btn');
  const nextBtn = container.querySelector('#next-card-btn');

  // Flip toggle handler
  const flipCard = () => {
    sessionState.isFlipped = !sessionState.isFlipped;
    renderStudyCardView(container);
  };

  cardEl?.addEventListener('click', (e) => {
    // Avoid flipping when clicking hint or link
    if (e.target.closest('#toggle-hint-btn') || e.target.closest('.link-learn-related')) {
      return;
    }
    flipCard();
  });

  container.querySelectorAll('.btn-flip-trigger').forEach(btn => {
    btn.addEventListener('click', flipCard);
  });

  container.querySelector('#card-lesson-link')?.addEventListener('click', () => {
    sessionState.active = false;
  });

  // Toggle Hint
  toggleHintBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    sessionState.showHint = !sessionState.showHint;
    renderStudyCardView(container);
  });

  // Bookmark toggle
  bookmarkBtn?.addEventListener('click', async (e) => {
    e.stopPropagation();
    const currentCard = sessionState.cards[sessionState.currentIndex];
    const newState = await toggleCardBookmark(currentCard.id);
    currentCard.progress.isBookmarked = newState;
    bookmarkBtn.classList.toggle('bookmarked', newState);
    bookmarkBtn.innerHTML = newState ? '★' : '☆';
  });

  // Shuffle
  shuffleBtn?.addEventListener('click', () => {
    const remaining = sessionState.cards.slice(sessionState.currentIndex);
    const shuffledRemaining = shuffleArray(remaining);
    sessionState.cards = [
      ...sessionState.cards.slice(0, sessionState.currentIndex),
      ...shuffledRemaining
    ];
    sessionState.isFlipped = false;
    sessionState.showHint = false;
    renderStudyCardView(container);
  });

  // Previous card
  prevBtn?.addEventListener('click', () => {
    if (sessionState.currentIndex > 0) {
      sessionState.currentIndex--;
      sessionState.isFlipped = false;
      sessionState.showHint = false;
      renderStudyCardView(container);
    }
  });

  // Next card
  nextBtn?.addEventListener('click', () => {
    if (sessionState.currentIndex < sessionState.cards.length - 1) {
      sessionState.currentIndex++;
      sessionState.isFlipped = false;
      sessionState.showHint = false;
      renderStudyCardView(container);
    }
  });

  // Exit session
  exitBtn?.addEventListener('click', () => {
    sessionState.active = false;
    navigate('#/flashcards');
  });

  // Rating buttons
  container.querySelectorAll('.btn-rating').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rating = btn.getAttribute('data-rating');
      await handleCardRating(container, rating);
    });
  });

  // Keyboard navigation
  const keyHandler = (e) => {
    if (!sessionState.active) {
      window.removeEventListener('keydown', keyHandler);
      return;
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      flipCard();
    } else if (e.key === 'Escape') {
      sessionState.active = false;
      navigate('#/flashcards');
    } else if (e.key === 'h' || e.key === 'H') {
      sessionState.showHint = !sessionState.showHint;
      renderStudyCardView(container);
    } else if (e.key === 'b' || e.key === 'B' || e.key === 's' || e.key === 'S') {
      bookmarkBtn?.click();
    } else if (sessionState.isFlipped) {
      if (e.key === '1') handleCardRating(container, 'again');
      else if (e.key === '2') handleCardRating(container, 'hard');
      else if (e.key === '3') handleCardRating(container, 'good');
      else if (e.key === '4') handleCardRating(container, 'easy');
    } else {
      if (e.key === 'ArrowLeft' && sessionState.currentIndex > 0) {
        prevBtn?.click();
      } else if (e.key === 'ArrowRight' && sessionState.currentIndex < sessionState.cards.length - 1) {
        nextBtn?.click();
      }
    }
  };

  window.addEventListener('keydown', keyHandler, { once: true });
}

/**
 * Handles rating submission and moves to next card
 */
async function handleCardRating(container, rating) {
  const currentCard = sessionState.cards[sessionState.currentIndex];

  // Save SRS progression
  await rateCard(currentCard.id, rating);

  sessionState.reviewedInSession.push({
    cardId: currentCard.id,
    rating
  });

  // Move to next card or complete session
  if (sessionState.currentIndex < sessionState.cards.length - 1) {
    sessionState.currentIndex++;
    sessionState.isFlipped = false;
    sessionState.showHint = false;
    renderStudyCardView(container);
  } else {
    renderSessionCompletedView(container);
  }
}

/**
 * Renders session completion screen
 */
function renderSessionCompletedView(container) {
  sessionState.active = false;
  const count = sessionState.reviewedInSession.length;

  const againCount = sessionState.reviewedInSession.filter(r => r.rating === 'again').length;
  const hardCount = sessionState.reviewedInSession.filter(r => r.rating === 'hard').length;
  const goodCount = sessionState.reviewedInSession.filter(r => r.rating === 'good').length;
  const easyCount = sessionState.reviewedInSession.filter(r => r.rating === 'easy').length;

  container.innerHTML = `
    <div class="session-completed-module">
      <div class="completed-card">
        <div class="completed-icon" aria-hidden="true">🏆</div>
        <h2 class="completed-title">${t('flashcards.completedTitle')}</h2>
        <p class="completed-desc">${t('flashcards.completedDesc', { count })}</p>

        <div class="completed-stats-row">
          <div class="stat-badge again">
            <strong>${againCount}</strong>
            <span>${t('flashcards.rateAgain')}</span>
          </div>
          <div class="stat-badge hard">
            <strong>${hardCount}</strong>
            <span>${t('flashcards.rateHard')}</span>
          </div>
          <div class="stat-badge good">
            <strong>${goodCount}</strong>
            <span>${t('flashcards.rateGood')}</span>
          </div>
          <div class="stat-badge easy">
            <strong>${easyCount}</strong>
            <span>${t('flashcards.rateEasy')}</span>
          </div>
        </div>

        <div class="completed-actions">
          <button type="button" class="btn btn-primary" id="study-again-btn">
            ${t('flashcards.studyAgainBtn')}
          </button>
          <a href="#/flashcards" class="btn btn-outline">
            ${t('flashcards.backToDashboardBtn')}
          </a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('study-again-btn')?.addEventListener('click', () => {
    startStudySession(container, sessionState.mode);
  });
}

/**
 * Renders empty session view (no cards found for selected mode)
 */
function renderEmptySessionView(container, mode) {
  container.innerHTML = `
    <div class="flashcards-empty-session">
      <div class="empty-session-card">
        <span class="empty-icon" aria-hidden="true">🎯</span>
        <h2>${t('flashcards.emptySessionTitle')}</h2>
        <p>${t('flashcards.emptySessionDesc')}</p>
        <div class="empty-actions">
          <a href="#/flashcards/study/all" class="btn btn-primary">${t('flashcards.reviewAllBtn')}</a>
          <a href="#/flashcards" class="btn btn-outline">${t('flashcards.backToDashboardBtn')}</a>
        </div>
      </div>
    </div>
  `;
}

function getStatusLabel(status) {
  if (status === 'mastered') return t('flashcards.statusMastered');
  if (status === 'review') return t('flashcards.statusReview');
  if (status === 'learning') return t('flashcards.statusLearning');
  return t('flashcards.statusNew');
}
