// src/games/emailDetective/emailDetective.js
// Interactive Email Detective Simulation Game Engine
// Provides realistic inbox inspection, safe link analysis, evidence collection,
// scoring, real-world defensive feedback, and progress persistence.

import { EMAIL_SCENARIOS } from './scenarios.js';
import { saveGameProgress, getGameProgress } from '../gamesData.js';
import { navigate } from '../../router.js';
import { t } from '../../i18n.js';

let gameState = null;

/**
 * Initializes a new game session or resumes
 */
export function startEmailDetectiveGame(container) {
  gameState = {
    scenarios: EMAIL_SCENARIOS,
    currentIndex: 0,
    currentScore: 0,
    selectedVerdict: null,
    selectedClues: new Set(),
    isSubmitted: false,
    senderDetailsOpen: false,
    activeLinkIndex: null,
    history: []
  };

  renderCurrentScenario(container);
}

/**
 * Renders the active scenario view
 */
function renderCurrentScenario(container) {
  if (!gameState) return;

  const { scenarios, currentIndex, currentScore, selectedVerdict, selectedClues, isSubmitted, senderDetailsOpen, activeLinkIndex } = gameState;

  // If completed all scenarios, render final report
  if (currentIndex >= scenarios.length) {
    renderFinalReport(container);
    return;
  }

  const scenario = scenarios[currentIndex];
  const totalScenarios = scenarios.length;
  const isLastScenario = currentIndex === totalScenarios - 1;

  const senderInitial = (scenario.senderName || 'S').trim().charAt(0).toUpperCase();

  container.innerHTML = `
    <div class="game-session email-detective-view">
      <!-- Session Header Bar -->
      <header class="game-header-bar">
        <div class="game-header-left">
          <a href="#/games" class="btn btn-ghost btn-sm" id="game-exit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>${t('games.backToHub')}</span>
          </a>
          <span class="game-mode-badge">${t('games.ed.title')}</span>
        </div>
        <div class="game-header-right">
          <span class="game-progress-pill">${t('games.ed.scenarioProgress', { current: currentIndex + 1, total: totalScenarios })}</span>
          <span class="game-score-pill">⭐ ${t('games.ed.scoreLabel')} <strong>${currentScore}</strong></span>
        </div>
      </header>

      <!-- Fictional Simulation Notice Banner -->
      <div class="simulation-banner" role="status">
        <div class="sim-banner-icon">🛡️</div>
        <div class="sim-banner-text">
          <strong>${t('games.ed.inboxBadge')}:</strong> ${t('games.ed.simulationNotice')}
        </div>
      </div>

      <!-- Main Email Client Frame -->
      <main class="email-client-frame" aria-label="Simulated Email Message">
        <!-- Email Meta Header -->
        <section class="email-meta-header">
          <div class="email-subject-line">
            <h2>${escapeHtml(scenario.subject)}</h2>
          </div>

          <div class="email-sender-card">
            <div class="sender-avatar" aria-hidden="true">${senderInitial}</div>
            <div class="sender-main-info">
              <div class="sender-primary-line">
                <span class="sender-display-name">${escapeHtml(scenario.senderName)}</span>
                <span class="sender-email-address">&lt;${escapeHtml(scenario.senderEmail)}&gt;</span>
              </div>
              <div class="sender-secondary-line">
                <span class="email-recipient-info">${t('games.ed.to')} ${escapeHtml(scenario.recipientEmail)}</span>
                <span class="email-date-info">${escapeHtml(scenario.date)}</span>
              </div>
            </div>

            <button type="button" class="btn btn-outline btn-sm sender-toggle-btn" id="toggle-sender-details">
              ${senderDetailsOpen ? t('games.ed.hideSender') : t('games.ed.inspectSender')}
            </button>
          </div>

          <!-- Expanded Sender Details Panel -->
          ${senderDetailsOpen ? `
            <div class="sender-inspection-panel animate-fade-in" id="sender-inspection-panel">
              <div class="inspection-field">
                <strong>${t('games.ed.from')}</strong>
                <span>${escapeHtml(scenario.senderName)}</span>
              </div>
              <div class="inspection-field">
                <strong>Email:</strong>
                <code>${escapeHtml(scenario.senderEmail)}</code>
              </div>
              <div class="inspection-field">
                <strong>${t('games.ed.domain')}</strong>
                <code class="domain-tag">${escapeHtml(scenario.senderEmail.split('@')[1] || '')}</code>
              </div>
              <div class="inspection-field">
                <strong>${t('games.ed.date')}</strong>
                <span>${escapeHtml(scenario.date)}</span>
              </div>
            </div>
          ` : ''}
        </section>

        <!-- Email Body -->
        <article class="email-body-content">
          ${scenario.bodyHtml}
        </article>

        <!-- Attachment Box if present -->
        ${scenario.attachments ? `
          <section class="email-attachment-box" aria-label="${t('games.ed.attachment')}">
            <div class="attachment-icon">📎</div>
            <div class="attachment-details">
              <div class="attachment-name">
                <strong>${escapeHtml(scenario.attachments.fileName)}</strong>
                <span class="attachment-size">(${escapeHtml(scenario.attachments.fileSize)})</span>
              </div>
              <div class="attachment-warning-tag">${t('games.ed.attachmentWarning')}</div>
            </div>
          </section>
        ` : ''}

        <!-- Interactive Safe Link Inspector Modal / Panel -->
        ${activeLinkIndex !== null && scenario.links[activeLinkIndex] ? `
          <section class="safe-link-inspector animate-fade-in" id="link-inspector-box" aria-live="polite">
            <div class="inspector-header">
              <span class="inspector-title">${t('games.ed.linkInspectorTitle')}</span>
              <button type="button" class="btn-icon close-inspector-btn" id="close-inspector-btn" aria-label="Close link inspector">✕</button>
            </div>
            <div class="inspector-body">
              <div class="inspector-row">
                <span class="inspector-label">${t('games.ed.linkText')}</span>
                <span class="inspector-val">${escapeHtml(scenario.links[activeLinkIndex].text)}</span>
              </div>
              <div class="inspector-row">
                <span class="inspector-label">${t('games.ed.linkDestination')}</span>
                <code class="inspector-url ${scenario.links[activeLinkIndex].isSuspicious ? 'suspicious' : 'safe'}">
                  ${escapeHtml(scenario.links[activeLinkIndex].actualDestination)}
                </code>
              </div>
              <p class="inspector-explanation">${escapeHtml(scenario.links[activeLinkIndex].explanation)}</p>
              <div class="inspector-inert-notice">
                ℹ️ ${t('games.ed.linkNotice')}
              </div>
            </div>
          </section>
        ` : ''}

        <!-- Evidence Checklist -->
        <section class="investigation-evidence-section" aria-label="${t('games.ed.evidenceTitle')}">
          <div class="evidence-header">
            <h3>${t('games.ed.evidenceTitle')}</h3>
            <span class="evidence-bonus-badge">${t('games.ed.evidenceBonus', { pts: 25 })}</span>
          </div>
          <div class="evidence-checklist-grid">
            ${scenario.clues.map(clue => {
              const isChecked = selectedClues.has(clue.id);
              return `
                <label class="evidence-item ${isChecked ? 'selected' : ''} ${isSubmitted ? 'disabled' : ''}">
                  <input
                    type="checkbox"
                    class="evidence-checkbox"
                    data-clue-id="${clue.id}"
                    ${isChecked ? 'checked' : ''}
                    ${isSubmitted ? 'disabled' : ''}
                  />
                  <span class="evidence-text">${escapeHtml(clue.text)}</span>
                </label>
              `;
            }).join('')}
          </div>
        </section>

        <!-- Decision Toolbar -->
        ${!isSubmitted ? `
          <section class="decision-section" aria-label="${t('games.ed.decisionTitle')}">
            <h3 class="decision-heading">${t('games.ed.decisionTitle')}</h3>
            <div class="verdict-options-grid" role="radiogroup" aria-label="${t('games.ed.decisionTitle')}">
              <button
                type="button"
                class="verdict-btn legit ${selectedVerdict === 'legitimate' ? 'active' : ''}"
                data-verdict="legitimate"
                role="radio"
                aria-checked="${selectedVerdict === 'legitimate' ? 'true' : 'false'}"
              >
                ${t('games.ed.verdictLegit')}
              </button>
              <button
                type="button"
                class="verdict-btn suspicious ${selectedVerdict === 'suspicious' ? 'active' : ''}"
                data-verdict="suspicious"
                role="radio"
                aria-checked="${selectedVerdict === 'suspicious' ? 'true' : 'false'}"
              >
                ${t('games.ed.verdictSuspicious')}
              </button>
              <button
                type="button"
                class="verdict-btn phishing ${selectedVerdict === 'phishing' ? 'active' : ''}"
                data-verdict="phishing"
                role="radio"
                aria-checked="${selectedVerdict === 'phishing' ? 'true' : 'false'}"
              >
                ${t('games.ed.verdictPhishing')}
              </button>
            </div>

            <div class="decision-action-row">
              <button type="button" class="btn btn-primary btn-lg" id="submit-verdict-btn">
                ${t('games.ed.submitDecision')}
              </button>
            </div>
          </section>
        ` : ''}

        <!-- Post-Submission Feedback Panel -->
        ${isSubmitted ? renderFeedbackPanel(scenario, isLastScenario) : ''}
      </main>
    </div>
  `;

  attachGameEventListeners(container, scenario);
}

