// src/flashcards/srsEngine.js
// Spaced Repetition System (SRS) algorithm and state management for CyberWise Flashcards

import { get, set } from '../storage.js';
import { getDB } from '../db.js';
import { getAllFlashcards } from './flashcardsData.js';

const STORAGE_KEY = 'cyberwise_flashcards';
const SCHEMA_VERSION = 1;

/**
 * Creates initial default progress state for a card
 */
export function createInitialCardState(cardId) {
  return {
    cardId,
    status: 'new', // 'new' | 'learning' | 'review' | 'mastered'
    repetition: 0,
    interval: 0, // days
    easeFactor: 2.5,
    lastReviewed: null,
    nextReview: null,
    lapses: 0,
    isBookmarked: false,
    history: []
  };
}

/**
 * Creates default store
 */
function getDefaultStore() {
  const cards = {};
  for (const card of getAllFlashcards()) {
    cards[card.id] = createInitialCardState(card.id);
  }
  return {
    version: SCHEMA_VERSION,
    cards
  };
}

/**
 * Loads flashcards progress store from localStorage
 */
export function loadFlashcardsStore() {
  const data = get(STORAGE_KEY, null);
  const defaultStore = getDefaultStore();

  if (!data || typeof data !== 'object' || !data.cards) {
    return defaultStore;
  }

  // Ensure all current static flashcards exist in stored cards
  const mergedCards = { ...defaultStore.cards };
  for (const [id, c] of Object.entries(data.cards)) {
    if (mergedCards[id]) {
      mergedCards[id] = {
        ...mergedCards[id],
        ...c,
        isBookmarked: !!c.isBookmarked
      };
    }
  }

  return {
    version: data.version || SCHEMA_VERSION,
    cards: mergedCards
  };
}

/**
 * Saves flashcards progress store to localStorage and IndexedDB
 */
export async function saveFlashcardsStore(store) {
  set(STORAGE_KEY, store);

  // Dual-layer backup in IndexedDB app_state
  if (typeof indexedDB !== 'undefined') {
    try {
      const db = await getDB();
      if (db && db.objectStoreNames.contains('app_state')) {
        await db.put('app_state', store, 'flashcards');
      }
    } catch (err) {
      console.warn('[Flashcards] Failed to backup to IndexedDB:', err);
    }
  }
}

/**
 * Dual-layer sync: restores flashcards from IndexedDB if localStorage was wiped
 */
export async function syncFlashcardsWithBackup() {
  const local = loadFlashcardsStore();
  const studiedLocal = Object.values(local.cards).filter(c => c.status !== 'new' || c.isBookmarked).length;

  if (typeof indexedDB !== 'undefined') {
    try {
      const db = await getDB();
      if (db && db.objectStoreNames.contains('app_state')) {
        const dbBackup = await db.get('app_state', 'flashcards');
        const studiedDb = dbBackup && dbBackup.cards ? Object.values(dbBackup.cards).filter(c => c.status !== 'new' || c.isBookmarked).length : 0;

        if (studiedLocal === 0 && studiedDb > 0) {
          console.log('[Flashcards] Restoring progress from IndexedDB backup:', studiedDb, 'cards');
          set(STORAGE_KEY, dbBackup);
          return dbBackup;
        } else if (studiedLocal > 0) {
          await db.put('app_state', local, 'flashcards');
        }
      }
    } catch (err) {
      console.warn('[Flashcards] Sync error:', err);
    }
  }
  return local;
}

/**
 * End of today in local time timestamp
 */
