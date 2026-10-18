// src/quiz/quiz.js
import {
  loadQuizManifest,
  buildSubchapterQuiz,
  buildChapterQuiz,
  buildMasterQuiz,
  scoreQuiz,
  QUIZ_MODES
} from './engine.js';
import { recordResult, getHistory, formatHistoryEntry } from './history.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';
import { checkAchievements, recordQuizReviewed } from '../achievements/achievementEngine.js';

const BASE_URL = import.meta.env.BASE_URL;

function getContainer() {
  return document.getElementById('page-container');
}

export async function renderQuiz(mode = null, id = null) {
  const container = getContainer();
  container.innerHTML = `<div class="loading"><div class="spinner"></div><p>${t('quiz.loading')}</p></div>`;

  try {
    if (mode && id) {
      await startQuiz(container, mode, id);
    } else {
      await renderQuizSelection(container);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2>${t('quiz.errorTitle')}</h2>
        <p>${err.message}</p>
        <a href="#/quiz" class="btn btn-primary">${t('quiz.backToQuizzes')}</a>
      </div>`;
  }
}

async function renderQuizSelection(container) {
  const manifest = await loadQuizManifest();
  const lessonManifest = await fetch(BASE_URL + 'materi/manifest.json').then(r => r.json());
  const history = await getHistory();

  // Group subchapters by chapter
  const chapters = {};
  lessonManifest.lessons.forEach(l => {
    if (!chapters[l.chapterId]) {
      chapters[l.chapterId] = { id: l.chapterId, title: l.chapterTitle, subchapters: [] };
    }
    chapters[l.chapterId].subchapters.push(l);
  });

  // Check availability for each subchapter
  const subAvailMap = {};
  for (const sub of manifest.subchapters) {
    try {
      const res = await fetch(BASE_URL + sub.file);
      if (res.ok) {
        const data = await res.json();
        const count = data.questions ? data.questions.length : 0;
        subAvailMap[sub.id] = { available: count, canRun: count >= 10 };
      } else {
        subAvailMap[sub.id] = { available: 0, canRun: false };
      }
    } catch {
      subAvailMap[sub.id] = { available: 0, canRun: false };
    }
  }

  // Calculate chapter totals
  const chapterAvail = {};
  for (const chId of Object.keys(chapters)) {
    const subs = chapters[chId].subchapters;
    let total = 0;
    for (const sub of subs) {
      const a = subAvailMap[sub.id] || { available: 0, canRun: false };
      total += a.available;
    }
    chapterAvail[chId] = { total, canRun: total >= 30 };
  }

  const totalQuestions = Object.values(chapterAvail).reduce((s, c) => s + c.total, 0);
  const masterCanRun = totalQuestions >= 50;

  container.innerHTML = `
    <div class="quiz-selection">
      <!-- Header -->
      <header class="quiz-selection-header">
        <h1>${t('quiz.centerTitle')}</h1>
        <p>${t('quiz.centerSubtitle')}</p>
      </header>

      <!-- Master Quiz Banner -->
      <section class="master-quiz-section" aria-label="${t('quiz.masterTitle')}">
        <div class="master-quiz-card">
          <div class="master-quiz-badge-row">
            <span class="badge badge-accent">${t('quiz.fullCurriculum')}</span>
            <span class="badge ${masterCanRun ? 'badge-success' : 'badge-warning'}">${t('quiz.questionsAvail', { count: totalQuestions })}</span>
          </div>
          <div class="master-quiz-content">
            <div class="master-quiz-info">
              <h2>${t('quiz.masterTitle')}</h2>
              <p>${t('quiz.masterDesc')}</p>
            </div>
            <div class="master-quiz-action">
              ${masterCanRun
                ? `<a href="#/quiz/master/all" class="btn btn-master">${t('quiz.startMasterBtn')}</a>`
                : `<div class="quiz-unavailable-box">
                     <span class="unavailable-status">${t('quiz.notEnoughQuestions')}</span>
                     <span class="unavailable-detail">${t('quiz.needsMoreQuestions', { diff: 50 - totalQuestions })}</span>
                   </div>`}
            </div>
          </div>
        </div>
      </section>

      <!-- Chapters List -->
      <section class="chapters-quiz-list" aria-label="Chapter and Subchapter Quizzes">
        ${Object.values(chapters).map(ch => {
          const chData = chapterAvail[ch.id];
          return `
            <div class="quiz-chapter-section" id="quiz-chapter-${ch.id}">
              <!-- Chapter Section Header -->
              <div class="quiz-chapter-header">
                <div class="quiz-chapter-header-main">
                  <span class="chapter-badge">${t('lesson.chapterPrefix', { id: ch.id })}</span>
                  <h2 class="quiz-chapter-title">${ch.title}</h2>
                </div>
                <div class="quiz-chapter-header-stats">
                  <span class="badge badge-outline">${t('quiz.inBank', { count: chData.total })}</span>
                </div>
              </div>

              <!-- Chapter Quiz Action Box -->
              <div class="chapter-quiz-action-box">
                <div class="chapter-quiz-action-info">
                  <div class="chapter-quiz-action-title">
                    <strong>${t('quiz.chapterQuizTitle', { id: ch.id })}</strong>
                    <span class="badge badge-info">${t('quiz.chapterQuizBadge')}</span>
                  </div>
                  <p class="chapter-quiz-action-desc">${t('quiz.chapterQuizDesc', { id: ch.id })}</p>
                </div>
                <div class="chapter-quiz-action-cta">
                  ${chData.canRun
                    ? `<a href="#/quiz/chapter/${ch.id}" class="btn btn-primary chapter-action-btn">${t('quiz.startChapterBtn')}</a>`
                    : `<div class="chapter-unavailable-pill">
                         <span class="pill-label">${t('quiz.needsMoreQuestions', { diff: 30 - chData.total })}</span>
                       </div>`}
                </div>
              </div>

              <!-- Subchapter Cards Section -->
              <div class="subchapters-quiz-container">
                <h3 class="subchapters-section-heading">${t('quiz.subchapterSection')}</h3>
                <div class="quiz-subchapter-grid">
                  ${ch.subchapters.map(sub => {
                    const subData = subAvailMap[sub.id] || { available: 0, canRun: false };
                    return `
                      <a href="#/quiz/subchapter/${sub.id}" class="quiz-subchapter-card ${subData.canRun ? 'can-run' : 'pending-content'}" aria-label="Quiz for ${sub.id}: ${sub.title}">
                        <div class="subchapter-card-top">
                          <span class="subchapter-id-badge">${sub.id}</span>
                          <span class="subchapter-bank-count">${t('quiz.subInBank', { count: subData.available })}</span>
                        </div>
                        <h4 class="subchapter-card-title">${sub.title}</h4>
                        <div class="subchapter-card-footer">
                          ${subData.canRun
                            ? `<span class="card-action-label ready">${t('quiz.takeSubchapterBtn')}</span>`
                            : `<span class="card-action-label pending">${subData.available}/10 Q →</span>`}
                        </div>
                      </a>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </section>

      <!-- History Section -->
      ${history.length > 0 ? `
      <section class="quiz-history-section">
        <h2>${t('quiz.recentAttempts')}</h2>
        <div class="quiz-history-table-wrapper">
          <table class="quiz-history-table">
            <thead>
              <tr>
                <th>${t('quiz.thDate')}</th>
                <th>${t('quiz.thMode')}</th>
                <th>${t('quiz.thTopic')}</th>
                <th>${t('quiz.thScore')}</th>
                <th>${t('quiz.thResult')}</th>
              </tr>
            </thead>
            <tbody>
              ${history.slice(0, 10).map(h => {
                const pct = Math.round((h.score / h.total) * 100);
                const pass = pct >= 70;
                const dateStr = new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return `
                  <tr>
                    <td>${dateStr}</td>
                    <td><span class="badge badge-outline">${h.mode}</span></td>
                    <td><strong>${h.subjectId}</strong></td>
                    <td>${h.score} / ${h.total} (${pct}%)</td>
                    <td><span class="badge ${pass ? 'badge-success' : 'badge-danger'}">${pass ? t('quiz.passBadge') : t('quiz.retryBadge')}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </section>` : ''}
    </div>`;
}

// Quiz state
let quizState = null;

async function startQuiz(container, mode, id) {
  let result;
  try {
    if (mode === QUIZ_MODES.SUBCHAPTER) result = await buildSubchapterQuiz(id);
    else if (mode === QUIZ_MODES.CHAPTER) result = await buildChapterQuiz(id);
    else if (mode === 'master') result = await buildMasterQuiz();
    else throw new Error('Unknown quiz mode: ' + mode);
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <h2>${t('quiz.errorTitle')}</h2>
        <p>${err.message}</p>
        <a href="#/quiz" class="btn btn-primary">${t('quiz.backToQuizzes')}</a>
      </div>`;
    return;
  }

  if (!result.ok) {
    container.innerHTML = `
      <div class="error-state">
        <h2>${t('quiz.errorTitle')}</h2>
        <p>${result.error}</p>
        <a href="#/quiz" class="btn btn-primary" style="margin-top: var(--space-4);">${t('quiz.backToCenter')}</a>
      </div>`;
    return;
  }

  quizState = {
    mode,
    id,
    questions: result.questions,
    answers: new Array(result.questions.length).fill(null),
    current: 0,
    submitted: false
  };

  renderQuizQuestion(container);
}

function renderQuizQuestion(container) {
  const { questions, answers, current } = quizState;
  const q = questions[current];
  const total = questions.length;
  const answeredCount = answers.filter(a => a !== null).length;

  container.innerHTML = `
    <div class="quiz-session">
      <!-- Quiz Header Bar -->
      <header class="quiz-header">
        <div class="quiz-header-top">
          <a href="#/quiz" class="btn btn-ghost btn-sm" onclick="return confirmLeave()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><polyline points="15 18 9 12 15 6"/></svg>
            <span>${t('quiz.exitQuiz')}</span>
          </a>
          <span class="quiz-mode-pill">${getModeLabel(quizState.mode, quizState.id)}</span>
          <div class="quiz-progress-counter">
            <span class="counter-main">${t('quiz.qProgress', { current: current + 1, total })}</span>
            <span class="counter-sub">${t('quiz.answeredCount', { count: answeredCount })}</span>
          </div>
        </div>
      </header>

      <!-- Compact Question Navigator with Legend -->
      <nav class="question-navigator" aria-label="${t('quiz.navigatorTitle')}">
        <div class="navigator-header">
          <span class="navigator-title">${t('quiz.navigatorTitle')}</span>
          <div class="navigator-legend">
            <div class="legend-item">
              <span class="legend-indicator unanswered" aria-hidden="true"></span>
              <span>${t('quiz.unanswered')}</span>
            </div>
            <div class="legend-item">
              <span class="legend-indicator current" aria-hidden="true"></span>
              <span>${t('quiz.current')}</span>
            </div>
            <div class="legend-item">
              <span class="legend-indicator answered" aria-hidden="true"></span>
              <span>${t('quiz.answered')}</span>
            </div>
          </div>
        </div>

        <!-- Horizontal wrap grid of numbered buttons -->
        <div class="quiz-nav-grid" role="tablist" aria-label="Questions list">
          ${questions.map((_, i) => {
            const isAnswered = answers[i] !== null;
            const isCurrent = i === current;
            let statusLabel = isAnswered ? 'answered' : 'unanswered';
            if (isCurrent) statusLabel += ', current';
            return `
              <button
                type="button"
                class="nav-dot ${isAnswered ? 'answered' : ''} ${isCurrent ? 'current' : ''}"
                aria-label="Question ${i + 1} (${statusLabel})"
                data-idx="${i}"
              >${i + 1}</button>
            `;
          }).join('')}
        </div>
      </nav>

      <!-- Active Question Box -->
      <article class="question-container" aria-live="polite">
        <div class="question-meta-row">
          <span class="question-badge">${t('quiz.questionBadge', { current: current + 1 })}</span>
          ${q.difficulty ? `<span class="badge badge-outline">${q.difficulty}</span>` : ''}
        </div>
        <h2 class="question-text">${q.question}</h2>

        <div class="options-list" role="radiogroup" aria-label="${t('quiz.optionsAria')}">
          ${q.options.map((opt, i) => {
            const isSelected = answers[current] === i;
            return `
              <label class="option-item ${isSelected ? 'selected' : ''}">
                <input
                  type="radio"
                  name="quiz-answer"
                  value="${i}"
                  ${isSelected ? 'checked' : ''}
                  aria-label="Option ${String.fromCharCode(65 + i)}: ${opt}"
                />
                <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + i)}</span>
                <span class="option-text">${opt}</span>
              </label>
            `;
          }).join('')}
        </div>
      </article>

      <!-- Controls Footer -->
      <footer class="quiz-footer">
        <div class="quiz-nav-btns">
          <button type="button" class="btn btn-outline" id="prev-btn" ${current === 0 ? 'disabled' : ''}>${t('quiz.prevBtn')}</button>
          <button type="button" class="btn btn-outline" id="next-btn" ${current === total - 1 ? 'disabled' : ''}>${t('quiz.nextBtn')}</button>
        </div>
        <button type="button" class="btn btn-primary" id="submit-btn">${t('quiz.submitBtn')}</button>
      </footer>
    </div>`;

  // Radio button selection
  container.querySelectorAll('input[name="quiz-answer"]').forEach(input => {
    input.addEventListener('change', () => {
      quizState.answers[quizState.current] = parseInt(input.value);
      // Update dot styles immediately
      const dots = container.querySelectorAll('.nav-dot');
      if (dots[quizState.current]) {
        dots[quizState.current].classList.add('answered');
      }
      // Update label selection
      container.querySelectorAll('.option-item').forEach(l => l.classList.remove('selected'));
      input.closest('.option-item').classList.add('selected');

      // Update counter
      const answeredNow = quizState.answers.filter(a => a !== null).length;
      const counterSub = container.querySelector('.counter-sub');
      if (counterSub) counterSub.textContent = t('quiz.answeredCount', { count: answeredNow });
    });
  });

  // Nav dots click
  container.querySelectorAll('.nav-dot').forEach(btn => {
    btn.addEventListener('click', () => {
      quizState.current = parseInt(btn.getAttribute('data-idx'));
      renderQuizQuestion(container);
    });
  });

  // Prev button
  document.getElementById('prev-btn')?.addEventListener('click', () => {
    if (quizState.current > 0) {
      quizState.current--;
      renderQuizQuestion(container);
    }
  });

  // Next button
  document.getElementById('next-btn')?.addEventListener('click', () => {
    if (quizState.current < quizState.questions.length - 1) {
      quizState.current++;
      renderQuizQuestion(container);
    }
  });

  // Submit button
  document.getElementById('submit-btn')?.addEventListener('click', () => {
    const unanswered = quizState.answers.filter(a => a === null).length;
    const msg = unanswered > 0
      ? t('quiz.confirmUnanswered', { count: unanswered })
      : t('quiz.confirmSubmit');
    if (confirm(msg)) {
      quizState.submitted = true;
      submitQuiz(container);
    }
  });
}

async function submitQuiz(container) {
  const { questions, answers, mode, id } = quizState;
  const { score, total, results } = scoreQuiz(questions, answers);

  // Save to IndexedDB history
  try {
    await recordResult({ mode, id, score, total });
  } catch (err) {
    console.warn('[Quiz] Could not save history:', err);
  }

  // Trigger achievement evaluation
  checkAchievements({ event: 'quiz_submitted', mode, id, score, total }).catch(err => {
    console.warn('[Achievements] Error on quiz submission:', err);
  });

  const pct = Math.round((score / total) * 100);
  const pass = pct >= 70;

  // Load lesson manifest for review links
  let lessonMap = {};
  try {
    const lm = await fetch(BASE_URL + 'materi/manifest.json').then(r => r.json());
    lm.lessons.forEach(l => { lessonMap[l.id] = l; });
  } catch {}

  container.innerHTML = `
    <div class="quiz-results">
      <!-- Results Header Box -->
      <div class="results-header">
        <div class="score-circle ${pass ? 'pass' : 'fail'}" aria-label="Score: ${pct}%">
          <span class="score-pct">${pct}%</span>
          <span class="score-label">${pass ? t('quiz.passBadge') : t('quiz.tryAgain')}</span>
        </div>
        <div class="results-summary">
          <h1>${pass ? t('quiz.congrats') : t('quiz.keepLearning')}</h1>
          <p class="score-detail">${t('quiz.scoreSummary', { score, total, pct })}</p>
          <p class="mode-detail">${getModeLabel(mode, id)}</p>
        </div>
      </div>

      <div class="results-actions">
        <button class="btn btn-primary" id="retry-btn">${t('quiz.retryQuiz')}</button>
        <a href="#/quiz" class="btn btn-outline">${t('quiz.backToCenter')}</a>
      </div>

      <!-- Detailed Review Section -->
      <section class="review-section" aria-label="Review of Answers">
        <h2>${t('quiz.detailedReview')}</h2>
        <div class="review-list">
          ${results.map((r, i) => {
            const lessonId = r.question.subchapterId;
            const lesson = lessonMap[lessonId];
            return `
              <div class="review-item ${r.isCorrect ? 'correct' : 'incorrect'}">
                <div class="review-header">
                  <span class="review-num">${t('quiz.reviewItemNum', { idx: i + 1, subId: r.question.subchapterId })}</span>
                  <span class="review-status ${r.isCorrect ? 'correct' : 'incorrect'}">
                    ${r.isCorrect ? t('quiz.correctLabel') : t('quiz.incorrectLabel')}
                  </span>
                </div>
                <p class="review-question">${r.question.question}</p>
                ${!r.isCorrect ? `
                <div class="review-answers">
                  <div class="review-answer your-answer">
                    <strong>${t('quiz.yourAnswer')}</strong>
                    ${r.givenAnswer !== null ? r.question.options[r.givenAnswer] : `<em>${t('quiz.notAnswered')}</em>`}
                  </div>
                  <div class="review-answer correct-answer">
                    <strong>${t('quiz.correctAnswer')}</strong> ${r.question.options[r.correctAnswer]}
                  </div>
                </div>` : ''}
                <div class="review-explanation">
                  <span class="explanation-title">${t('quiz.explanation')}</span>
                  <p>${r.question.explanation}</p>
                </div>
                ${lesson ? `
                  <a href="#/learn/${lessonId}" class="review-lesson-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    <span>${t('quiz.learnRelated', { title: lesson.title })}</span>
                  </a>` : ''}
              </div>`;
          }).join('')}
        </div>
      </section>
    </div>`;

  container.querySelectorAll('.review-lesson-link').forEach(link => {
    link.addEventListener('click', () => {
      recordQuizReviewed();
    });
  });

  if (results.some(r => !r.isCorrect)) {
    recordQuizReviewed();
  }

  document.getElementById('retry-btn')?.addEventListener('click', () => {
    navigate(`#/quiz/${quizState.mode}/${quizState.id}`);
  });
}

function getModeLabel(mode, id) {
  if (mode === 'master') return t('quiz.modeMaster');
  if (mode === QUIZ_MODES.CHAPTER) return t('quiz.modeChapter', { id });
  if (mode === QUIZ_MODES.SUBCHAPTER) return t('quiz.modeSubchapter', { id });
  return t('nav.quiz');
}

window.confirmLeave = () => {
  return quizState && !quizState.submitted ? confirm(t('quiz.confirmLeave')) : true;
};
