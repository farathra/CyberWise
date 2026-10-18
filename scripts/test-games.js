// scripts/test-games.js
// Automated verification for CyberWise Games & Cybersecurity Simulation (Email Detective & Chat Trap)
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

  // Ensure contact details
  if (!sc.contact.name || !sc.contact.handle || !sc.contact.avatar || !sc.contact.statusType || !sc.contact.contextClue) {
    allCtScenariosValid = false;
  }

  // Check messages
  if (sc.messages.length < 2) {
    allCtScenariosValid = false;
  }

  // Check options has safe, caution, unsafe
  const safetyTypes = new Set(sc.options.map(o => o.safety));
  if (!safetyTypes.has('safe') || !safetyTypes.has('unsafe')) {
    allCtScenariosValid = false;
  }

  // Check if there is a legitimate interaction scenario
  if (sc.contact.verified === true) {
    hasSafeInteraction = true;
  }
}

assert(allCtScenariosValid, 'All Chat Trap scenarios have required schema (id, title, context, contact, messages, options, clues, defenseAdvice)');
assert(allCtLessonIdsValid, 'All Chat Trap relatedLessonIds strictly exist in materi/manifest.json');
assert(ctDifficultyCount.beginner >= 4, `Balanced Beginner scenarios (found: ${ctDifficultyCount.beginner})`);
assert(ctDifficultyCount.intermediate >= 4, `Balanced Intermediate scenarios (found: ${ctDifficultyCount.intermediate})`);
assert(hasSafeInteraction, 'Includes legitimate/safe conversation scenario so players do not automatically distrust everyone');

// 4. Extensible Game Hub & Registry
console.log('\n--- Test Group 4: Extensible Game Library Framework ---');
const gamesDataModule = await import('../src/games/gamesData.js');
const gamesList = gamesDataModule.GAMES_LIST || [];

assert(gamesList.length >= 4, `Games registry supports multiple games (found: ${gamesList.length})`);
const emailDetectiveGame = gamesList.find(g => g.id === 'email-detective');
assert(emailDetectiveGame && emailDetectiveGame.status === 'playable', 'Email Detective is registered as playable');

const chatTrapGame = gamesList.find(g => g.id === 'chat-trap');
assert(chatTrapGame && chatTrapGame.status === 'playable', 'Chat Trap is registered as playable');
assert(chatTrapGame && chatTrapGame.route === '#/games/chat-trap', 'Chat Trap route points to #/games/chat-trap');

const upcomingGames = gamesList.filter(g => g.status === 'coming-soon');
assert(upcomingGames.length >= 2, `Upcoming games registered as teasers (found: ${upcomingGames.length})`);

// 5. Internationalization & Content Preservation
console.log('\n--- Test Group 5: Localization & Content Integrity ---');
const i18nModule = await import('../src/i18n.js');
const testKeys = [
  'nav.games',
  'games.hubTitle',
  'games.ed.title',
  'games.ct.title',
  'games.ct.badge',
  'games.ct.decisionHeading',
  'games.ct.submitResponse',
  'games.ct.safeResult',
  'games.ct.unsafeResult',
  'games.ct.reportTitle'
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
let scenarioTextInIndonesian = true;
const sampleMessages = ctScenarios.flatMap(s => s.messages.map(m => m.text));
for (const text of sampleMessages) {
  const indonesianWords = ['dan', 'yang', 'ini', 'kamu', 'anda', 'kami', 'ke', 'di', 'dari', 'bisa', 'tolong', 'jangan', 'halo'];
  const lower = text.toLowerCase();
  const matched = indonesianWords.filter(w => lower.includes(w));
  if (matched.length === 0) {
    scenarioTextInIndonesian = false;
  }
}
assert(scenarioTextInIndonesian, 'Chat Trap educational scenarios are strictly maintained in Indonesian');

// 6. App Shell & Navigation Integration
console.log('\n--- Test Group 6: UI & Architecture Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/games"') && indexHtml.includes('data-tab="games"'), 'index.html contains Games navigation tab link');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("games: t('nav.games')"), "src/app.js registers games tab in updateAppShellText");

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderGames') && mainJs.includes('/games'), 'src/main.js imports renderGames and registers routes');

const gamesHubJs = fs.readFileSync(path.join(rootDir, 'src', 'games', 'gamesHub.js'), 'utf8');
assert(gamesHubJs.includes("gameId === 'chat-trap'") && gamesHubJs.includes('startChatTrapGame'), 'gamesHub.js dispatches chat-trap to startChatTrapGame');

const gamesCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'games.css'), 'utf8');
assert(gamesCss.includes('.chat-trap-view') && gamesCss.includes('.chat-bubble'), 'games.css contains Chat Trap styles');

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
