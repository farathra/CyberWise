// src/search/searchIndex.js
// Offline-first client-side search index for CyberWise
// Indexes Learn materials (chapters, subchapters, markdown content),
// Quiz questions (without revealing answers/explanations), and user Notes.

import { getAllNotes } from '../db.js';
import { t } from '../i18n.js';

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';

// In-memory cache
let learnIndex = null;
let quizIndex = null;
let notesIndex = null;
let isIndexing = false;
let notesStale = true;

/**
 * Strips HTML tags safely to return plain text
 */
export function stripHtml(html = '') {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Strips Markdown formatting (headings, bold, italics, links, code blocks) to plain text
 */
export function stripMarkdown(md = '') {
  if (!md) return '';
  return md
    // Strip frontmatter
    .replace(/^---[\s\S]*?---\n/, '')
    // Strip code blocks
    .replace(/```[\s\S]*?```/g, ' ')
    // Strip inline code
    .replace(/`([^`]+)`/g, '$1')
    // Strip image tags
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Strip links, keep text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Strip headings markers
    .replace(/^#{1,6}\s+/gm, '')
    // Strip bold & italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Strip blockquotes
    .replace(/^>\s+/gm, '')
    // Strip horizontal rules
    .replace(/^---+$/gm, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escapes characters for HTML output
 */
export function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Escapes regex special characters
 */
function escapeRegex(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

/**
 * Safely highlights matching query tokens within plain text and returns safe HTML
 */
export function highlightMatch(text = '', queryTokens = []) {
  if (!text) return '';
  const rawText = String(text);
  if (!queryTokens || queryTokens.length === 0) return escapeHtml(rawText);

  const validTokens = queryTokens
    .map(t => String(t || '').trim())
    .filter(t => t.length > 0)
    .map(escapeRegex);

  if (validTokens.length === 0) return escapeHtml(rawText);

  try {
    const pattern = new RegExp(validTokens.join('|'), 'gi');
    let match;
    const ranges = [];

    while ((match = pattern.exec(rawText)) !== null) {
      if (match[0].length === 0) {
        pattern.lastIndex++;
        continue;
      }
      ranges.push([match.index, match.index + match[0].length]);
    }

    if (ranges.length === 0) return escapeHtml(rawText);

    // Merge overlapping or adjacent ranges
    const merged = [ranges[0]];
    for (let i = 1; i < ranges.length; i++) {
      const prev = merged[merged.length - 1];
      const curr = ranges[i];
      if (curr[0] <= prev[1]) {
        prev[1] = Math.max(prev[1], curr[1]);
      } else {
        merged.push(curr);
      }
    }

    let result = '';
    let lastIndex = 0;
    for (const [start, end] of merged) {
      if (start > lastIndex) {
        result += escapeHtml(rawText.slice(lastIndex, start));
      }
      result += '<mark class="search-match">' + escapeHtml(rawText.slice(start, end)) + '</mark>';
      lastIndex = end;
    }
    if (lastIndex < rawText.length) {
      result += escapeHtml(rawText.slice(lastIndex));
    }

    return result;
  } catch {
    return escapeHtml(rawText);
  }
}

/**
 * Extracts a snippet of text surrounding the first match of query tokens
 */
export function extractSnippet(text = '', queryTokens = [], maxLength = 130) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) {
    return highlightMatch(clean, queryTokens);
  }

  // Find index of first matching token
  let firstIndex = -1;
  const lower = clean.toLowerCase();
  for (const token of queryTokens) {
    const idx = lower.indexOf(token.toLowerCase());
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  if (firstIndex === -1) {
    // No match in content, return beginning
    const slice = clean.slice(0, maxLength);
    return highlightMatch(slice + '...', queryTokens);
  }

  // Calculate snippet window
  const contextBefore = Math.floor(maxLength * 0.35);
  let start = Math.max(0, firstIndex - contextBefore);
  let end = Math.min(clean.length, start + maxLength);

  // Adjust word boundaries
  if (start > 0) {
    const spaceIdx = clean.indexOf(' ', start);
    if (spaceIdx !== -1 && spaceIdx < firstIndex) {
      start = spaceIdx + 1;
    }
  }
  if (end < clean.length) {
    const spaceIdx = clean.lastIndexOf(' ', end);
    if (spaceIdx !== -1 && spaceIdx > firstIndex) {
      end = spaceIdx;
    }
  }

  const prefix = start > 0 ? '… ' : '';
  const suffix = end < clean.length ? ' …' : '';
  const snippet = prefix + clean.slice(start, end) + suffix;

  return highlightMatch(snippet, queryTokens);
}

/**
 * Loads and indexes all Learn lessons
 */
async function buildLearnIndex() {
  if (learnIndex) return learnIndex;

  try {
    const manifestRes = await fetch(BASE_URL + 'materi/manifest.json');
    if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status}`);
    const manifest = await manifestRes.json();
    const lessons = manifest.lessons || [];

    const items = [];

    // Fetch and index each lesson file
    await Promise.all(
      lessons.map(async (lesson) => {
        try {
          const fileRes = await fetch(BASE_URL + lesson.file);
          let rawMd = '';
          if (fileRes.ok) {
            rawMd = await fileRes.text();
          }

          // Strip frontmatter
          const bodyMd = rawMd.replace(/^---[\s\S]*?---\n/, '');

          // Extract sections based on ## headings
          const sectionRegex = /^##\s+([^\n]+)\n([\s\S]*?)(?=(?:^##\s+)|$)/gm;
          let match;
          const sections = [];

          while ((match = sectionRegex.exec(bodyMd)) !== null) {
            const heading = match[1].trim();
            const content = stripMarkdown(match[2]);
            if (content.length > 0) {
              sections.push({
                heading,
                content
              });
            }
          }

          const plainBody = stripMarkdown(bodyMd);

          // Add entire lesson entry
          items.push({
            id: `learn-${lesson.id}`,
            category: 'learn',
            categoryLabel: 'Materi Belajar',
            targetId: lesson.id,
            route: `#/learn/${lesson.id}`,
            chapterId: lesson.chapterId,
            chapterTitle: lesson.chapterTitle,
            title: lesson.title,
            subchapterId: lesson.id,
            plainContent: plainBody,
            sections: sections
          });
        } catch (err) {
          console.warn(`[Search] Failed to index lesson ${lesson.id}:`, err);
          // Fallback to manifest info only
          items.push({
            id: `learn-${lesson.id}`,
            category: 'learn',
            categoryLabel: 'Materi Belajar',
            targetId: lesson.id,
            route: `#/learn/${lesson.id}`,
            chapterId: lesson.chapterId,
            chapterTitle: lesson.chapterTitle,
            title: lesson.title,
            subchapterId: lesson.id,
            plainContent: '',
            sections: []
          });
        }
      })
    );

    learnIndex = items;
    return learnIndex;
  } catch (err) {
    console.error('[Search] Failed to build Learn index:', err);
    learnIndex = [];
    return learnIndex;
  }
}

