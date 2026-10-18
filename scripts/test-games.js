// scripts/test-games.js
// Automated verification for CyberWise Games & Cybersecurity Simulation
// (Email Detective, Chat Trap, and Password Defender)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🎮 Starting CyberWise Games Lab & Simulation Tests...\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
  }
}

// Load valid lesson manifest for lesson ID validation
const materiManifestPath = path.join(rootDir, 'materi', 'manifest.json');
const materiManifest = JSON.parse(fs.readFileSync(materiManifestPath, 'utf8'));
const validLessonIds = new Set(materiManifest.lessons.map(l => l.id));

// 1. Files & Architecture
console.log('--- Test Group 1: Files and Architecture ---');
const gamesDataPath = path.join(rootDir, 'src', 'games', 'gamesData.js');
assert(fs.existsSync(gamesDataPath), 'src/games/gamesData.js exists');

const gamesHubPath = path.join(rootDir, 'src', 'games', 'gamesHub.js');
assert(fs.existsSync(gamesHubPath), 'src/games/gamesHub.js exists');

const edScenariosPath = path.join(rootDir, 'src', 'games', 'emailDetective', 'scenarios.js');
assert(fs.existsSync(edScenariosPath), 'src/games/emailDetective/scenarios.js exists');

const emailDetectivePath = path.join(rootDir, 'src', 'games', 'emailDetective', 'emailDetective.js');
assert(fs.existsSync(emailDetectivePath), 'src/games/emailDetective/emailDetective.js exists');

const ctScenariosPath = path.join(rootDir, 'src', 'games', 'chatTrap', 'scenarios.js');
assert(fs.existsSync(ctScenariosPath), 'src/games/chatTrap/scenarios.js exists');

const chatTrapPath = path.join(rootDir, 'src', 'games', 'chatTrap', 'chatTrap.js');
assert(fs.existsSync(chatTrapPath), 'src/games/chatTrap/chatTrap.js exists');

const pdScenariosPath = path.join(rootDir, 'src', 'games', 'passwordDefender', 'scenarios.js');
assert(fs.existsSync(pdScenariosPath), 'src/games/passwordDefender/scenarios.js exists');

const passwordDefenderPath = path.join(rootDir, 'src', 'games', 'passwordDefender', 'passwordDefender.js');
assert(fs.existsSync(passwordDefenderPath), 'src/games/passwordDefender/passwordDefender.js exists');

const cicScenariosPath = path.join(rootDir, 'src', 'games', 'incidentCommander', 'scenarios.js');
assert(fs.existsSync(cicScenariosPath), 'src/games/incidentCommander/scenarios.js exists');

const incidentCommanderPath = path.join(rootDir, 'src', 'games', 'incidentCommander', 'incidentCommander.js');
assert(fs.existsSync(incidentCommanderPath), 'src/games/incidentCommander/incidentCommander.js exists');

const gamesCssPath = path.join(rootDir, 'src', 'styles', 'games.css');
assert(fs.existsSync(gamesCssPath), 'src/styles/games.css exists');

// 2. Validate Email Detective Scenarios Data
console.log('\n--- Test Group 2: Email Detective Scenarios Integrity ---');
const edScenariosModule = await import('../src/games/emailDetective/scenarios.js');
const edScenarios = edScenariosModule.EMAIL_SCENARIOS || [];

assert(edScenarios.length >= 8 && edScenarios.length <= 15, `Email Detective scenario count is between 8 and 15 (found: ${edScenarios.length})`);

let allEdScenariosValid = true;
let allEdLessonIdsValid = true;
let allEdLinksInert = true;
const edScenarioIds = new Set();
const edClassifications = { legitimate: 0, suspicious: 0, phishing: 0 };

