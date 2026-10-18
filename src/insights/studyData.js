// src/insights/studyData.js
// Aggregates learning metrics, topic performance, trend data, and study goals from local data

import { get, set } from '../storage.js';
import { loadProgress } from '../learn/progress.js';
import { getAllQuizHistory } from '../db.js';
import { getAllGamesProgress, GAMES_LIST } from '../games/gamesData.js';

const GOALS_KEY = 'analytics_goals';
const DEFAULT_GOALS = {
  targetLessons: 3,
  targetQuizzes: 3
};

const BASE_URL = typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL ? import.meta.env.BASE_URL : './';

/**
 * Retrieves the user's weekly study goals from localStorage
 */
export function getStudyGoals() {
  const saved = get(GOALS_KEY, DEFAULT_GOALS);
  return {
    targetLessons: Math.max(1, Math.min(14, Number(saved?.targetLessons) || DEFAULT_GOALS.targetLessons)),
    targetQuizzes: Math.max(1, Math.min(20, Number(saved?.targetQuizzes) || DEFAULT_GOALS.targetQuizzes))
  };
}

/**
 * Saves the user's weekly study goals to localStorage
 */
export function saveStudyGoals(goals) {
  const current = getStudyGoals();
  const updated = {
    targetLessons: Math.max(1, Math.min(14, Number(goals?.targetLessons) || current.targetLessons)),
    targetQuizzes: Math.max(1, Math.min(20, Number(goals?.targetQuizzes) || current.targetQuizzes))
  };
  set(GOALS_KEY, updated);
  return updated;
}

/**
 * Returns Monday 00:00:00 of the current week in local time
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.getTime();
}

/**
 * Safely computes full analytics snapshot from local stores and manifest
 */
export async function getAnalyticsData(manifestUrl = BASE_URL + 'materi/manifest.json') {
  // 1. Fetch lesson manifest
  let lessons = [];
  try {
    const res = await fetch(manifestUrl);
    if (res.ok) {
      const data = await res.json();
      lessons = data.lessons || [];
    }
  } catch (err) {
    console.warn('[Insights] Failed to fetch manifest:', err);
  }

  // 2. Fetch lesson progress
  const progress = loadProgress() || { completed: {}, timestamps: {}, lastAccessed: null };
  const completedMap = progress.completed || {};
  const timestampsMap = progress.timestamps || {};
  const lastAccessed = progress.lastAccessed || null;

  // 3. Fetch all quiz history from IndexedDB
  let quizHistory = [];
  try {
    quizHistory = await getAllQuizHistory();
  } catch (err) {
    console.warn('[Insights] Failed to fetch quiz history:', err);
    quizHistory = [];
  }

  // Filter out corrupted or invalid quiz records
  const validQuizHistory = quizHistory.filter(q => {
    return q && typeof q === 'object' &&
      typeof q.score === 'number' &&
      typeof q.total === 'number' &&
      q.total > 0 &&
      !isNaN(q.score) &&
      !isNaN(q.total);
  });

  // 4. Fetch games progress
  const gamesProgress = getAllGamesProgress() || {};

  // 5. Fetch goals
  const goals = getStudyGoals();

  return calculateMetrics({
    lessons,
    completedMap,
    timestampsMap,
    lastAccessed,
    quizHistory: validQuizHistory,
    gamesProgress,
    goals
  });
}

/**
 * Pure calculation function for all analytics sections
 */
