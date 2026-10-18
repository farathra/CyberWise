// scripts/test-achievements.js
// Automated verification for CyberWise Achievement System
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🏆 Starting CyberWise Achievement System Tests...\n');

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
const registryPath = path.join(rootDir, 'src', 'achievements', 'achievementRegistry.js');
assert(fs.existsSync(registryPath), 'src/achievements/achievementRegistry.js exists');

const enginePath = path.join(rootDir, 'src', 'achievements', 'achievementEngine.js');
assert(fs.existsSync(enginePath), 'src/achievements/achievementEngine.js exists');

const notificationPath = path.join(rootDir, 'src', 'achievements', 'achievementNotification.js');
assert(fs.existsSync(notificationPath), 'src/achievements/achievementNotification.js exists');

const viewPath = path.join(rootDir, 'src', 'achievements', 'achievementView.js');
assert(fs.existsSync(viewPath), 'src/achievements/achievementView.js exists');

const cssPath = path.join(rootDir, 'src', 'styles', 'achievements.css');
assert(fs.existsSync(cssPath), 'src/styles/achievements.css exists');

// Load modules dynamically
const { ACHIEVEMENTS_LIST, ACHIEVEMENT_CATEGORIES, getAchievementById } = await import('../src/achievements/achievementRegistry.js');
const { restoreAchievementsBackup } = await import('../src/achievements/achievementEngine.js');
const { translations } = await import('../src/i18n.js');

// 2. Registry Integrity
console.log('\n--- Test Group 2: Registry Structure and Unique IDs ---');
assert(ACHIEVEMENTS_LIST.length === 24, `Achievement count is exactly 24 (found: ${ACHIEVEMENTS_LIST.length})`);

const idSet = new Set();
let uniqueIds = true;
for (const a of ACHIEVEMENTS_LIST) {
  if (idSet.has(a.id)) {
    uniqueIds = false;
    break;
  }
  idSet.add(a.id);
}
assert(uniqueIds, 'All 24 achievement IDs are strictly unique');

const validCategories = ['learning', 'quiz', 'games', 'consistency', 'exploration'];
const allValidCats = ACHIEVEMENTS_LIST.every(a => validCategories.includes(a.category));
assert(allValidCats, 'All achievements belong to valid defined categories');

const allHaveEvaluators = ACHIEVEMENTS_LIST.every(a => typeof a.evaluate === 'function' && a.maxProgress > 0);
assert(allHaveEvaluators, 'All achievements have valid evaluation functions and positive maxProgress');

// 3. New User Zero Progress State
console.log('\n--- Test Group 3: Empty State & Zero Progress Metrics ---');
const emptyState = {
  completedLessonIds: [],
  completedLessonCount: 0,
  quizAttemptsCount: 0,
  bestQuizPct: 0,
  hasPerfectScore: false,
  highScoreAttemptsCount: 0,
  distinctQuizTopicsCount: 0,
  gamesCompletedMap: {},
  completedGamesCount: 0,
  notesCount: 0,
  distinctActiveDaysCount: 0,
  exploredTermsCount: 0,
  hasReviewedQuiz: false,
  otherUnlockedCount: 0
};

const emptyResults = ACHIEVEMENTS_LIST.map(a => a.evaluate(emptyState));
const allLockedForNewUser = emptyResults.every(r => r.isUnlocked === false);
assert(allLockedForNewUser, 'All achievements are locked for new users with zero progress');

const allZeroProgress = emptyResults.every(r => r.currentProgress === 0);
assert(allZeroProgress, 'Current progress is 0 for all achievements for new user');

// 4. Learning Achievements Progression
console.log('\n--- Test Group 4: Learning Achievements Progression ---');
const firstStepsDef = getAchievementById('first-steps');
const curiousDef = getAchievementById('curious-learner');
const scholarDef = getAchievementById('cyber-scholar');
const chCompleteDef = getAchievementById('chapter-complete');

// 1 lesson
const state1 = { ...emptyState, completedLessonCount: 1, completedLessonIds: ['1-a'] };
assert(firstStepsDef.evaluate(state1).isUnlocked === true, 'First Steps unlocks on 1 completed lesson');
assert(curiousDef.evaluate(state1).isUnlocked === false && curiousDef.evaluate(state1).currentProgress === 1, 'Curious Learner reports 1/5 progress');