for (const sc of edScenarios) {
  if (!sc.id || !sc.subject || !sc.senderName || !sc.senderEmail || !sc.classification || !sc.bodyHtml || !Array.isArray(sc.clues) || !sc.explanation || !sc.recommendation) {
    allEdScenariosValid = false;
  }
  if (edScenarioIds.has(sc.id)) {
    allEdScenariosValid = false;
  }
  edScenarioIds.add(sc.id);

  if (edClassifications[sc.classification] !== undefined) {
    edClassifications[sc.classification]++;
  } else {
    allEdScenariosValid = false;
  }

  if (sc.relatedLessonId && !validLessonIds.has(sc.relatedLessonId)) {
    allEdLessonIdsValid = false;
    console.error(`Invalid relatedLessonId: ${sc.relatedLessonId} in Email Detective scenario ${sc.id}`);
  }

  if (Array.isArray(sc.links)) {
    for (const link of sc.links) {
      if (!link.text || !link.actualDestination || !link.explanation) {
        allEdLinksInert = false;
      }
    }
  }

  if (sc.bodyHtml.includes('<a ')) {
    if (!sc.bodyHtml.includes('class="simulated-link-trigger"') || !sc.bodyHtml.includes('href="#"')) {
      allEdLinksInert = false;
    }
  }
}

assert(allEdScenariosValid, 'All Email Detective scenarios have required schema');
assert(allEdLessonIdsValid, 'All Email Detective relatedLessonIds exist in materi/manifest.json');
assert(allEdLinksInert, 'All Email Detective simulated links are safe and inert');
assert(edClassifications.legitimate >= 2, `Includes legitimate emails (found: ${edClassifications.legitimate})`);
assert(edClassifications.phishing >= 3, `Includes phishing emails (found: ${edClassifications.phishing})`);
assert(edClassifications.suspicious >= 2, `Includes suspicious emails (found: ${edClassifications.suspicious})`);

// 3. Validate Chat Trap Scenarios Data
console.log('\n--- Test Group 3: Chat Trap Scenarios & Progression Integrity ---');
const ctScenariosModule = await import('../src/games/chatTrap/scenarios.js');
const ctScenarios = ctScenariosModule.CHAT_SCENARIOS || [];

assert(ctScenarios.length >= 8 && ctScenarios.length <= 15, `Chat Trap scenario count is between 8 and 15 (found: ${ctScenarios.length})`);

let allCtScenariosValid = true;
let allCtLessonIdsValid = true;
const ctScenarioIds = new Set();
const ctDifficultyCount = { beginner: 0, intermediate: 0 };
let hasSafeInteraction = false;

for (const sc of ctScenarios) {
  if (!sc.id || !sc.title || !sc.context || !sc.contact || !Array.isArray(sc.messages) || !Array.isArray(sc.options) || !Array.isArray(sc.clues) || !sc.defenseAdvice || !sc.conceptKey) {
    allCtScenariosValid = false;
  }
  if (ctScenarioIds.has(sc.id)) {
    allCtScenariosValid = false;
  }
  ctScenarioIds.add(sc.id);

  if (ctDifficultyCount[sc.difficulty] !== undefined) {
    ctDifficultyCount[sc.difficulty]++;
  } else {
    allCtScenariosValid = false;
  }

  if (sc.relatedLessonId && !validLessonIds.has(sc.relatedLessonId)) {
    allCtLessonIdsValid = false;
    console.error(`Invalid relatedLessonId: ${sc.relatedLessonId} in Chat Trap scenario ${sc.id}`);
  }

  if (!sc.contact.name || !sc.contact.handle || !sc.contact.avatar || !sc.contact.statusType || !sc.contact.contextClue) {
    allCtScenariosValid = false;
  }

  if (sc.messages.length < 2) {
    allCtScenariosValid = false;
  }

  const safetyTypes = new Set(sc.options.map(o => o.safety));
  if (!safetyTypes.has('safe') || !safetyTypes.has('unsafe')) {
    allCtScenariosValid = false;
  }

  if (sc.contact.verified === true) {
    hasSafeInteraction = true;
  }
}

