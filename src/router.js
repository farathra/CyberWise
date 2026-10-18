// src/router.js
// Hash-based router for GitHub Pages compatibility

const routes = [];

export function route(pattern, handler) {
  routes.push({ pattern, handler });
}

function matchRoute(hash) {
  const path = hash.replace(/^#/, '') || '/learn';
  for (const r of routes) {
    if (typeof r.pattern === 'string') {
      if (r.pattern === path) return { handler: r.handler, params: {} };
    } else if (r.pattern instanceof RegExp) {
      const m = path.match(r.pattern);
      if (m) return { handler: r.handler, params: m.groups || {} };
    }
  }
  return null;
}

export function navigate(hash) {
  window.location.hash = hash;
}

export function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/learn';
}

export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

export function refreshCurrentRoute() {
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/learn';
  const match = matchRoute(hash);
  if (match) {
    try {
      match.handler(match.params);
    } catch (err) {
      console.error('[Router] Handler error for route:', hash, err);
      // Fallback to learn dashboard if route handler crashes
      if (hash !== '#/learn') {
        navigate('#/learn');
      }
    }
  } else {
    // Default to learn
    navigate('#/learn');
  }
}
