// src/achievements/achievementEngine.js
// Centralized achievement evaluation, progress tracking, and persistence engine

import { get, set } from '../storage.js';
import { getDB } from '../db.js';
import { ACHIEVEMENTS_LIST, getAchievementById } from './achievementRegistry.js';
import { notifyAchievementUnlock } from './achievementNotification.js';
import { loadProgress } from '../learn/progress.js';
import { getAllQuizHistory, getAllNotes } from '../db.js';
import { getAllGamesProgress } from '../games/gamesData.js';

const STORAGE_KEY = 'cyberwise_achievements';
const SCHEMA_VERSION = 1;

let isEvaluating = false;

/**
 * Returns default initial achievement store
 */
function getDefaultStore() {
  return {
    version: SCHEMA_VERSION,
    unlocked: {}, // { [id]: { unlockedAt: timestamp } }
    exploredTerms: [], // array of unique term IDs
    hasReviewedQuiz: false
  };
}

/**
 * Retrieves the achievements store from localStorage
 */
export function getStoredAchievements() {
  const data = get(STORAGE_KEY, null);
  if (!data || typeof data !== 'object') {
    return getDefaultStore();
  }
  return {
    version: data.version || SCHEMA_VERSION,
    unlocked: data.unlocked && typeof data.unlocked === 'object' ? data.unlocked : {},
    exploredTerms: Array.isArray(data.exploredTerms) ? data.exploredTerms : [],
    hasReviewedQuiz: !!data.hasReviewedQuiz
  };
}

/**
 * Saves achievements store to localStorage and IndexedDB backup
 */
export async function saveStoredAchievements(store) {
  set(STORAGE_KEY, store);

  // Dual-layer backup in IndexedDB app_state
  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('app_state')) {
      await db.put('app_state', store, 'achievements');
    }
  } catch (err) {
    console.warn('[Achievements] Failed to backup to IndexedDB:', err);
  }
}

/**
 * Syncs with IndexedDB backup if localStorage was cleared
 */
export async function syncAchievementsWithBackup() {
  const local = getStoredAchievements();
  const localCount = Object.keys(local.unlocked || {}).length;

  try {
    const db = await getDB();
    if (db && db.objectStoreNames.contains('app_state')) {
      const dbBackup = await db.get('app_state', 'achievements');
      const dbCount = dbBackup && dbBackup.unlocked ? Object.keys(dbBackup.unlocked).length : 0;

      if (localCount === 0 && dbCount > 0) {
        console.log('[Achievements] Restoring achievements from IndexedDB backup:', dbCount);
        set(STORAGE_KEY, dbBackup);
        return dbBackup;
      } else if (localCount > 0) {
        await db.put('app_state', local, 'achievements');
      }
    }
  } catch (err) {
    console.warn('[Achievements] Sync backup error:', err);
  }
  return local;
}

/**
 * Converts a timestamp to local calendar day string (YYYY-MM-DD)
 */
