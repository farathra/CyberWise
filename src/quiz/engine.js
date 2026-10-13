// src/quiz/engine.js
// Core quiz logic: loading, question selection, scoring

const BASE_URL = import.meta.env.BASE_URL;

export const QUIZ_MODES = {
  SUBCHAPTER: 'subchapter',
  CHAPTER: 'chapter',
  MASTER: 'master'
};

const COUNTS = {
  [QUIZ_MODES.SUBCHAPTER]: { required: 30, select: 10 },
  [QUIZ_MODES.CHAPTER]: { required: 30, select: 30 },
  [QUIZ_MODES.MASTER]: { required: 50, select: 50 }
};

let quizManifest = null;
const questionBankCache = {};

export async function loadQuizManifest() {
  if (quizManifest) return quizManifest;
  const res = await fetch(BASE_URL + 'quiz/manifest.json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  quizManifest = await res.json();
  return quizManifest;
}

export async function loadQuestionBank(subchapterId) {
  if (questionBankCache[subchapterId]) return questionBankCache[subchapterId];
  const manifest = await loadQuizManifest();
  const entry = manifest.subchapters.find(s => s.id === subchapterId);
  if (!entry) throw new Error(`No quiz file for subchapter: ${subchapterId}`);
  const res = await fetch(BASE_URL + entry.file);
  if (!res.ok) throw new Error(`HTTP ${res.status} loading ${entry.file}`);
  const data = await res.json();
  questionBankCache[subchapterId] = data.questions;
  return data.questions;
}

// Fisher-Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectQuestions(pool, count) {
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}

export async function buildSubchapterQuiz(subchapterId) {
  const bank = await loadQuestionBank(subchapterId);
  const { required, select } = COUNTS[QUIZ_MODES.SUBCHAPTER];
  if (bank.length < select) {
    return {
      ok: false,
      error: `Subchapter ${subchapterId} has ${bank.length} questions. At least ${select} required to run this quiz. (${required} needed for full Phase 2.)`,
      available: bank.length,
      needed: select
    };
  }
  return { ok: true, questions: selectQuestions(bank, select), mode: QUIZ_MODES.SUBCHAPTER, id: subchapterId };
}

export async function buildChapterQuiz(chapterId) {
  const manifest = await loadQuizManifest();
  const subchapters = manifest.subchapters.filter(s => s.chapterId === chapterId);
  let pool = [];
  for (const sub of subchapters) {
    const bank = await loadQuestionBank(sub.id);
    pool = pool.concat(bank);
  }
  const { select } = COUNTS[QUIZ_MODES.CHAPTER];
  if (pool.length < select) {
    return {
      ok: false,
      error: `Chapter ${chapterId} has ${pool.length} questions total. ${select} required for the chapter quiz.`,
      available: pool.length,
      needed: select
    };
  }
  return { ok: true, questions: selectQuestions(pool, select), mode: QUIZ_MODES.CHAPTER, id: chapterId };
}

export async function buildMasterQuiz() {
  const manifest = await loadQuizManifest();
  
  // Group by chapter for balanced selection
  const byChapter = {};
  for (const sub of manifest.subchapters) {
    if (!byChapter[sub.chapterId]) byChapter[sub.chapterId] = [];
    const bank = await loadQuestionBank(sub.id);
    byChapter[sub.chapterId] = byChapter[sub.chapterId].concat(bank);
  }
  
  const chapterIds = Object.keys(byChapter);
  const { select } = COUNTS[QUIZ_MODES.MASTER];
  
  let allQuestions = [];
  chapterIds.forEach(id => allQuestions = allQuestions.concat(byChapter[id]));
  
  if (allQuestions.length < select) {
    return {
      ok: false,
      error: `Only ${allQuestions.length} questions available in total. ${select} required for the Master Quiz.`,
      available: allQuestions.length,
      needed: select
    };
  }
  
  // Balanced selection: try to take equal amounts from each chapter
  const perChapter = Math.floor(select / chapterIds.length);
  let selected = [];
  chapterIds.forEach(id => {
    const chapterPool = shuffle(byChapter[id]);
    selected = selected.concat(chapterPool.slice(0, perChapter));
  });
  
  // Fill remainder
  const remaining = select - selected.length;
  if (remaining > 0) {
    const selectedIds = new Set(selected.map(q => q.id));
    const rest = shuffle(allQuestions.filter(q => !selectedIds.has(q.id)));
    selected = selected.concat(rest.slice(0, remaining));
  }
  
  return { ok: true, questions: shuffle(selected), mode: QUIZ_MODES.MASTER, id: 'master' };
}

export function scoreQuiz(questions, answers) {
  const results = questions.map((q, i) => {
    const given = answers[i];
    const correct = q.answer;
    return {
      question: q,
      givenAnswer: given,
      correctAnswer: correct,
      isCorrect: given === correct
    };
  });
  const score = results.filter(r => r.isCorrect).length;
  return { score, total: questions.length, results };
}