// 5 lessons
const state5 = { ...emptyState, completedLessonCount: 5, completedLessonIds: ['1-a', '1-b', '1-c', '2-a', '2-b'] };
assert(curiousDef.evaluate(state5).isUnlocked === true, 'Curious Learner unlocks on 5 completed lessons');
assert(chCompleteDef.evaluate(state5).isUnlocked === true, 'Chapter Complete unlocks when Chapter 1 (1-a, 1-b, 1-c) is fully completed');

// 14 lessons
const state14 = { ...emptyState, completedLessonCount: 14 };
assert(scholarDef.evaluate(state14).isUnlocked === true, 'Cyber Scholar unlocks on all 14 completed lessons');

// 5. Quiz Mastery Progression
console.log('\n--- Test Group 5: Quiz Mastery Progression ---');
const firstTestDef = getAchievementById('first-test');
const sharpMindDef = getAchievementById('sharp-mind');
const perfectScoreDef = getAchievementById('perfect-score');
const consistentPerfDef = getAchievementById('consistent-performer');
const quizExplorerDef = getAchievementById('quiz-explorer');

// First quiz low score (50%)
const quizStateLow = { ...emptyState, quizAttemptsCount: 1, bestQuizPct: 50 };
assert(firstTestDef.evaluate(quizStateLow).isUnlocked === true, 'First Test unlocks on first quiz');
assert(sharpMindDef.evaluate(quizStateLow).isUnlocked === false, 'Sharp Mind remains locked at 50%');

// Quiz score 85%
const quizStateHigh = { ...emptyState, quizAttemptsCount: 1, bestQuizPct: 85, highScoreAttemptsCount: 1 };
assert(sharpMindDef.evaluate(quizStateHigh).isUnlocked === true, 'Sharp Mind unlocks on score >= 80%');
assert(perfectScoreDef.evaluate(quizStateHigh).isUnlocked === false, 'Perfect Score remains locked at 85%');

// Perfect score (100%)
const quizState100 = { ...quizStateHigh, hasPerfectScore: true, bestQuizPct: 100 };
assert(perfectScoreDef.evaluate(quizState100).isUnlocked === true, 'Perfect Score unlocks on 100% quiz');

// Consistent performer (3 high score attempts)
const quizState3High = { ...quizStateHigh, highScoreAttemptsCount: 3 };
assert(consistentPerfDef.evaluate(quizState3High).isUnlocked === true, 'Consistent Performer unlocks on 3 high score attempts');

// Quiz explorer (3 distinct topics)
const quizState3Topics = { ...emptyState, distinctQuizTopicsCount: 3 };
assert(quizExplorerDef.evaluate(quizState3Topics).isUnlocked === true, 'Quiz Explorer unlocks on 3 distinct topics');

// 6. Games Achievements
console.log('\n--- Test Group 6: Cybersecurity Games Achievements ---');
const playerOneDef = getAchievementById('player-one');
const emailDetectiveDef = getAchievementById('email-detective');
const chatTrapDef = getAchievementById('conversation-guardian');
const passwordDef = getAchievementById('password-defender');
const cicDef = getAchievementById('incident-commander');
const mmDef = getAchievementById('malware-mission');
const gameExplorerDef = getAchievementById('cyber-game-explorer');

const gameStateED = {
  ...emptyState,
  completedGamesCount: 1,
  gamesCompletedMap: { 'email-detective': true }
};
assert(playerOneDef.evaluate(gameStateED).isUnlocked === true, 'Player One unlocks on 1 game completed');
assert(emailDetectiveDef.evaluate(gameStateED).isUnlocked === true, 'Email Detective achievement unlocks on email-detective completed');
assert(chatTrapDef.evaluate(gameStateED).isUnlocked === false, 'Chat Trap remains locked');

const gameStateAll5 = {
  ...emptyState,
  completedGamesCount: 5,
  gamesCompletedMap: {
    'email-detective': true,
    'chat-trap': true,
    'password-defender': true,
    'incident-commander': true,
    'malware-mission': true
  }
};
assert(chatTrapDef.evaluate(gameStateAll5).isUnlocked === true, 'Conversation Guardian unlocks');
assert(passwordDef.evaluate(gameStateAll5).isUnlocked === true, 'Password Defender unlocks');
assert(cicDef.evaluate(gameStateAll5).isUnlocked === true, 'Incident Commander unlocks');
assert(mmDef.evaluate(gameStateAll5).isUnlocked === true, 'Malware Mission unlocks');
assert(gameExplorerDef.evaluate(gameStateAll5).isUnlocked === true, 'Cyber Game Explorer unlocks on all 5 games completed');