/**
/**
 * Loads and indexes Quiz modules (subchapter quizzes and master quiz)
 * NOTE: Individual questions are deliberately EXCLUDED to prevent cheating!
 */
async function buildQuizIndex() {
  if (quizIndex) return quizIndex;

  try {
    const manifestRes = await fetch(BASE_URL + 'quiz/manifest.json');
    if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status}`);
    const manifest = await manifestRes.json();
    const subchapters = manifest.subchapters || [];

    // Also get lesson titles for better context
    let lessonMap = {};
    try {
      const lRes = await fetch(BASE_URL + 'materi/manifest.json');
      if (lRes.ok) {
        const lm = await lRes.json();
        (lm.lessons || []).forEach(l => { lessonMap[l.id] = l; });
      }
    } catch {
      // ignore
    }

    const items = [];

    subchapters.forEach((sub) => {
      const lesson = lessonMap[sub.id] || {};
      const subTitle = lesson.title || `Sub-bab ${sub.id}`;
      const chapterTitle = lesson.chapterTitle || `Bab ${sub.chapterId}`;

      // Add subchapter quiz entry ONLY (no question prompts to prevent cheating)
      items.push({
        id: `quiz-sub-${sub.id}`,
        category: 'quiz',
        categoryLabel: 'Quiz',
        targetId: sub.id,
        route: `#/quiz/subchapter/${sub.id}`,
        title: `Quiz: ${subTitle}`,
        chapterTitle: chapterTitle,
        subchapterId: sub.id,
        plainContent: `Kuis sub-bab evaluasi pemahaman ${subTitle} (${sub.id}). Uji kemampuan dengan 10 soal acak.`
      });
    });

    // Add Master Quiz entry
    items.push({
      id: 'quiz-master',
      category: 'quiz',
      categoryLabel: 'Master Quiz',
      targetId: 'master',
      route: '#/quiz/master/all',
      title: '🏆 Master Quiz — Seluruh Kurikulum',
      chapterTitle: 'Evaluasi Komprehensif',
      subchapterId: 'master',
      plainContent: 'Uji pemahaman komprehensif dari seluruh 4 bab dan 14 sub-bab kurikulum keamanan digital. 50 pertanyaan acak seimbang.'
    });

    quizIndex = items;
    return quizIndex;
  } catch (err) {
    console.error('[Search] Failed to build Quiz index:', err);
    quizIndex = [];
    return quizIndex;
  }
}

