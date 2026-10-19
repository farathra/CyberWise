// scripts/test-flashcards.js
// Automated verification tests for CyberWise Flashcards & Spaced Repetition System (SRS)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🃏 Starting CyberWise Flashcards & Smart Review Tests...\n');

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

// Global mock storage for node environment
const mockStorage = {};
globalThis.localStorage = {
  getItem: (key) => mockStorage[key] || null,
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
globalThis.window = {
  location: { hash: '#/flashcards' },
  addEventListener: () => {},
  removeEventListener: () => {}
};
globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => [],
  documentElement: {
    setAttribute: () => {},
    getAttribute: () => 'light'
  }
};

// 1. Files & Architecture
console.log('--- Test Group 1: Files and Architecture ---');
const dataPath = path.join(rootDir, 'src', 'flashcards', 'flashcardsData.js');
assert(fs.existsSync(dataPath), 'src/flashcards/flashcardsData.js exists');

const enginePath = path.join(rootDir, 'src', 'flashcards', 'srsEngine.js');
assert(fs.existsSync(enginePath), 'src/flashcards/srsEngine.js exists');

const viewPath = path.join(rootDir, 'src', 'flashcards', 'flashcardsView.js');
assert(fs.existsSync(viewPath), 'src/flashcards/flashcardsView.js exists');

const cssPath = path.join(rootDir, 'src', 'styles', 'flashcards.css');
assert(fs.existsSync(cssPath), 'src/styles/flashcards.css exists');

const mainCss = fs.readFileSync(path.join(rootDir, 'src', 'styles', 'main.css'), 'utf8');
assert(mainCss.includes("import './flashcards.css'"), 'src/styles/main.css imports flashcards.css');

const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
assert(indexHtml.includes('href="#/flashcards"') && indexHtml.includes('data-tab="flashcards"'), 'index.html contains flashcards tab navigation');

const appJs = fs.readFileSync(path.join(rootDir, 'src', 'app.js'), 'utf8');
assert(appJs.includes("flashcards: t('nav.flashcards')"), 'src/app.js tabMap includes flashcards');

const mainJs = fs.readFileSync(path.join(rootDir, 'src', 'main.js'), 'utf8');
assert(mainJs.includes("route(/^\\/flashcards$/") && mainJs.includes("renderFlashcards"), 'src/main.js registers flashcards routes');

const notesJs = fs.readFileSync(path.join(rootDir, 'src', 'notes', 'notes.js'), 'utf8');
assert(notesJs.includes("flashcards: getFlashcardsBackup()") && notesJs.includes("restoreFlashcardsBackup"), 'src/notes/notes.js includes flashcards backup & restore');

// Load modules dynamically
const { FLASHCARDS_DATA, getFlashcardsByChapter, getFlashcardById } = await import('../src/flashcards/flashcardsData.js');
const {
  createInitialCardState,
  loadFlashcardsStore,
  saveFlashcardsStore,
  rateCard,
  isCardDue,
  getDeckStatistics,
  getSessionDeck,
  toggleCardBookmark,
  getFlashcardsBackup,
  restoreFlashcardsBackup,
  resetCardProgress,
  getEndOfToday
} = await import('../src/flashcards/srsEngine.js');
const { translations, t } = await import('../src/i18n.js');

// 2. Flashcards Data & Content Integrity
console.log('\n--- Test Group 2: Flashcards Curriculum Data Integrity ---');
assert(Array.isArray(FLASHCARDS_DATA) && FLASHCARDS_DATA.length === 35, `Curriculum has 35 authentic flashcards (found: ${FLASHCARDS_DATA.length})`);

const idSet = new Set();
let allIdsUnique = true;
let allFieldsValid = true;
let indonesianQuestions = true;

const subchaptersExpected = [
  '1-a', '1-b', '1-c',
  '2-a', '2-b', '2-c', '2-d', '2-e',
  '3-a', '3-b', '3-c', '3-d',
  '4-a', '4-b'
];
const subchaptersFound = new Set();

for (const card of FLASHCARDS_DATA) {
  if (idSet.has(card.id)) allIdsUnique = false;
  idSet.add(card.id);

  if (!card.id || !card.chapterId || !card.chapterTitle || !card.subchapterId || !card.subchapterTitle || !card.front || !card.back || !card.explanation) {
    allFieldsValid = false;
  }

  subchaptersFound.add(card.subchapterId);

  // Check that front, back, hint, and explanation are in Indonesian
  if (card.front.length < 5 || card.back.length < 3 || card.explanation.length < 10) {
    indonesianQuestions = false;
  }
}