/**
 * Renders the feedback panel after verdict submission
 */
function renderFeedbackPanel(scenario, isLastScenario) {
  const lastResult = gameState.history[gameState.history.length - 1];
  const isCorrect = lastResult ? lastResult.isCorrect : false;
  const earned = lastResult ? lastResult.earnedScore : 0;

  const verdictLabelMap = {
    legitimate: t('games.ed.verdictLegit'),
    suspicious: t('games.ed.verdictSuspicious'),
    phishing: t('games.ed.verdictPhishing')
  };

  return `
    <section class="feedback-panel animate-fade-in ${isCorrect ? 'correct' : 'incorrect'}" aria-live="polite">
      <div class="feedback-header">
        <div class="feedback-status-badge ${isCorrect ? 'pass' : 'fail'}">
          ${isCorrect ? t('games.ed.correctVerdict') : t('games.ed.incorrectVerdict')}
        </div>
        <div class="feedback-points-tag">${t('games.ed.pointsEarned', { pts: earned })}</div>
      </div>

      <div class="feedback-content-block">
        <div class="feedback-verdict-row">
          <span class="feedback-label">${t('games.ed.trueClassification')}</span>
          <strong class="verdict-pill ${scenario.classification}">
            ${verdictLabelMap[scenario.classification] || scenario.classification}
          </strong>
        </div>

        <div class="feedback-explanation-box">
          <h4>${t('games.ed.explanationTitle')}</h4>
          <p>${escapeHtml(scenario.explanation)}</p>
        </div>

        <div class="feedback-clues-analysis">
          <div class="clues-caught-col">
            <h5>✅ ${t('games.ed.cluesCaught')}</h5>
            <ul>
              ${scenario.clues.filter(c => gameState.selectedClues.has(c.id)).map(c => `
                <li>${escapeHtml(c.text)}</li>
              `).join('') || '<em>(Tidak ada bukti yang dicentang)</em>'}
            </ul>
          </div>
          <div class="clues-missed-col">
            <h5>⚠️ ${t('games.ed.cluesMissed')}</h5>
            <ul>
              ${scenario.clues.filter(c => !gameState.selectedClues.has(c.id)).map(c => `
                <li>${escapeHtml(c.text)}</li>
              `).join('') || '<em>(Hebat! Semua bukti terungkap!)</em>'}
            </ul>
          </div>
        </div>

        <div class="feedback-recommendation-box">
          <h4>💡 ${t('games.ed.recommendationTitle')}</h4>
          <p>${escapeHtml(scenario.recommendation)}</p>
        </div>
      </div>

      <div class="feedback-action-row">
        <button type="button" class="btn btn-primary btn-lg" id="next-scenario-btn">
          ${isLastScenario ? t('games.ed.finishGame') : t('games.ed.nextEmail')}
        </button>
      </div>
    </section>
  `;
}