assert(allCtScenariosValid, 'All Chat Trap scenarios have required schema (id, title, context, contact, messages, options, clues, defenseAdvice)');
assert(allCtLessonIdsValid, 'All Chat Trap relatedLessonIds strictly exist in materi/manifest.json');
assert(ctDifficultyCount.beginner >= 4, `Balanced Beginner scenarios (found: ${ctDifficultyCount.beginner})`);
assert(ctDifficultyCount.intermediate >= 4, `Balanced Intermediate scenarios (found: ${ctDifficultyCount.intermediate})`);
assert(hasSafeInteraction, 'Includes legitimate conversation scenario');

// 4. Validate Password Defender Scenarios Data
console.log('\n--- Test Group 4: Password Defender 3-Mode Scenarios Integrity ---');
const pdScenariosModule = await import('../src/games/passwordDefender/scenarios.js');
const pdScenarios = pdScenariosModule.PASSWORD_SCENARIOS || [];

assert(pdScenarios.length >= 8 && pdScenarios.length <= 15, `Password Defender scenario count is between 8 and 15 (found: ${pdScenarios.length})`);

let allPdScenariosValid = true;
let allPdLessonIdsValid = true;
const pdScenarioIds = new Set();
const pdModeCount = { 'mode-a': 0, 'mode-b': 0, 'mode-c': 0 };

for (const sc of pdScenarios) {
  if (!sc.id || !sc.mode || !sc.title || !sc.account || !Array.isArray(sc.evidence) || !Array.isArray(sc.options) || !sc.principle || !sc.remediation || !sc.conceptKey) {
    allPdScenariosValid = false;
  }
  if (pdScenarioIds.has(sc.id)) {
    allPdScenariosValid = false;
  }
  pdScenarioIds.add(sc.id);

  if (pdModeCount[sc.mode] !== undefined) {
    pdModeCount[sc.mode]++;
  } else {
    allPdScenariosValid = false;
  }

  if (sc.relatedLessonId && !validLessonIds.has(sc.relatedLessonId)) {
    allPdLessonIdsValid = false;
    console.error(`Invalid relatedLessonId: ${sc.relatedLessonId} in Password Defender scenario ${sc.id}`);
  }

  if (!sc.account.name || !sc.account.type || !sc.account.initialConfig || !sc.account.alertOrDiscovery) {
    allPdScenariosValid = false;
  }

  const safetyTypes = new Set(sc.options.map(o => o.safety));
  if (!safetyTypes.has('optimal') || !safetyTypes.has('hazardous')) {
    allPdScenariosValid = false;
  }
}

assert(allPdScenariosValid, 'All Password Defender scenarios have required schema (id, mode, title, account, evidence, options, principle, remediation, conceptKey)');
assert(allPdLessonIdsValid, 'All Password Defender relatedLessonIds strictly exist in materi/manifest.json');
assert(pdModeCount['mode-a'] >= 2, `Covers Mode A (Password Strategy): ${pdModeCount['mode-a']} scenarios`);
assert(pdModeCount['mode-b'] >= 2, `Covers Mode B (Account Defense): ${pdModeCount['mode-b']} scenarios`);
assert(pdModeCount['mode-c'] >= 3, `Covers Mode C (Breach Response): ${pdModeCount['mode-c']} scenarios`);

// 5. Validate Cyber Incident Commander Scenarios Data
console.log('\n--- Test Group 5: Cyber Incident Commander Scenarios Integrity ---');
const cicScenariosModule = await import('../src/games/incidentCommander/scenarios.js');
const cicScenarios = cicScenariosModule.INCIDENT_SCENARIOS || [];

assert(cicScenarios.length >= 3, `Cyber Incident Commander scenario count is at least 3 (found: ${cicScenarios.length})`);

let allCicScenariosValid = true;
let allCicLessonIdsValid = true;
const cicScenarioIds = new Set();