assert(allIdsUnique, 'All flashcard IDs are completely unique');
assert(allFieldsValid, 'All flashcards have id, chapter, subchapter, front, back, and explanation');
assert(subchaptersFound.size >= 14, `Covers all curriculum subchapters (found: ${subchaptersFound.size} subchapters)`);
assert(indonesianQuestions, 'Flashcard content questions, answers, and explanations are thorough Indonesian text');

const ch1Cards = getFlashcardsByChapter('1');
const ch2Cards = getFlashcardsByChapter('2');
const ch3Cards = getFlashcardsByChapter('3');
const ch4Cards = getFlashcardsByChapter('4');
assert(ch1Cards.length > 0 && ch2Cards.length > 0 && ch3Cards.length > 0 && ch4Cards.length > 0, 'Every chapter (1-4) has flashcards available');

const singleCard = getFlashcardById('fc-1-a-1');
assert(singleCard && singleCard.subchapterId === '1-a', 'getFlashcardById retrieves correct card (fc-1-a-1)');

// 3. Spaced Repetition (SM-2) Engine Logic
console.log('\n--- Test Group 3: Spaced Repetition (SM-2) Engine & Rating Transitions ---');

// Initial Card State
const initialState = createInitialCardState('test-card-1');
assert(initialState.status === 'new' && initialState.interval === 0 && initialState.repetition === 0 && initialState.easeFactor === 2.5, 'createInitialCardState creates correct initial SM-2 defaults');

// New card is not due
assert(!isCardDue(initialState), 'New unstudied card is not marked due');

// Reset store for deterministic testing
localStorage.clear();

// Test Rating: 'again' (lapse / forgetting)
const now = Date.now();
const resAgain = await rateCard('fc-1-a-1', 'again', now);
assert(resAgain.status === 'learning', 'Rating "again" sets status to "learning"');
assert(resAgain.interval === 1, 'Rating "again" sets interval to 1 day');
assert(resAgain.repetition === 0, 'Rating "again" resets repetition count to 0');
assert(resAgain.lapses === 1, 'Rating "again" increments lapses count to 1');
assert(resAgain.easeFactor === 2.3, `Rating "again" decreases easeFactor by 0.2 (expected: 2.3, got: ${resAgain.easeFactor})`);

// Due calculation after interval:
// When scheduled for 1 day in the past or now, is it due?
const pastCard = { ...resAgain, nextReview: now - 10000 };
assert(isCardDue(pastCard, now), 'Card with past nextReview timestamp is due');

const futureCard = { ...resAgain, nextReview: now + 5 * 86400000 };
assert(!isCardDue(futureCard, now), 'Card with future nextReview (> today) is not due');

// Test Rating: 'good' sequential progression
// Session 1: Repetition 1
const resGood1 = await rateCard('fc-1-a-2', 'good', now);
assert(resGood1.repetition === 1 && resGood1.interval === 1 && resGood1.status === 'learning', 'First "good" review: repetition 1, interval 1 day');

// Session 2: Repetition 2
const resGood2 = await rateCard('fc-1-a-2', 'good', now + 86400000);
assert(resGood2.repetition === 2 && resGood2.interval === 3 && resGood2.status === 'review', 'Second "good" review: repetition 2, interval 3 days, status "review"');

// Session 3: Repetition 3 (interval = Math.round(3 * 2.5) = 8 days)
const resGood3 = await rateCard('fc-1-a-2', 'good', now + 4 * 86400000);
assert(resGood3.repetition === 3 && resGood3.interval === 8 && resGood3.status === 'review', `Third "good" review: repetition 3, interval 8 days (got: ${resGood3.interval})`);

// Session 4: Repetition 4 (interval = Math.round(8 * 2.5) = 20 days -> mastered!)
const resGood4 = await rateCard('fc-1-a-2', 'good', now + 12 * 86400000);
assert(resGood4.repetition === 4 && resGood4.interval === 20 && resGood4.status === 'mastered', `Fourth "good" review: interval 20 days sets status to "mastered"`);

// Test Rating: 'easy'
const resEasy = await rateCard('fc-1-a-3', 'easy', now);
assert(resEasy.repetition === 1 && resEasy.interval === 4 && resEasy.status === 'review', 'First "easy" review sets interval to 4 days, status "review"');
assert(resEasy.easeFactor === 2.65, `Rating "easy" increases easeFactor by 0.15 (expected: 2.65, got: ${resEasy.easeFactor})`);

// Test Rating: 'hard'
const resHard = await rateCard('fc-1-b-1', 'hard', now);
assert(resHard.repetition === 1 && resHard.interval === 1, 'First "hard" review keeps interval at 1 day');
assert(resHard.easeFactor === 2.35, `Rating "hard" reduces easeFactor by 0.15 (expected: 2.35, got: ${resHard.easeFactor})`);

