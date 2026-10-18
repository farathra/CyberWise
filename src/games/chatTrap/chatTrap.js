// src/games/chatTrap/chatTrap.js
// Interactive Chat Trap Simulation Game Engine
// Provides message-by-message chat progression, contact dossier inspection,
// contextual decision points, defensive feedback, scoring, and progress persistence.

import { CHAT_SCENARIOS } from './scenarios.js';
import { saveGameProgress, getGameProgress } from '../gamesData.js';
import { navigate } from '../../router.js';
import { t } from '../../i18n.js';

let gameState = null;

/**
 * Initializes a new Chat Trap game session or resumes
 */
export function startChatTrapGame(container) {
  gameState = {
    scenarios: CHAT_SCENARIOS,
    currentIndex: 0,
    currentScore: 0,
    revealedCount: 1, // Start by revealing first message
    profileOpen: false,
    selectedOption: null,
    isSubmitted: false,
    history: []
  };

  renderCurrentScenario(container);
}

/**
 * Renders the active chat scenario
 */
function renderCurrentScenario(container) {
  if (!gameState) return;

  const { scenarios, currentIndex, currentScore, revealedCount, profileOpen, selectedOption, isSubmitted } = gameState;

  if (currentIndex >= scenarios.length) {
    renderFinalReport(container);
    return;
  }

  const scenario = scenarios[currentIndex];
  const totalScenarios = scenarios.length;
  const isLastScenario = currentIndex === totalScenarios - 1;
  const allMessagesRevealed = revealedCount >= scenario.messages.length;

  const diffLabel = scenario.difficulty === 'beginner' 
    ? t('games.ct.diffBeginner') 
    : t('games.ct.diffIntermediate');

  const statusLabel = scenario.contact.statusType === 'online'
    ? t('games.ct.statusOnline')
    : scenario.contact.statusType === 'official'
    ? t('games.ct.statusOfficial')
    : t('games.ct.statusUnknown');

  container.innerHTML = `
    <div class="game-session chat-trap-view animate-fade-in">
      <!-- Session Header Bar -->
      <header class="game-header-bar">
        <div class="game-header-left">
          <a href="#/games" class="btn btn-ghost btn-sm" id="game-exit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>${t('games.backToHub')}</span>
          </a>
          <span class="game-mode-badge">${t('games.ct.title')}</span>
          <span class="chat-diff-pill ${scenario.difficulty}">${diffLabel}</span>
        </div>
        <div class="game-header-right">
          <span class="game-progress-pill">${t('games.ct.scenarioProgress', { current: currentIndex + 1, total: totalScenarios })}</span>
          <span class="game-score-pill">⭐ ${t('games.ct.scoreLabel')} <strong>${currentScore}</strong></span>
        </div>
      </header>

      <!-- Scenario Context & Situation Card -->
      <section class="scenario-context-card" aria-label="Scenario Context">
        <div class="context-badge">📌 ${scenario.title}</div>
        <p class="context-text">${escapeHtml(scenario.context)}</p>
      </section>

      <!-- Main Chat Application Client Frame -->
      <main class="chat-client-frame" aria-label="Simulated Messaging App">
        <!-- Chat App Header Bar -->
        <header class="chat-app-header">
          <div class="chat-contact-info">
            <div class="chat-avatar" aria-hidden="true">${scenario.contact.avatar}</div>
            <div class="chat-meta">
              <div class="chat-name-line">
                <span class="chat-display-name">${escapeHtml(scenario.contact.name)}</span>
                ${scenario.contact.verified ? '<span class="verified-badge" title="Verified">✓</span>' : ''}
              </div>
              <span class="chat-status-subtitle">${statusLabel} • ${escapeHtml(scenario.contact.handle)}</span>
            </div>
          </div>

          <button type="button" class="btn btn-outline btn-sm chat-inspect-btn" id="toggle-profile-btn">
            ${profileOpen ? t('games.ct.hideProfile') : t('games.ct.inspectProfile')}
          </button>
        </header>

        <!-- Inspectable Contact Dossier Panel -->
        ${profileOpen ? `
          <section class="chat-dossier-panel animate-fade-in" id="contact-dossier" aria-label="${t('games.ct.profileTitle')}">
            <div class="dossier-header">
              <h4>${t('games.ct.profileTitle')}</h4>
            </div>
            <div class="dossier-grid">
              <div class="dossier-item">
                <span class="dossier-label">${t('games.ct.profileAccount')}</span>
                <code>${escapeHtml(scenario.contact.handle)}</code>
              </div>
              <div class="dossier-item">
                <span class="dossier-label">${t('games.ct.profileStatus')}</span>
                <span class="dossier-val ${scenario.contact.verified ? 'safe' : 'suspicious'}">
                  ${scenario.contact.verified ? 'Terverifikasi / Kontak Lama' : 'Akun Tidak Dikenal / Tanpa Verifikasi Resmi'}
                </span>
              </div>
              <div class="dossier-item full-width">
                <span class="dossier-label">${t('games.ct.profileContext')}</span>
                <p class="dossier-desc">${escapeHtml(scenario.contact.contextClue)}</p>
              </div>
            </div>
          </section>
        ` : ''}

        <!-- Chat Conversation Messages Container -->
        <div class="chat-messages-container" id="chat-messages-area" role="log" aria-live="polite">
          ${scenario.messages.slice(0, revealedCount).map((msg, idx) => {
            const isPlayer = msg.sender === 'player';
            return `
              <div class="chat-bubble-row ${isPlayer ? 'bubble-outgoing' : 'bubble-incoming'} animate-fade-in">
                ${!isPlayer ? `<div class="bubble-avatar">${scenario.contact.avatar}</div>` : ''}
                <div class="chat-bubble">
                  ${!isPlayer ? `<div class="bubble-sender">${escapeHtml(msg.senderName)}</div>` : ''}
                  <div class="bubble-content">${escapeHtml(msg.text)}</div>
                  <div class="bubble-time">${escapeHtml(msg.time)}</div>
                </div>
              </div>
            `;
          }).join('')}

          ${!allMessagesRevealed ? `
            <div class="chat-reveal-controls">
              <button type="button" class="btn btn-outline btn-sm" id="next-msg-btn">
                ${t('games.ct.nextMessage')}
              </button>
              <button type="button" class="btn btn-ghost btn-sm" id="reveal-all-btn">
                ${t('games.ct.showAllMessages')}
              </button>
            </div>
          ` : ''}
        </div>

        <!-- Decision Point Section (Revealed when messages are read) -->
        ${allMessagesRevealed && !isSubmitted ? `
          <section class="chat-decision-panel animate-fade-in" aria-label="${t('games.ct.decisionHeading')}">
            <div class="decision-intro">
              <h3 class="decision-heading">${t('games.ct.decisionHeading')}</h3>
              <p class="decision-sub">${t('games.ct.decisionSub')}</p>
            </div>

            <div class="chat-options-list" role="radiogroup" aria-label="${t('games.ct.decisionHeading')}">
              ${scenario.options.map(opt => {
                const isSelected = selectedOption === opt.id;
                return `
                  <label class="chat-option-card ${isSelected ? 'active' : ''}">
                    <input
                      type="radio"
                      name="chat-response"
                      class="chat-radio-input"
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
              <button type="button" class="btn btn-primary btn-lg" id="submit-response-btn">
                ${t('games.ct.submitResponse')}
              </button>
            </div>
          </section>
        ` : ''}

        <!-- Post-Decision Feedback Panel -->
        ${isSubmitted ? renderChatFeedback(scenario, isLastScenario) : ''}
      </main>
    </div>
  `;

  attachChatEventListeners(container, scenario);
}

/**
 * Renders the feedback panel after player submits their response
 */
function renderChatFeedback(scenario, isLastScenario) {
  const lastResult = gameState.history[gameState.history.length - 1];
  const safety = lastResult ? lastResult.safety : 'unsafe';
  const earnedScore = lastResult ? lastResult.earnedScore : 0;
  const chosenOpt = scenario.options.find(o => o.id === lastResult?.selectedOption);

  let statusBadgeClass = 'fail';
  let statusText = t('games.ct.unsafeResult');

  if (safety === 'safe') {
    statusBadgeClass = 'pass';
    statusText = t('games.ct.safeResult');
  } else if (safety === 'caution') {
    statusBadgeClass = 'caution';
    statusText = t('games.ct.partiallySafe');
  }

  return `
    <section class="chat-feedback-panel animate-fade-in ${safety}" aria-live="polite">
      <div class="feedback-header">
        <div class="feedback-status-badge ${statusBadgeClass}">
          ${statusText}
        </div>
        <div class="feedback-points-tag">${t('games.ed.pointsEarned', { pts: earnedScore })}</div>
      </div>

      <div class="feedback-content-block">
        <!-- Consequence Box -->
        <div class="feedback-consequence-box">
          <h4>${t('games.ct.consequenceTitle')}</h4>
          <p>${escapeHtml(chosenOpt?.consequence || '')}</p>
        </div>

        <!-- Warning signs / Clues in this chat -->
        <div class="feedback-clues-box">
          <h4>${t('games.ct.cluesTitle')}</h4>
          <ul class="clues-list">
            ${scenario.clues.map(c => `
              <li>
                <strong>${escapeHtml(c.title)}:</strong> ${escapeHtml(c.description)}
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Real World Defensive Advice -->
        <div class="feedback-recommendation-box">
          <h4>💡 ${t('games.ct.actionTitle')}</h4>
          <p>${escapeHtml(scenario.defenseAdvice)}</p>
        </div>
      </div>

      <div class="feedback-action-row">
        <button type="button" class="btn btn-primary btn-lg" id="next-scenario-btn">
          ${isLastScenario ? t('games.ct.finishGame') : t('games.ct.nextScenario')}
        </button>
      </div>
    </section>
  `;
}

/**
 * Attaches user interaction listeners for active scenario
 */
function attachChatEventListeners(container, scenario) {
  // 1. Toggle dossier/profile
  container.querySelector('#toggle-profile-btn')?.addEventListener('click', () => {
    gameState.profileOpen = !gameState.profileOpen;
    renderCurrentScenario(container);
  });

  // 2. Next message button
  container.querySelector('#next-msg-btn')?.addEventListener('click', () => {
    if (gameState.revealedCount < scenario.messages.length) {
      gameState.revealedCount++;
      renderCurrentScenario(container);
      scrollToBottom();
    }
  });

  // 3. Reveal all messages button
  container.querySelector('#reveal-all-btn')?.addEventListener('click', () => {
    gameState.revealedCount = scenario.messages.length;
    renderCurrentScenario(container);
    scrollToBottom();
  });

  // 4. Radio option selection
  container.querySelectorAll('.chat-radio-input').forEach(radio => {
    radio.addEventListener('change', () => {
      gameState.selectedOption = radio.value;
      container.querySelectorAll('.chat-option-card').forEach(card => card.classList.remove('active'));
      radio.closest('.chat-option-card')?.classList.add('active');
    });
  });

  // 5. Submit response
  container.querySelector('#submit-response-btn')?.addEventListener('click', () => {
    if (!gameState.selectedOption) {
      alert(t('games.ct.pleaseSelect'));
      return;
    }

    const chosen = scenario.options.find(o => o.id === gameState.selectedOption);
    const score = chosen ? chosen.score : 0;
    const safety = chosen ? chosen.safety : 'unsafe';
    const isCorrect = safety === 'safe';

    gameState.currentScore += score;
    gameState.isSubmitted = true;

    gameState.history.push({
      scenarioId: scenario.id,
      difficulty: scenario.difficulty,
      selectedOption: gameState.selectedOption,
      safety,
      isCorrect,
      earnedScore: score,
      relatedLessonId: scenario.relatedLessonId,
      conceptKey: scenario.conceptKey
    });

    renderCurrentScenario(container);

    const feedbackEl = container.querySelector('.chat-feedback-panel');
    if (feedbackEl) {
      feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // 6. Next scenario
  container.querySelector('#next-scenario-btn')?.addEventListener('click', () => {
    gameState.currentIndex++;
    gameState.revealedCount = 1;
    gameState.profileOpen = false;
    gameState.selectedOption = null;
    gameState.isSubmitted = false;
    renderCurrentScenario(container);
  });
}

function scrollToBottom() {
  const area = document.getElementById('chat-messages-area');
  if (area) {
    area.scrollTop = area.scrollHeight;
  }
}

/**
 * Renders the final Chat Trap investigation report
 */
function renderFinalReport(container) {
  const { currentScore, history, scenarios } = gameState;
  const totalScenarios = scenarios.length;
  const correctCount = history.filter(h => h.isCorrect).length;
  const accuracyPct = Math.round((correctCount / totalScenarios) * 100);

  // Breakdown by difficulty
  const beginnerHistory = history.filter(h => h.difficulty === 'beginner');
  const intermediateHistory = history.filter(h => h.difficulty === 'intermediate');

  const beginnerCorrect = beginnerHistory.filter(h => h.isCorrect).length;
  const intermediateCorrect = intermediateHistory.filter(h => h.isCorrect).length;

  const beginnerPct = beginnerHistory.length > 0 
    ? Math.round((beginnerCorrect / beginnerHistory.length) * 100) 
    : 100;
  const intermediatePct = intermediateHistory.length > 0 
    ? Math.round((intermediateCorrect / intermediateHistory.length) * 100) 
    : 100;

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
  let rankKey = 'games.ct.rankNovice';
  let reviewKey = 'games.ct.reviewPractice';

  if (accuracyPct >= 80 && currentScore >= 800) {
    rankKey = 'games.ct.rankMaster';
    reviewKey = 'games.ct.reviewPerfect';
  } else if (accuracyPct >= 60) {
    rankKey = 'games.ct.rankInvestigator';
    reviewKey = 'games.ct.reviewGood';
  } else if (accuracyPct >= 40) {
    rankKey = 'games.ct.rankScout';
    reviewKey = 'games.ct.reviewPractice';
  }

  // Persist game progress locally
  saveGameProgress('chat-trap', {
    score: currentScore,
    accuracyPct,
    correctCount,
    totalScenarios,
    completed: true,
    rankKey,
    beginnerScore: `${beginnerCorrect}/${beginnerHistory.length}`,
    intermediateScore: `${intermediateCorrect}/${intermediateHistory.length}`
  });

  // Fallback recommended lesson if none missed
  if (missedLessons.size === 0) {
    missedLessons.add('2-b');
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
    '4-a': 'Prinsip Dasar Keamanan & 2FA',
    '4-b': 'Teknik dan Strategi Penggunaan Data'
  };

  container.innerHTML = `
    <div class="game-report-view animate-fade-in">
      <header class="report-header">
        <span class="report-badge">🏆 ${t('games.ct.reportTitle')}</span>
        <h1 class="report-title">${t(rankKey)}</h1>
        <div class="report-score-banner">
          <span class="score-number">${currentScore}</span>
          <span class="score-sub">${t('games.ed.maxScore', { score: currentScore, max: totalScenarios * 100 })}</span>
        </div>
      </header>

      <!-- Overall and Progression Stats -->
      <section class="report-stats-grid">
        <div class="stat-card">
          <span class="stat-label">${t('games.ct.accuracy')}</span>
          <strong class="stat-value ${accuracyPct >= 70 ? 'pass' : 'fail'}">${accuracyPct}%</strong>
          <small>${correctCount} / ${totalScenarios} keputusan tepat</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">${t('games.ct.beginnerAccuracy')}</span>
          <strong class="stat-value pass">${beginnerPct}%</strong>
          <small>${beginnerCorrect} / ${beginnerHistory.length} skenario pemula</small>
        </div>
        <div class="stat-card">
          <span class="stat-label">${t('games.ct.intermediateAccuracy')}</span>
          <strong class="stat-value ${intermediatePct >= 60 ? 'pass' : 'fail'}">${intermediatePct}%</strong>
          <small>${intermediateCorrect} / ${intermediateHistory.length} skenario menengah</small>
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
              ${Array.from(practiceConcepts).map(c => `<li>${escapeHtml(c)}</li>`).join('') || '<em>(Hebat! Semua konsep dikuasai!)</em>'}
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
          🔄 ${t('games.ct.replayBtn')}
        </button>
        <a href="#/games" class="btn btn-outline btn-lg">
          ${t('games.ct.hubBtn')}
        </a>
      </footer>
    </div>
  `;

  container.querySelector('#replay-game-btn')?.addEventListener('click', () => {
    startChatTrapGame(container);
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