/**
 * Attaches user interaction listeners for active scenario
 */
function attachGameEventListeners(container, scenario) {
  // 1. Toggle sender details
  container.querySelector('#toggle-sender-details')?.addEventListener('click', () => {
    gameState.senderDetailsOpen = !gameState.senderDetailsOpen;
    renderCurrentScenario(container);
  });

  // 2. Safe Link inspector trigger
  container.querySelectorAll('.simulated-link-trigger').forEach(linkEl => {
    linkEl.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(linkEl.getAttribute('data-link-idx'), 10);
      gameState.activeLinkIndex = idx;
      renderCurrentScenario(container);
      const inspector = document.getElementById('link-inspector-box');
      if (inspector) {
        inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  });

  // 3. Close safe link inspector
  container.querySelector('#close-inspector-btn')?.addEventListener('click', () => {
    gameState.activeLinkIndex = null;
    renderCurrentScenario(container);
  });

  // 4. Evidence checklist changes
  container.querySelectorAll('.evidence-checkbox').forEach(chk => {
    chk.addEventListener('change', () => {
      const clueId = chk.getAttribute('data-clue-id');
      if (chk.checked) {
        gameState.selectedClues.add(clueId);
      } else {
        gameState.selectedClues.delete(clueId);
      }
      chk.closest('.evidence-item')?.classList.toggle('selected', chk.checked);
    });
  });

  // 5. Verdict button clicks
  container.querySelectorAll('.verdict-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      gameState.selectedVerdict = btn.getAttribute('data-verdict');
      container.querySelectorAll('.verdict-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
    });
  });

  // 6. Submit verdict
  container.querySelector('#submit-verdict-btn')?.addEventListener('click', () => {
    if (!gameState.selectedVerdict) {
      alert(t('games.ed.pleaseSelect'));
      return;
    }

    const isCorrect = gameState.selectedVerdict === scenario.classification;
    let scenarioScore = 0;

    // +100 points for correct verdict
    if (isCorrect) {
      scenarioScore += 100;
    }

    // +25 points for each identified clue
    scenario.clues.forEach(c => {
      if (gameState.selectedClues.has(c.id)) {
        scenarioScore += (c.points || 25);
      }
    });

    gameState.currentScore += scenarioScore;
    gameState.isSubmitted = true;

    gameState.history.push({
      scenarioId: scenario.id,
      userVerdict: gameState.selectedVerdict,
      correctVerdict: scenario.classification,
      isCorrect,
      selectedClues: Array.from(gameState.selectedClues),
      earnedScore: scenarioScore,
      relatedLessonId: scenario.relatedLessonId
    });

    renderCurrentScenario(container);

    const feedbackEl = container.querySelector('.feedback-panel');
    if (feedbackEl) {
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // 7. Next scenario button
  container.querySelector('#next-scenario-btn')?.addEventListener('click', () => {
    gameState.currentIndex++;
    gameState.selectedVerdict = null;
    gameState.selectedClues = new Set();
    gameState.isSubmitted = false;
    gameState.senderDetailsOpen = false;
    gameState.activeLinkIndex = null;
    renderCurrentScenario(container);
  });
}

/**
 * Renders the final detective investigation report
 */
function renderFinalReport(container) {
  const { currentScore, history, scenarios } = gameState;
  const totalScenarios = scenarios.length;
  const correctCount = history.filter(h => h.isCorrect).length;
  const accuracyPct = Math.round((correctCount / totalScenarios) * 100);

  // Calculate total clues found
  let totalCluesCount = 0;
  let foundCluesCount = 0;
  scenarios.forEach(sc => {
    totalCluesCount += sc.clues.length;
  });
  history.forEach(h => {
    foundCluesCount += (h.selectedClues || []).length;
  });

  // Determine Detective Rank
  let rankKey = 'games.ed.rankCadet';
  let reviewKey = 'games.ed.reviewPractice';

  if (accuracyPct >= 80 && currentScore >= 800) {
    rankKey = 'games.ed.rankSenior';
    reviewKey = 'games.ed.reviewPerfect';
  } else if (accuracyPct >= 60) {
    rankKey = 'games.ed.rankInvestigator';
    reviewKey = 'games.ed.reviewGood';
  } else if (accuracyPct >= 40) {
    rankKey = 'games.ed.rankJunior';
    reviewKey = 'games.ed.reviewPractice';
  }

  // Persist game progress locally
  saveGameProgress('email-detective', {
    score: currentScore,
    accuracyPct,
    correctCount,
    totalScenarios,
    completed: true,
    rankKey
  });

  // Gather recommended lessons from missed scenarios
  const missedLessons = new Set();
  history.forEach(h => {
    if (!h.isCorrect && h.relatedLessonId) {
      missedLessons.add(h.relatedLessonId);
    }
  });

  // If perfect score, recommend chapter 2 review
  if (missedLessons.size === 0) {
    missedLessons.add('2-b');
  }

  const lessonTitles = {
    '1-a': 'Pengertian Keamanan Digital',
    '1-b': 'Definisi Keamanan Data dan Informasi',
    '2-a': 'Definisi Teknologi Digital',
    '2-b': 'Peran Teknologi Digital & Mengenal Phishing',
    '3-b': 'Jenis-Jenis Malware & Lampiran Berbahaya',
    '4-a': 'Prinsip Dasar Keamanan & Autentikasi 2FA'
  };

  container.innerHTML = `
    <div class="game-report-view animate-fade-in">
      <header class="report-header">
        <span class="report-badge">🏆 ${t('games.ed.reportTitle')}</span>
        <h1 class="report-title">${t(rankKey)}</h1>
        <div class="report-score-banner">
          <span class="score-number">${currentScore}</span>
          <span class="score-sub">${t('games.ed.maxScore', { score: currentScore, max: totalScenarios * 200 })}</span>
        </div>
      </header>

      <section class="report-stats-grid">
        <div class="stat-card">
          <span class="stat-label">${t('games.ed.accuracy')}</span>
          <strong class="stat-value ${accuracyPct >= 70 ? 'pass' : 'fail'}">${accuracyPct}%</strong>
          <small>${correctCount} / ${totalScenarios} email benar</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">${t('games.ed.evidenceDiscovered')}</span>
          <strong class="stat-value">${foundCluesCount} / ${totalCluesCount}</strong>
          <small>bukti diidentifikasi</small>
        </div>
      </section>

      <section class="report-summary-card">
        <h3>${t('games.ed.performanceReview')}</h3>
        <p>${t(reviewKey)}</p>
      </section>

      ${missedLessons.size > 0 ? `
        <section class="report-lessons-card">
          <h3>📚 ${t('games.ed.recommendedLessons')}</h3>
          <div class="recommended-lessons-list">
            ${Array.from(missedLessons).map(lId => `
              <a href="#/learn/${lId}" class="recommended-lesson-pill" title="Pelajari materi ${lId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                <span>${t('games.ed.openLesson', { title: `${lId}: ${lessonTitles[lId] || 'Materi'}` })}</span>
              </a>
            `).join('')}
          </div>
        </section>
      ` : ''}

      <footer class="report-actions-row">
        <button type="button" class="btn btn-primary btn-lg" id="replay-game-btn">
          🔄 ${t('games.ed.replayBtn')}
        </button>
        <a href="#/games" class="btn btn-outline btn-lg">
          ${t('games.ed.hubBtn')}
        </a>
      </footer>
    </div>
  `;

  container.querySelector('#replay-game-btn')?.addEventListener('click', () => {
    startEmailDetectiveGame(container);
  });
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