/**
 * Loads Notes from IndexedDB
 */
async function buildNotesIndex(forceRefresh = false) {
  if (notesIndex && !notesStale && !forceRefresh) return notesIndex;

  try {
    const rawNotes = await getAllNotes();
    const items = (rawNotes || [])
      .filter(note => note && typeof note === 'object')
      .map((note) => {
        const plainContent = stripHtml(note.content || '');
        const title = (note.title || '').trim() || t('search.untitledNote');

        return {
          id: `note-${note.id || Math.random().toString(36).slice(2)}`,
          category: 'notes',
          categoryLabel: t('search.catNote'),
          targetId: note.id,
          route: `#/notes/${note.id}`,
          title: title,
          chapterTitle: note.pinned ? t('search.notePinned') : t('search.notePersonal'),
          plainContent: plainContent,
          pinned: !!note.pinned,
          updatedAt: note.updatedAt || Date.now()
        };
      });

    notesIndex = items;
    notesStale = false;
    return notesIndex;
  } catch (err) {
    console.warn('[Search] Failed to load Notes for search index:', err);
    notesIndex = [];
    return notesIndex;
  }
}

/**
 * Notify search index that notes have changed (save, delete, import)
 */
export function invalidateNotesIndex() {
  notesStale = true;
}

/**
 * Pre-warms the search index asynchronously
 */
export async function initSearchIndex() {
  if (isIndexing) return;
  isIndexing = true;
  try {
    await Promise.all([
      buildLearnIndex(),
      buildQuizIndex(),
      buildNotesIndex()
    ]);
  } catch (err) {
    console.warn('[Search] Error during search index pre-warm:', err);
  } finally {
    isIndexing = false;
  }
}

/**
 * Executes a search query across indexed content
 * @param {string} query Search query string
 * @param {string} filterCategory 'all' | 'learn' | 'quiz' | 'notes'
 * @returns {Promise<{ results: Array, total: number, query: string }>}
 */
