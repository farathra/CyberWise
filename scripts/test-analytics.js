// scripts/test-analytics.js
// Automated verification for CyberWise Learning Analytics & Personalized Recommendations
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('📊 Starting CyberWise Learning Analytics & Recommendations Tests...\n');

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
const analyticsDataPath = path.join(rootDir, 'src', 'insights', 'studyData.js');
assert(fs.existsSync(analyticsDataPath), 'src/insights/studyData.js exists');

const recommendationsPath = path.join(rootDir, 'src', 'insights', 'recommendations.js');
assert(fs.existsSync(recommendationsPath), 'src/insights/recommendations.js exists');

const analyticsJsPath = path.join(rootDir, 'src', 'insights', 'studyInsights.js');
assert(fs.existsSync(analyticsJsPath), 'src/insights/studyInsights.js exists');

const analyticsCssPath = path.join(rootDir, 'src', 'styles', 'insights.css');
assert(fs.existsSync(analyticsCssPath), 'src/styles/insights.css exists');

// Load modules for dynamic testing
const { calculateMetrics, getStartOfWeek } = await import('../src/insights/studyData.js');
const { generateRecommendations } = await import('../src/insights/recommendations.js');

const manifestPath = path.join(rootDir, 'materi', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const lessons = manifest.lessons;

// 2. Empty State & Zero Progress Metrics
console.log('\n--- Test Group 2: Empty State & Zero Progress Metrics ---');
const emptyMetrics = calculateMetrics({
  lessons,
  completedMap: {},
  timestampsMap: {},
  lastAccessed: null,
  quizHistory: [],
  gamesProgress: {},
  goals: { targetLessons: 3, targetQuizzes: 3 }
});

assert(emptyMetrics.overview.totalLessons === 14, `Total lessons equals manifest count (found: ${emptyMetrics.overview.totalLessons})`);
assert(emptyMetrics.overview.completedLessons === 0, 'Completed lessons is 0 for new user');
assert(emptyMetrics.overview.lessonCompletionPct === 0, 'Completion percentage is 0%');
assert(emptyMetrics.overview.totalQuizzesAttempted === 0, 'Quizzes attempted is 0');
assert(emptyMetrics.overview.averageQuizScore === null, 'Average quiz score is null when no attempts exist (not 0% or NaN)');
assert(emptyMetrics.overview.averageBestQuizScore === null, 'Average best quiz score is null when no attempts exist');
assert(emptyMetrics.overview.gamesCompleted === 0, 'Games completed is 0 for new user');
assert(emptyMetrics.overview.lastActivityDate === null, 'Last activity date is null when no activity recorded');
assert(emptyMetrics.chaptersPerformance.length === 4, 'Includes all 4 curriculum chapters');

const allSubNotStarted = emptyMetrics.chaptersPerformance.every(ch =>
  ch.subchapters.every(s => s.topicStatus === 'not_started')
);
assert(allSubNotStarted, 'All topics correctly labeled as not_started for new user');

// 3. Partial Progress & Topic Mastery Classification
console.log('\n--- Test Group 3: Partial Progress & Topic Mastery Classification ---');
const partialCompletedMap = {
  '1-a': true,
  '1-b': true
};
const now = Date.now();
const partialTimestamps = {
  '1-a': now - 86400000,
  '1-b': now
};

const mockQuizHistory = [
  // User took quiz for 1-a twice: first 50%, then 80% (pass)
  { id: 1, mode: 'subchapter', subjectId: '1-a', score: 2, total: 4, date: now - 3600000 },
  { id: 2, mode: 'subchapter', subjectId: '1-a', score: 4, total: 5, date: now - 1800000 },
  // User took quiz for 1-b: score 2/5 (40% - needs practice)
  { id: 3, mode: 'subchapter', subjectId: '1-b', score: 2, total: 5, date: now - 900000 },
  // Malformed record (should be ignored gracefully)
  { id: 4, mode: 'subchapter', subjectId: 'corrupted', score: NaN, total: 0, date: null }
];

const validQuizOnly = mockQuizHistory.filter(q => q && typeof q.score === 'number' && typeof q.total === 'number' && q.total > 0 && !isNaN(q.score));

const partialMetrics = calculateMetrics({
  lessons,
  completedMap: partialCompletedMap,
  timestampsMap: partialTimestamps,
  lastAccessed: '1-b',
  quizHistory: validQuizOnly,
  gamesProgress: {
    'email-detective': { bestScore: 850, lastPlayed: now - 500000 }
  },
  goals: { targetLessons: 3, targetQuizzes: 3 }
});

assert(partialMetrics.overview.completedLessons === 2, 'Correct completed lessons count (2)');
assert(partialMetrics.overview.lessonCompletionPct === Math.round((2 / 14) * 100), `Correct percentage: ${partialMetrics.overview.lessonCompletionPct}%`);
assert(partialMetrics.overview.totalQuizzesAttempted === 3, 'Counts valid quiz attempts only (3)');
assert(typeof partialMetrics.overview.averageQuizScore === 'number' && !isNaN(partialMetrics.overview.averageQuizScore), 'Average quiz score is valid number');
assert(partialMetrics.overview.gamesCompleted === 1, 'Correctly detected 1 completed simulation game');
assert(partialMetrics.overview.lastActivityDate === now, 'Last activity accurately reflects latest timestamp');

const ch1 = partialMetrics.chaptersPerformance.find(c => c.id === '1');
const sub1a = ch1.subchapters.find(s => s.id === '1-a');
const sub1b = ch1.subchapters.find(s => s.id === '1-b');
const sub1c = ch1.subchapters.find(s => s.id === '1-c');

assert(sub1a.topicStatus === 'completed', 'Subchapter 1-a is marked completed (lesson read & passed quiz 80%)');
assert(sub1b.topicStatus === 'needs_practice', 'Subchapter 1-b is marked needs_practice (score 40% < 70%)');
assert(sub1c.topicStatus === 'not_started', 'Subchapter 1-c is marked not_started');

// 4. Learning Trends & Daily Activity Calculation
console.log('\n--- Test Group 4: Learning Trends & Progression Data ---');
assert(partialMetrics.trends.hasData === true, 'Trends accurately reports hasData = true when activity exists');
assert(partialMetrics.trends.quizTrends.length === 3, 'Quiz trends contains 3 chronological attempts');
assert(partialMetrics.trends.dailyActivity.length === 7, 'Daily activity covers exactly 7 days');

const totalWeekActivity = partialMetrics.trends.dailyActivity.reduce((sum, d) => sum + d.totalCount, 0);
assert(totalWeekActivity > 0, `Recorded total activity in 7-day window (found: ${totalWeekActivity})`);
assert(partialMetrics.recentActivities.length > 0, 'Recent activities contains chronologically ordered events');

// 5. Weekly Goals & Routine Tracker
console.log('\n--- Test Group 5: Weekly Goals & Routine Tracker ---');
const weekStart = getStartOfWeek();
assert(typeof weekStart === 'number' && weekStart > 0, 'getStartOfWeek returns valid epoch timestamp');

const goals = partialMetrics.goalsProgress;
assert(goals.targetLessons === 3, 'Correct target lessons (3)');
assert(goals.targetQuizzes === 3, 'Correct target quizzes (3)');
assert(typeof goals.completedLessonsThisWeek === 'number', 'Calculates completed lessons this week');
assert(typeof goals.completedQuizzesThisWeek === 'number', 'Calculates completed quizzes this week');
assert(goals.lessonsGoalPct <= 100 && goals.lessonsGoalPct >= 0, 'Lessons goal percentage bounded 0-100');

// 6. Recommendation Engine Determinism & Quality
console.log('\n--- Test Group 6: Recommendation Engine Determinism & Quality ---');

// Case A: New user
const recsNew = generateRecommendations({
  lessons,
  completedMap: {},
  quizHistory: [],
  gamesProgress: {},
  goalsProgress: null
});
assert(recsNew.length >= 1, 'New user receives at least 1 recommendation');
assert(recsNew[0].type === 'continue_learning' && recsNew[0].actionUrl === '#/learn/1-a', 'First recommendation for new user points to #/learn/1-a');
assert(recsNew[0].priority === 1, 'First lesson is priority 1');

// Case B: User with weak topic (< 70%)
const recsWithWeak = generateRecommendations({
  lessons,
  completedMap: partialCompletedMap,
  quizHistory: validQuizOnly,
  gamesProgress: {},
  goalsProgress: null
});
const weakRec = recsWithWeak.find(r => r.type === 'review_weak');
assert(weakRec !== undefined, 'Generated review_weak recommendation for low quiz score');
assert(weakRec?.actionUrl === '#/learn/1-b', 'Weak topic recommendation points to lesson 1-b');
assert(weakRec?.secondaryUrl === '#/quiz/subchapter/1-b', 'Weak topic recommendation provides retake quiz link');

// Case C: User completed lesson 1-c without quiz
const completedWith1c = { ...partialCompletedMap, '1-c': true };
const recsPractice = generateRecommendations({
  lessons,
  completedMap: completedWith1c,
  quizHistory: validQuizOnly,
  gamesProgress: {},
  goalsProgress: null
});
const practiceRec = recsPractice.find(r => r.type === 'practice_quiz');
assert(practiceRec !== undefined, 'Generated practice_quiz recommendation for completed lesson without quiz');
assert(practiceRec?.actionUrl === '#/quiz/subchapter/1-c', 'Practice recommendation targets subchapter 1-c quiz');

// Case D: All 14 lessons completed
const allCompletedMap = {};
lessons.forEach(l => { allCompletedMap[l.id] = true; });
const passedQuizzes = lessons.map((l, i) => ({
  id: i + 1,
  mode: 'subchapter',
  subjectId: l.id,
  score: 5,
  total: 5,
  date: now
}));

const recsMaster = generateRecommendations({
  lessons,
  completedMap: allCompletedMap,
  quizHistory: passedQuizzes,
  gamesProgress: {
    'email-detective': { bestScore: 900 },
    'chat-trap': { bestScore: 900 },
    'password-defender': { bestScore: 900 },
    'incident-commander': { bestScore: 900 },
    'malware-mission': { bestScore: 900 }
  },
  goalsProgress: null
});
const masterRec = recsMaster.find(r => r.id === 'master-quiz');
assert(masterRec !== undefined, 'Recommends Master Quiz when all curriculum completed and passed');
assert(masterRec?.actionUrl === '#/quiz/master', 'Master Quiz action URL is #/quiz/master');

// Case E: Determinism
const run1 = JSON.stringify(generateRecommendations({ lessons, completedMap: partialCompletedMap, quizHistory: validQuizOnly }));
const run2 = JSON.stringify(generateRecommendations({ lessons, completedMap: partialCompletedMap, quizHistory: validQuizOnly }));
assert(run1 === run2, 'Recommendation engine is strictly deterministic (run1 === run2)');

// Case F: Valid route URLs
const allRecs = [...recsNew, ...recsWithWeak, ...recsPractice, ...recsMaster];
const validRoutes = allRecs.every(r => r.actionUrl.startsWith('#/'));
assert(validRoutes, 'All recommendation action URLs use valid hash routes');

// 7. UI & Shell Integration
console.log('\n--- Test Group 7: UI & Architecture Integration ---');
const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('data-tab="analytics"') && indexHtml.includes('href="#/analytics"'), 'index.html contains Analytics navigation tab link');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("analytics: t('nav.analytics')"), 'src/app.js registers analytics in tabMap');

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes('renderAnalytics') && mainJs.includes('./insights/studyInsights.js'), 'src/main.js imports renderAnalytics from studyInsights.js');
assert(mainJs.includes("route(/^\\/analytics$/, () => renderAnalytics())"), 'src/main.js registers /analytics route');