function toLocalDayString(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gathers complete actual learning data from local stores
 */
export async function gatherEvaluationState(stored) {
  // 1. Lessons progress
  const progress = loadProgress() || { completed: {}, timestamps: {} };
  const completedLessonIds = Object.keys(progress.completed || {}).filter(id => progress.completed[id]);
  const lessonTimestamps = progress.timestamps || {};

  // 2. Quiz history from IndexedDB
  let quizHistory = [];
  try {
    quizHistory = await getAllQuizHistory();
  } catch {
    quizHistory = [];
  }

  const validQuizzes = (quizHistory || []).filter(q =>
    q && typeof q === 'object' &&
    typeof q.score === 'number' &&
    typeof q.total === 'number' &&
    q.total > 0 &&
    !isNaN(q.score)
  );

  let bestQuizPct = 0;
  let hasPerfectScore = false;
  let highScoreAttemptsCount = 0;
  const distinctQuizTopics = new Set();

  for (const q of validQuizzes) {
    const pct = Math.round((q.score / q.total) * 100);
    if (pct > bestQuizPct) bestQuizPct = pct;
    if (q.score === q.total && q.total > 0) hasPerfectScore = true;
    if (pct >= 80) highScoreAttemptsCount++;
    if (q.subjectId) distinctQuizTopics.add(q.subjectId);
  }

  // 3. Games progress from localStorage
  const gamesProgress = getAllGamesProgress() || {};
  const supportedGames = ['email-detective', 'chat-trap', 'password-defender', 'incident-commander', 'malware-mission'];
  const gamesCompletedMap = {};
  let completedGamesCount = 0;

  for (const gid of supportedGames) {
    const g = gamesProgress[gid];
    if (g && (g.bestScore > 0 || g.lastPlayed > 0)) {
      gamesCompletedMap[gid] = true;
      completedGamesCount++;
    }
  }

  // 4. Notes count from IndexedDB
  let notesCount = 0;
  let notesTimestamps = [];
  try {
    const notes = await getAllNotes();
    notesCount = (notes || []).length;
    notesTimestamps = (notes || []).map(n => n.updatedAt || n.createdAt).filter(Boolean);
  } catch {
    notesCount = 0;
  }

  // 5. Distinct calendar active days
  const activeDays = new Set();

  // From completed lessons
  for (const ts of Object.values(lessonTimestamps)) {
    const day = toLocalDayString(ts);
    if (day) activeDays.add(day);
  }

  // From quizzes
  for (const q of validQuizzes) {
    const day = toLocalDayString(q.date);
    if (day) activeDays.add(day);
  }

  // From games
  for (const g of Object.values(gamesProgress)) {
    if (g && g.lastPlayed) {
      const day = toLocalDayString(g.lastPlayed);
      if (day) activeDays.add(day);
    }
  }

  // From notes
  for (const ts of notesTimestamps) {
    const day = toLocalDayString(ts);
    if (day) activeDays.add(day);
  }

  // Count currently unlocked achievements excluding 'cyberwise-completionist'
  const unlockedKeys = Object.keys(stored?.unlocked || {});
  const otherUnlockedCount = unlockedKeys.filter(k => k !== 'cyberwise-completionist').length;

  return {
    completedLessonIds,
    completedLessonCount: completedLessonIds.length,
    quizAttemptsCount: validQuizzes.length,
    bestQuizPct,
    hasPerfectScore,
    highScoreAttemptsCount,
    distinctQuizTopicsCount: distinctQuizTopics.size,
    gamesCompletedMap,
    completedGamesCount,
    notesCount,
    distinctActiveDaysCount: activeDays.size,
    exploredTermsCount: (stored?.exploredTerms || []).length,
    hasReviewedQuiz: !!stored?.hasReviewedQuiz,
    otherUnlockedCount
  };
}

/**
 * Checks all achievements against genuine user state and unlocks any newly earned
 * @param {Object} context Optional event metadata (e.g. { event: 'lesson_completed', lessonId })
 * @param {Object} options Evaluation options (e.g. { silent: false })
 * @returns {Promise<Array>} Newly unlocked achievements
 */
export async function checkAchievements(context = {}, options = { silent: false }) {
  if (isEvaluating) return [];
  isEvaluating = true;

  try {
    const stored = getStoredAchievements();
    const state = await gatherEvaluationState(stored);
    const newlyUnlocked = [];

    // Step 1: Evaluate standard achievements
    for (const achievement of ACHIEVEMENTS_LIST) {
      if (achievement.id === 'cyberwise-completionist') continue;

      const evalResult = achievement.evaluate(state);
      const isAlreadyUnlocked = !!stored.unlocked[achievement.id];

      if (evalResult.isUnlocked && !isAlreadyUnlocked) {
        stored.unlocked[achievement.id] = {
          unlockedAt: Date.now()
        };
        newlyUnlocked.push(achievement);
      }
    }

    // Step 2: Re-calculate for cyberwise-completionist with updated unlocks count
    const completionistDef = getAchievementById('cyberwise-completionist');
    if (completionistDef) {
      const totalUnlockedNow = Object.keys(stored.unlocked).filter(k => k !== 'cyberwise-completionist').length;
      state.otherUnlockedCount = totalUnlockedNow;

      const compResult = completionistDef.evaluate(state);
      const isAlreadyUnlocked = !!stored.unlocked['cyberwise-completionist'];

      if (compResult.isUnlocked && !isAlreadyUnlocked) {
        stored.unlocked['cyberwise-completionist'] = {
          unlockedAt: Date.now()
        };
        newlyUnlocked.push(completionistDef);
      }
    }

    // Save if any new achievement was unlocked
    if (newlyUnlocked.length > 0) {
      await saveStoredAchievements(stored);

      // Trigger toasts only if not silent
      if (!options.silent) {
        for (const item of newlyUnlocked) {
          notifyAchievementUnlock(item);
        }
      }
    }

    return newlyUnlocked;
  } catch (err) {
    console.error('[Achievements] Evaluation failed:', err);
    return [];
  } finally {
    isEvaluating = false;
  }
}

/**
 * Returns full achievement progress data ready for UI rendering
 */
export async function getAchievementsOverview() {
  const stored = getStoredAchievements();
  const state = await gatherEvaluationState(stored);

  const items = ACHIEVEMENTS_LIST.map(achievement => {
    const isUnlocked = !!stored.unlocked[achievement.id];
    const unlockedAt = stored.unlocked[achievement.id]?.unlockedAt || null;
    const evalResult = achievement.evaluate(state);

    const currentProgress = isUnlocked ? achievement.maxProgress : evalResult.currentProgress;
    const maxProgress = achievement.maxProgress;
    const pct = Math.min(100, Math.round((currentProgress / maxProgress) * 100));

    return {
      ...achievement,
      isUnlocked,
      unlockedAt,
      currentProgress,
      maxProgress,
      pct
    };
  });

  const totalUnlocked = items.filter(a => a.isUnlocked).length;
  const totalAvailable = items.length;
  const completionPct = totalAvailable > 0 ? Math.round((totalUnlocked / totalAvailable) * 100) : 0;

  // Recently unlocked (sorted by unlockedAt desc)
  const recentlyUnlocked = items
    .filter(a => a.isUnlocked && a.unlockedAt)
    .sort((a, b) => b.unlockedAt - a.unlockedAt)
    .slice(0, 3);

  return {
    items,
    totalUnlocked,
    totalAvailable,
    completionPct,
    recentlyUnlocked,
    exploredTermsCount: state.exploredTermsCount,
    distinctActiveDaysCount: state.distinctActiveDaysCount
  };
}

/**
 * Records that a user explored a glossary term
 */
export async function recordGlossaryTermExplored(termId) {
  if (!termId) return;
  const cleanId = String(termId).toLowerCase().trim();
  const stored = getStoredAchievements();

  if (!stored.exploredTerms.includes(cleanId)) {
    stored.exploredTerms.push(cleanId);
    await saveStoredAchievements(stored);
    await checkAchievements({ event: 'glossary_explored', termId: cleanId });
  }
}

/**
 * Records that a user reviewed their quiz answers/mistakes
 */
export async function recordQuizReviewed() {
  const stored = getStoredAchievements();
  if (!stored.hasReviewedQuiz) {
    stored.hasReviewedQuiz = true;
    await saveStoredAchievements(stored);
    await checkAchievements({ event: 'quiz_reviewed' });
  }
}

/**
 * Backup / Export helper: returns complete serializable achievements payload
 */
export function getAchievementsBackup() {
  return getStoredAchievements();
}

/**
 * Restore / Import helper: merges imported achievements without overwriting existing data
 */
export async function restoreAchievementsBackup(importedAchievements) {
  if (!importedAchievements || typeof importedAchievements !== 'object') {
    return;
  }
  const current = getStoredAchievements();

  // Merge unlocked
  const importedUnlocked = importedAchievements.unlocked || {};
  for (const [id, val] of Object.entries(importedUnlocked)) {
    if (!current.unlocked[id] && getAchievementById(id)) {
      current.unlocked[id] = {
        unlockedAt: val?.unlockedAt || Date.now()
      };
    }
  }

  // Merge explored terms
  const importedTerms = Array.isArray(importedAchievements.exploredTerms) ? importedAchievements.exploredTerms : [];
  for (const term of importedTerms) {
    if (!current.exploredTerms.includes(term)) {
      current.exploredTerms.push(term);
    }
  }

  if (importedAchievements.hasReviewedQuiz) {
    current.hasReviewedQuiz = true;
  }

  await saveStoredAchievements(current);
  await checkAchievements({}, { silent: true });
}

/**
 * Initialize achievements engine on application start
 */
export async function initAchievements() {
  await syncAchievementsWithBackup();
  // Evaluate silently on startup so no spurious notifications appear
  await checkAchievements({}, { silent: true });
}