export async function searchContent(query = '', filterCategory = 'all') {
  const cleanQuery = String(query || '').trim();
  if (!cleanQuery) {
    return { results: [], total: 0, query: '' };
  }

  // Ensure indexes are loaded safely
  let learnItems = [];
  let quizItems = [];
  let notesItems = [];

  try {
    const results = await Promise.all([
      buildLearnIndex().catch(err => { console.warn('[Search] Learn index error:', err); return []; }),
      buildQuizIndex().catch(err => { console.warn('[Search] Quiz index error:', err); return []; }),
      buildNotesIndex().catch(err => { console.warn('[Search] Notes index error:', err); return []; })
    ]);
    learnItems = Array.isArray(results[0]) ? results[0] : [];
    quizItems = Array.isArray(results[1]) ? results[1] : [];
    notesItems = Array.isArray(results[2]) ? results[2] : [];
  } catch (err) {
    console.warn('[Search] Error resolving search indices:', err);
  }

  let pool = [];
  if (filterCategory === 'all' || filterCategory === 'learn') {
    pool = pool.concat(learnItems);
  }
  if (filterCategory === 'all' || filterCategory === 'quiz') {
    pool = pool.concat(quizItems);
  }
  if (filterCategory === 'all' || filterCategory === 'notes') {
    pool = pool.concat(notesItems);
  }

  // Filter out any invalid items
  pool = pool.filter(item => item && typeof item === 'object');

  const qLower = cleanQuery.toLowerCase();
  // Split query into significant tokens (length >= 2, or 1 if single query)
  const tokens = qLower
    .split(/\s+/)
    .filter(t => t.length > 0);

  const scoredResults = [];

  for (const item of pool) {
    let score = 0;
    const titleLower = String(item.title || '').toLowerCase();
    const chapterLower = String(item.chapterTitle || '').toLowerCase();
    const contentLower = String(item.plainContent || '').toLowerCase();
    const subIdLower = String(item.subchapterId || '').toLowerCase();

    // 1. Exact match on title
    if (titleLower === qLower) {
      score += 150;
    } else if (titleLower.startsWith(qLower)) {
      score += 90;
    } else if (titleLower.includes(qLower)) {
      score += 70;
    }

    // 2. Exact match on subchapter ID (e.g. "1-a", "3-b")
    if (subIdLower && (subIdLower === qLower || subIdLower === qLower.replace(/^sub-?bab\s*/i, ''))) {
      score += 110;
    }

    // 3. Match in Chapter title (e.g. "Malware", "Keamanan Data")
    if (chapterLower.includes(qLower)) {
      score += 50;
    }

    // 4. Token matches in Title
    let titleTokenMatches = 0;
    for (const t of tokens) {
      if (titleLower.includes(t)) {
        score += 35;
        titleTokenMatches++;
      }
    }

    // 5. Section headings matches (in Learn items)
    let bestSectionHeading = '';
    let bestSectionContent = '';
    if (Array.isArray(item.sections) && item.sections.length > 0) {
      for (const sec of item.sections) {
        if (!sec) continue;
        const secH = String(sec.heading || '').toLowerCase();
        const secC = String(sec.content || '');
        if (secH.includes(qLower)) {
          score += 45;
          if (!bestSectionHeading) {
            bestSectionHeading = String(sec.heading || '');
            bestSectionContent = secC;
          }
        } else {
          for (const t of tokens) {
            if (secH.includes(t)) {
              score += 15;
              if (!bestSectionHeading) {
                bestSectionHeading = String(sec.heading || '');
                bestSectionContent = secC;
              }
            }
          }
        }
      }
    }

    // 6. Match in Content
    if (contentLower.includes(qLower)) {
      score += 40;
    } else {
      let contentTokenMatches = 0;
      for (const t of tokens) {
        if (contentLower.includes(t)) {
          score += 10;
          contentTokenMatches++;
        }
      }
      // Require at least one token match if title didn't match
      if (titleTokenMatches === 0 && contentTokenMatches === 0 && score === 0) {
        continue;
      }
    }

    // Bonus for pinned notes
    if (item.pinned) {
      score += 10;
    }

    if (score > 0) {
      // Pick source text for snippet
      const sourceText = bestSectionContent || String(item.plainContent || '');
      const snippetHtml = extractSnippet(sourceText, tokens, 130);
      const titleHtml = highlightMatch(String(item.title || ''), tokens);

      let contextSubtitle = String(item.chapterTitle || '');
      if (bestSectionHeading) {
        contextSubtitle += ` › ${bestSectionHeading}`;
      }

      scoredResults.push({
        id: item.id || `res-${Math.random().toString(36).slice(2)}`,
        category: item.category || 'learn',
        categoryLabel: item.category === 'quiz' ? t('search.catQuiz') : (item.category === 'notes' ? t('search.catNote') : t('search.catLesson')),
        route: item.route || '#/learn',
        titleHtml: titleHtml,
        plainTitle: String(item.title || ''),
        contextSubtitle: contextSubtitle,
        snippetHtml: snippetHtml,
        score: score
      });
    }
  }

  // Sort descending by relevance score
  scoredResults.sort((a, b) => b.score - a.score);

  // Return top 25 results
  const topResults = scoredResults.slice(0, 25);

  return {
    results: topResults,
    total: scoredResults.length,
    query: cleanQuery
  };
}
