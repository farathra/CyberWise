// src/games/passwordDefender/passwordDefender.js
// Interactive Password Defender Simulation Game Engine
// Provides multi-mode account defense simulation: Password Strategy, Account Defense,
// and Incident Breach Response, with contextual feedback, scoring, and progress persistence.

import { PASSWORD_SCENARIOS } from './scenarios.js';
import { saveGameProgress, getGameProgress } from '../gamesData.js';
import { navigate } from '../../router.js';
import { t } from '../../i18n.js';

let gameState = null;

/**
 * Initializes a new Password Defender game session or resumes
 */
export function startPasswordDefenderGame(container) {
  gameState = {
    scenarios: PASSWORD_SCENARIOS,
    currentIndex: 0,
    currentScore: 0,
    selectedOption: null,
    isSubmitted: false,
    history: []
  };

  renderCurrentScenario(container);
}

/**
 * Renders the active scenario in the security console
 */
function renderCurrentScenario(container) {
  if (!gameState) return;

  const { scenarios, currentIndex, currentScore, selectedOption, isSubmitted } = gameState;

  if (currentIndex >= scenarios.length) {
    renderFinalReport(container);
    return;
  }

  const scenario = scenarios[currentIndex];
  const totalScenarios = scenarios.length;
  const isLastScenario = currentIndex === totalScenarios - 1;

  // Determine Mode text and subtitle
  let modeTitleKey = 'games.pd.modeA';
  let modeSubKey = 'games.pd.modeSubA';
  let modeBadgeClass = 'mode-a';

  if (scenario.mode === 'mode-b') {
    modeTitleKey = 'games.pd.modeB';
    modeSubKey = 'games.pd.modeSubB';
    modeBadgeClass = 'mode-b';
  } else if (scenario.mode === 'mode-c') {
    modeTitleKey = 'games.pd.modeC';
    modeSubKey = 'games.pd.modeSubC';
    modeBadgeClass = 'mode-c';
  }

  container.innerHTML = `
    <div class="game-session password-defender-view animate-fade-in">
      <!-- Session Header Bar -->
      <header class="game-header-bar">
        <div class="game-header-left">
          <a href="#/games" class="btn btn-ghost btn-sm" id="game-exit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>${t('games.backToHub')}</span>
          </a>
          <span class="game-mode-badge">${t('games.pd.title')}</span>
          <span class="pd-mode-pill ${modeBadgeClass}">${t(modeTitleKey)}</span>
        </div>
        <div class="game-header-right">
          <span class="game-progress-pill">${t('games.pd.scenarioProgress', { current: currentIndex + 1, total: totalScenarios })}</span>
          <span class="game-score-pill">⭐ ${t('games.ct.scoreLabel')} <strong>${currentScore}</strong></span>
        </div>
      </header>

      <!-- 3-Mode Visual Navigator Tabs -->
      <nav class="pd-mode-navigator" aria-label="Game Modes">
        <div class="mode-nav-step ${scenario.mode === 'mode-a' ? 'active' : ''}">
          <span class="step-num">A</span>
          <div class="step-meta">
            <strong>${t('games.pd.modeA')}</strong>
            <small>Skenario 1–3</small>
          </div>
        </div>
        <div class="mode-nav-step ${scenario.mode === 'mode-b' ? 'active' : ''}">
          <span class="step-num">B</span>
          <div class="step-meta">
            <strong>${t('games.pd.modeB')}</strong>
            <small>Skenario 4–6</small>
          </div>
        </div>
        <div class="mode-nav-step ${scenario.mode === 'mode-c' ? 'active' : ''}">
          <span class="step-num">C</span>
          <div class="step-meta">
            <strong>${t('games.pd.modeC')}</strong>
            <small>Skenario 7–10</small>
          </div>
        </div>
      </nav>

      <!-- Main Security Console Client Frame -->
      <main class="security-console-frame" aria-label="Account Security Console">
        <!-- Console Header & Scenario Dossier -->
        <header class="console-header">
          <div class="console-meta-line">
            <span class="console-scenario-num">#${currentIndex + 1}</span>
            <h2 class="console-title">${escapeHtml(scenario.title)}</h2>
          </div>
          <p class="console-mode-desc">${t(modeSubKey)}</p>
        </header>

        <!-- Account Target Card -->
        <section class="console-account-card">
          <div class="account-card-header">
            <div class="account-icon">🛡️</div>
            <div class="account-name-group">
              <span class="account-label">${t('games.pd.accountInspect')}</span>
              <strong class="account-title">${escapeHtml(scenario.account.name)}</strong>
              <span class="account-type-tag">${escapeHtml(scenario.account.type)}</span>
            </div>
          </div>

          <div class="account-status-grid">
            <div class="status-box current-state">
              <span class="box-label">${t('games.pd.currentConfig')}</span>
              <p class="box-desc">${escapeHtml(scenario.account.initialConfig)}</p>
            </div>
            <div class="status-box incident-alert">
              <span class="box-label">${t('games.pd.incidentAlert')}</span>
              <p class="box-desc">${escapeHtml(scenario.account.alertOrDiscovery)}</p>
            </div>
          </div>

          <!-- Observable Evidence List -->
          <div class="console-evidence-box">
            <span class="evidence-box-label">🔍 Bukti & Fakta Pengamatan:</span>
            <ul class="console-evidence-list">
              ${scenario.evidence.map(ev => `<li>${escapeHtml(ev)}</li>`).join('')}
            </ul>
          </div>
        </section>

        <!-- Interactive Decision Point -->
        ${!isSubmitted ? `
          <section class="console-decision-section animate-fade-in" aria-label="${t('games.pd.decisionTitle')}">
            <div class="decision-intro">
              <h3 class="decision-heading">${t('games.pd.decisionTitle')}</h3>
              <p class="decision-sub">${t('games.pd.decisionSub')}</p>
            </div>

            <div class="console-options-list" role="radiogroup" aria-label="${t('games.pd.decisionTitle')}">
              ${scenario.options.map(opt => {
                const isSelected = selectedOption === opt.id;
                return `
                  <label class="console-option-card ${isSelected ? 'active' : ''}">
                    <input
                      type="radio"
                      name="pd-action"
                      class="console-radio-input"
                      value="${opt.id}"
                      ${isSelected ? 'checked' : ''}
                    />
                    <div class="option-content">
                      <span class="option-text">${escapeHtml(opt.text)}</span>
                    </div>
                  </label>
                `;
              }).join('')}
            </div>

            <div class="decision-action-row">
              <button type="button" class="btn btn-primary btn-lg" id="submit-pd-btn">
                ${t('games.pd.submitDecision')}
              </button>
            </div>
          </section>
        ` : ''}

        <!-- Post-Decision Feedback Panel -->
        ${isSubmitted ? renderDecisionFeedback(scenario, isLastScenario) : ''}
      </main>
    </div>
  `;

  attachConsoleEventListeners(container, scenario);
}

