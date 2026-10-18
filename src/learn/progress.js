// src/learn/progress.js
import { get, set } from '../storage.js';
import { saveProgressBackup, getProgressBackup } from '../db.js';
import { checkAchievements } from '../achievements/achievementEngine.js';

const KEY = 'progress';

let cachedProgress = null;

export function loadProgress() {
  if (cachedProgress && typeof cachedProgress === 'object' && cachedProgress.completed) {
    return cachedProgress;
  }
  const p = get(KEY, { completed: {}, lastAccessed: null, timestamps: {} });
  if (!p || typeof p !== 'object' || !p.completed) {
    cachedProgress = { completed: {}, lastAccessed: null, timestamps: {} };
  } else {
    cachedProgress = p;
  }
  return cachedProgress;
}

// Dual-layer sync: restores progress from IndexedDB if localStorage was cleared
export async function syncProgressWithBackup() {
  const local = loadProgress();
  const localCount = Object.keys(local.completed || {}).length;

  try {
    const dbBackup = await getProgressBackup();
    const dbCount = dbBackup && dbBackup.completed ? Object.keys(dbBackup.completed).length : 0;

    if (localCount === 0 && dbCount > 0) {
      // LocalStorage was wiped (e.g. by hard reload / clearing cache), restore from IndexedDB
      console.log('[Progress] Restoring progress from IndexedDB backup:', dbCount, 'lessons');
      cachedProgress = dbBackup;
      set(KEY, dbBackup);
      return dbBackup;
    } else if (localCount > 0) {
      // LocalStorage has progress, update IndexedDB backup
      saveProgressBackup(local);
    }
  } catch (err) {
    console.warn('[Progress] Sync error:', err);
  }
  return local;
}

export function markComplete(lessonId) {
  const p = loadProgress();
  p.completed[lessonId] = true;
  p.timestamps = p.timestamps || {};
  p.timestamps[lessonId] = Date.now();
  cachedProgress = p;
  set(KEY, p);
  saveProgressBackup(p);
  checkAchievements({ event: 'lesson_completed', lessonId }).catch(err => {
    console.warn('[Achievements] Error on lesson completion:', err);
  });
}

export function markIncomplete(lessonId) {
  const p = loadProgress();
  delete p.completed[lessonId];
  cachedProgress = p;
  set(KEY, p);
  saveProgressBackup(p);
}

export function isComplete(lessonId) {
  return !!loadProgress().completed[lessonId];
}

export function setLastAccessed(lessonId) {
  const p = loadProgress();
  p.lastAccessed = lessonId;
  cachedProgress = p;
  set(KEY, p);
  saveProgressBackup(p);
}

export function getLastAccessed() {
  return loadProgress().lastAccessed;
}

export function getCompletedIds() {
  return Object.keys(loadProgress().completed || {});
}

export function getProgress() {
  const p = loadProgress();
  return {
    completedIds: Object.keys(p.completed || {}),
    lastAccessed: p.lastAccessed,
    timestamps: p.timestamps || {}
  };
}

export function getChapterProgress(chapterId, lessons) {
  const p = loadProgress();
  const chapterLessons = lessons.filter(l => l.chapterId === chapterId);
  const completed = chapterLessons.filter(l => p.completed && p.completed[l.id]).length;
  return { completed, total: chapterLessons.length };
}
