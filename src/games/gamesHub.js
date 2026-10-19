// src/games/gamesHub.js
// CyberWise Games Lab Hub & Router Controller
// Provides a library of interactive cybersecurity simulation games.

import { GAMES_LIST, getGameProgress } from './gamesData.js';
import { startEmailDetectiveGame } from './emailDetective/emailDetective.js';
import { startChatTrapGame } from './chatTrap/chatTrap.js';
import { startPasswordDefenderGame } from './passwordDefender/passwordDefender.js';
import { startIncidentCommanderGame } from './incidentCommander/incidentCommander.js';
import { startMalwareMissionGame } from './malwareMission/malwareMission.js';
import { navigate } from '../router.js';
import { t } from '../i18n.js';

function getContainer() {
  return document.getElementById('page-container');
}

/**
 * Main render entry point for Games route
 * @param {string|null} gameId Optional specific game identifier
 */
export function renderGames(gameId = null) {
  const container = getContainer();
  if (!container) return;

  if (gameId === 'email-detective') {
    startEmailDetectiveGame(container);
    return;
  }

  if (gameId === 'chat-trap') {
    startChatTrapGame(container);
    return;
  }

  if (gameId === 'password-defender') {
    startPasswordDefenderGame(container);
    return;
  }

  if (gameId === 'incident-commander') {
    startIncidentCommanderGame(container);
    return;
  }

  if (gameId === 'malware-mission') {
    startMalwareMissionGame(container);
    return;
  }

  renderGamesHubView(container);
}

/**
 * Renders the Games Library / Hub view
 */
function renderGamesHubView(container) {
  const gamesWithProgress = GAMES_LIST.map(game => {
    const progress = getGameProgress(game.id);
    return {
      ...game,
      progress
    };
  });

  const playableCount = gamesWithProgress.filter(g => g.status === 'playable').length;

  container.innerHTML = `
    <div class="games-hub-module animate-fade-in">
      <!-- Hero Banner -->
      <header class="games-hero">
        <div class="games-hero-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;" aria-hidden="true">
            <rect x="2" y="6" width="20" height="12" rx="3"/>
            <path d="M6 12h4m-2-2v4"/>
            <circle cx="17" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="13" r="1" fill="currentColor"/>
          </svg>
          <span>${t('games.hubBadge')}</span>
        </div>
        <h1 class="games-title">${t('games.hubTitle')}</h1>
        <p class="games-subtitle">${t('games.hubSubtitle')}</p>

        <div class="games-metrics">
          <div class="games-metric-pill">
            <span>🎮</span>
            <strong>${t('games.metricTotal', { count: gamesWithProgress.length })}</strong>
          </div>
          <div class="games-metric-pill">
            <span>✨</span>
            <strong>${t('games.metricPlayable')}</strong>
          </div>
          <div class="games-metric-pill">
            <span>🛡️</span>
            <strong>${t('games.metricSafe')}</strong>
          </div>
        </div>
      </header>

      <!-- Games Library Cards Grid -->
      <section class="games-cards-grid" aria-label="Games Library">
        ${gamesWithProgress.map(game => {
          const isPlayable = game.status === 'playable';
          const bestScore = game.progress?.bestScore;

          const mechanicsMap = {
            'email-detective': 'RADAR PHISHING & HEADER INSPECTION',
            'chat-trap': 'SOCIAL ENGINEERING TRIAGE',
            'password-defender': 'ENTROPY & BRUTE-FORCE DEFENSE',
            'incident-commander': 'SOC CRISIS TRIAGE',
            'malware-mission': 'ENDPOINT QUARANTINE PROTOCOL'
          };
          const mechanics = mechanicsMap[game.id] || 'SIMULATION LAB';

          return `
            <article class="game-card ${isPlayable ? 'playable' : 'coming-soon'}" id="card-${game.id}">
              <div class="game-card-top">
                <div class="game-icon-wrap">
                  <span class="game-card-icon" aria-hidden="true">${game.icon}</span>
                </div>
                <div class="game-card-tags">
                  <span class="game-status-badge ${isPlayable ? 'ready' : 'soon'}">
                    ${isPlayable ? `<span class="pulse-dot" aria-hidden="true"></span> ${t('games.statusPlayable')}` : t('games.statusComingSoon')}
                  </span>
                </div>
              </div>

              <div class="game-card-body">
                <span class="game-mechanics-badge">${mechanics}</span>
                <h2 class="game-card-title">${t(game.titleKey)}</h2>
                <p class="game-card-desc">${t(game.descKey)}</p>

                <div class="game-meta-specs">
                  <div class="spec-row">
                    <span class="spec-label">${t('games.category')}</span>
                    <span class="spec-value">${t(game.categoryKey)}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">${t('games.duration')}</span>
                    <span class="spec-value">${t(game.durationKey)}</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-label">${t('games.difficulty')}</span>
                    <span class="spec-value">${t(game.difficultyKey)}</span>
                  </div>
                </div>

                ${bestScore !== undefined && bestScore > 0 ? `
                  <div class="game-best-score">
                    <span>🏆 ${t('games.bestScore')}</span>
                    <strong>${bestScore} pts</strong>
                  </div>
                ` : ''}
              </div>

              <div class="game-card-footer">
                ${isPlayable ? `
                  <a href="${game.route}" class="btn btn-primary game-cta-btn">
                    ${t('games.playBtn')}
                  </a>
                ` : `
                  <button type="button" class="btn btn-outline game-cta-btn disabled" disabled>
                    🔒 ${t('games.statusComingSoon')}
                  </button>
                `}
              </div>
            </article>
          `;
        }).join('')}
      </section>

      <!-- Extension Note -->
      <footer class="games-future-footer">
        <div class="future-icon">🚀</div>
        <p>${t('games.futureNotice')}</p>
      </footer>
    </div>
  `;
}