/**
 * Renders the feedback panel after player submits action
 */
function renderDecisionFeedback(scenario, isLastScenario) {
  const lastResult = gameState.history[gameState.history.length - 1];
  const safety = lastResult ? lastResult.safety : 'hazardous';
  const earnedScore = lastResult ? lastResult.earnedScore : 0;
  const chosenOpt = scenario.options.find(o => o.id === lastResult?.selectedOption);

  let statusBadgeClass = 'fail';
  let statusText = t('games.pd.hazardousResult');

  if (safety === 'optimal') {
    statusBadgeClass = 'pass';
    statusText = t('games.pd.optimalResult');
  } else if (safety === 'adequate') {
    statusBadgeClass = 'caution';
    statusText = t('games.pd.adequateResult');
  }

  return `
    <section class="console-feedback-panel animate-fade-in ${safety}" aria-live="polite">
      <div class="feedback-header">
        <div class="feedback-status-badge ${statusBadgeClass}">
          ${statusText}
        </div>
        <div class="feedback-points-tag">${t('games.ed.pointsEarned', { pts: earnedScore })}</div>
      </div>

      <div class="feedback-content-block">
        <!-- Outcome Box -->
        <div class="feedback-outcome-box">
          <h4>${t('games.pd.outcomeTitle')}</h4>
          <p>${escapeHtml(chosenOpt?.outcome || '')}</p>
        </div>

        <!-- Security Principle Box -->
        <div class="feedback-principle-box">
          <h4>🛡️ ${t('games.pd.principleTitle')}</h4>
          <p>${escapeHtml(scenario.principle)}</p>
        </div>

        <!-- Real World Recommendation -->
        <div class="feedback-recommendation-box">
          <h4>💡 ${t('games.pd.actionAdviceTitle')}</h4>
          <p>${escapeHtml(scenario.remediation)}</p>
        </div>
      </div>

      <div class="feedback-action-row">
        <button type="button" class="btn btn-primary btn-lg" id="next-scenario-btn">
          ${isLastScenario ? t('games.pd.finishGame') : t('games.pd.nextScenario')}
        </button>
      </div>
    </section>
  `;
}

