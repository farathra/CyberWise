// src/db.js
// IndexedDB setup using idb library
import { openDB } from 'idb';

const DB_NAME = 'cyberwise_db';
const DB_VERSION = 1;

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
