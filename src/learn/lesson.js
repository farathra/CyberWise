// src/learn/lesson.js
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { markComplete, markIncomplete, isComplete, setLastAccessed, getCompletedIds } from './progress.js';
import { navigate } from '../router.js';

const BASE_URL = import.meta.env.BASE_URL;

// Configure marked
marked.setOptions({ gfm: true, breaks: false });

export async function renderLesson(container, manifest, lessonId) {
  const lessons = manifest.lessons;
  const lessonIndex = lessons.findIndex(l => l.id === lessonId);

  if (lessonIndex === -1) {
    container.innerHTML = `<div class="error-state"><h2>Lesson Not Found</h2><p>Lesson "${lessonId}" does not exist.</p><a href="#/learn" class="btn btn-primary">Back to Dashboard</a></div>`;
    return;
  }

  const lesson = lessons[lessonIndex];
  const prevLesson = lessonIndex > 0 ? lessons[lessonIndex - 1] : null;
  const nextLesson = lessonIndex < lessons.length - 1 ? lessons[lessonIndex + 1] : null;

  setLastAccessed(lesson.id);

  // Show loading
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading lesson...</p></div>';

  let rawMarkdown = '';
  try {
    const res = await fetch(BASE_URL + lesson.file);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    rawMarkdown = await res.text();
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2>Failed to Load Lesson</h2>
        <p>Could not load "${lesson.title}".</p>
        <p class="error-detail">${err.message}</p>
        <a href="#/learn" class="btn btn-outline">Back to Dashboard</a>
      </div>`;
    return;
  }

  // Strip frontmatter
  const content = rawMarkdown.replace(/^---[\s\S]*?---\n/, '').trim();

  // Parse markdown safely
  const rawHtml = marked.parse(content);
  const safeHtml = DOMPurify.sanitize(rawHtml, {
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed']
  });

  // Generate TOC from headings
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = safeHtml;
  const headings = Array.from(tempDiv.querySelectorAll('h2, h3'));
  const tocItems = headings.map((h, i) => {
    const id = 'heading-' + i;
    h.id = id;
    const level = h.tagName === 'H2' ? 2 : 3;
    return { id, text: h.textContent, level };
  });
  const processedHtml = tempDiv.innerHTML;

  // Group lessons by chapter for sidebar curriculum navigation
  const chaptersMap = {};
  lessons.forEach(l => {
    if (!chaptersMap[l.chapterId]) {
      chaptersMap[l.chapterId] = { id: l.chapterId, title: l.chapterTitle, lessons: [] };
    }
    chaptersMap[l.chapterId].lessons.push(l);
  });
  const chapters = Object.values(chaptersMap);
  const completedCount = getCompletedIds().length;

  const tocHtml = tocItems.length > 0 ? `
    <div class="sidebar-card toc-card">
      <div class="sidebar-card-header">
        <span class="sidebar-section-title">On This Page</span>
      </div>
      <nav class="toc" aria-label="Table of contents">
        <ul class="toc-list">
          ${tocItems.map(item => `
            <li class="toc-item ${item.level === 2 ? 'toc-item-h2' : 'toc-item-h3'}">
              <a href="#${item.id}" class="toc-link">${item.text}</a>
            </li>
          `).join('')}
        </ul>
      </nav>
    </div>` : '';

  const videoHtml = lesson.videoId ? `
    <div class="video-embed">
      <div class="video-wrapper">
        <iframe
          src="https://www.youtube.com/embed/${lesson.videoId}"
          title="${lesson.title} - Video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
      <p class="video-note">📹 Video requires internet connection</p>
    </div>` : '';

  container.innerHTML = `
    <div class="lesson-view">
      <div class="reading-progress-bar" id="reading-progress"></div>

      <!-- Mobile Sidebar Toggle -->
      <button class="sidebar-toggle" id="sidebar-toggle" aria-expanded="false" aria-controls="lesson-sidebar">
        <span class="sidebar-toggle-main">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="sidebar-toggle-icon"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
          <span>Curriculum & Table of Contents</span>
        </span>
        <span class="sidebar-toggle-badge">${completedCount}/${lessons.length} done</span>
        <svg class="sidebar-toggle-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      <div class="lesson-layout">
        <!-- Sidebar: compact, 280-320px on desktop -->
        <aside class="lesson-sidebar" id="lesson-sidebar" role="complementary" aria-label="Curriculum Navigation">
          <a href="#/learn" class="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="15 18 9 12 15 6"/></svg>
            <span>Back to Dashboard</span>
          </a>

          <!-- Curriculum Navigator in Sidebar -->
          <div class="sidebar-card curriculum-card">
            <div class="sidebar-card-header">
              <span class="sidebar-section-title">Curriculum</span>
              <span class="sidebar-progress-badge">${completedCount}/${lessons.length}</span>
            </div>
            <div class="sidebar-chapters-list">
              ${chapters.map(ch => `
                <div class="sidebar-chapter-group ${ch.id === lesson.chapterId ? 'current-chapter' : ''}">
                  <div class="sidebar-chapter-title">Chapter ${ch.id}</div>
                  <ul class="sidebar-subchapter-list">
                    ${ch.lessons.map(l => {
                      const active = l.id === lesson.id;
                      const done = isComplete(l.id);
                      return `
                        <li class="sidebar-subchapter-item">
                          <a href="#/learn/${l.id}" class="sidebar-nav-link ${active ? 'active' : ''} ${done ? 'completed' : ''}" ${active ? 'aria-current="page"' : ''}>
                            <span class="sidebar-status-icon ${done ? 'done' : ''}" aria-hidden="true">${done ? '✓' : '○'}</span>
                            <span class="sidebar-nav-title"><strong class="sub-id">${l.id}</strong> ${l.title}</span>
                          </a>
                        </li>
                      `;
                    }).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          ${tocHtml}
        </aside>

        <!-- Main Content Area: generous, comfortable reading width -->
        <main class="lesson-main">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="#/learn">Learn</a>
            <span class="breadcrumb-sep" aria-hidden="true">/</span>
            <span>Chapter ${lesson.chapterId}</span>
            <span class="breadcrumb-sep" aria-hidden="true">/</span>
            <span aria-current="page" class="breadcrumb-current">${lesson.title}</span>
          </nav>

          <header class="lesson-header">
            <div class="lesson-badge-row">
              <span class="badge badge-info">Chapter ${lesson.chapterId}</span>
              <span class="badge badge-outline">${lesson.id}</span>
              ${isComplete(lesson.id) ? '<span class="badge badge-success">✓ Completed</span>' : ''}
            </div>
            <h1 class="lesson-title">${lesson.title}</h1>
          </header>

          ${videoHtml}

          <article class="lesson-content markdown-body">${processedHtml}</article>

          <div class="lesson-actions">
            <button
              id="complete-btn"
              class="btn ${isComplete(lesson.id) ? 'btn-success' : 'btn-primary'}"
              data-lesson-id="${lesson.id}"
            >
              ${isComplete(lesson.id) ? '✓ Completed' : 'Mark as Complete'}
            </button>
            <a href="#/quiz/subchapter/${lesson.id}" class="btn btn-outline">Take Subchapter Quiz (${lesson.id}) →</a>
          </div>

          <nav class="lesson-nav" aria-label="Lesson navigation">
            ${prevLesson
              ? `<a href="#/learn/${prevLesson.id}" class="lesson-nav-btn prev">
                   <span class="nav-dir-label">← Previous Lesson</span>
                   <span class="nav-title-label">${prevLesson.title}</span>
                 </a>`
              : '<span class="lesson-nav-btn prev disabled"><span class="nav-dir-label">← First Lesson</span><span class="nav-title-label">Beginning of curriculum</span></span>'}
            ${nextLesson
              ? `<a href="#/learn/${nextLesson.id}" class="lesson-nav-btn next">
                   <span class="nav-dir-label">Next Lesson →</span>
                   <span class="nav-title-label">${nextLesson.title}</span>
                 </a>`
              : '<span class="lesson-nav-btn next disabled"><span class="nav-dir-label">Curriculum Complete →</span><span class="nav-title-label">End of lessons</span></span>'}
          </nav>
        </main>
      </div>
    </div>`;

  // Reading progress bar
  const progressBar = document.getElementById('reading-progress');
  const updateReadingProgress = () => {
    const winHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = winHeight > 0 ? (window.scrollY / winHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
  };
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  updateReadingProgress();

  // Mobile sidebar toggle handler
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('lesson-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      toggleBtn.classList.toggle('open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Smooth TOC scrolling
  container.querySelectorAll('.toc-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#heading-')) {
        const targetEl = document.getElementById(targetId.substring(1));
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // If on mobile, close sidebar after clicking TOC
          if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            toggleBtn?.classList.remove('open');
            toggleBtn?.setAttribute('aria-expanded', 'false');
          }
        }
      }
    });
  });

  // Mark complete button handler
  const completeBtn = document.getElementById('complete-btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      const id = completeBtn.getAttribute('data-lesson-id');
      if (isComplete(id)) {
        markIncomplete(id);
        completeBtn.textContent = 'Mark as Complete';
        completeBtn.className = 'btn btn-primary';
      } else {
        markComplete(id);
        completeBtn.textContent = '✓ Completed';
        completeBtn.className = 'btn btn-success';
      }
    });
  }
}
