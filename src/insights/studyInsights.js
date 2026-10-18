// src/insights/studyInsights.js
// Dedicated Learning Analytics & Personalized Recommendations view
// Named studyInsights to prevent ad-blockers from false-positive blocking analytics.js filenames

import { t } from '../i18n.js';
import { navigate } from '../router.js';
import { getAnalyticsData, getStudyGoals, saveStudyGoals } from './studyData.js';
import { generateRecommendations } from './recommendations.js';
import { GAMES_LIST } from '../games/gamesData.js';

let currentData = null;

/**
 * Main entry point for the Analytics page
 */
export async function renderAnalytics() {
  const container = document.getElementById('page-container');
  if (!container) return;

  // Show loading skeleton while fetching data
  container.innerHTML = `
    <div class="insights-container loading-state">
      <div class="insights-loading-spinner" aria-hidden="true"></div>
      <p class="insights-loading-text">${t('analytics.refresh')}...</p>
    </div>
  `;

  try {
    currentData = await getAnalyticsData();
    renderAnalyticsDashboard(container, currentData);
  } catch (err) {
    console.error('[Insights] Failed to render dashboard:', err);
    container.innerHTML = `
      <div class="insights-container error-state">
        <h2>${t('analytics.title')}</h2>
        <p class="error-msg">Gagal memuat data analitik. Silakan coba segarkan halaman.</p>
        <button class="btn btn-primary" id="insights-retry-btn">${t('analytics.refresh')}</button>
      </div>
    `;
    document.getElementById('insights-retry-btn')?.addEventListener('click', () => renderAnalytics());
  }
}

/**
 * Renders the complete dashboard view
 */
