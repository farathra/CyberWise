// src/quiz/history.js
import { saveQuizResult, getQuizHistory } from '../db.js';

export async function recordResult({ mode, id, score, total, date }) {
  return saveQuizResult({ mode, subjectId: id, score, total, date: date || Date.now() });
}

export async function getHistory() {
  return getQuizHistory(20);
}

export function formatHistoryEntry(entry) {
  const pct = Math.round((entry.score / entry.total) * 100);
  const date = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${date} — ${entry.mode} (${entry.subjectId}): ${entry.score}/${entry.total} (${pct}%)`;
}
