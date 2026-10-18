// src/achievements/achievementView.js
// Dedicated view controller for CyberWise Achievement Center

import { t } from '../i18n.js';
import { ACHIEVEMENT_CATEGORIES } from './achievementRegistry.js';
import { getAchievementsOverview, checkAchievements } from './achievementEngine.js';

let currentCategory = 'all';
let currentStatusFilter = 'all'; // 'all' | 'unlocked' | 'locked'

/**
 * Main render function for the Achievements route
 */
export async function renderAchievements() {
  const container = document.getElementById('page-container');
  if (!container) return;

  // Show loading spinner
  container.innerHTML = `
    <div class="achievements-loading-state">
      <div class="achievements-spinner" aria-hidden="true"></div>
      <p>${t('achievements.loading')}</p>
    </div>
  `;

  try {
    // Run silent evaluation to ensure current data is up to date
    await checkAchievements({}, { silent: true });
    const overview = await getAchievementsOverview();
    renderAchievementsDashboard(container, overview);
  } catch (err) {
    console.error('[Achievements] Failed to render view:', err);
    container.innerHTML = `
      <div class="achievements-error-state">
        <h2>${t('achievements.title')}</h2>
        <p>${t('achievements.loadError')}</p>
        <button class="btn btn-primary" id="achievements-retry-btn">${t('achievements.retryBtn')}</button>
      </div>
    `;
    document.getElementById('achievements-retry-btn')?.addEventListener('click', () => renderAchievements());
  }
}

/**
 * Renders the dashboard
 */
