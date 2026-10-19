// src/utils/scrollReveal.js
// Subtle, non-intrusive scroll reveal & fluid viewport animation system

const REVEAL_SELECTORS = [
  '.scroll-reveal',
  '.dashboard-command-hub',
  '.continue-card',
  '.progress-overview',
  '.chapter-card',
  '.game-card',
  '.flashcards-kpi-grid .kpi-card',
  '.deck-card',
  '.achievement-card',
  '.recommendation-card',
  '.note-card',
  '.glossary-card',
  '.question-container',
  '.quiz-chapter-section',
  '.master-quiz-card',
  '.games-hero',
  '.glossary-hero',
  '.insights-welcome-card',
  '.achievements-welcome-card'
].join(', ');

let revealObserver = null;
let mutationObserver = null;
let scanTimeout = null;

function prefersReducedMotion() {
  return typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function initScrollReveal() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Cleanup any existing observer instance
  if (revealObserver) {
    revealObserver.disconnect();
    revealObserver = null;
  }

  const isReduced = prefersReducedMotion();
  const hasIO = 'IntersectionObserver' in window;

  if (hasIO && !isReduced) {
    revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.05
    });
  }

  // Initial scan and setup
  scanAndObserve();

  // Watch for SPA route changes and DOM mutations within #page-container
  const pageContainer = document.getElementById('page-container') || document.getElementById('app') || document.body;
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  mutationObserver = new MutationObserver(() => {
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = setTimeout(scanAndObserve, 35);
  });

  mutationObserver.observe(pageContainer, {
    childList: true,
    subtree: true
  });
}

function revealElement(el, delayMs = 0) {
  if (!el) return;

  if (delayMs > 0) {
    setTimeout(() => {
      el.classList.add('revealed');
      cleanupAfterReveal(el);
    }, delayMs);
  } else {
    requestAnimationFrame(() => {
      el.classList.add('revealed');
      cleanupAfterReveal(el);
    });
  }
}

function cleanupAfterReveal(el) {
  // After animation completes (420ms + buffer), remove helper classes so there is zero
  // CSS specificity clash with subsequent hover/active transitions.
  setTimeout(() => {
    if (el && el.classList) {
      el.classList.remove('scroll-reveal');
      el.classList.add('reveal-done');
    }
  }, 450);
}

export function scanAndObserve() {
  if (typeof document === 'undefined') return;

  const isReduced = prefersReducedMotion();
  const elements = document.querySelectorAll(REVEAL_SELECTORS);
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  let inViewStaggerCount = 0;

  elements.forEach(el => {
    // Skip if already processed or already revealed
    if (el.hasAttribute('data-reveal-init') || el.classList.contains('reveal-done')) return;
    el.setAttribute('data-reveal-init', 'true');

    if (isReduced || !revealObserver) {
      el.classList.add('reveal-done');
      return;
    }

    // Check if element is already within the visible viewport
    const rect = el.getBoundingClientRect();
    const isInInitialView = rect.top < viewportHeight && rect.bottom > 0;

    el.classList.add('scroll-reveal');

    if (isInInitialView) {
      // Gentle micro-stagger for initial on-screen elements (capped at 4 items)
      const staggerDelay = Math.min(inViewStaggerCount, 4) * 35;
      inViewStaggerCount++;
      revealElement(el, staggerDelay);
    } else {
      revealObserver.observe(el);
    }
  });
}
