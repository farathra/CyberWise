// src/notes/notes.js
import { getAllNotes, saveNote, deleteNote } from '../db.js';
import { navigate } from '../router.js';
import DOMPurify from 'dompurify';
import { notifyNotesChanged } from '../search/search.js';
import { t } from '../i18n.js';
import { checkAchievements, getAchievementsBackup, restoreAchievementsBackup } from '../achievements/achievementEngine.js';
import { getFlashcardsBackup, restoreFlashcardsBackup } from '../flashcards/srsEngine.js';

function getContainer() {
  return document.getElementById('page-container');
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export async function renderNotes(noteId = null) {
  const container = getContainer();
  if (noteId) {
    const { renderEditor } = await import('./editor.js');
    renderEditor(container, noteId);
  } else {
    renderNotesList(container);
  }
}

async function renderNotesList(container) {
  container.innerHTML = `<div class="loading"><div class="spinner"></div><p>${t('notes.loading')}</p></div>`;

  let notes = [];
  try {
    notes = await getAllNotes();
  } catch (err) {
    container.innerHTML = `<div class="error-state"><h2>${t('notes.loadError')}</h2><p>${err.message}</p></div>`;
    return;
  }

  renderNotesView(container, notes);
}

function renderNotesView(container, notes, searchQuery = '', sortBy = 'date') {
  // Filter
  let filtered = notes.filter(n =>
    !searchQuery || n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return b.updatedAt - a.updatedAt;
  });

  container.innerHTML = `
    <div class="notes-module">
      <div class="notes-header">
        <h1>${t('notes.title')}</h1>
        <div class="notes-header-actions">
          <button class="btn btn-primary" id="new-note-btn">${t('notes.newBtn')}</button>
          <button class="btn btn-outline" id="export-all-btn" ${notes.length === 0 ? 'disabled' : ''}>${t('notes.exportAll')}</button>
          <label class="btn btn-outline" style="cursor:pointer;">
            ${t('notes.importBtn')}
            <input type="file" id="import-btn" accept=".json" style="display:none" />
          </label>
        </div>
      </div>

      <p class="notes-sync-notice">${t('notes.syncNotice')}</p>

      <div class="notes-toolbar">
        <input type="search" id="notes-search" placeholder="${t('notes.searchPlaceholder')}" value="${escapeHtml(searchQuery)}" class="search-input" />
        <select id="notes-sort" class="sort-select">
          <option value="date" ${sortBy === 'date' ? 'selected' : ''}>${t('notes.sortRecent')}</option>
          <option value="title" ${sortBy === 'title' ? 'selected' : ''}>${t('notes.sortTitle')}</option>
        </select>
      </div>

      <div class="notes-grid">
        ${filtered.length === 0 ? `
          <div class="notes-empty">
            ${searchQuery
              ? `<p>${t('notes.noMatch', { query: escapeHtml(searchQuery) })}</p>`
              : `<p>${t('notes.empty')}</p>`}
          </div>` : ''}
        ${filtered.map(note => `
          <div class="note-card ${note.pinned ? 'pinned' : ''}" data-note-id="${note.id}">
            <div class="note-card-header">
              <h3 class="note-card-title">${escapeHtml(note.title) || t('notes.untitled')}</h3>
              <div class="note-card-actions">
                <button class="btn-icon pin-btn" data-id="${note.id}" title="${note.pinned ? t('notes.unpin') : t('notes.pin')}" aria-label="${note.pinned ? t('notes.unpinAria') : t('notes.pinAria')}">
                  ${note.pinned ? '📌' : '📍'}
                </button>
                <button class="btn-icon delete-btn" data-id="${note.id}" title="${t('notes.delete')}" aria-label="${t('notes.deleteAria')}">🗑</button>
              </div>
            </div>
            <div class="note-card-preview">${getPreview(note.content)}</div>
            <div class="note-card-footer">
              <span class="note-date">${formatDate(note.updatedAt)}</span>
              <a href="#/notes/${note.id}" class="btn btn-ghost btn-sm">${t('notes.open')}</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

  // New note
  document.getElementById('new-note-btn')?.addEventListener('click', async () => {
    const note = { id: generateId(), title: t('notes.untitledNote'), content: '', createdAt: Date.now(), updatedAt: Date.now(), pinned: false };
    await saveNote(note);
    notifyNotesChanged();
    checkAchievements({ event: 'note_saved' }).catch(() => {});
    navigate('#/notes/' + note.id);
  });

  // Export all (includes notes & achievements)
  document.getElementById('export-all-btn')?.addEventListener('click', () => {
    const data = JSON.stringify({
      exported: new Date().toISOString(),
      notes,
      achievements: getAchievementsBackup(),
      flashcards: getFlashcardsBackup()
    }, null, 2);
    downloadFile('cyberwise-notes-backup.json', data, 'application/json');
  });

  // Import (supports notes, achievements, and flashcards)
  document.getElementById('import-btn')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const importedNotes = parsed.notes || (Array.isArray(parsed) ? parsed : []);
      for (const n of importedNotes) {
        const clean = {
          id: n.id || generateId(),
          title: String(n.title || t('notes.untitledNote')).slice(0, 200),
          content: DOMPurify.sanitize(n.content || ''),
          createdAt: n.createdAt || Date.now(),
          updatedAt: n.updatedAt || Date.now(),
          pinned: !!n.pinned
        };
        await saveNote(clean);
      }

      // Restore achievements if present in backup (without deleting existing if missing)
      if (parsed.achievements) {
        await restoreAchievementsBackup(parsed.achievements);
      }

      // Restore flashcards if present in backup (without deleting existing if missing)
      if (parsed.flashcards) {
        await restoreFlashcardsBackup(parsed.flashcards);
      }

      notifyNotesChanged();
      const updated = await getAllNotes();
      renderNotesView(container, updated, searchQuery, sortBy);
    } catch (err) {
      alert(t('notes.importError', { msg: err.message }));
    }
  });

  // Search
  document.getElementById('notes-search')?.addEventListener('input', async (e) => {
    const q = e.target.value;
    const all = await getAllNotes();
    renderNotesView(container, all, q, sortBy);
  });

  // Sort
  document.getElementById('notes-sort')?.addEventListener('change', async (e) => {
    const all = await getAllNotes();
    renderNotesView(container, all, searchQuery, e.target.value);
  });

  // Pin
  container.querySelectorAll('.pin-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const note = notes.find(n => n.id === id);
      if (note) {
        note.pinned = !note.pinned;
        await saveNote(note);
        notifyNotesChanged();
        const updated = await getAllNotes();
        renderNotesView(container, updated, searchQuery, sortBy);
      }
    });
  });

  // Delete
  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      const note = notes.find(n => n.id === id);
      const name = note ? note.title || t('notes.untitled') : 'this note';
      if (confirm(t('notes.deleteConfirm', { name }))) {
        await deleteNote(id);
        notifyNotesChanged();
        const updated = await getAllNotes();
        renderNotesView(container, updated, searchQuery, sortBy);
      }
    });
  });
}

function getPreview(html) {
  const div = document.createElement('div');
  div.innerHTML = DOMPurify.sanitize(html);
  const text = div.textContent || '';
  return escapeHtml(text.slice(0, 120)) + (text.length > 120 ? '...' : '');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