/**
 * Attaches console interaction listeners
 */
function attachConsoleEventListeners(container, scenario) {
  // Radio option selection
  container.querySelectorAll('.console-radio-input').forEach(radio => {
    radio.addEventListener('change', () => {
      gameState.selectedOption = radio.value;
      container.querySelectorAll('.console-option-card').forEach(card => card.classList.remove('active'));
      radio.closest('.console-option-card')?.classList.add('active');
    });
  });

  // Submit action
  container.querySelector('#submit-pd-btn')?.addEventListener('click', () => {
    if (!gameState.selectedOption) {
      alert(t('games.pd.pleaseSelect'));
      return;
    }

    const chosen = scenario.options.find(o => o.id === gameState.selectedOption);
    const score = chosen ? chosen.score : 0;
    const safety = chosen ? chosen.safety : 'hazardous';
    const isCorrect = safety === 'optimal';

    gameState.currentScore += score;
    gameState.isSubmitted = true;

    gameState.history.push({
      scenarioId: scenario.id,
      mode: scenario.mode,
      difficulty: scenario.difficulty,
      selectedOption: gameState.selectedOption,
      safety,
      isCorrect,
      earnedScore: score,
      relatedLessonId: scenario.relatedLessonId,
      conceptKey: scenario.conceptKey
    });

    renderCurrentScenario(container);

    const feedbackEl = container.querySelector('.console-feedback-panel');
    if (feedbackEl) {
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Next scenario
  container.querySelector('#next-scenario-btn')?.addEventListener('click', () => {
    gameState.currentIndex++;
    gameState.selectedOption = null;
    gameState.isSubmitted = false;
    renderCurrentScenario(container);
  });
}

/**
 * Renders the final Password Defender audit report
 */
function renderFinalReport(container) {
  const { currentScore, history, scenarios } = gameState;
  const totalScenarios = scenarios.length;
  const optimalCount = history.filter(h => h.isCorrect).length;
  const accuracyPct = Math.round((optimalCount / totalScenarios) * 100);

  // Mode Performance Breakdown
  const modeAHistory = history.filter(h => h.mode === 'mode-a');
  const modeBHistory = history.filter(h => h.mode === 'mode-b');
  const modeCHistory = history.filter(h => h.mode === 'mode-c');

  const modeAScore = modeAHistory.filter(h => h.isCorrect).length;
  const modeBScore = modeBHistory.filter(h => h.isCorrect).length;
  const modeCScore = modeCHistory.filter(h => h.isCorrect).length;

  // Concepts breakdown
  const masteredConcepts = new Set();
  const practiceConcepts = new Set();
  const missedLessons = new Set();

  history.forEach(h => {
    if (h.isCorrect) {
      masteredConcepts.add(h.conceptKey);
    } else {
      practiceConcepts.add(h.conceptKey);
      if (h.relatedLessonId) {
        missedLessons.add(h.relatedLessonId);
      }
    }
  });

  // Determine Rank
  let rankKey = 'games.pd.rankNovice';
  let reviewKey = 'games.pd.reviewPractice';

  if (accuracyPct >= 80 && currentScore >= 800) {
    rankKey = 'games.pd.rankMaster';
    reviewKey = 'games.pd.reviewPerfect';
  } else if (accuracyPct >= 60) {
    rankKey = 'games.pd.rankDefender';
    reviewKey = 'games.pd.reviewGood';
  } else if (accuracyPct >= 40) {
    rankKey = 'games.pd.rankOperator';
    reviewKey = 'games.pd.reviewPractice';
  }

  // Persist game progress locally
  saveGameProgress('password-defender', {
    score: currentScore,
    accuracyPct,
    correctCount: optimalCount,
    totalScenarios,
    completed: true,
    rankKey,
    modeAScore: `${modeAScore}/${modeAHistory.length}`,
    modeBScore: `${modeBScore}/${modeBHistory.length}`,
    modeCScore: `${modeCScore}/${modeCHistory.length}`
  });

  // Fallback recommended lesson if none missed
  if (missedLessons.size === 0) {
    missedLessons.add('4-a');
  }

  const lessonTitles = {
    '1-a': 'Pengertian Keamanan Digital',
    '1-b': 'Definisi Keamanan Data dan Informasi',
    '1-c': 'Perbedaan Data dan Informasi',
    '2-a': 'Definisi Teknologi Digital',
    '2-b': 'Peran Teknologi Digital & Phishing',
    '2-c': 'Perkembangan Teknologi Digital',
    '2-d': 'Dampak Positif dan Negatif',
    '2-e': 'Cara Mengatasi Dampak Negatif',
    '3-a': 'Pengertian Malware',
    '3-b': 'Jenis-Jenis Malware',
    '3-c': 'Cara Penyebaran Malware & APK',
    '3-d': 'Studi Kasus Malware',
    '4-a': 'Prinsip Dasar Keamanan Data & 2FA',
    '4-b': 'Teknik dan Strategi Penggunaan Data'
  };

  container.innerHTML = `
    <div class="game-report-view animate-fade-in">
      <header class="report-header">
        <span class="report-badge">🏆 ${t('games.pd.reportTitle')}</span>
        <h1 class="report-title">${t(rankKey)}</h1>
        <div class="report-score-banner">
          <span class="score-number">${currentScore}</span>
          <span class="score-sub">${t('games.ed.maxScore', { score: currentScore, max: totalScenarios * 100 })}</span>
        </div>
      </header>

      <!-- Overall and 3-Mode Breakdown Stats -->
      <section class="report-stats-grid">
        <div class="stat-card">
          <span class="stat-label">${t('games.pd.modeAScore')}</span>
          <strong class="stat-value pass">${modeAScore} / ${modeAHistory.length}</strong>
          <small>Strategi Kata Sandi</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">${t('games.pd.modeBScore')}</span>
          <strong class="stat-value ${modeBScore >= 2 ? 'pass' : 'fail'}">${modeBScore} / ${modeBHistory.length}</strong>
          <small>Pertahanan Akun & 2FA</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">${t('games.pd.modeCScore')}</span>
          <strong class="stat-value ${modeCScore >= 3 ? 'pass' : 'fail'}">${modeCScore} / ${modeCHistory.length}</strong>
          <small>Respons Insiden & Mitigasi</small>
        </div>
      </section>

      <!-- Concepts Analysis Card -->
      <section class="report-summary-card">
        <h3>${t('games.ed.performanceReview')}</h3>
        <p>${t(reviewKey)}</p>

        <div class="concepts-analysis-grid">
          <div class="concept-col mastered">
            <h4>✅ ${t('games.ct.conceptsMastered')}</h4>
            <ul>
              ${Array.from(masteredConcepts).map(c => `<li>${escapeHtml(c)}</li>`).join('') || '<em>(Terus berlatih!)</em>'}
            </ul>
          </div>
          <div class="concept-col practice">
            <h4>💡 ${t('games.ct.conceptsPractice')}</h4>
            <ul>
              ${Array.from(practiceConcepts).map(c => `<li>${escapeHtml(c)}</li>`).join('') || '<em>(Luar biasa! Seluruh konsep dikuasai!)</em>'}
            </ul>
          </div>
        </div>
      </section>

      <!-- Recommended Lessons -->
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
          🔄 ${t('games.pd.replayBtn')}
        </button>
        <a href="#/games" class="btn btn-outline btn-lg">
          ${t('games.pd.hubBtn')}
        </a>
      </footer>
    </div>
  `;

  container.querySelector('#replay-game-btn')?.addEventListener('click', () => {
    startPasswordDefenderGame(container);
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
