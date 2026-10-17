// src/db.js
// IndexedDB setup using idb library
import { openDB } from 'idb';

const DB_NAME = 'cyberwise_db';
const DB_VERSION = 2;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Notes store
        if (!db.objectStoreNames.contains('notes')) {
          const notes = db.createObjectStore('notes', { keyPath: 'id' });
          notes.createIndex('pinned', 'pinned');
          notes.createIndex('updatedAt', 'updatedAt');
          notes.createIndex('title', 'title');
        }
        // Quiz history store
        if (!db.objectStoreNames.contains('quiz_history')) {
          const history = db.createObjectStore('quiz_history', { keyPath: 'id', autoIncrement: true });
          history.createIndex('date', 'date');
          history.createIndex('mode', 'mode');
          history.createIndex('subjectId', 'subjectId');
        }
        // App state and progress backup store (resilient against localStorage clearing)
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state');
        }
      }
    });
  }
  return dbPromise;
}

// Notes CRUD
export async function getNotes() {
  const db = await getDB();
  return db.getAll('notes');
}

export async function getNote(id) {
  const db = await getDB();
  return db.get('notes', id);
}

export async function saveNote(note) {
  const db = await getDB();
  return db.put('notes', note);
}

export async function deleteNote(id) {
  const db = await getDB();
  return db.delete('notes', id);
}

export async function getAllNotes() {
  const db = await getDB();
  return db.getAll('notes');
}

// Quiz history CRUD
export async function saveQuizResult(result) {
  const db = await getDB();
  return db.add('quiz_history', result);
}

export async function getQuizHistory(limit = 20) {
  const db = await getDB();
  const all = await db.getAll('quiz_history');
  return all.sort((a, b) => b.date - a.date).slice(0, limit);
}

// Progress backup in IndexedDB (survives hard reload and cache clearing)
export async function saveProgressBackup(progress) {
  try {
    const db = await getDB();
    if (db.objectStoreNames.contains('app_state')) {
      await db.put('app_state', progress, 'progress');
    }
  } catch (err) {
    console.warn('[DB] Failed to save progress backup:', err);
  }
}

export async function getProgressBackup() {
  try {
    const db = await getDB();
    if (db.objectStoreNames.contains('app_state')) {
      return await db.get('app_state', 'progress');
    }
  } catch (err) {
    console.warn('[DB] Failed to read progress backup:', err);
  }
  return null;
}
