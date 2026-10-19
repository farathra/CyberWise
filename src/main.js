// src/main.js
// CyberWise application entry point
import './styles/main.css';
import { initApp } from './app.js';
import { initRouter, route } from './router.js';
import { renderLearn } from './learn/learn.js';
import { renderQuiz } from './quiz/quiz.js';
import { renderNotes } from './notes/notes.js';
import { renderGlossary } from './glossary/glossary.js';
import { renderGames } from './games/gamesHub.js';
import { renderAnalytics } from './insights/studyInsights.js';
import { renderAchievements } from './achievements/achievementView.js';
import { initAchievements } from './achievements/achievementEngine.js';
import { renderFlashcards, renderFlashcardsStudy } from './flashcards/flashcardsView.js';
import { initSearch } from './search/search.js';
import { syncProgressWithBackup } from './learn/progress.js';
import { initScrollReveal } from './utils/scrollReveal.js';

// Service Worker Registration & Dev Mode Protection
if ('serviceWorker' in navigator) {
  const isLocalDev = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalDev) {
    // In development mode, unregister any existing service worker so it never
    // intercepts Vite dev modules or serves stale cache on normal reload.
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const reg of registrations) {
        reg.unregister();
        console.log('[SW] Unregistered in DEV mode:', reg.scope);
      }
    }).catch(err => console.warn('[SW] Unregister failed:', err));
    if (typeof caches !== 'undefined') {
      caches.keys().then(keys => {
        keys.forEach(k => {
          if (k.startsWith('cyberwise-')) {
            caches.delete(k);
          }
        });
      }).catch(err => console.warn('[SW] Cache clear failed:', err));
    }
  } else {
    // Production PWA registration
    window.addEventListener('load', () => {
      const swUrl = import.meta.env.BASE_URL + 'sw.js';
      navigator.serviceWorker.register(swUrl)
        .then(reg => {
          console.log('[SW] Registered:', reg.scope);
          // Auto-check for updates
          reg.update();
        })
        .catch(err => console.warn('[SW] Registration failed:', err));
    });
  }
}

// Register routes (hash-based)
route(/^\/learn$/, () => renderLearn());
route(/^\/learn\/(?<lessonId>[\w-]+)$/, ({ lessonId }) => renderLearn(lessonId));
route(/^\/quiz$/, () => renderQuiz());
route(/^\/quiz\/(?<mode>[\w]+)\/(?<id>[\w-]+)$/, ({ mode, id }) => renderQuiz(mode, id));
route(/^\/quiz\/master$/, () => renderQuiz('master', 'all'));
route(/^\/notes$/, () => renderNotes());
route(/^\/notes\/(?<noteId>[\w-]+)$/, ({ noteId }) => renderNotes(noteId));
route(/^\/glossary$/, () => renderGlossary());
route(/^\/glossary\/(?<termId>[\w-]+)$/, ({ termId }) => renderGlossary(termId));
route(/^\/games$/, () => renderGames());
route(/^\/games\/(?<gameId>[\w-]+)$/, ({ gameId }) => renderGames(gameId));
route(/^\/flashcards$/, () => renderFlashcards());
route(/^\/flashcards\/study(?:\/(?<mode>[\w-]+))?$/, ({ mode }) => renderFlashcardsStudy(mode));
route(/^\/analytics$/, () => renderAnalytics());
route(/^\/achievements$/, () => renderAchievements());
route('/', () => renderLearn());

// Ensure DOM is ready before mounting router & shell
function startApp() {
  initApp();
  try {
    initSearch();
  } catch (err) {
    console.warn('[Search] Failed to init search:', err);
  }
  // Dual-layer progress sync (restores progress from IndexedDB if localStorage was cleared)
  syncProgressWithBackup();
  // Initialize and silently evaluate achievements
  initAchievements();
  // Start router
  initRouter();
  // Initialize subtle scroll reveal
  initScrollReveal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