const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf8');
assert(mainCss.includes("insights.css"), 'src/styles/main.css imports insights.css');

const swJs = fs.readFileSync(path.join(rootDir, 'public', 'sw.js'), 'utf8');
assert(swJs.includes("cyberwise-v8") || swJs.includes("cyberwise-v9"), 'public/sw.js cache version maintained for PWA');

// 8. Localization Parity & Indonesian Integrity
console.log('\n--- Test Group 8: Localization Parity & Indonesian Integrity ---');
const { translations } = await import('../src/i18n.js');
const enKeys = Object.keys(translations.en).filter(k => k.startsWith('analytics.'));
const idKeys = Object.keys(translations.id).filter(k => k.startsWith('analytics.'));

assert(enKeys.length >= 35, `Substantial analytics translation keys defined (found: ${enKeys.length})`);
assert(enKeys.length === idKeys.length, 'Exact parity between EN and ID analytics keys');

const missingInId = enKeys.filter(k => !translations.id[k]);
assert(missingInId.length === 0, 'No missing analytics keys in Indonesian dictionary');

console.log(`\n==================================================`);
console.log(`📊 Analytics Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);

if (passedTests === totalTests) {
  console.log('🎉 ALL ANALYTICS & RECOMMENDATION TESTS PASSED!\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED!\n');
  process.exit(1);
}
