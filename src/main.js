// src/main.js
// CyberWise application entry point
import './styles/main.css';
import { initApp } from './app.js';
import { initRouter, route } from './router.js';
import { renderLearn } from './learn/learn.js';
import { renderQuiz } from './quiz/quiz.js';
import { renderNotes } from './notes/notes.js';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.BASE_URL + 'sw.js';
    navigator.serviceWorker.register(swUrl)
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

// Initialize app shell
initApp();

// Register routes (hash-based)
route(/^\/learn$/, () => renderLearn());
route(/^\/learn\/(?<lessonId>[\w-]+)$/, ({ lessonId }) => renderLearn(lessonId));
route(/^\/quiz$/, () => renderQuiz());
route(/^\/quiz\/(?<mode>[\w]+)\/(?<id>[\w-]+)$/, ({ mode, id }) => renderQuiz(mode, id));
route(/^\/quiz\/master$/, () => renderQuiz('master', 'all'));
route(/^\/notes$/, () => renderNotes());
route(/^\/notes\/(?<noteId>[\w-]+)$/, ({ noteId }) => renderNotes(noteId));
route('/', () => renderLearn());

// Start router
initRouter();