// 7. Consistency & Exploration
console.log('\n--- Test Group 7: Consistency and Exploration Achievements ---');
const backForMoreDef = getAchievementById('back-for-more');
const weeklyLearnerDef = getAchievementById('weekly-learner');
const glossaryExpDef = getAchievementById('glossary-explorer');
const noteTakerDef = getAchievementById('note-taker');
const preparedLearnerDef = getAchievementById('prepared-learner');
const completionistDef = getAchievementById('cyberwise-completionist');

const consistencyState3 = { ...emptyState, distinctActiveDaysCount: 3 };
assert(backForMoreDef.evaluate(consistencyState3).isUnlocked === true, 'Back for More unlocks on 3 distinct calendar days');
assert(weeklyLearnerDef.evaluate(consistencyState3).isUnlocked === false, 'Weekly Learner requires 7 days (currently locked at 3/7)');

const consistencyState7 = { ...emptyState, distinctActiveDaysCount: 7 };
assert(weeklyLearnerDef.evaluate(consistencyState7).isUnlocked === true, 'Weekly Learner unlocks on 7 distinct calendar days');

const exploreState = {
  ...emptyState,
  exploredTermsCount: 5,
  notesCount: 1,
  hasReviewedQuiz: true,
  otherUnlockedCount: 10
};
assert(glossaryExpDef.evaluate(exploreState).isUnlocked === true, 'Glossary Explorer unlocks on 5 explored terms');
assert(noteTakerDef.evaluate(exploreState).isUnlocked === true, 'Note Taker unlocks on 1 note created');
assert(preparedLearnerDef.evaluate(exploreState).isUnlocked === true, 'Prepared Learner unlocks on quiz review recorded');
assert(completionistDef.evaluate(exploreState).isUnlocked === true, 'CyberWise Completionist unlocks when >= 10 other achievements unlocked');

// 8. Determinism & Progress Bounds
console.log('\n--- Test Group 8: Determinism and Progress Bounds ---');
const sampleState = {
  ...emptyState,
  completedLessonCount: 7,
  quizAttemptsCount: 4,
  bestQuizPct: 88,
  distinctActiveDaysCount: 4
};
const runA = JSON.stringify(ACHIEVEMENTS_LIST.map(a => a.evaluate(sampleState)));
const runB = JSON.stringify(ACHIEVEMENTS_LIST.map(a => a.evaluate(sampleState)));
assert(runA === runB, 'Evaluation is strictly deterministic (runA === runB)');

const allBounded = ACHIEVEMENTS_LIST.every(a => {
  const res = a.evaluate(sampleState);
  return res.currentProgress >= 0 && res.currentProgress <= res.maxProgress;
});
assert(allBounded, 'All achievements calculate progress bounded between 0 and maxProgress');

// 9. Bilingual Parity for All Achievements
console.log('\n--- Test Group 9: Localization Parity for Achievements ---');
const missingKeys = [];
for (const a of ACHIEVEMENTS_LIST) {
  if (!translations.en[a.titleKey]) missingKeys.push(`EN missing: ${a.titleKey}`);
  if (!translations.id[a.titleKey]) missingKeys.push(`ID missing: ${a.titleKey}`);
  if (!translations.en[a.descKey]) missingKeys.push(`EN missing: ${a.descKey}`);
  if (!translations.id[a.descKey]) missingKeys.push(`ID missing: ${a.descKey}`);
}
assert(missingKeys.length === 0, `All 24 achievements have 100% translation key parity in EN and ID (errors: ${missingKeys.length})`);

// 10. UI and Navigation Integration
console.log('\n--- Test Group 10: UI and Navigation Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/achievements"') && indexHtml.includes('data-tab="achievements"'), 'index.html contains Achievements navigation tab');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("achievements: t('nav.achievements')"), 'src/app.js registers achievements in tabMap');

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderAchievements'), 'src/main.js imports renderAchievements');
assert(mainJs.includes("route(/^\\/achievements$/, () => renderAchievements())"), 'src/main.js registers /achievements route');
assert(mainJs.includes('initAchievements()'), 'src/main.js calls initAchievements() on startup');

const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf8');
assert(mainCss.includes("achievements.css"), 'src/styles/main.css imports achievements.css');

console.log(`\n==================================================`);
console.log(`📊 Achievements Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);

if (passedTests === totalTests) {
  console.log('🎉 ALL ACHIEVEMENT SYSTEM TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
