// scripts/test-games.js
// Automated verification for CyberWise Games & Cybersecurity Simulation
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

// 1. Files & Architecture
console.log('--- Test Group 1: Files and Architecture ---');
const gamesDataPath = path.join(rootDir, 'src', 'games', 'gamesData.js');
assert(fs.existsSync(gamesDataPath), 'src/games/gamesData.js exists');

const gamesHubPath = path.join(rootDir, 'src', 'games', 'gamesHub.js');
assert(fs.existsSync(gamesHubPath), 'src/games/gamesHub.js exists');

const scenariosPath = path.join(rootDir, 'src', 'games', 'emailDetective', 'scenarios.js');
assert(fs.existsSync(scenariosPath), 'src/games/emailDetective/scenarios.js exists');

const emailDetectivePath = path.join(rootDir, 'src', 'games', 'emailDetective', 'emailDetective.js');
assert(fs.existsSync(emailDetectivePath), 'src/games/emailDetective/emailDetective.js exists');

const gamesCssPath = path.join(rootDir, 'src', 'styles', 'games.css');
assert(fs.existsSync(gamesCssPath), 'src/styles/games.css exists');

// 2. Validate Scenarios Data and Lesson ID Integrity
console.log('\n--- Test Group 2: Email Detective Scenarios Integrity ---');
const scenariosModule = await import('../src/games/emailDetective/scenarios.js');
const scenarios = scenariosModule.EMAIL_SCENARIOS || [];

assert(scenarios.length >= 8 && scenarios.length <= 15, `Scenario count is balanced between 8 and 15 (found: ${scenarios.length})`);

// Load valid lesson manifest
const materiManifestPath = path.join(rootDir, 'materi', 'manifest.json');
const materiManifest = JSON.parse(fs.readFileSync(materiManifestPath, 'utf8'));
const validLessonIds = new Set(materiManifest.lessons.map(l => l.id));

let allScenariosValid = true;
let allLessonIdsValid = true;
let allLinksInert = true;
const scenarioIds = new Set();
const classificationsCount = { legitimate: 0, suspicious: 0, phishing: 0 };

for (const sc of scenarios) {
  if (!sc.id || !sc.subject || !sc.senderName || !sc.senderEmail || !sc.classification || !sc.bodyHtml || !Array.isArray(sc.clues) || !sc.explanation || !sc.recommendation) {
    allScenariosValid = false;
  }
  if (scenarioIds.has(sc.id)) {
    allScenariosValid = false;
  }
  scenarioIds.add(sc.id);

  if (classificationsCount[sc.classification] !== undefined) {
    classificationsCount[sc.classification]++;
  } else {
    allScenariosValid = false;
  }

  // Check lesson ID
  if (sc.relatedLessonId && !validLessonIds.has(sc.relatedLessonId)) {
    allLessonIdsValid = false;
    console.error(`Invalid relatedLessonId: ${sc.relatedLessonId} in scenario ${sc.id}`);
  }

  // Check inert links
  if (Array.isArray(sc.links)) {
    for (const link of sc.links) {
      if (!link.text || !link.actualDestination || !link.explanation) {
        allLinksInert = false;
      }
    }
  }

  // Check body HTML simulated link triggers
  if (sc.bodyHtml.includes('<a ')) {
    if (!sc.bodyHtml.includes('class="simulated-link-trigger"') || !sc.bodyHtml.includes('href="#"')) {
      allLinksInert = false;
    }
  }
}

assert(allScenariosValid, 'All scenarios have required schema (id, subject, sender, classification, bodyHtml, clues, explanation, recommendation)');
assert(allLessonIdsValid, 'All scenario relatedLessonIds exist in materi/manifest.json');
assert(allLinksInert, 'All simulated links are safe, inert, and use simulated-link-trigger with href="#"');
assert(classificationsCount.legitimate >= 2, `Includes legitimate emails for balanced discernment (found: ${classificationsCount.legitimate})`);
assert(classificationsCount.phishing >= 3, `Includes realistic phishing emails (found: ${classificationsCount.phishing})`);
assert(classificationsCount.suspicious >= 2, `Includes suspicious/scam emails (found: ${classificationsCount.suspicious})`);

// 3. Extensible Game Hub & Registry
console.log('\n--- Test Group 3: Extensible Game Library Framework ---');
const gamesDataModule = await import('../src/games/gamesData.js');
const gamesList = gamesDataModule.GAMES_LIST || [];

assert(gamesList.length >= 3, `Games registry supports multiple games (found: ${gamesList.length})`);
const emailDetectiveGame = gamesList.find(g => g.id === 'email-detective');
assert(emailDetectiveGame && emailDetectiveGame.status === 'playable', 'Email Detective is registered as playable');
const upcomingGames = gamesList.filter(g => g.status === 'coming-soon');
assert(upcomingGames.length >= 2, `Upcoming games registered as teasers (found: ${upcomingGames.length})`);

// 4. Internationalization & Content Preservation
console.log('\n--- Test Group 4: Localization & Content Integrity ---');
const i18nModule = await import('../src/i18n.js');
const enKeys = ['nav.games', 'games.hubTitle', 'games.ed.title', 'games.ed.verdictLegit', 'games.ed.verdictSuspicious', 'games.ed.verdictPhishing'];
let allKeysFound = true;
for (const k of enKeys) {
  const enVal = i18nModule.t(k, {}, 'en');
  const idVal = i18nModule.t(k, {}, 'id');
  if (!enVal || !idVal || enVal === k || idVal === k) {
    allKeysFound = false;
    console.error(`Missing or fallback translation for key: ${k}`);
  }
}
assert(allKeysFound, 'All games UI keys are defined in both English and Indonesian');

// Verify scenario body text is in Indonesian
let scenarioTextInIndonesian = true;
for (const sc of scenarios) {
  const indonesianWords = ['keamanan', 'akun', 'peringatan', 'anda', 'kami', 'password', 'klik', 'email', 'sekolah', 'informasi'];
  const bodyLower = sc.bodyHtml.toLowerCase();
  const matched = indonesianWords.filter(w => bodyLower.includes(w));
  if (matched.length < 2) {
    scenarioTextInIndonesian = false;
  }
}
assert(scenarioTextInIndonesian, 'Scenario educational content strictly maintained in Indonesian');

// 5. App Shell & Navigation Integration
console.log('\n--- Test Group 5: UI & Architecture Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/games"') && indexHtml.includes('data-tab="games"'), 'index.html contains Games navigation tab link');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("games: t('nav.games')"), "src/app.js registers games tab in updateAppShellText");

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderGames') && mainJs.includes('/games'), 'src/main.js imports renderGames and registers routes');

const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf8');
assert(mainCss.includes("import './games.css'"), "src/styles/main.css imports games.css");

const swJs = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
assert(swJs.includes('cyberwise-v6'), 'public/sw.js cache version bumped to cyberwise-v6');

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
