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
        <h1 class="dashboard-title">${t('dashboard.title')}</h1>
        <p class="dashboard-subtitle">${t('dashboard.subtitle')}</p>
      </div>

      <div class="progress-overview">
        <div class="progress-stats">
          <div class="stat">
            <span class="stat-value">${completed}</span>
            <span class="stat-label">${t('dashboard.completedOf', { total })}</span>
          </div>
          <span class="stat-pct">${pct}%</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" style="width: ${pct}%"></div>
        </div>
      </div>

      ${continueLesson ? `
      <div class="continue-section">
        <div class="continue-card">
          <div class="continue-info">
            <span class="continue-label">${t('dashboard.continueLabel')}</span>
            <h2 class="continue-title">${continueLesson.title}</h2>
            <span class="continue-chapter">${continueLesson.chapterTitle}</span>
          </div>
          <a href="#/learn/${continueLesson.id}" class="btn btn-primary">${t('dashboard.continueBtn')}</a>
        </div>
      </div>` : `
      <div class="continue-section">
        <div class="all-done-card">
          <span class="all-done-icon">🎉</span>
          <h2>${t('dashboard.allDoneTitle')}</h2>
          <p>${t('dashboard.allDoneDesc')}</p>
        </div>
      </div>`}

      <div class="chapters-section">
        <h2 class="section-title">${t('dashboard.chapters')}</h2>
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

  return `
    <div class="chapter-card" data-chapter="${chapter.id}">
      <div class="chapter-card-header" role="button" tabindex="0" aria-expanded="true"
           aria-label="${t('dashboard.chPrefix', { id: chapter.id })}: ${chapter.title}">
        <div class="chapter-header-main">
          <span class="chapter-badge">${t('dashboard.chPrefix', { id: chapter.id })}</span>
          <h3 class="chapter-title">${chapter.title}</h3>
        </div>
        <div class="chapter-header-right">
          <span class="chapter-progress-text">${completedCount}/${total}</span>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>
      <div class="chapter-progress-bar">
        <div class="chapter-progress-fill" style="width: ${pct}%"></div>
      </div>
      <ul class="subchapter-list">
        ${chapterLessons.map(lesson => `
          <li class="subchapter-item ${isComplete(lesson.id) ? 'completed' : ''}">
            <a href="#/learn/${lesson.id}" class="subchapter-link">
              <span class="subchapter-check" aria-hidden="true">${isComplete(lesson.id) ? '✓' : '○'}</span>
              <span class="subchapter-title">${lesson.title}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </div>`;
}