export function calculateMetrics({
  lessons = [],
  completedMap = {},
  timestampsMap = {},
  lastAccessed = null,
  quizHistory = [],
  gamesProgress = {},
  goals = DEFAULT_GOALS
}) {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter(l => !!completedMap[l.id]).length;
  const lessonCompletionPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Total quizzes attempted
  const totalQuizzesAttempted = quizHistory.length;

  // Calculate Average Quiz Score (all attempts)
  let averageQuizScore = null;
  if (totalQuizzesAttempted > 0) {
    const totalPcts = quizHistory.reduce((sum, q) => sum + Math.round((q.score / q.total) * 100), 0);
    averageQuizScore = Math.round(totalPcts / totalQuizzesAttempted);
  }

  // Quizzes mapped by subjectId
  const quizBySubject = {};
  quizHistory.forEach(q => {
    const subId = q.subjectId || 'unknown';
    if (!quizBySubject[subId]) {
      quizBySubject[subId] = [];
    }
    quizBySubject[subId].push(q);
  });

  // Calculate Average Best Score across distinct attempted quiz subjects
  let averageBestQuizScore = null;
  const subjectIds = Object.keys(quizBySubject);
  if (subjectIds.length > 0) {
    const sumBestPcts = subjectIds.reduce((sum, id) => {
      const attempts = quizBySubject[id];
      const best = Math.max(...attempts.map(a => Math.round((a.score / a.total) * 100)));
      return sum + best;
    }, 0);
    averageBestQuizScore = Math.round(sumBestPcts / subjectIds.length);
  }

  // Games completed
  const totalGames = GAMES_LIST.length;
  let gamesCompleted = 0;
  GAMES_LIST.forEach(g => {
    const prog = gamesProgress[g.id];
    if (prog && (prog.bestScore > 0 || prog.score > 0 || prog.lastPlayed)) {
      gamesCompleted++;
    }
  });

  // Last learning activity timestamp
  let lastActivityDate = null;
  const candidateDates = [];

  // from lesson timestamps
  Object.values(timestampsMap).forEach(ts => {
    if (typeof ts === 'number' && !isNaN(ts) && ts > 0) candidateDates.push(ts);
  });
  // from quiz history
  quizHistory.forEach(q => {
    if (typeof q.date === 'number' && !isNaN(q.date) && q.date > 0) candidateDates.push(q.date);
  });
  // from games
  Object.values(gamesProgress).forEach(gp => {
    if (typeof gp?.lastPlayed === 'number' && !isNaN(gp.lastPlayed) && gp.lastPlayed > 0) {
      candidateDates.push(gp.lastPlayed);
    }
  });

  if (candidateDates.length > 0) {
    lastActivityDate = Math.max(...candidateDates);
  }

  // Build Chapters & Topics performance structure
  const chapterMap = {};
  lessons.forEach(l => {
    const chId = l.chapterId;
    if (!chapterMap[chId]) {
      chapterMap[chId] = {
        id: chId,
        title: l.chapterTitle,
        lessons: []
      };
    }
    chapterMap[chId].lessons.push(l);
  });

  const chaptersPerformance = Object.values(chapterMap).map(ch => {
    const chLessons = ch.lessons;
    const chCompletedCount = chLessons.filter(l => !!completedMap[l.id]).length;
    const chPct = chLessons.length > 0 ? Math.round((chCompletedCount / chLessons.length) * 100) : 0;

    // Chapter-level quiz attempts (mode === 'chapter' && subjectId === ch.id)
    const chQuizAttempts = quizBySubject[ch.id] || [];
    let chQuizData = null;
    if (chQuizAttempts.length > 0) {
      const sortedAttempts = [...chQuizAttempts].sort((a, b) => (b.date || 0) - (a.date || 0));
      const latest = sortedAttempts[0];
      const latestPct = Math.round((latest.score / latest.total) * 100);
      const bestPct = Math.max(...chQuizAttempts.map(a => Math.round((a.score / a.total) * 100)));
      chQuizData = {
        attempts: chQuizAttempts.length,
        latestScore: latestPct,
        latestTotal: latest.total,
        bestScore: bestPct,
        status: latestPct >= 70 ? 'pass' : 'fail'
      };
    }

    const subchapters = chLessons.map(lesson => {
      const isCompleted = !!completedMap[lesson.id];
      const completedAt = timestampsMap[lesson.id] || null;
      const subAttempts = quizBySubject[lesson.id] || [];

      let quizInfo = {
        attempts: 0,
        latestScore: null,
        bestScore: null,
        averageScore: null,
        latestDate: null,
        status: 'not_attempted'
      };

      if (subAttempts.length > 0) {
        const sorted = [...subAttempts].sort((a, b) => (b.date || 0) - (a.date || 0));
        const latest = sorted[0];
        const latestPct = Math.round((latest.score / latest.total) * 100);
        const bestPct = Math.max(...subAttempts.map(a => Math.round((a.score / a.total) * 100)));
        const avgPct = Math.round(subAttempts.reduce((sum, a) => sum + Math.round((a.score / a.total) * 100), 0) / subAttempts.length);

        quizInfo = {
          attempts: subAttempts.length,
          latestScore: latestPct,
          latestRaw: `${latest.score}/${latest.total}`,
          bestScore: bestPct,
          averageScore: avgPct,
          latestDate: latest.date || null,
          status: latestPct >= 70 ? 'pass' : 'fail'
        };
      }

      let topicStatus = 'not_started';
      if (quizInfo.attempts > 0 && quizInfo.latestScore < 70) {
        topicStatus = 'needs_practice';
      } else if (isCompleted && quizInfo.attempts > 0 && quizInfo.latestScore >= 70) {
        topicStatus = 'completed';
      } else if (isCompleted || quizInfo.attempts > 0 || lastAccessed === lesson.id) {
        topicStatus = 'in_progress';
      }

      return {
        id: lesson.id,
        title: lesson.title,
        chapterId: lesson.chapterId,
        lessonCompleted: isCompleted,
        completedAt,
        quiz: quizInfo,
        topicStatus
      };
    });

    return {
      id: ch.id,
      title: ch.title,
      totalLessons: chLessons.length,
      completedLessons: chCompletedCount,
      completionPct: chPct,
      chapterQuiz: chQuizData,
      subchapters
    };
  });

  // Weekly Goals Calculation (current week Monday - Sunday)
  const weekStart = getStartOfWeek();
  let completedLessonsThisWeek = 0;
  Object.entries(timestampsMap).forEach(([id, ts]) => {
    if (completedMap[id] && typeof ts === 'number' && ts >= weekStart) {
      completedLessonsThisWeek++;
    }
  });

  let completedQuizzesThisWeek = 0;
  quizHistory.forEach(q => {
    if (typeof q.date === 'number' && q.date >= weekStart) {
      completedQuizzesThisWeek++;
    }
  });

  const goalsProgress = {
    targetLessons: goals.targetLessons,
    targetQuizzes: goals.targetQuizzes,
    completedLessonsThisWeek,
    completedQuizzesThisWeek,
    lessonsGoalPct: Math.min(100, Math.round((completedLessonsThisWeek / goals.targetLessons) * 100)),
    quizzesGoalPct: Math.min(100, Math.round((completedQuizzesThisWeek / goals.targetQuizzes) * 100))
  };

  // Learning Trends
  const sortedQuizHistoryAsc = [...quizHistory].sort((a, b) => (a.date || 0) - (b.date || 0));
  const recentQuizTrends = sortedQuizHistoryAsc.slice(-10).map((q, idx) => {
    const pct = Math.round((q.score / q.total) * 100);
    return {
      index: idx + 1,
      mode: q.mode,
      subjectId: q.subjectId,
      score: q.score,
      total: q.total,
      pct,
      date: q.date || null
    };
  });

  // Recent 7 Days Activity Distribution
  const now = new Date();
  const dayStats = [];
  for (let i = 6; i >= 0; i--) {
    const targetDay = new Date(now);
    targetDay.setDate(now.getDate() - i);
    targetDay.setHours(0, 0, 0, 0);
    const dayStart = targetDay.getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000 - 1;

    let lessonsCount = 0;
    Object.values(timestampsMap).forEach(ts => {
      if (ts >= dayStart && ts <= dayEnd) lessonsCount++;
    });

    let quizzesCount = 0;
    quizHistory.forEach(q => {
      if (q.date && q.date >= dayStart && q.date <= dayEnd) quizzesCount++;
    });

    let gamesCount = 0;
    Object.values(gamesProgress).forEach(gp => {
      if (gp?.lastPlayed && gp.lastPlayed >= dayStart && gp.lastPlayed <= dayEnd) gamesCount++;
    });

    dayStats.push({
      dateStr: targetDay.toISOString().split('T')[0],
      dayNameShort: targetDay.toLocaleDateString('id-ID', { weekday: 'short' }),
      lessonsCount,
      quizzesCount,
      gamesCount,
      totalCount: lessonsCount + quizzesCount + gamesCount
    });
  }

  // Recent Activity Feed
  const activityEvents = [];
  lessons.forEach(l => {
    const ts = timestampsMap[l.id];
    if (completedMap[l.id] && ts) {
      activityEvents.push({
        type: 'lesson',
        title: l.title,
        id: l.id,
        link: `#/learn/${l.id}`,
        timestamp: ts
      });
    }
  });

  quizHistory.forEach(q => {
    if (q.date) {
      activityEvents.push({
        type: 'quiz',
        mode: q.mode,
        subjectId: q.subjectId,
        score: q.score,
        total: q.total,
        pct: Math.round((q.score / q.total) * 100),
        link: q.mode === 'master' ? '#/quiz/master' : `#/quiz/${q.mode}/${q.subjectId}`,
        timestamp: q.date
      });
    }
  });

  GAMES_LIST.forEach(g => {
    const gp = gamesProgress[g.id];
    if (gp && gp.lastPlayed) {
      activityEvents.push({
        type: 'game',
        id: g.id,
        titleKey: g.titleKey,
        score: gp.score || gp.bestScore || 0,
        link: g.route,
        timestamp: gp.lastPlayed
      });
    }
  });

  activityEvents.sort((a, b) => b.timestamp - a.timestamp);
  const recentActivities = activityEvents.slice(0, 8);

  return {
    overview: {
      totalLessons,
      completedLessons,
      lessonCompletionPct,
      totalQuizzesAttempted,
      averageQuizScore,
      averageBestQuizScore,
      totalGames,
      gamesCompleted,
      lastActivityDate
    },
    chaptersPerformance,
    trends: {
      hasData: recentQuizTrends.length > 0 || dayStats.some(d => d.totalCount > 0),
      quizTrends: recentQuizTrends,
      dailyActivity: dayStats
    },
    recentActivities,
    goalsProgress,
    raw: {
      lessons,
      completedMap,
      timestampsMap,
      lastAccessed,
      quizHistory,
      gamesProgress,
      goals
    }
  };
}
