// src/storage.js
// localStorage helpers for lightweight preferences and progress

const PREFIX = 'cyberwise_';

export function get(key, defaultValue = null) {
  try {
    const val = localStorage.getItem(PREFIX + key);
    if (val === null) return defaultValue;
    return JSON.parse(val);
  } catch {
    return defaultValue;
  }
}

export function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    console.warn('[Storage] Could not save to localStorage:', key);
    return false;
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}

export function clear() {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
