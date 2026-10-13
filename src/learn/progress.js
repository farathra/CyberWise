// src/learn/progress.js
import { get, set } from '../storage.js';

const KEY = 'progress';

function loadProgress() {
  return get(KEY, { completed: {}, lastAccessed: null, timestamps: {} });
}

export function markComplete(lessonId) {
  const p = loadProgress();
  p.completed[lessonId] = true;
  p.timestamps[lessonId] = Date.now();
  set(KEY, p);
}

export function markIncomplete(lessonId) {
  const p = loadProgress();
  delete p.completed[lessonId];
  set(KEY, p);
}

export function isComplete(lessonId) {
  return !!loadProgress().completed[lessonId];
}

export function setLastAccessed(lessonId) {
  const p = loadProgress();
  p.lastAccessed = lessonId;
  set(KEY, p);
}

export function getLastAccessed() {
  return loadProgress().lastAccessed;
}

export function getCompletedIds() {
  return Object.keys(loadProgress().completed);
}

export function getProgress() {
  const p = loadProgress();
  return {
    completedIds: Object.keys(p.completed),
    lastAccessed: p.lastAccessed,
    timestamps: p.timestamps
  };
}

export function getChapterProgress(chapterId, lessons) {
  const p = loadProgress();
  const chapterLessons = lessons.filter(l => l.chapterId === chapterId);
  const completed = chapterLessons.filter(l => p.completed[l.id]).length;
  return { completed, total: chapterLessons.length };
}
