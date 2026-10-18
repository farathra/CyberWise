// src/games/gamesData.js
// Games registry and local progress storage for CyberWise Games Lab
import { get, set } from '../storage.js';

const STORAGE_KEY = 'games_progress';

export const GAMES_LIST = [
  {
    id: 'email-detective',
    titleKey: 'games.ed.title',
    descKey: 'games.ed.desc',
    categoryKey: 'games.ed.category',
    durationKey: 'games.ed.duration',
    difficultyKey: 'games.diffBeginner',
    status: 'playable',
    icon: '🕵️‍♂️',
    badge: 'NEW',
    route: '#/games/email-detective'
  },
  {
    id: 'chat-trap',
    titleKey: 'games.ct.title',
    descKey: 'games.ct.desc',
    categoryKey: 'games.ct.category',
    durationKey: 'games.ct.duration',
    difficultyKey: 'games.diffBeginner',
    status: 'playable',
    icon: '💬',
    badge: 'NEW',
    route: '#/games/chat-trap'
  },
  {
    id: 'password-defender',
    titleKey: 'games.pd.title',
    descKey: 'games.pd.desc',
    categoryKey: 'games.pd.category',
    durationKey: 'games.pd.duration',
    difficultyKey: 'games.diffIntermediate',
    status: 'coming-soon',
    icon: '🛡️',
    badge: 'COMING SOON',
    route: null
  },
  {
    id: 'malware-mission',
    titleKey: 'games.mm.title',
    descKey: 'games.mm.desc',
    categoryKey: 'games.mm.category',
    durationKey: 'games.mm.duration',
    difficultyKey: 'games.diffAdvanced',
    status: 'coming-soon',
    icon: '🦠',
    badge: 'COMING SOON',
    route: null
  }
];

/**
 * Retrieves all saved games progress from localStorage
 */
export function getAllGamesProgress() {
  return get(STORAGE_KEY, {});
}

/**
 * Retrieves saved progress for a specific game
 */
export function getGameProgress(gameId) {
  const all = getAllGamesProgress();
  return all[gameId] || null;
}

/**
 * Saves completed game session record (score, accuracy, timestamp)
 */
export function saveGameProgress(gameId, data) {
  const all = getAllGamesProgress();
  const currentBest = all[gameId]?.bestScore || 0;
  const bestScore = Math.max(currentBest, data.score || 0);

  all[gameId] = {
    ...data,
    bestScore,
    lastPlayed: Date.now()
  };

  set(STORAGE_KEY, all);
  return all[gameId];
}