function renderAchievementsDashboard(container, overview) {
  const { items, totalUnlocked, totalAvailable, completionPct, recentlyUnlocked } = overview;

  // Filter items according to active category and status
  const filteredItems = items.filter(item => {
    const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
    const matchesStatus =
      currentStatusFilter === 'all' ||
      (currentStatusFilter === 'unlocked' && item.isUnlocked) ||
      (currentStatusFilter === 'locked' && !item.isUnlocked);
    return matchesCategory && matchesStatus;
  });

  const isBrandNew = totalUnlocked === 0;

  container.innerHTML = `
    <div class="achievements-container" role="region" aria-label="${t('achievements.title')}">
      <!-- Header -->
      <header class="achievements-header">
        <div class="achievements-header-content">
          <div class="achievements-kicker-row">
            <span class="badge badge-primary">CyberWise Honors</span>
            <span class="badge badge-outline">${totalUnlocked} / ${totalAvailable} ${t('achievements.statUnlockedLabel')}</span>
          </div>
          <h1 class="achievements-title">${t('achievements.title')}</h1>
          <p class="achievements-subtitle">${t('achievements.subtitle')}</p>
        </div>
      </header>

      <!-- Overall Completion KPI Card -->
      <section class="achievements-kpi-card" aria-label="${t('achievements.progressOverviewTitle')}">
        <div class="kpi-score-ring">
          <span class="kpi-pct-number">${completionPct}%</span>
          <span class="kpi-pct-label">${t('achievements.completedLabel')}</span>
        </div>
        <div class="kpi-summary-info">
          <h2 class="kpi-summary-title">${t('achievements.progressSummaryTitle', { count: totalUnlocked, total: totalAvailable })}</h2>
          <p class="kpi-summary-desc">${t('achievements.progressSummaryDesc')}</p>
          <div class="kpi-track" aria-hidden="true">
            <div class="kpi-fill" style="width: ${completionPct}%;"></div>
          </div>
        </div>
      </section>

      <!-- Recently Unlocked Banner (if any) -->
      ${recentlyUnlocked.length > 0 ? `
        <section class="achievements-recent-section" aria-labelledby="recent-heading">
          <h2 id="recent-heading" class="section-title">
            <span class="section-title-icon" aria-hidden="true">✨</span>
            ${t('achievements.recentTitle')}
          </h2>
          <div class="recent-achievements-grid">
            ${recentlyUnlocked.map(rec => `
              <div class="recent-card">
                <div class="recent-icon" aria-hidden="true">${rec.icon}</div>
                <div class="recent-info">
                  <h3 class="recent-title">${t(rec.titleKey)}</h3>
                  <p class="recent-desc">${t(rec.descKey)}</p>
                  <span class="recent-date">${t('achievements.unlockedDatePrefix')} ${formatDate(rec.unlockedAt)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <!-- Welcome Banner for New Users -->
      ${isBrandNew ? `
        <section class="achievements-welcome-card" aria-label="${t('achievements.welcomeTitle')}">
          <div class="welcome-icon" aria-hidden="true">🎯</div>
          <div class="welcome-body">
            <h2>${t('achievements.welcomeTitle')}</h2>
            <p>${t('achievements.welcomeDesc')}</p>
            <div class="welcome-actions">
              <a href="#/learn/1-a" class="btn btn-primary btn-sm">${t('achievements.startLearningBtn')} →</a>
              <a href="#/games" class="btn btn-outline btn-sm">${t('achievements.exploreGamesBtn')}</a>
            </div>
          </div>
        </section>
      ` : ''}

      <!-- Filter Controls -->
      <section class="achievements-filter-section" aria-label="Filters">
        <!-- Category Filter Pills -->
        <div class="category-pills-row" role="tablist" aria-label="${t('achievements.filterCategoryAria')}">
          ${ACHIEVEMENT_CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? items.length
              : items.filter(a => a.category === cat.id).length;
            const isActive = currentCategory === cat.id;
            return `
              <button
                type="button"
                role="tab"
                class="category-pill ${isActive ? 'active' : ''}"
                data-category="${cat.id}"
                aria-selected="${isActive}"
              >
                ${cat.icon ? `<span class="pill-icon" aria-hidden="true">${cat.icon}</span>` : ''}
                <span>${t(cat.labelKey)}</span>
                <span class="pill-count">(${count})</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Status Filter Tabs -->
        <div class="status-filters-row">
          <button type="button" class="status-btn ${currentStatusFilter === 'all' ? 'active' : ''}" data-status="all">
            ${t('achievements.filterAll')} (${items.length})
          </button>
          <button type="button" class="status-btn ${currentStatusFilter === 'unlocked' ? 'active' : ''}" data-status="unlocked">
            ${t('achievements.filterUnlocked')} (${totalUnlocked})
          </button>
          <button type="button" class="status-btn ${currentStatusFilter === 'locked' ? 'active' : ''}" data-status="locked">
            ${t('achievements.filterLocked')} (${totalAvailable - totalUnlocked})
          </button>
        </div>
      </section>

      <!-- Achievement Cards Grid -->
      <section class="achievements-grid-section" aria-label="Achievements List">
        ${filteredItems.length > 0 ? `
          <div class="achievements-grid">
            ${filteredItems.map(item => `
              <article class="achievement-card ${item.isUnlocked ? 'unlocked' : 'locked'}" id="ach-${item.id}">
                <div class="card-status-strip ${item.isUnlocked ? 'strip-unlocked' : 'strip-locked'}"></div>

                <div class="card-top-row">
                  <div class="achievement-badge-wrap ${item.isUnlocked ? 'badge-active' : 'badge-inactive'}">
                    <span class="achievement-icon" aria-hidden="true">${item.icon}</span>
                  </div>
                  <div class="card-meta">
                    <span class="badge ${item.isUnlocked ? 'badge-success' : 'badge-outline'}">
                      ${item.isUnlocked ? `✓ ${t('achievements.statusUnlocked')}` : `🔒 ${t('achievements.statusLocked')}`}
                    </span>
                  </div>
                </div>

                <div class="card-body">
                  <h3 class="card-title">${t(item.titleKey)}</h3>
                  <p class="card-desc">${t(item.descKey)}</p>
                </div>

                <div class="card-footer">
                  <!-- Progress Bar -->
                  <div class="card-progress-box">
                    <div class="card-progress-label">
                      <span>${t('achievements.progressLabel')}</span>
                      <strong>${item.currentProgress} / ${item.maxProgress} ${item.unit}</strong>
                    </div>
                    <div class="card-progress-track" aria-hidden="true">
                      <div class="card-progress-fill ${item.isUnlocked ? 'fill-completed' : ''}" style="width: ${item.pct}%;"></div>
                    </div>
                  </div>

                  <!-- Date or Action Link -->
                  <div class="card-action-row">
                    ${item.isUnlocked && item.unlockedAt ? `
                      <span class="unlocked-date">
                        ${t('achievements.unlockedDatePrefix')} ${formatDate(item.unlockedAt)}
                      </span>
                    ` : `
                      <a href="${item.route}" class="btn-goto-action">
                        ${t('achievements.actionGoTo')} →
                      </a>
                    `}
                  </div>
                </div>
              </article>
            `).join('')}
          </div>
        ` : `
          <div class="achievements-empty-filter">
            <span class="empty-icon" aria-hidden="true">🔍</span>
            <h3>${t('achievements.emptyFilterTitle')}</h3>
            <p>${t('achievements.emptyFilterDesc')}</p>
            <button type="button" class="btn btn-outline btn-sm" id="reset-filters-btn">
              ${t('achievements.resetFiltersBtn')}
            </button>
          </div>
        `}
      </section>
    </div>
  `;

  attachEventHandlers(container, overview);
}

/**
 * Attaches filter button events
 */
function attachEventHandlers(container, overview) {
  // Category filter pills
  container.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.getAttribute('data-category') || 'all';
      renderAchievementsDashboard(container, overview);
    });
  });

  // Status filter buttons
  container.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStatusFilter = btn.getAttribute('data-status') || 'all';
      renderAchievementsDashboard(container, overview);
    });
  });

  // Reset filters button
  document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
    currentCategory = 'all';
    currentStatusFilter = 'all';
    renderAchievementsDashboard(container, overview);
  });
}

function formatDate(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
