// src/games/incidentCommander/incidentCommander.js
// Cyber Incident Commander (Advanced) Interactive Game Engine
// Multi-phase incident response simulation with SOC dashboard, live risk and
// service availability gauges, telemetry logs, containment decisions, and after-action reports.

import { INCIDENT_SCENARIOS } from './scenarios.js';
import { saveGameProgress, getGameProgress } from '../gamesData.js';
import { navigate } from '../../router.js';
import { t } from '../../i18n.js';

let gameState = null;

/**
 * Initializes a new Incident Commander session or loads scenario
 */
export function startIncidentCommanderGame(container) {
  initGameSession(0);
  renderCurrentPhase(container);
}

/**
 * Sets up session state for a specific scenario index
 */
function initGameSession(scenarioIndex = 0) {
  const scenario = INCIDENT_SCENARIOS[scenarioIndex] || INCIDENT_SCENARIOS[0];

  const assetStates = {};
  scenario.assets.forEach(a => {
    assetStates[a.id] = a.initialStatus;
  });

  gameState = {
    scenarios: INCIDENT_SCENARIOS,
    scenarioIndex,
    scenario,
    currentPhase: 'phaseA', // 'phaseA' | 'phaseB' | 'phaseC' | 'phaseD' | 'aar'
    currentRisk: scenario.initialRisk,
    currentAvailability: scenario.initialAvailability,
    scenarioScore: 0,
    cumulativeScore: gameState ? gameState.cumulativeScore : 0,
    selectedOption: null,
    isSubmitted: false,
    activeLogTab: 'auth', // 'auth' | 'endpoint' | 'network' | 'assets'
    phaseResults: {},
    assetStates,
    history: []
  };
}

/**
 * Master render dispatcher based on current phase
 */
function renderCurrentPhase(container) {
  if (!gameState || !container) return;

  if (gameState.currentPhase === 'aar') {
    renderAfterActionReport(container);
    return;
  }

  renderSocDashboard(container);
}

/**
 * Renders the interactive SOC Incident Dashboard
 */