for (const sc of cicScenarios) {
  if (!sc.id || !sc.code || !sc.title || !sc.org || !sc.initialSeverity || sc.initialRisk === undefined || sc.initialAvailability === undefined || !sc.overview || !Array.isArray(sc.assets) || !Array.isArray(sc.alerts) || !sc.evidenceLogs || !sc.phases || !sc.aar) {
    allCicScenariosValid = false;
  }
  if (cicScenarioIds.has(sc.id)) {
    allCicScenariosValid = false;
  }
  cicScenarioIds.add(sc.id);

  // Check valid lesson IDs in AAR and scenario
  if (Array.isArray(sc.relatedLessonIds)) {
    for (const lid of sc.relatedLessonIds) {
      if (!validLessonIds.has(lid)) {
        allCicLessonIdsValid = false;
        console.error(`Invalid relatedLessonId: ${lid} in Cyber Incident Commander scenario ${sc.id}`);
      }
    }
  }

  if (sc.aar && Array.isArray(sc.aar.recommendedLessonIds)) {
    for (const lid of sc.aar.recommendedLessonIds) {
      if (!validLessonIds.has(lid)) {
        allCicLessonIdsValid = false;
        console.error(`Invalid AAR recommendedLessonId: ${lid} in Cyber Incident Commander scenario ${sc.id}`);
      }
    }
  }

  // Check 4 operational phases exist with questions and valid options
  const reqPhases = ['phaseA', 'phaseB', 'phaseC', 'phaseD'];
  for (const ph of reqPhases) {
    const pData = sc.phases[ph];
    if (!pData || !pData.title || !pData.question || !Array.isArray(pData.options) || pData.options.length < 3) {
      allCicScenariosValid = false;
    } else {
      const types = new Set(pData.options.map(o => o.type));
      if (!types.has('optimal') || !types.has('hazardous')) {
        allCicScenariosValid = false;
      }
    }
  }

  // Check telemetry logs
  if (!Array.isArray(sc.evidenceLogs.auth) || !Array.isArray(sc.evidenceLogs.endpoint) || !Array.isArray(sc.evidenceLogs.network)) {
    allCicScenariosValid = false;
  }
}

assert(allCicScenariosValid, 'All Cyber Incident Commander scenarios have required schema (assets, alerts, evidenceLogs, phases A-D, and AAR)');
assert(allCicLessonIdsValid, 'All Cyber Incident Commander relatedLessonIds strictly exist in materi/manifest.json');

// 6. Extensible Game Hub & Registry
console.log('\n--- Test Group 6: Extensible Game Library Framework ---');
const gamesDataModule = await import('../src/games/gamesData.js');
const gamesList = gamesDataModule.GAMES_LIST || [];

assert(gamesList.length >= 5, `Games registry supports multiple games (found: ${gamesList.length})`);
const emailDetectiveGame = gamesList.find(g => g.id === 'email-detective');
assert(emailDetectiveGame && emailDetectiveGame.status === 'playable', 'Email Detective is registered as playable');

const chatTrapGame = gamesList.find(g => g.id === 'chat-trap');
assert(chatTrapGame && chatTrapGame.status === 'playable', 'Chat Trap is registered as playable');

const passwordDefenderGame = gamesList.find(g => g.id === 'password-defender');
assert(passwordDefenderGame && passwordDefenderGame.status === 'playable', 'Password Defender is registered as playable');
assert(passwordDefenderGame && passwordDefenderGame.route === '#/games/password-defender', 'Password Defender route points to #/games/password-defender');

const incidentCommanderGame = gamesList.find(g => g.id === 'incident-commander');
assert(incidentCommanderGame && incidentCommanderGame.status === 'playable', 'Cyber Incident Commander is registered as playable');
assert(incidentCommanderGame && incidentCommanderGame.route === '#/games/incident-commander', 'Cyber Incident Commander route points to #/games/incident-commander');

const upcomingGames = gamesList.filter(g => g.status === 'coming-soon');
assert(upcomingGames.length >= 1, `Remaining upcoming games registered as teasers (found: ${upcomingGames.length})`);

