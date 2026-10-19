// src/learn/dashboard.js
import { getProgress, isComplete, getChapterProgress } from './progress.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';

export function renderDashboard(container, manifest) {
  const { lessons } = manifest;
  const progress = getProgress();
  const completedIds = progress.completedIds;
  const total = lessons.length;
  const completed = completedIds.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Find continue learning target
  let continueLesson = null;
  if (progress.lastAccessed) {
    continueLesson = lessons.find(l => l.id === progress.lastAccessed);
  }
  if (!continueLesson) {
    continueLesson = lessons.find(l => !isComplete(l.id));
  }

  // Build chapters structure from manifest
  const chaptersMap = {};
  lessons.forEach(lesson => {
    if (!chaptersMap[lesson.chapterId]) {
      chaptersMap[lesson.chapterId] = { id: lesson.chapterId, title: lesson.chapterTitle, lessons: [] };
    }
    chaptersMap[lesson.chapterId].lessons.push(lesson);
  });
  const chapters = Object.values(chaptersMap);

  container.innerHTML = `
    <div class="learn-dashboard">
      <div class="dashboard-hero">
        <div class="dashboard-hero-header">
          <div class="dashboard-hero-badge">
            <span class="pulse-dot" aria-hidden="true"></span>
            <span>CYBER OPERATIONS LEARNING MATRIX</span>
          </div>
          <h1 class="dashboard-title">${t('dashboard.title')}</h1>
          <p class="dashboard-subtitle">${t('dashboard.subtitle')}</p>
        </div>
      </div>

      <!-- Asymmetric Command Hub: Active Mission & Readiness Matrix -->
      <div class="dashboard-command-hub">
        <!-- Spotlight: Active Mission -->
        ${continueLesson ? `
        <div class="continue-section">
          <div class="continue-card">
            <div class="continue-card-badge-row">
              <span class="badge badge-tech">MISSION: ${continueLesson.id.toUpperCase()}</span>
              <span class="continue-time-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ~5-8 min
              </span>
            </div>
            <div class="continue-info">
              <span class="continue-label">${t('dashboard.continueLabel')}</span>
              <h2 class="continue-title">${continueLesson.title}</h2>
              <span class="continue-chapter">${continueLesson.chapterTitle}</span>
            </div>
            <div class="continue-action-row">
              <a href="#/learn/${continueLesson.id}" class="btn btn-primary continue-cta-btn">
                <span>${t('dashboard.continueBtn')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cta-arrow" style="width:16px;height:16px;" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            </div>
          </div>
        </div>` : `
        <div class="continue-section">
          <div class="all-done-card">
            <span class="all-done-icon">🎉</span>
            <div class="all-done-info">
              <h2>${t('dashboard.allDoneTitle')}</h2>
              <p>${t('dashboard.allDoneDesc')}</p>
            </div>
          </div>
        </div>`}

        <!-- Security Readiness Overview Matrix -->
        <div class="progress-overview">
          <div class="readiness-header">
            <span class="readiness-title">KEAMANAN & KURIKULUM</span>
            <span class="stat-pct">${pct}%</span>
          </div>
          <div class="progress-stats">
            <div class="stat">
              <span class="stat-value">${completed}</span>
              <span class="stat-label">${t('dashboard.completedOf', { total })}</span>
            </div>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="dashboard-quick-actions">
            <a href="#/quiz" class="quick-action-chip" title="Uji Pemahaman">
              <span>✍️ Kuis</span>
            </a>
            <a href="#/flashcards" class="quick-action-chip" title="Kartu Belajar SRS">
              <span>🃏 Flashcards</span>
            </a>
            <a href="#/games" class="quick-action-chip" title="Simulasi Siber">
              <span>🎮 Games</span>
            </a>
          </div>
        </div>
      </div>

      <div class="chapters-section">
        <div class="chapters-section-header">
          <h2 class="section-title">${t('dashboard.chapters')}</h2>
          <span class="chapters-count-badge">${chapters.length} Modul Utama</span>
        </div>
        <div class="chapters-list">
          ${chapters.map(ch => renderChapterCard(ch, lessons)).join('')}
        </div>
      </div>
    </div>`;

  // Make chapters expandable with click and keyboard support
  container.querySelectorAll('.chapter-card-header').forEach(header => {
    const toggle = () => {
      const card = header.closest('.chapter-card');
      const isExpanded = card.classList.toggle('expanded');
      header.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
    };
    header.addEventListener('click', toggle);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
    // Start expanded
    header.closest('.chapter-card').classList.add('expanded');
  });
}

function renderChapterCard(chapter, allLessons) {
  const chapterLessons = allLessons.filter(l => l.chapterId === chapter.id);
  const completedCount = chapterLessons.filter(l => isComplete(l.id)).length;
  const total = chapterLessons.length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const isAllDone = completedCount === total && total > 0;

  const chapterIcons = {
    '1': '🛡️',
    '2': '🌐',
    '3': '🦠',
    '4': '🔐'
  };
  const icon = chapterIcons[chapter.id] || '📖';

  return `
    <div class="chapter-card ${isAllDone ? 'chapter-all-done' : ''}" data-chapter="${chapter.id}">
      <div class="chapter-card-header" role="button" tabindex="0" aria-expanded="true"
           aria-label="${t('dashboard.chPrefix', { id: chapter.id })}: ${chapter.title}">
        <div class="chapter-header-main">
          <span class="chapter-icon" aria-hidden="true">${icon}</span>
          <div class="chapter-title-group">
            <div class="chapter-badge-line">
              <span class="chapter-badge">${t('dashboard.chPrefix', { id: chapter.id })}</span>
              ${isAllDone ? `<span class="badge badge-success badge-sm">LENGKAP</span>` : ''}
            </div>
            <h3 class="chapter-title">${chapter.title}</h3>
          </div>
        </div>
        <div class="chapter-header-right">
          <div class="chapter-metric-box">
            <span class="chapter-progress-text">${completedCount}/${total}</span>
            <span class="chapter-progress-pct">${pct}%</span>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="chapter-progress-bar">
        <div class="chapter-progress-fill" style="width: ${pct}%"></div>
      </div>
      <ul class="subchapter-list">
        ${chapterLessons.map((lesson, idx) => {
          const done = isComplete(lesson.id);
          return `
          <li class="subchapter-item ${done ? 'completed' : ''}" data-lesson-id="${lesson.id}">
            <a href="#/learn/${lesson.id}" class="subchapter-link">
              <div class="subchapter-track-node">
                <span class="subchapter-check" aria-hidden="true">${done ? '✓' : idx + 1}</span>
              </div>
              <div class="subchapter-text-wrap">
                <div class="subchapter-meta-line">
                  <span class="subchapter-code">${lesson.id.toUpperCase()}</span>
                  <span class="subchapter-time">~5m</span>
                </div>
                <span class="subchapter-title">${lesson.title}</span>
              </div>
              <svg class="subchapter-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </a>
          </li>`;
        }).join('')}
      </ul>
    </div>`;
}