function renderSocDashboard(container) {
  const { scenario, scenarioIndex, scenarios, currentPhase, currentRisk, currentAvailability, scenarioScore, isSubmitted, selectedOption, activeLogTab, assetStates } = gameState;

  const totalScenarios = scenarios.length;
  const phaseData = scenario.phases[currentPhase];

  // Compute Risk gauge color & label
  let riskColorClass = 'risk-critical';
  let riskLabel = 'Kritis';
  if (currentRisk <= 30) {
    riskColorClass = 'risk-low';
    riskLabel = 'Terkendali';
  } else if (currentRisk <= 60) {
    riskColorClass = 'risk-moderate';
    riskLabel = 'Sedang';
  }

  // Compute Availability gauge color & label
  let availColorClass = 'avail-high';
  let availLabel = 'Optimal';
  if (currentAvailability < 50) {
    availColorClass = 'avail-low';
    availLabel = 'Terdistrupsi Berat';
  } else if (currentAvailability < 80) {
    availColorClass = 'avail-moderate';
    availLabel = 'Sebagian Terganggu';
  }

  container.innerHTML = `
    <div class="game-session incident-commander-view animate-fade-in">
      <!-- Session Header Bar -->
      <header class="game-header-bar">
        <div class="game-header-left">
          <a href="#/games" class="btn btn-ghost btn-sm" id="game-exit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>${t('games.backToHub')}</span>
          </a>
          <span class="game-mode-badge">${t('games.cic.title')}</span>
          <span class="cic-code-pill"><span class="pulse-dot"></span> ${scenario.code}</span>
        </div>
        <div class="game-header-right">
          <span class="game-progress-pill">${t('games.cic.scenarioProgress', { current: scenarioIndex + 1, total: totalScenarios })}</span>
          <span class="game-score-pill">⭐ ${t('games.ct.scoreLabel')} <strong>${scenarioScore}</strong> pts</span>
        </div>
      </header>

      <!-- Threat & Tactical Gauges Bar -->
      <section class="cic-gauges-strip" aria-label="Incident Gauges">
        <div class="cic-gauge-item">
          <div class="gauge-header">
            <span class="gauge-title">${t('games.cic.riskGauge')}</span>
            <span class="gauge-value ${riskColorClass}"><strong>${currentRisk}%</strong> (${riskLabel})</span>
          </div>
          <div class="gauge-track">
            <div class="gauge-fill ${riskColorClass}" style="width: ${Math.min(100, Math.max(0, currentRisk))}%;"></div>
          </div>
        </div>

        <div class="cic-gauge-item">
          <div class="gauge-header">
            <span class="gauge-title">${t('games.cic.availabilityGauge')}</span>
            <span class="gauge-value ${availColorClass}"><strong>${currentAvailability}%</strong> (${availLabel})</span>
          </div>
          <div class="gauge-track">
            <div class="gauge-fill ${availColorClass}" style="width: ${Math.min(100, Math.max(0, currentAvailability))}%;"></div>
          </div>
        </div>
      </section>

      <!-- 5-Phase Interactive Navigation Stepper -->
      <nav class="cic-phase-stepper" aria-label="Incident Phases">
        <div class="phase-step ${currentPhase === 'phaseA' ? 'active' : ''} ${gameState.phaseResults.phaseA ? 'completed' : ''}">
          <span class="step-num">1</span>
          <span class="step-label">${t('games.cic.phaseA')}</span>
        </div>
        <div class="phase-step ${currentPhase === 'phaseB' ? 'active' : ''} ${gameState.phaseResults.phaseB ? 'completed' : ''}">
          <span class="step-num">2</span>
          <span class="step-label">${t('games.cic.phaseB')}</span>
        </div>
        <div class="phase-step ${currentPhase === 'phaseC' ? 'active' : ''} ${gameState.phaseResults.phaseC ? 'completed' : ''}">
          <span class="step-num">3</span>
          <span class="step-label">${t('games.cic.phaseC')}</span>
        </div>
        <div class="phase-step ${currentPhase === 'phaseD' ? 'active' : ''} ${gameState.phaseResults.phaseD ? 'completed' : ''}">
          <span class="step-num">4</span>
          <span class="step-label">${t('games.cic.phaseD')}</span>
        </div>
        <div class="phase-step ${currentPhase === 'aar' ? 'active' : ''}">
          <span class="step-num">5</span>
          <span class="step-label">${t('games.cic.phaseE')}</span>
        </div>
      </nav>

      <!-- Incident Briefing Card -->
      <section class="cic-briefing-card">
        <div class="briefing-header">
          <div class="briefing-meta">
            <span class="target-org-badge">🏢 ${scenario.org}</span>
            <span class="severity-badge ${scenario.initialSeverity.toLowerCase().includes('kritis') ? 'critical' : 'high'}">
              ⚠️ ${scenario.initialSeverity}
            </span>
          </div>
          <h1 class="briefing-title">${scenario.title}</h1>
        </div>
        <p class="briefing-text">${scenario.overview}</p>
      </section>

      <!-- Main Operational SOC Split Layout -->
      <main class="cic-console-grid">
        <!-- Left Panel: Telemetry & Evidence Inspector -->
        <section class="cic-telemetry-panel" aria-label="Security Telemetry and Forensics">
          <div class="panel-header-tabs">
            <h2 class="panel-section-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>${currentPhase === 'phaseA' ? t('games.cic.alertQueueTitle') : t('games.cic.evidenceTitle')}</span>
            </h2>

            ${currentPhase !== 'phaseA' ? `
              <div class="evidence-tabs-bar" role="tablist">
                <button type="button" class="tab-btn ${activeLogTab === 'auth' ? 'active' : ''}" data-tab="auth">
                  ${t('games.cic.tabAuth')}
                </button>
                <button type="button" class="tab-btn ${activeLogTab === 'endpoint' ? 'active' : ''}" data-tab="endpoint">
                  ${t('games.cic.tabEndpoint')}
                </button>
                <button type="button" class="tab-btn ${activeLogTab === 'network' ? 'active' : ''}" data-tab="network">
                  ${t('games.cic.tabNetwork')}
                </button>
                <button type="button" class="tab-btn ${activeLogTab === 'assets' ? 'active' : ''}" data-tab="assets">
                  ${t('games.cic.tabAssets')}
                </button>
              </div>
            ` : ''}
          </div>

          <div class="panel-content-body">
            ${currentPhase === 'phaseA' ? renderAlertQueue(scenario.alerts) : renderEvidenceInspector(scenario, activeLogTab, assetStates)}
          </div>
        </section>

        <!-- Right Panel: Commander Tactical Action Console -->
        <section class="cic-tactical-panel" aria-label="Commander Decision Console">
          <div class="tactical-header">
            <span class="tactical-kicker">🎯 ${t('games.cic.actionConsoleTitle')}</span>
            <h2 class="tactical-heading">${phaseData.title}</h2>
          </div>

          <p class="tactical-prompt">${phaseData.question}</p>

          <!-- Tactical Options List -->
          <div class="tactical-options-group" role="radiogroup" aria-label="Decision Options">
            ${phaseData.options.map(opt => {
              const isSelected = selectedOption === opt.id;
              let statusClass = '';
              if (isSubmitted) {
                if (opt.type === 'optimal') statusClass = 'option-optimal';
                else if (isSelected && opt.type !== 'optimal') statusClass = 'option-incorrect';
                else statusClass = 'option-dimmed';
              } else if (isSelected) {
                statusClass = 'option-selected';
              }

              return `
                <div class="tactical-option-card ${statusClass}" data-opt-id="${opt.id}" tabindex="${isSubmitted ? '-1' : '0'}" role="radio" aria-checked="${isSelected}">
                  <div class="option-radio-indicator">
                    <span class="inner-dot"></span>
                  </div>
                  <div class="option-text-wrap">
                    <p class="option-description">${opt.text}</p>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Execution / Feedback Block -->
          <div class="tactical-footer-action">
            ${!isSubmitted ? `
              <button type="button" class="btn btn-primary btn-block" id="btn-execute-action" ${!selectedOption ? 'disabled' : ''}>
                ⚡ ${t('games.cic.submitAction')}
              </button>
            ` : `
              ${renderFeedbackBanner(phaseData, selectedOption)}
              <button type="button" class="btn btn-primary btn-block animate-fade-in" id="btn-next-phase">
                ${getNextPhaseButtonText(currentPhase)}
              </button>
            `}
          </div>
        </section>
      </main>
    </div>
  `;

  attachDashboardEvents(container);
}

/**
 * Returns appropriate label for next phase button
 */
function getNextPhaseButtonText(phase) {
  if (phase === 'phaseD') {
    return `📊 ${t('games.cic.viewReport')}`;
  }
  return `${t('games.cic.nextPhase')}`;
}

/**
 * Renders Alert Queue for Phase A (Triage)
 */
function renderAlertQueue(alerts) {
  return `
    <div class="cic-alerts-feed">
      ${alerts.map(alt => {
        let severityTag = 'sev-low';
        if (alt.severity.toLowerCase().includes('kritis')) severityTag = 'sev-critical';
        else if (alt.severity.toLowerCase().includes('tinggi')) severityTag = 'sev-high';

        return `
          <article class="cic-alert-item ${alt.isMalicious ? 'alert-threat' : 'alert-benign'}">
            <div class="alert-item-header">
              <span class="alert-id-badge">${alt.id}</span>
              <span class="alert-time">🕒 ${alt.timestamp}</span>
              <span class="alert-severity ${severityTag}">${alt.severity}</span>
            </div>
            <h3 class="alert-item-title">${alt.title}</h3>
            <div class="alert-item-meta">
              <span>📡 ${alt.source}</span>
              <span>🔍 ${alt.confidence}</span>
            </div>
            <p class="alert-item-detail">${alt.detail}</p>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renders Forensic Evidence tabs for Phases B, C, D
 */
function renderEvidenceInspector(scenario, activeTab, assetStates) {
  const { evidenceLogs, assets } = scenario;

  if (activeTab === 'auth') {
    return `
      <div class="evidence-table-container">
        <table class="cic-evidence-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Pengguna</th>
              <th>Alamat IP & Lokasi</th>
              <th>MFA</th>
              <th>Status</th>
              <th>Catatan Telemetri</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceLogs.auth.map(row => `
              <tr>
                <td class="cell-mono">${row.timestamp}</td>
                <td><strong>${row.user}</strong></td>
                <td class="cell-mono">${row.ip}</td>
                <td><span class="cell-tag ${row.mfaUsed.includes('Ya') ? 'tag-safe' : 'tag-warn'}">${row.mfaUsed}</span></td>
                <td><span class="cell-tag ${row.status.includes('Success') || row.status.includes('Granted') ? 'tag-primary' : 'tag-danger'}">${row.status}</span></td>
                <td>${row.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeTab === 'endpoint') {
    return `
      <div class="evidence-table-container">
        <table class="cic-evidence-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Host / Sasaran</th>
              <th>Proses</th>
              <th>Baris Perintah (Command Line)</th>
              <th>Catatan Forensik</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceLogs.endpoint.map(row => `
              <tr>
                <td class="cell-mono">${row.timestamp}</td>
                <td><strong>${row.host}</strong></td>
                <td class="cell-mono"><code>${row.process}</code></td>
                <td class="cell-code"><code>${row.commandLine}</code></td>
                <td>${row.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeTab === 'network') {
    return `
      <div class="evidence-table-container">
        <table class="cic-evidence-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Sumber (Source)</th>
              <th>Tujuan (Destination)</th>
              <th>Port / Protokol</th>
              <th>Volume Data</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            ${evidenceLogs.network.map(row => `
              <tr>
                <td class="cell-mono">${row.timestamp}</td>
                <td class="cell-mono">${row.src}</td>
                <td class="cell-mono"><strong>${row.dst}</strong></td>
                <td class="cell-mono">${row.port}</td>
                <td><span class="cell-tag tag-primary">${row.bytes}</span></td>
                <td>${row.notes}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Assets Tab
  return `
    <div class="cic-assets-grid">
      ${assets.map(asset => {
        const currentStatus = assetStates[asset.id] || asset.initialStatus;
        let statusBadgeClass = 'status-normal';
        let statusLabel = t('games.cic.statusNormal');

        if (currentStatus === 'compromised') {
          statusBadgeClass = 'status-compromised';
          statusLabel = '⚠️ Terkompromi';
        } else if (currentStatus === 'investigating') {
          statusBadgeClass = 'status-investigating';
          statusLabel = t('games.cic.statusInvestigating');
        } else if (currentStatus === 'isolated') {
          statusBadgeClass = 'status-isolated';
          statusLabel = t('games.cic.statusIsolated');
        } else if (currentStatus === 'remediated') {
          statusBadgeClass = 'status-remediated';
          statusLabel = t('games.cic.statusRemediated');
        }

        return `
          <div class="cic-asset-card">
            <div class="asset-card-top">
              <span class="asset-type-icon">
                ${asset.type === 'server' ? '🖥️' : asset.type === 'workstation' ? '💻' : asset.type === 'account' ? '👤' : asset.type === 'gateway' ? '🌐' : '☁️'}
              </span>
              <span class="asset-status-pill ${statusBadgeClass}">${statusLabel}</span>
            </div>
            <h4 class="asset-name">${asset.name}</h4>
            <div class="asset-meta">
              <span>ID: <code>${asset.id}</code></span>
              <span>Kekritisan: <strong>${asset.criticality}</strong></span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/**
 * Renders Feedback Banner after decision submission
 */
function renderFeedbackBanner(phaseData, selectedOptionId) {
  const chosen = phaseData.options.find(o => o.id === selectedOptionId);
  if (!chosen) return '';

  let bannerClass = 'fb-optimal';
  let badgeTitle = 'Tindakan Taktis Terbaik! 🛡️';

  if (chosen.type === 'suboptimal') {
    bannerClass = 'fb-suboptimal';
    badgeTitle = 'Tindakan Cukup Efektif / Kurang Presisi ⚠️';
  } else if (chosen.type === 'hazardous') {
    bannerClass = 'fb-hazardous';
    badgeTitle = 'Tindakan Berbahaya / Dampak Negatif Tinggi! 🚨';
  }

  return `
    <div class="cic-feedback-banner ${bannerClass} animate-fade-in" role="alert">
      <div class="fb-header">
        <span class="fb-title">${badgeTitle}</span>
        <span class="fb-points">+${chosen.points} Poin</span>
      </div>
      <p class="fb-text">${chosen.feedback}</p>
      <div class="fb-deltas">
        <span>Risiko: <strong>${chosen.riskDelta > 0 ? `+${chosen.riskDelta}%` : `${chosen.riskDelta}%`}</strong></span>
        <span>Ketersediaan: <strong>${chosen.availabilityDelta < 0 ? `${chosen.availabilityDelta}%` : 'Terjaga'}</strong></span>
      </div>
    </div>
  `;
}

/**
 * Attaches event listeners to the active dashboard
 */
function attachDashboardEvents(container) {
  // Option selection
  const optionCards = container.querySelectorAll('.tactical-option-card');
  optionCards.forEach(card => {
    card.addEventListener('click', () => {
      if (gameState.isSubmitted) return;
      const optId = card.getAttribute('data-opt-id');
      gameState.selectedOption = optId;
      renderCurrentPhase(container);
    });

    card.addEventListener('keydown', (e) => {
      if (gameState.isSubmitted) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const optId = card.getAttribute('data-opt-id');
        gameState.selectedOption = optId;
        renderCurrentPhase(container);
      }
    });
  });

  // Execute Action button
  const executeBtn = container.querySelector('#btn-execute-action');
  if (executeBtn) {
    executeBtn.addEventListener('click', () => {
      if (!gameState.selectedOption || gameState.isSubmitted) return;
      executeCommanderDecision(container);
    });
  }

  // Next Phase button
  const nextPhaseBtn = container.querySelector('#btn-next-phase');
  if (nextPhaseBtn) {
    nextPhaseBtn.addEventListener('click', () => {
      proceedToNextPhase(container);
    });
  }

  // Evidence Tab buttons
  const tabBtns = container.querySelectorAll('.evidence-tabs-bar .tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      gameState.activeLogTab = tab;
      renderCurrentPhase(container);
    });
  });
}

/**
 * Commits the commander's tactical decision
 */
function executeCommanderDecision(container) {
  const { currentPhase, selectedOption, scenario } = gameState;
  const phaseData = scenario.phases[currentPhase];
  const chosen = phaseData.options.find(o => o.id === selectedOption);
  if (!chosen) return;

  gameState.isSubmitted = true;
  gameState.scenarioScore += chosen.points;
  gameState.phaseResults[currentPhase] = {
    chosenOptionId: chosen.id,
    type: chosen.type,
    points: chosen.points
  };

  // Apply Risk & Availability deltas
  gameState.currentRisk = Math.max(5, Math.min(100, gameState.currentRisk + (chosen.riskDelta || 0)));
  gameState.currentAvailability = Math.max(0, Math.min(100, gameState.currentAvailability + (chosen.availabilityDelta || 0)));

  // Update asset statuses if any
  if (chosen.assetUpdates) {
    chosen.assetUpdates.forEach(up => {
      if (gameState.assetStates[up.id]) {
        gameState.assetStates[up.id] = up.status;
      }
    });
  }

  gameState.history.push({
    phase: currentPhase,
    decisionId: chosen.id,
    type: chosen.type,
    points: chosen.points,
    risk: gameState.currentRisk,
    availability: gameState.currentAvailability
  });

  renderCurrentPhase(container);
}

/**
 * Transitions from one phase to the next
 */
function proceedToNextPhase(container) {
  const phaseOrder = ['phaseA', 'phaseB', 'phaseC', 'phaseD', 'aar'];
  const currentIndex = phaseOrder.indexOf(gameState.currentPhase);

  if (currentIndex < phaseOrder.length - 1) {
    gameState.currentPhase = phaseOrder[currentIndex + 1];
    gameState.selectedOption = null;
    gameState.isSubmitted = false;
    renderCurrentPhase(container);
  }
}

/**
 * Renders Phase 5: After-Action Review (Post-Incident Report)
 */
function renderAfterActionReport(container) {
  const { scenario, scenarioIndex, scenarios, scenarioScore, currentRisk, currentAvailability, phaseResults } = gameState;
  const totalScenarios = scenarios.length;
  const isLastScenario = scenarioIndex >= totalScenarios - 1;

  // Cumulative tracking
  const maxScenarioScore = 100;
  const accuracyPct = Math.round((scenarioScore / maxScenarioScore) * 100);

  // Commander Rank
  let rankKey = 'games.cic.rankCadet';
  if (accuracyPct >= 90) rankKey = 'games.cic.rankMaster';
  else if (accuracyPct >= 75) rankKey = 'games.cic.rankSenior';
  else if (accuracyPct >= 50) rankKey = 'games.cic.rankAnalyst';

  // Qualitative summary review
  let reviewKey = 'games.cic.reviewPractice';
  if (accuracyPct >= 90) reviewKey = 'games.cic.reviewPerfect';
  else if (accuracyPct >= 75) reviewKey = 'games.cic.reviewGood';

  // Save Progress to localStorage via gamesData
  saveGameProgress('incident-commander', {
    score: scenarioScore,
    accuracy: accuracyPct,
    risk: currentRisk,
    availability: currentAvailability,
    scenarioId: scenario.id
  });

  container.innerHTML = `
    <div class="game-session incident-commander-view animate-fade-in">
      <!-- Session Header Bar -->
      <header class="game-header-bar">
        <div class="game-header-left">
          <a href="#/games" class="btn btn-ghost btn-sm" id="game-exit-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            <span>${t('games.backToHub')}</span>
          </a>
          <span class="game-mode-badge">${t('games.cic.title')}</span>
          <span class="cic-code-pill">${scenario.code}</span>
        </div>
        <div class="game-header-right">
          <span class="game-progress-pill">${t('games.cic.scenarioProgress', { current: scenarioIndex + 1, total: totalScenarios })}</span>
        </div>
      </header>

      <!-- AAR Document Frame -->
      <article class="cic-aar-frame animate-fade-in">
        <header class="aar-doc-header">
          <div class="aar-badge-wrap">
            <span class="aar-kicker">🛡️ ${t('games.cic.phaseE')}</span>
            <span class="aar-code-badge">${scenario.code}</span>
          </div>
          <h1 class="aar-doc-title">${t('games.cic.reportTitle')}</h1>
          <p class="aar-doc-subtitle">Insiden: <strong>${scenario.title}</strong> — ${scenario.org}</p>
        </header>

        <!-- Commander Score & Rank Hero Card -->
        <section class="aar-rank-card">
          <div class="rank-avatar" aria-hidden="true">
            ${accuracyPct >= 75 ? '🎖️' : '🔍'}
          </div>
          <div class="rank-details">
            <span class="rank-kicker">Peringkat Komando Akhir</span>
            <h2 class="rank-title">${t(rankKey)}</h2>
            <p class="rank-review">${t(reviewKey)}</p>
          </div>
          <div class="rank-score-pill">
            <span class="score-num">${scenarioScore}</span>
            <span class="score-den">/ 100 pts</span>
          </div>
        </section>

        <!-- Tactical Performance Metrics Grid -->
        <section class="aar-metrics-grid">
          <div class="metric-card">
            <span class="metric-icon">🎯</span>
            <span class="metric-label">Akurasi Keputusan Taktis</span>
            <strong class="metric-value">${accuracyPct}%</strong>
          </div>
          <div class="metric-card">
            <span class="metric-icon">🛡️</span>
            <span class="metric-label">Risiko Akhir Insiden</span>
            <strong class="metric-value ${currentRisk <= 30 ? 'text-success' : 'text-danger'}">${currentRisk}%</strong>
          </div>
          <div class="metric-card">
            <span class="metric-icon">⚡</span>
            <span class="metric-label">Ketersediaan Layanan</span>
            <strong class="metric-value ${currentAvailability >= 80 ? 'text-success' : 'text-warn'}">${currentAvailability}%</strong>
          </div>
        </section>

        <!-- Chronological Attack vs Defense Summary -->
        <section class="aar-section">
          <h3 class="aar-section-heading">📌 Ringkasan Vektor Serangan & Akar Masalah</h3>
          <div class="aar-content-box">
            <p><strong>Vektor Serangan:</strong> ${scenario.aar.attackVectorSummary}</p>
            <p><strong>Akar Masalah (Root Cause):</strong> ${scenario.aar.rootCause}</p>
            <p><strong>Pelajaran Mitigasi:</strong> ${scenario.aar.mitigationLessons}</p>
          </div>
        </section>

        <!-- Recommended Learn Lessons -->
        <section class="aar-section">
          <h3 class="aar-section-heading">📚 Modul Belajar Terkait untuk Pendalaman:</h3>
          <div class="aar-lessons-list">
            ${scenario.aar.recommendedLessonIds.map(lessonId => `
              <a href="#/learn/${lessonId}" class="aar-lesson-card">
                <span class="lesson-link-icon">📖</span>
                <span class="lesson-link-text">Modul ${lessonId} →</span>
              </a>
            `).join('')}
          </div>
        </section>

        <!-- Action Navigation Footer -->
        <footer class="aar-footer-actions">
          ${!isLastScenario ? `
            <button type="button" class="btn btn-primary" id="btn-next-mission">
              🚀 ${t('games.cic.nextMission')}
            </button>
          ` : `
            <button type="button" class="btn btn-primary" id="btn-replay-mission">
              ↺ ${t('games.cic.replayBtn')}
            </button>
          `}
          <a href="#/games" class="btn btn-outline" id="btn-aar-hub">
            ${t('games.cic.hubBtn')}
          </a>
        </footer>
      </article>
    </div>
  `;

  // Attach AAR events
  const nextMissionBtn = container.querySelector('#btn-next-mission');
  if (nextMissionBtn) {
    nextMissionBtn.addEventListener('click', () => {
      initGameSession(scenarioIndex + 1);
      renderCurrentPhase(container);
    });
  }

  const replayBtn = container.querySelector('#btn-replay-mission');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      initGameSession(0);
      renderCurrentPhase(container);
    });
  }
}