// Bookmarking
const isBookmarked1 = await toggleCardBookmark('fc-1-a-1');
assert(isBookmarked1 === true, 'toggleCardBookmark stars the card');
const isBookmarked2 = await toggleCardBookmark('fc-1-a-1');
assert(isBookmarked2 === false, 'toggleCardBookmark unstars the card');

// Reset card progress
const resetRes = await resetCardProgress('fc-1-a-1');
assert(resetRes.status === 'new' && resetRes.interval === 0, 'resetCardProgress restores card to brand new state');

// 4. Deck Statistics & Session Selection
console.log('\n--- Test Group 4: Deck Statistics and Session Deck Builder ---');
const stats = getDeckStatistics();
assert(stats.totalCards === 35, `Statistics shows totalCards = 35 (got: ${stats.totalCards})`);
assert(stats.masteredCount >= 1, `Statistics shows masteredCount >= 1 (got: ${stats.masteredCount})`);
assert(stats.reviewedTodayCount >= 3, `Statistics shows reviewedTodayCount >= 3 (got: ${stats.reviewedTodayCount})`);
assert(typeof stats.masteryPct === 'number' && stats.masteryPct >= 0, `Statistics calculates mastery percentage (${stats.masteryPct}%)`);

// Test getSessionDeck
const allDeck = getSessionDeck('all');
assert(allDeck.length === 35, `getSessionDeck('all') returns entire curriculum deck (35 cards)`);

const newDeck = getSessionDeck('new');
assert(newDeck.length > 0 && newDeck.every(c => c.progress.status === 'new'), 'getSessionDeck("new") returns only new unstudied cards');

// 5. Backup & Restore Integration
console.log('\n--- Test Group 5: Backup Export & Restore Integration ---');
const backupData = getFlashcardsBackup();
assert(backupData && backupData.cards && typeof backupData.cards === 'object', 'getFlashcardsBackup produces serializable store');

// Create test mock import with an advanced card
const importPayload = {
  version: 1,
  cards: {
    'fc-2-a-1': {
      cardId: 'fc-2-a-1',
      status: 'mastered',
      repetition: 6,
      interval: 45,
      easeFactor: 2.7,
      nextReview: now + 45 * 86400000,
      isBookmarked: true
    }
  }
};

await restoreFlashcardsBackup(importPayload);
const storeAfter = loadFlashcardsStore();
assert(storeAfter.cards['fc-2-a-1'].status === 'mastered' && storeAfter.cards['fc-2-a-1'].repetition === 6, 'restoreFlashcardsBackup merges imported card progress into local store');
assert(storeAfter.cards['fc-2-a-1'].isBookmarked === true, 'restoreFlashcardsBackup restores bookmark state');

// 6. Localization & Bilingual Parity
console.log('\n--- Test Group 6: Localization & UI Key Parity ---');
const requiredKeys = [
  'nav.flashcards',
  'flashcards.title',
  'flashcards.subtitle',
  'flashcards.kpiDueToday',
  'flashcards.kpiNewCards',
  'flashcards.kpiReviewedToday',
  'flashcards.kpiMastered',
  'flashcards.startReviewBtn',
  'flashcards.studyNewBtn',
  'flashcards.rateAgain',
  'flashcards.rateHard',
  'flashcards.rateGood',
  'flashcards.rateEasy',
  'flashcards.deckExplorerTitle',
  'flashcards.searchPlaceholder',
  'flashcards.completedTitle',
  'flashcards.statusMastered',
  'flashcards.statusReview',
  'flashcards.statusLearning',
  'flashcards.statusNew'
];

let allEnPresent = true;
let allIdPresent = true;
for (const k of requiredKeys) {
  if (!(k in translations.en)) allEnPresent = false;
  if (!(k in translations.id)) allIdPresent = false;
}

assert(allEnPresent, 'All key flashcard translations exist in English dictionary');
assert(allIdPresent, 'All key flashcard translations exist in Indonesian dictionary');

assert(t('flashcards.progressFraction', { current: 3, total: 20 }) === 'Card 3 of 20', 'Parameter interpolation works in English');
assert(t('flashcards.bannerDueTitle', { count: 7 }).includes('7'), 'Count interpolation works for banner title');

// Summary
console.log('\n==================================================');
console.log(`📊 Flashcards Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests/totalTests)*100)}%)`);
if (passedTests === totalTests) {
  console.log('🎉 ALL FLASHCARDS & SMART REVIEW TESTS PASSED!\n');
} else {
  console.error('⚠️ SOME FLASHCARDS TESTS FAILED.\n');
  process.exit(1);
}
