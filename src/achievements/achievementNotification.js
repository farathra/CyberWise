// src/achievements/achievementNotification.js
// Non-intrusive, accessible toast notification queue for achievement unlocks

import { t } from '../i18n.js';
import { navigate } from '../router.js';

let notificationQueue = [];
let isShowing = false;
let toastContainer = null;
let currentTimeout = null;

function ensureToastContainer() {
  if (toastContainer && document.body.contains(toastContainer)) {
    return toastContainer;
  }
  toastContainer = document.getElementById('achievement-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'achievement-toast-container';
    toastContainer.className = 'achievement-toast-container';
    toastContainer.setAttribute('role', 'region');
    toastContainer.setAttribute('aria-label', 'Achievement Notifications');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

/**
 * Enqueues an achievement unlock notification
 * @param {Object} achievement Achievement definition object
 */
export function notifyAchievementUnlock(achievement) {
  if (!achievement) return;

  // Avoid queuing duplicates of the same achievement currently in queue
  if (notificationQueue.some(item => item.id === achievement.id)) {
    return;
  }

  notificationQueue.push(achievement);
  if (!isShowing) {
    displayNextNotification();
  }
}

/**
 * Displays the next notification in the queue
 */
function displayNextNotification() {
  if (notificationQueue.length === 0) {
    isShowing = false;
    return;
  }

  isShowing = true;
  const achievement = notificationQueue.shift();
  const container = ensureToastContainer();

  // Create toast card
  const toast = document.createElement('div');
  toast.className = 'achievement-toast animate-slide-in';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.setAttribute('tabindex', '0');

  const title = t(achievement.titleKey);
  const desc = t(achievement.descKey);

  toast.innerHTML = `
    <div class="toast-icon-wrap" aria-hidden="true">${achievement.icon || '🏆'}</div>
    <div class="toast-content">
      <span class="toast-kicker">${t('achievements.unlockedToastKicker')}</span>
      <h4 class="toast-title">${title}</h4>
      <p class="toast-desc">${desc}</p>
    </div>
    <div class="toast-actions">
      <button type="button" class="btn-toast-view" aria-label="${t('achievements.viewToastBtn')}">${t('achievements.viewToastBtn')}</button>
      <button type="button" class="btn-toast-close" aria-label="${t('achievements.closeToastAria')}">✕</button>
    </div>
  `;

  // Click on toast or view button navigates to achievements
  const viewBtn = toast.querySelector('.btn-toast-view');
  viewBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast(toast);
    navigate('#/achievements');
  });

  const closeBtn = toast.querySelector('.btn-toast-close');
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissToast(toast);
  });

  // Keyboard accessibility: Enter or Space on toast navigates to achievements
  toast.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismissToast(toast);
    } else if (e.key === 'Enter') {
      dismissToast(toast);
      navigate('#/achievements');
    }
  });

  container.appendChild(toast);

  // Auto-dismiss after 4.5 seconds
  currentTimeout = setTimeout(() => {
    dismissToast(toast);
  }, 4500);
}

/**
 * Dismisses a toast smoothly and continues queue
 */
function dismissToast(toast) {
  if (currentTimeout) {
    clearTimeout(currentTimeout);
    currentTimeout = null;
  }
  if (!toast || !toast.parentNode) return;

  toast.classList.remove('animate-slide-in');
  toast.classList.add('animate-slide-out');

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    // Brief pause before showing next queued toast
    setTimeout(() => {
      displayNextNotification();
    }, 250);
  }, 250);
}