export function getEndOfToday(now = new Date()) {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

/**
 * Start of today in local time timestamp
 */
export function getStartOfToday(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * Checks if a card is currently due for review
 */
export function isCardDue(cardState, now = Date.now()) {
  if (!cardState || cardState.status === 'new' || !cardState.nextReview) {
    return false;
  }
  const endToday = getEndOfToday(new Date(now));
  return cardState.nextReview <= endToday;
}

/**
 * Rates a card according to SM-2 Spaced Repetition rules
 * @param {string} cardId Card identifier
 * @param {'again'|'hard'|'good'|'easy'} rating User active recall rating
 * @param {number} timestamp Optional review timestamp
 * @returns {Promise<Object>} Updated card state
 */
export async function rateCard(cardId, rating, timestamp = Date.now()) {
  const store = loadFlashcardsStore();
  const card = store.cards[cardId] || createInitialCardState(cardId);

  let { repetition, interval, easeFactor, lapses } = card;

  switch (rating) {
    case 'again':
      repetition = 0;
      interval = 1; // Due next day (or immediate review queue)
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      lapses = (lapses || 0) + 1;
      card.status = 'learning';
      break;

    case 'hard':
      if (repetition === 0) {
        repetition = 1;
        interval = 1;
      } else {
        interval = Math.max(1, Math.round(interval * 1.2));
      }
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      card.status = interval >= 3 ? 'review' : 'learning';
      break;

    case 'good':
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 3;
      } else {
        interval = Math.max(2, Math.round(interval * easeFactor));
      }
      repetition += 1;
      card.status = interval >= 14 ? 'mastered' : (interval >= 3 ? 'review' : 'learning');
      break;

    case 'easy':
      if (repetition === 0) {
        interval = 4;
      } else if (repetition === 1) {
        interval = 7;
      } else {
        interval = Math.max(4, Math.round(interval * easeFactor * 1.3));
      }
      easeFactor += 0.15;
      repetition += 1;
      card.status = interval >= 14 ? 'mastered' : 'review';
      break;

    default:
      console.warn(`[SRS] Unknown rating: ${rating}`);
      return card;
  }

  // Calculate next review timestamp: timestamp + interval * 24 hours
  const nextReview = timestamp + interval * 86400000;

  card.repetition = repetition;
  card.interval = interval;
  card.easeFactor = Math.round(easeFactor * 100) / 100;
  card.lapses = lapses || 0;
  card.lastReviewed = timestamp;
  card.nextReview = nextReview;

  card.history = card.history || [];
  card.history.push({
    date: timestamp,
    rating,
    interval,
    easeFactor: card.easeFactor
  });

  store.cards[cardId] = card;
  await saveFlashcardsStore(store);

  return card;
}

/**
 * Toggles the bookmark/star status of a card
 */
export async function toggleCardBookmark(cardId) {
  const store = loadFlashcardsStore();
  const card = store.cards[cardId] || createInitialCardState(cardId);
  card.isBookmarked = !card.isBookmarked;
  store.cards[cardId] = card;
  await saveFlashcardsStore(store);
  return card.isBookmarked;
}

/**
 * Retrieves comprehensive deck statistics
 */
export function getDeckStatistics() {
  const store = loadFlashcardsStore();
  const allCards = getAllFlashcards();
  const now = Date.now();
  const startToday = getStartOfToday(new Date(now));

  let dueTodayCount = 0;
  let newCardsCount = 0;
  let reviewedTodayCount = 0;
  let masteredCount = 0;
  let learningCount = 0;
  let reviewCount = 0;
  let bookmarkedCount = 0;
  let difficultCount = 0;

  for (const card of allCards) {
    const s = store.cards[card.id] || createInitialCardState(card.id);

    if (s.isBookmarked) bookmarkedCount++;
    if (s.status !== 'new' && (s.easeFactor < 2.1 || s.lapses > 0)) {
      difficultCount++;
    }

    if (s.status === 'new') {
      newCardsCount++;
    } else {
      if (s.status === 'mastered') masteredCount++;
      else if (s.status === 'review') reviewCount++;
      else learningCount++;

      if (isCardDue(s, now)) {
        dueTodayCount++;
      }
    }

    if (s.lastReviewed && s.lastReviewed >= startToday) {
      reviewedTodayCount++;
    }
  }

  const totalCards = allCards.length;
  const studiedCount = totalCards - newCardsCount;
  const masteryPct = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

  return {
    totalCards,
    dueTodayCount,
    newCardsCount,
    reviewedTodayCount,
    masteredCount,
    learningCount,
    reviewCount,
    bookmarkedCount,
    difficultCount,
    studiedCount,
    masteryPct
  };
}

/**
 * Retrieves full list of cards merged with their SRS progress state
 */
export function getCardsWithProgress() {
  const store = loadFlashcardsStore();
  const allCards = getAllFlashcards();
  const now = Date.now();

  return allCards.map(card => {
    const state = store.cards[card.id] || createInitialCardState(card.id);
    const isDue = isCardDue(state, now);
    return {
      ...card,
      progress: {
        ...state,
        isDue
      }
    };
  });
}

/**
 * Builds a session deck for studying based on mode or filters
 * @param {'due'|'new'|'all'|'bookmarked'|'difficult'|string} mode Session mode or chapter ID
 */
export function getSessionDeck(mode = 'due') {
  const cards = getCardsWithProgress();
  const now = Date.now();

  if (mode === 'due') {
    const due = cards.filter(c => c.progress.isDue);
    // If no cards are due, offer any learning cards or return empty
    return due.length > 0 ? due : [];
  }

  if (mode === 'new') {
    return cards.filter(c => c.progress.status === 'new');
  }

  if (mode === 'bookmarked') {
    return cards.filter(c => c.progress.isBookmarked);
  }

  if (mode === 'difficult') {
    return cards.filter(c => c.progress.status !== 'new' && (c.progress.easeFactor < 2.1 || c.progress.lapses > 0));
  }

  // Chapter filter: 'chapter-1', 'chapter-2', etc.
  if (mode.startsWith('chapter-')) {
    const chId = mode.replace('chapter-', '');
    return cards.filter(c => c.chapterId === chId);
  }

  // Default: all cards
  return cards;
}

/**
 * Fisher-Yates array shuffle helper
 */
export function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Backup / Export helper: returns complete serializable flashcards progress
 */
export function getFlashcardsBackup() {
  return loadFlashcardsStore();
}

/**
 * Restore / Import helper: safely merges imported flashcards without erasing unrelated cards
 */
export async function restoreFlashcardsBackup(imported) {
  if (!imported || typeof imported !== 'object' || !imported.cards) {
    return;
  }
  const current = loadFlashcardsStore();

  for (const [id, card] of Object.entries(imported.cards)) {
    if (current.cards[id]) {
      // Merge: pick the one with higher repetitions or most recent review
      const currentCard = current.cards[id];
      const isImportMoreAdvanced = (card.repetition || 0) > (currentCard.repetition || 0) ||
                                  (card.lastReviewed || 0) > (currentCard.lastReviewed || 0);

      if (isImportMoreAdvanced || currentCard.status === 'new') {
        current.cards[id] = {
          ...currentCard,
          ...card,
          isBookmarked: card.isBookmarked || currentCard.isBookmarked
        };
      }
    }
  }

  await saveFlashcardsStore(current);
}

/**
 * Resets a single card to new status
 */
export async function resetCardProgress(cardId) {
  const store = loadFlashcardsStore();
  store.cards[cardId] = createInitialCardState(cardId);
  await saveFlashcardsStore(store);
  return store.cards[cardId];
}