function renderAnalyticsDashboard(container, data) {
  const { overview, chaptersPerformance, trends, recentActivities, goalsProgress } = data;

  // Generate recommendations deterministically
  const recommendations = generateRecommendations({
    lessons: data.raw.lessons,
    completedMap: data.raw.completedMap,
    quizHistory: data.raw.quizHistory,
    gamesProgress: data.raw.gamesProgress,
    goalsProgress
  });

  const isBrandNewUser = overview.completedLessons === 0 && overview.totalQuizzesAttempted === 0 && overview.gamesCompleted === 0;

  const html = `
    <div class="insights-container" role="region" aria-label="${t('analytics.title')}">
      <!-- Header -->
      <header class="insights-header">
        <div class="insights-header-content">
          <div class="insights-title-badge-row">
            <span class="badge badge-primary">CyberWise Intelligence</span>
            ${overview.lastActivityDate ? `<span class="badge badge-outline">${t('analytics.lastActiveLabel')}: ${formatRelativeDate(overview.lastActivityDate)}</span>` : ''}
          </div>
          <h1 class="insights-title">${t('analytics.title')}</h1>
          <p class="insights-subtitle">${t('analytics.subtitle')}</p>
        </div>
        <div class="insights-header-actions">
          <button type="button" class="btn btn-outline btn-refresh" id="insights-refresh-btn" aria-label="${t('analytics.refresh')}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style="width:16px;height:16px;margin-right:6px;"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            ${t('analytics.refresh')}
          </button>
        </div>
      </header>

      <!-- Welcome Banner for New Users -->
      ${isBrandNewUser ? `
        <section class="insights-welcome-card" aria-label="${t('analytics.welcomeEmptyTitle')}">
          <div class="welcome-card-icon" aria-hidden="true">🌱</div>
          <div class="welcome-card-body">
            <h2>${t('analytics.welcomeEmptyTitle')}</h2>
            <p>${t('analytics.welcomeEmptyDesc')}</p>
            <div class="welcome-card-actions">
              <a href="#/learn/1-a" class="btn btn-primary">${t('analytics.startFirstLesson')} →</a>
            </div>
          </div>
        </section>
      ` : ''}

      <!-- Section 1: KPI Overview Cards -->
      <section class="insights-overview-section" aria-label="${t('analytics.overviewTitle')}">
        <h2 class="sr-only">${t('analytics.overviewTitle')}</h2>
        <div class="insights-kpi-grid">
          <!-- Lesson Progress KPI -->
          <div class="kpi-card" tabindex="0">
            <div class="kpi-icon-wrap icon-lessons">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">${t('analytics.lessonsCompletedLabel')}</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${overview.completedLessons}</span>
                <span class="kpi-total">/ ${overview.totalLessons}</span>
                <span class="kpi-pct-badge">${overview.lessonCompletionPct}%</span>
              </div>
              <div class="kpi-progress-track" aria-hidden="true">
                <div class="kpi-progress-fill" style="width: ${overview.lessonCompletionPct}%;"></div>
              </div>
            </div>
          </div>

          <!-- Quiz Score KPI -->
          <div class="kpi-card" tabindex="0">
            <div class="kpi-icon-wrap icon-quiz">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">${t('analytics.avgQuizScoreLabel')}</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${overview.averageQuizScore !== null ? `${overview.averageQuizScore}%` : '—'}</span>
              </div>
              <span class="kpi-subtext">
                ${overview.totalQuizzesAttempted > 0 
                  ? t('analytics.avgQuizScoreSub', { count: overview.totalQuizzesAttempted, best: overview.averageBestQuizScore || 0 })
                  : t('analytics.noQuizAttempts')}
              </span>
            </div>
          </div>

          <!-- Games KPI -->
          <div class="kpi-card" tabindex="0">
            <div class="kpi-icon-wrap icon-games">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 12h4m-2-2v4"/><circle cx="17" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">${t('analytics.gamesCompletedLabel')}</span>
              <div class="kpi-value-row">
                <span class="kpi-value">${overview.gamesCompleted}</span>
                <span class="kpi-total">/ ${overview.totalGames}</span>
              </div>
              <span class="kpi-subtext">${t('analytics.gamesCompletedSub', { count: overview.gamesCompleted, total: overview.totalGames })}</span>
            </div>
          </div>

          <!-- Last Active KPI -->
          <div class="kpi-card" tabindex="0">
            <div class="kpi-icon-wrap icon-activity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="kpi-info">
              <span class="kpi-label">${t('analytics.lastActiveLabel')}</span>
              <div class="kpi-value-row">
                <span class="kpi-value text-medium">${formatRelativeDate(overview.lastActivityDate)}</span>
              </div>
              <span class="kpi-subtext">${overview.lastActivityDate ? formatFullDate(overview.lastActivityDate) : t('analytics.startLearningPrompt')}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Personalized Recommendations -->
      <section class="insights-section recommendations-section" aria-labelledby="recommendations-heading">
        <div class="section-header">
          <div>
            <h2 id="recommendations-heading" class="section-title">
              <span class="section-title-icon" aria-hidden="true">💡</span>
              ${t('analytics.recommendationsTitle')}
            </h2>
            <p class="section-subtitle">${t('analytics.recommendationsSubtitle')}</p>
          </div>
        </div>

        ${recommendations.length > 0 ? `
          <div class="recommendations-grid">
            ${recommendations.map(rec => `
              <div class="recommendation-card priority-${rec.priority}" id="${rec.id}">
                <div class="rec-badge-row">
                  <span class="badge badge-accent">${t(rec.categoryKey)}</span>
                  <span class="rec-priority-label ${rec.priority <= 1 ? 'priority-high' : 'priority-normal'}">
                    ${rec.priority <= 1 ? t('analytics.priorityHigh') : t('analytics.priorityNormal')}
                  </span>
                </div>
                <h3 class="rec-title">${rec.title}</h3>
                <span class="rec-topic-tag">${rec.topic}</span>
                <p class="rec-reason">${rec.reason}</p>
                <div class="rec-actions">
                  <a href="${rec.actionUrl}" class="btn btn-primary btn-sm">${rec.actionText} →</a>
                  ${rec.secondaryUrl ? `
                    <a href="${rec.secondaryUrl}" class="btn btn-outline btn-sm">${rec.secondaryText}</a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state-card">
            <span class="empty-state-icon">🎉</span>
            <h3>${t('analytics.noRecommendationsTitle')}</h3>
            <p>${t('analytics.noRecommendationsDesc')}</p>
            <a href="#/quiz/master" class="btn btn-primary">Master Quiz →</a>
          </div>
        `}
      </section>

      <!-- Section 3: Study Goals Tracker -->
      <section class="insights-section goals-section" aria-labelledby="goals-heading">
        <div class="section-header">
          <div>
            <h2 id="goals-heading" class="section-title">
              <span class="section-title-icon" aria-hidden="true">🎯</span>
              ${t('analytics.goalsTitle')}
            </h2>
            <p class="section-subtitle">${t('analytics.goalsSubtitle')}</p>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="edit-goals-toggle-btn">
            ${t('analytics.editGoalsBtn')}
          </button>
        </div>

        <!-- Goals Progress Display -->
        <div class="goals-card">
          <div class="goals-kicker">${t('analytics.goalsCurrentWeek')}</div>
          <div class="goals-progress-grid">
            <!-- Lessons Target -->
            <div class="goal-item">
              <div class="goal-label-row">
                <span class="goal-label">${t('analytics.goalsLessonsProgress', { current: goalsProgress.completedLessonsThisWeek, target: goalsProgress.targetLessons, pct: goalsProgress.lessonsGoalPct })}</span>
              </div>
              <div class="goal-progress-track">
                <div class="goal-progress-fill" style="width: ${goalsProgress.lessonsGoalPct}%;"></div>
              </div>
            </div>

            <!-- Quizzes Target -->
            <div class="goal-item">
              <div class="goal-label-row">
                <span class="goal-label">${t('analytics.goalsQuizzesProgress', { current: goalsProgress.completedQuizzesThisWeek, target: goalsProgress.targetQuizzes, pct: goalsProgress.quizzesGoalPct })}</span>
              </div>
              <div class="goal-progress-track">
                <div class="goal-progress-fill" style="width: ${goalsProgress.quizzesGoalPct}%;"></div>
              </div>
            </div>
          </div>

          <div class="goal-status-message">
            ${goalsProgress.completedLessonsThisWeek >= goalsProgress.targetLessons && goalsProgress.completedQuizzesThisWeek >= goalsProgress.targetQuizzes
              ? `<span class="goal-achieved-badge">${t('analytics.goalsAchieved')}</span>`
              : `<span class="goal-encouragement">${t('analytics.goalsEncouragement')}</span>`}
          </div>

          <!-- Collapsible Goals Editor Form -->
          <form id="goals-editor-form" class="goals-editor-form hidden" aria-label="Edit study goals">
            <div class="form-inputs-row">
              <div class="form-group">
                <label for="target-lessons-input">${t('analytics.targetLessonsInput')}</label>
                <input type="number" id="target-lessons-input" min="1" max="14" value="${goalsProgress.targetLessons}" required />
              </div>
              <div class="form-group">
                <label for="target-quizzes-input">${t('analytics.targetQuizzesInput')}</label>
                <input type="number" id="target-quizzes-input" min="1" max="20" value="${goalsProgress.targetQuizzes}" required />
              </div>
            </div>
            <div class="form-actions-row">
              <button type="submit" class="btn btn-primary btn-sm">${t('analytics.saveGoalsBtn')}</button>
              <button type="button" class="btn btn-outline btn-sm" id="cancel-goals-btn">${t('analytics.cancelGoalsBtn')}</button>
            </div>
          </form>
        </div>
      </section>

      <!-- Section 4: Chapter & Topic Performance Breakdown -->
      <section class="insights-section performance-section" aria-labelledby="performance-heading">
        <div class="section-header">
          <div>
            <h2 id="performance-heading" class="section-title">
              <span class="section-title-icon" aria-hidden="true">📚</span>
              ${t('analytics.topicPerformanceTitle')}
            </h2>
            <p class="section-subtitle">${t('analytics.topicPerformanceSubtitle')}</p>
          </div>
        </div>

        <div class="chapters-performance-list">
          ${chaptersPerformance.map(ch => `
            <div class="chapter-perf-card" id="perf-chapter-${ch.id}">
              <div class="chapter-perf-header">
                <div class="chapter-perf-title-box">
                  <span class="chapter-badge">Bab ${ch.id}</span>
                  <h3 class="chapter-title">${ch.title}</h3>
                </div>
                <div class="chapter-perf-stat-box">
                  <span class="stat-text">${ch.completedLessons} / ${ch.totalLessons} Pelajaran (${ch.completionPct}%)</span>
                  <div class="mini-bar-track">
                    <div class="mini-bar-fill" style="width: ${ch.completionPct}%;"></div>
                  </div>
                </div>
              </div>

              <!-- Subchapters Table / Grid -->
              <div class="subchapters-perf-table-wrap">
                <table class="subchapters-perf-table" aria-label="Topik dan Subbab Bab ${ch.id}">
                  <thead>
                    <tr>
                      <th scope="col">Subbab & Topik</th>
                      <th scope="col">Status Materi</th>
                      <th scope="col">Evaluasi Kuis</th>
                      <th scope="col">Status Topik</th>
                      <th scope="col">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${ch.subchapters.map(sub => `
                      <tr class="subchapter-perf-row status-row-${sub.topicStatus}">
                        <td class="sub-col-title">
                          <span class="sub-id-badge">${sub.id}</span>
                          <span class="sub-title-text">${sub.title}</span>
                        </td>
                        <td class="sub-col-lesson">
                          ${sub.lessonCompleted
                            ? `<span class="badge badge-success"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>${t('analytics.lessonStatusDone')}</span>`
                            : `<span class="badge badge-outline">${t('analytics.lessonStatusPending')}</span>`}
                        </td>
                        <td class="sub-col-quiz">
                          ${sub.quiz.attempts > 0 ? `
                            <div class="quiz-score-pill ${sub.quiz.latestScore >= 70 ? 'pass' : 'fail'}">
                              <strong>${sub.quiz.latestScore}%</strong>
                              <span class="raw-score">(${sub.quiz.latestRaw})</span>
                              <span class="attempts-count">${t('analytics.attemptsCount', { count: sub.quiz.attempts })}</span>
                            </div>
                          ` : `
                            <span class="text-muted">${t('analytics.quizNotAttempted')}</span>
                          `}
                        </td>
                        <td class="sub-col-status">
                          <span class="topic-mastery-badge badge-${sub.topicStatus}">
                            ${getTopicStatusLabel(sub.topicStatus)}
                          </span>
                        </td>
                        <td class="sub-col-actions">
                          <div class="table-actions-group">
                            <a href="#/learn/${sub.id}" class="btn-action-link" title="${t('analytics.viewLessonBtn')}">${t('analytics.viewLessonBtn')}</a>
                            <span class="action-sep" aria-hidden="true">·</span>
                            <a href="#/quiz/subchapter/${sub.id}" class="btn-action-link" title="${sub.quiz.attempts > 0 ? t('analytics.retakeQuizBtn') : t('analytics.takeQuizBtn')}">
                              ${sub.quiz.attempts > 0 ? t('analytics.retakeQuizBtn') : t('analytics.takeQuizBtn')}
                            </a>
                          </div>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Chapter Quiz Status Footer -->
              <div class="chapter-quiz-footer-row">
                <div class="chapter-quiz-info">
                  <span class="badge badge-info">${t('analytics.chapterQuizLabel')}</span>
                  ${ch.chapterQuiz ? `
                    <span class="chapter-quiz-stat">
                      Skor Terakhir: <strong>${ch.chapterQuiz.latestScore}%</strong> (Terbaik: ${ch.chapterQuiz.bestScore}%, ${t('analytics.attemptsCount', { count: ch.chapterQuiz.attempts })})
                    </span>
                  ` : `
                    <span class="text-muted">${t('analytics.quizNotAttempted')}</span>
                  `}
                </div>
                <div class="chapter-quiz-action">
                  <a href="#/quiz/chapter/${ch.id}" class="btn btn-outline btn-sm">
                    ${ch.chapterQuiz ? t('analytics.retakeQuizBtn') : t('analytics.takeQuizBtn')}
                  </a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Section 5: Learning Trends & Progression Charts -->
      <section class="insights-section trends-section" aria-labelledby="trends-heading">
        <div class="section-header">
          <div>
            <h2 id="trends-heading" class="section-title">
              <span class="section-title-icon" aria-hidden="true">📈</span>
              ${t('analytics.trendsTitle')}
            </h2>
            <p class="section-subtitle">${t('analytics.trendsSubtitle')}</p>
          </div>
        </div>

        <div class="trends-grid">
          <!-- Quiz Score Chronological Trend -->
          <div class="trend-card">
            <div class="trend-card-header">
              <h3>${t('analytics.quizScoreTrendTitle')}</h3>
              <span class="badge badge-outline">${t('analytics.passingThreshold')}</span>
            </div>
            <div class="trend-card-body">
              ${trends.quizTrends.length > 0 ? `
                <div class="chart-wrapper">
                  ${renderQuizTrendsChart(trends.quizTrends)}
                </div>
                <!-- Accessible Table Toggle -->
                <details class="accessible-data-details">
                  <summary class="accessible-summary-btn">${t('analytics.accessibleDataSummary')}</summary>
                  <table class="accessible-data-table" aria-label="${t('analytics.quizScoreTrendTitle')}">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">${t('analytics.tableDate')}</th>
                        <th scope="col">${t('analytics.tableTopic')}</th>
                        <th scope="col">${t('analytics.tableScore')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${trends.quizTrends.map(item => `
                        <tr>
                          <td>${item.index}</td>
                          <td>${item.date ? formatFullDate(item.date) : '—'}</td>
                          <td>${item.mode} (${item.subjectId})</td>
                          <td>${item.score}/${item.total} (${item.pct}%)</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </details>
              ` : `
                <div class="chart-empty-state">
                  <p>${t('analytics.noQuizTrendData')}</p>
                  <a href="#/quiz" class="btn btn-primary btn-sm">${t('analytics.takeQuizBtn')}</a>
                </div>
              `}
            </div>
          </div>

          <!-- Weekly Activity Chart (Last 7 Days) -->
          <div class="trend-card">
            <div class="trend-card-header">
              <h3>${t('analytics.weeklyActivityTitle')}</h3>
            </div>
            <div class="trend-card-body">
              ${trends.dailyActivity.some(d => d.totalCount > 0) ? `
                <div class="chart-wrapper">
                  ${renderDailyActivityChart(trends.dailyActivity)}
                </div>
                <!-- Accessible Table Toggle -->
                <details class="accessible-data-details">
                  <summary class="accessible-summary-btn">${t('analytics.accessibleDataSummary')}</summary>
                  <table class="accessible-data-table" aria-label="${t('analytics.weeklyActivityTitle')}">
                    <thead>
                      <tr>
                        <th scope="col">${t('analytics.tableDate')}</th>
                        <th scope="col">${t('analytics.tableLessons')}</th>
                        <th scope="col">${t('analytics.tableQuizzes')}</th>
                        <th scope="col">${t('analytics.tableGames')}</th>
                        <th scope="col">${t('analytics.tableTotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${trends.dailyActivity.map(day => `
                        <tr>
                          <td>${day.dayNameShort} (${day.dateStr})</td>
                          <td>${day.lessonsCount}</td>
                          <td>${day.quizzesCount}</td>
                          <td>${day.gamesCount}</td>
                          <td>${day.totalCount}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </details>
              ` : `
                <div class="chart-empty-state">
                  <p>${t('analytics.noActivityTrendData')}</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </section>

      <!-- Section 6: Recent Learning Activity Feed -->
      <section class="insights-section recent-activity-section" aria-labelledby="activity-heading">
        <div class="section-header">
          <div>
            <h2 id="activity-heading" class="section-title">
              <span class="section-title-icon" aria-hidden="true">⏱️</span>
              ${t('analytics.recentActivityTitle')}
            </h2>
            <p class="section-subtitle">${t('analytics.recentActivitySubtitle')}</p>
          </div>
        </div>

        ${recentActivities.length > 0 ? `
          <div class="activity-feed-list">
            ${recentActivities.map(act => `
              <div class="activity-item">
                <div class="activity-icon-wrap type-${act.type}">
                  ${getActivityIcon(act.type)}
                </div>
                <div class="activity-details">
                  <div class="activity-title-row">
                    <a href="${act.link}" class="activity-link">${formatActivityTitle(act)}</a>
                    <span class="activity-timestamp">${formatRelativeDate(act.timestamp)}</span>
                  </div>
                  <div class="activity-sub-detail">
                    ${formatActivitySub(act)}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-state-card compact">
            <p>${t('analytics.noRecentActivity')}</p>
            <a href="#/learn/1-a" class="btn btn-outline btn-sm">${t('analytics.startFirstLesson')}</a>
          </div>
        `}
      </section>
    </div>
  `;

  container.innerHTML = html;
  attachAnalyticsEvents(container);
}

/**
 * Renders SVG line chart for chronological quiz progression
 */
function renderQuizTrendsChart(trends) {
  const width = 500;
  const height = 180;
  const padLeft = 40;
  const padRight = 25;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const passY = padTop + (1 - 70 / 100) * chartH;

  const points = trends.map((item, idx) => {
    const x = padLeft + (trends.length > 1 ? (idx / (trends.length - 1)) * chartW : chartW / 2);
    const y = padTop + (1 - Math.max(0, Math.min(100, item.pct)) / 100) * chartH;
    return { ...item, x, y };
  });

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return `
    <svg class="insights-chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true" role="img">
      <!-- Grid lines -->
      <line x1="${padLeft}" y1="${padTop}" x2="${width - padRight}" y2="${padTop}" stroke="var(--color-border)" stroke-width="1" stroke-dasharray="2,2"/>
      <text x="${padLeft - 8}" y="${padTop + 4}" font-size="10" text-anchor="end" fill="var(--color-text-muted)">100%</text>

      <line x1="${padLeft}" y1="${passY}" x2="${width - padRight}" y2="${passY}" stroke="var(--color-warning, #f59e0b)" stroke-width="1.5" stroke-dasharray="4,4"/>
      <text x="${padLeft - 8}" y="${passY + 4}" font-size="10" text-anchor="end" fill="var(--color-warning, #f59e0b)" font-weight="bold">70%</text>

      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="var(--color-border)" stroke-width="1"/>
      <text x="${padLeft - 8}" y="${padTop + chartH + 4}" font-size="10" text-anchor="end" fill="var(--color-text-muted)">0%</text>

      <!-- Trend connecting line -->
      ${points.length > 1 ? `
        <polyline points="${polylinePoints}" fill="none" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ` : ''}

      <!-- Data point markers -->
      ${points.map(p => `
        <g class="chart-point-group">
          <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${p.pct >= 70 ? 'var(--color-success, #10b981)' : 'var(--color-danger, #ef4444)'}" stroke="var(--color-surface)" stroke-width="2">
            <title>Kuis #${p.index} (${p.subjectId}): ${p.pct}%</title>
          </circle>
          <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" font-size="10" text-anchor="middle" fill="var(--color-text)" font-weight="bold">${p.pct}%</text>
          <text x="${p.x.toFixed(1)}" y="${height - 10}" font-size="9" text-anchor="middle" fill="var(--color-text-muted)">#${p.index}</text>
        </g>
      `).join('')}
    </svg>
  `;
}

/**
 * Renders SVG bar chart for daily activity in the last 7 days
 */
function renderDailyActivityChart(days) {
  const width = 500;
  const height = 180;
  const padLeft = 30;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 30;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxActivity = Math.max(5, ...days.map(d => d.totalCount));
  const colWidth = chartW / days.length;
  const barWidth = Math.min(32, colWidth * 0.65);

  return `
    <svg class="insights-chart-svg" viewBox="0 0 ${width} ${height}" aria-hidden="true" role="img">
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="var(--color-border)" stroke-width="1"/>

      ${days.map((d, i) => {
        const x = padLeft + i * colWidth + (colWidth - barWidth) / 2;
        const barHeight = (d.totalCount / maxActivity) * chartH;
        const y = padTop + chartH - barHeight;

        return `
          <g class="bar-group">
            <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="3" fill="${d.totalCount > 0 ? 'var(--color-primary)' : 'var(--color-border)'}" opacity="${d.totalCount > 0 ? '0.85' : '0.4'}">
              <title>${d.dayNameShort} (${d.dateStr}): ${d.totalCount} aktivitas (${d.lessonsCount} materi, ${d.quizzesCount} kuis, ${d.gamesCount} game)</title>
            </rect>
            ${d.totalCount > 0 ? `
              <text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" font-size="10" text-anchor="middle" fill="var(--color-text)" font-weight="bold">${d.totalCount}</text>
            ` : ''}
            <text x="${(x + barWidth / 2).toFixed(1)}" y="${height - 10}" font-size="10" text-anchor="middle" fill="var(--color-text-muted)">${d.dayNameShort}</text>
          </g>
        `;
      }).join('')}
    </svg>
  `;
}

function formatRelativeDate(timestamp) {
  if (!timestamp) return t('analytics.noActivityYet');
  const now = Date.now();
  const diffDays = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return t('analytics.relativeToday');
  if (diffDays === 1) return t('analytics.relativeYesterday');
  return t('analytics.relativeDaysAgo', { days: diffDays });
}

function formatFullDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getTopicStatusLabel(status) {
  if (status === 'completed') return t('analytics.statusCompleted');
  if (status === 'needs_practice') return t('analytics.statusNeedsPractice');
  if (status === 'in_progress') return t('analytics.statusInProgress');
  return t('analytics.statusNotStarted');
}

function getActivityIcon(type) {
  if (type === 'lesson') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
  }
  if (type === 'quiz') {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><rect x="2" y="6" width="20" height="12" rx="3"/><path d="M6 12h4m-2-2v4"/><circle cx="17" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>`;
}

function formatActivityTitle(act) {
  if (act.type === 'lesson') {
    return t('analytics.actionCompletedLesson', { title: act.title });
  }
  if (act.type === 'quiz') {
    return t('analytics.actionCompletedQuiz', { subject: act.subjectId, pct: act.pct });
  }
  const game = GAMES_LIST.find(g => g.id === act.id);
  const title = game ? t(game.titleKey) : act.id;
  return t('analytics.actionPlayedGame', { title });
}

function formatActivitySub(act) {
  if (act.type === 'lesson') {
    return `<span class="badge badge-outline">Materi Pelajaran</span>`;
  }
  if (act.type === 'quiz') {
    return `<span class="badge ${act.pct >= 70 ? 'badge-success' : 'badge-warning'}">Kuis ${act.mode} · Nilai: ${act.score}/${act.total}</span>`;
  }
  return `<span class="badge badge-accent">Simulasi Permainan · Skor: ${act.score}</span>`;
}

function attachAnalyticsEvents(container) {
  document.getElementById('insights-refresh-btn')?.addEventListener('click', () => {
    renderAnalytics();
  });

  const toggleGoalsBtn = document.getElementById('edit-goals-toggle-btn');
  const goalsForm = document.getElementById('goals-editor-form');
  const cancelGoalsBtn = document.getElementById('cancel-goals-btn');

  toggleGoalsBtn?.addEventListener('click', () => {
    goalsForm?.classList.toggle('hidden');
  });

  cancelGoalsBtn?.addEventListener('click', () => {
    goalsForm?.classList.add('hidden');
  });

  goalsForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const targetLessons = Number(document.getElementById('target-lessons-input')?.value);
    const targetQuizzes = Number(document.getElementById('target-quizzes-input')?.value);

    saveStudyGoals({ targetLessons, targetQuizzes });
    renderAnalytics();
  });
}
