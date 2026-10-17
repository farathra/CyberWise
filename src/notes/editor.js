// src/notes/editor.js
import { getNote, saveNote } from '../db.js';
import DOMPurify from 'dompurify';
import { notifyNotesChanged } from '../search/search.js';

let autosaveTimer = null;
let lastSavedContent = null;
let currentNote = null;

export async function renderEditor(container, noteId) {
  container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading note...</p></div>';

  let note = await getNote(noteId);
  if (!note) {
    container.innerHTML = `<div class="error-state"><h2>Note Not Found</h2><p>This note does not exist or was deleted.</p><a href="#/notes" class="btn btn-primary">Back to Notes</a></div>`;
    return;
  }

  currentNote = note;
  lastSavedContent = note.content;

  container.innerHTML = `
    <div class="note-editor">
      <div class="editor-header">
        <a href="#/notes" class="btn btn-ghost" id="back-notes">← Notes</a>
        <div class="editor-header-right">
          <span id="save-status" class="save-status">Saved</span>
          <button class="btn btn-outline btn-sm" id="export-note-btn">Export</button>
        </div>
      </div>

      <input type="text" id="note-title" class="note-title-input" value="${escapeAttr(note.title)}" placeholder="Note title" />

      <div class="editor-toolbar" role="toolbar" aria-label="Text formatting">
        <button class="toolbar-btn" data-cmd="bold" title="Bold (Ctrl+B)" aria-label="Bold"><strong>B</strong></button>
        <button class="toolbar-btn" data-cmd="italic" title="Italic (Ctrl+I)" aria-label="Italic"><em>I</em></button>
        <button class="toolbar-btn" data-cmd="underline" title="Underline (Ctrl+U)" aria-label="Underline"><u>U</u></button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="formatBlock" data-val="h2" title="Heading 2" aria-label="Heading 2">H2</button>
        <button class="toolbar-btn" data-cmd="formatBlock" data-val="h3" title="Heading 3" aria-label="Heading 3">H3</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" data-cmd="insertUnorderedList" title="Bullet list" aria-label="Bullet list">• List</button>
        <button class="toolbar-btn" data-cmd="insertOrderedList" title="Numbered list" aria-label="Numbered list">1. List</button>
        <button class="toolbar-btn" data-cmd="formatBlock" data-val="blockquote" title="Blockquote" aria-label="Blockquote">❝</button>
        <div class="toolbar-separator"></div>
        <button class="toolbar-btn" id="insert-link-btn" title="Insert link" aria-label="Insert link">🔗</button>
      </div>

      <div
        id="note-content"
        class="note-editor-content"
        contenteditable="true"
        spellcheck="true"
        aria-label="Note content"
        aria-multiline="true"
      >${DOMPurify.sanitize(note.content)}</div>
    </div>`;

  const titleInput = document.getElementById('note-title');
  const contentDiv = document.getElementById('note-content');
  const saveStatus = document.getElementById('save-status');

  // Toolbar actions
  container.querySelectorAll('.toolbar-btn[data-cmd]').forEach(btn => {
    btn.addEventListener('mousedown', (e) => {
      e.preventDefault(); // Prevent focus loss
      const cmd = btn.getAttribute('data-cmd');
      const val = btn.getAttribute('data-val') || null;
      document.execCommand(cmd, false, val);
      contentDiv.focus();
      scheduleAutosave();
    });
  });

  // Link insert
  document.getElementById('insert-link-btn')?.addEventListener('click', () => {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
      contentDiv.focus();
      scheduleAutosave();
    }
  });

  // Title change
  titleInput.addEventListener('input', () => scheduleAutosave());

  // Content change
  contentDiv.addEventListener('input', () => scheduleAutosave());

  // Export
  document.getElementById('export-note-btn')?.addEventListener('click', () => {
    const html = `<!DOCTYPE html><html><head><title>${escapeHtml(currentNote.title)}</title></head><body>${currentNote.content}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentNote.title || 'note') + '.html';
    a.click();
    URL.revokeObjectURL(url);
  });

  function scheduleAutosave() {
    if (saveStatus) saveStatus.textContent = 'Saving...';
    clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(() => autosave(titleInput, contentDiv, saveStatus), 1500);
  }

  async function autosave(titleEl, contentEl, statusEl) {
    try {
      currentNote.title = titleEl.value.trim() || 'Untitled';
      const rawHtml = contentEl.innerHTML;
      currentNote.content = DOMPurify.sanitize(rawHtml);
      currentNote.updatedAt = Date.now();
      await saveNote(currentNote);
      notifyNotesChanged();
      lastSavedContent = currentNote.content;
      if (statusEl) {
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        statusEl.textContent = `Saved at ${time}`;
      }
    } catch (err) {
      console.error('[Editor] Autosave failed:', err);
      if (statusEl) statusEl.textContent = 'Save failed';
    }
  }
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
