// src/learn/learn.js
import { renderDashboard } from './dashboard.js';
import { renderLesson } from './lesson.js';

const BASE_URL = import.meta.env.BASE_URL;

let manifest = null;

export async function loadManifest() {
  if (manifest) return manifest;
  try {
    const res = await fetch(BASE_URL + 'materi/manifest.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    manifest = await res.json();
    return manifest;
  } catch (err) {
    console.error('[Learn] Failed to load lesson manifest:', err);
    throw err;
  }
}

export function getContainer() {
  return document.getElementById('page-container');
}

export async function renderLearn(lessonId = null) {
  const container = getContainer();
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';

  try {
    const manifest = await loadManifest();
    if (lessonId) {
      await renderLesson(container, manifest, lessonId);
    } else {
      renderDashboard(container, manifest);
    }
  } catch (err) {
    container.innerHTML = `
      <div class="error-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <h2>Failed to Load Content</h2>
        <p>Could not load the lesson manifest. Please check your connection and try again.</p>
        <p class="error-detail">${err.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Retry</button>
      </div>`;
  }
}