// 7. Internationalization & Content Preservation
console.log('\n--- Test Group 7: Localization & Content Integrity ---');
const i18nModule = await import('../src/i18n.js');
const testKeys = [
  'nav.games',
  'games.hubTitle',
  'games.ed.title',
  'games.ct.title',
  'games.pd.title',
  'games.pd.badge',
  'games.pd.modeA',
  'games.pd.modeB',
  'games.pd.modeC',
  'games.pd.decisionTitle',
  'games.pd.submitDecision',
  'games.pd.optimalResult',
  'games.pd.hazardousResult',
  'games.pd.reportTitle',
  'games.cic.title',
  'games.cic.badge',
  'games.cic.scenarioProgress',
  'games.cic.riskGauge',
  'games.cic.availabilityGauge',
  'games.cic.phaseA',
  'games.cic.phaseB',
  'games.cic.phaseC',
  'games.cic.phaseD',
  'games.cic.phaseE',
  'games.cic.reportTitle',
  'games.cic.submitAction',
  'games.cic.rankMaster'
];
let allKeysFound = true;
for (const k of testKeys) {
  const enVal = i18nModule.t(k, {}, 'en');
  const idVal = i18nModule.t(k, {}, 'id');
  if (!enVal || !idVal || enVal === k || idVal === k) {
    allKeysFound = false;
    console.error(`Missing or fallback translation for key: ${k}`);
  }
}
assert(allKeysFound, 'All games UI keys are defined in both English and Indonesian');

// Verify scenario text is in Indonesian
let cicTextInIndonesian = true;
const sampleOverviews = cicScenarios.map(s => s.overview);
for (const text of sampleOverviews) {
  const indonesianWords = ['dan', 'yang', 'ini', 'akun', 'keamanan', 'pengguna', 'layanan', 'sistem', 'adalah', 'atau', 'data', 'pada'];
  const lower = text.toLowerCase();
  const matched = indonesianWords.filter(w => lower.includes(w));
  if (matched.length < 2) {
    cicTextInIndonesian = false;
  }
}
assert(cicTextInIndonesian, 'Cyber Incident Commander educational scenarios are strictly in Indonesian');

// 8. App Shell & Navigation Integration
console.log('\n--- Test Group 8: UI & Architecture Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/games"') && indexHtml.includes('data-tab="games"'), 'index.html contains Games navigation tab link');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("games: t('nav.games')"), "src/app.js registers games tab in updateAppShellText");

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderGames') && mainJs.includes('/games'), 'src/main.js imports renderGames and registers routes');

const gamesHubJs = fs.readFileSync(path.join(rootDir, 'src', 'games', 'gamesHub.js'), 'utf8');
assert(gamesHubJs.includes("gameId === 'password-defender'") && gamesHubJs.includes('startPasswordDefenderGame'), 'gamesHub.js dispatches password-defender to startPasswordDefenderGame');
assert(gamesHubJs.includes("gameId === 'incident-commander'") && gamesHubJs.includes('startIncidentCommanderGame'), 'gamesHub.js dispatches incident-commander to startIncidentCommanderGame');

const gamesCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'games.css'), 'utf8');
assert(gamesCss.includes('.password-defender-view') && gamesCss.includes('.security-console-frame'), 'games.css contains Password Defender styles');
assert(gamesCss.includes('.incident-commander-view') && gamesCss.includes('.cic-console-grid'), 'games.css contains Cyber Incident Commander styles');

const swJs = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
assert(swJs.includes('cyberwise-v6') || swJs.includes('cyberwise-v7'), 'public/sw.js cache version maintained for PWA');

// Summary
console.log('\n==================================================');
console.log(`📊 Games Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
if (passedTests === totalTests) {
  console.log('🎉 ALL GAMES TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error(`💥 ${totalTests - passedTests} test(s) failed.\n`);
  process.exit(1);
}
