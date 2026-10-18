// src/achievements/achievementRegistry.js
// Centralized definitions and criteria for CyberWise Achievement System

export const ACHIEVEMENT_CATEGORIES = [
  { id: 'all', labelKey: 'achievements.catAll' },
  { id: 'learning', labelKey: 'achievements.catLearning', icon: '📚' },
  { id: 'quiz', labelKey: 'achievements.catQuiz', icon: '🎯' },
  { id: 'games', labelKey: 'achievements.catGames', icon: '🎮' },
  { id: 'consistency', labelKey: 'achievements.catConsistency', icon: '📅' },
  { id: 'exploration', labelKey: 'achievements.catExploration', icon: '🧭' }
];

export const CHAPTER_LESSONS = {
  '1': ['1-a', '1-b', '1-c'],
  '2': ['2-a', '2-b', '2-c', '2-d', '2-e'],
  '3': ['3-a', '3-b', '3-c', '3-d'],
  '4': ['4-a', '4-b']
};

export const ACHIEVEMENTS_LIST = [
  // ── 1. Learning Achievements ──────────────────────────────
  {
    id: 'first-steps',
    category: 'learning',
    icon: '🌱',
    titleKey: 'achievements.firstSteps.title',
    descKey: 'achievements.firstSteps.desc',
    maxProgress: 1,
    unit: 'materi',
    route: '#/learn',
    evaluate(state) {
      const count = state.completedLessonCount || 0;
      return {
        isUnlocked: count >= 1,
        currentProgress: Math.min(1, count),
        maxProgress: 1
      };
    }
  },
  {
    id: 'curious-learner',
    category: 'learning',
    icon: '🔍',
    titleKey: 'achievements.curiousLearner.title',
    descKey: 'achievements.curiousLearner.desc',
    maxProgress: 5,
    unit: 'materi',
    route: '#/learn',
    evaluate(state) {
      const count = state.completedLessonCount || 0;
      return {
        isUnlocked: count >= 5,
        currentProgress: Math.min(5, count),
        maxProgress: 5
      };
    }
  },
  {
    id: 'knowledge-explorer',
    category: 'learning',
    icon: '📖',
    titleKey: 'achievements.knowledgeExplorer.title',
    descKey: 'achievements.knowledgeExplorer.desc',
    maxProgress: 10,
    unit: 'materi',
    route: '#/learn',
    evaluate(state) {
      const count = state.completedLessonCount || 0;
      return {
        isUnlocked: count >= 10,
        currentProgress: Math.min(10, count),
        maxProgress: 10
      };
    }
  },
  {
    id: 'chapter-complete',
    category: 'learning',
    icon: '🏆',
    titleKey: 'achievements.chapterComplete.title',
    descKey: 'achievements.chapterComplete.desc',
    maxProgress: 1,
    unit: 'bab',
    route: '#/learn',
    evaluate(state) {
      const completedIds = state.completedLessonIds || [];
      const anyChapterCompleted = Object.values(CHAPTER_LESSONS).some(lessons =>
        lessons.every(id => completedIds.includes(id))
      );
      return {
        isUnlocked: anyChapterCompleted,
        currentProgress: anyChapterCompleted ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'cyber-scholar',
    category: 'learning',
    icon: '🎓',
    titleKey: 'achievements.cyberScholar.title',
    descKey: 'achievements.cyberScholar.desc',
    maxProgress: 14,
    unit: 'materi',
    route: '#/learn',
    evaluate(state) {
      const count = state.completedLessonCount || 0;
      return {
        isUnlocked: count >= 14,
        currentProgress: Math.min(14, count),
        maxProgress: 14
      };
    }
  },

  // ── 2. Quiz Mastery Achievements ──────────────────────────
  {
    id: 'first-test',
    category: 'quiz',
    icon: '📝',
    titleKey: 'achievements.firstTest.title',
    descKey: 'achievements.firstTest.desc',
    maxProgress: 1,
    unit: 'kuis',
    route: '#/quiz',
    evaluate(state) {
      const attempts = state.quizAttemptsCount || 0;
      return {
        isUnlocked: attempts >= 1,
        currentProgress: Math.min(1, attempts),
        maxProgress: 1
      };
    }
  },
  {
    id: 'getting-better',
    category: 'quiz',
    icon: '📈',
    titleKey: 'achievements.gettingBetter.title',
    descKey: 'achievements.gettingBetter.desc',
    maxProgress: 5,
    unit: 'kuis',
    route: '#/quiz',
    evaluate(state) {
      const attempts = state.quizAttemptsCount || 0;
      return {
        isUnlocked: attempts >= 5,
        currentProgress: Math.min(5, attempts),
        maxProgress: 5
      };
    }
  },
  {
    id: 'sharp-mind',
    category: 'quiz',
    icon: '⚡',
    titleKey: 'achievements.sharpMind.title',
    descKey: 'achievements.sharpMind.desc',
    maxProgress: 80,
    unit: '%',
    route: '#/quiz',
    evaluate(state) {
      const best = state.bestQuizPct || 0;
      return {
        isUnlocked: best >= 80,
        currentProgress: Math.min(80, best),
        maxProgress: 80
      };
    }
  },
  {
    id: 'perfect-score',
    category: 'quiz',
    icon: '💯',
    titleKey: 'achievements.perfectScore.title',
    descKey: 'achievements.perfectScore.desc',
    maxProgress: 1,
    unit: 'kuis',
    route: '#/quiz',
    evaluate(state) {
      const hasPerfect = state.hasPerfectScore || false;
      return {
        isUnlocked: hasPerfect,
        currentProgress: hasPerfect ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'consistent-performer',
    category: 'quiz',
    icon: '⭐',
    titleKey: 'achievements.consistentPerformer.title',
    descKey: 'achievements.consistentPerformer.desc',
    maxProgress: 3,
    unit: 'kuis',
    route: '#/quiz',
    evaluate(state) {
      const count = state.highScoreAttemptsCount || 0;
      return {
        isUnlocked: count >= 3,
        currentProgress: Math.min(3, count),
        maxProgress: 3
      };
    }
  },
  {
    id: 'quiz-explorer',
    category: 'quiz',
    icon: '🗺️',
    titleKey: 'achievements.quizExplorer.title',
    descKey: 'achievements.quizExplorer.desc',
    maxProgress: 3,
    unit: 'topik',
    route: '#/quiz',
    evaluate(state) {
      const topics = state.distinctQuizTopicsCount || 0;
      return {
        isUnlocked: topics >= 3,
        currentProgress: Math.min(3, topics),
        maxProgress: 3
      };
    }
  },

  // ── 3. Cybersecurity Games Achievements ───────────────────
  {
    id: 'player-one',
    category: 'games',
    icon: '🎮',
    titleKey: 'achievements.playerOne.title',
    descKey: 'achievements.playerOne.desc',
    maxProgress: 1,
    unit: 'game',
    route: '#/games',
    evaluate(state) {
      const count = state.completedGamesCount || 0;
      return {
        isUnlocked: count >= 1,
        currentProgress: Math.min(1, count),
        maxProgress: 1
      };
    }
  },
  {
    id: 'email-detective',
    category: 'games',
    icon: '🕵️‍♂️',
    titleKey: 'achievements.emailDetective.title',
    descKey: 'achievements.emailDetective.desc',
    maxProgress: 1,
    unit: 'simulasi',
    route: '#/games/email-detective',
    evaluate(state) {
      const done = !!state.gamesCompletedMap?.['email-detective'];
      return {
        isUnlocked: done,
        currentProgress: done ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'conversation-guardian',
    category: 'games',
    icon: '💬',
    titleKey: 'achievements.conversationGuardian.title',
    descKey: 'achievements.conversationGuardian.desc',
    maxProgress: 1,
    unit: 'simulasi',
    route: '#/games/chat-trap',
    evaluate(state) {
      const done = !!state.gamesCompletedMap?.['chat-trap'];
      return {
        isUnlocked: done,
        currentProgress: done ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'password-defender',
    category: 'games',
    icon: '🛡️',
    titleKey: 'achievements.passwordDefender.title',
    descKey: 'achievements.passwordDefender.desc',
    maxProgress: 1,
    unit: 'simulasi',
    route: '#/games/password-defender',
    evaluate(state) {
      const done = !!state.gamesCompletedMap?.['password-defender'];
      return {
        isUnlocked: done,
        currentProgress: done ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'incident-commander',
    category: 'games',
    icon: '🚨',
    titleKey: 'achievements.incidentCommander.title',
    descKey: 'achievements.incidentCommander.desc',
    maxProgress: 1,
    unit: 'simulasi',
    route: '#/games/incident-commander',
    evaluate(state) {
      const done = !!state.gamesCompletedMap?.['incident-commander'];
      return {
        isUnlocked: done,
        currentProgress: done ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'malware-mission',
    category: 'games',
    icon: '🦠',
    titleKey: 'achievements.malwareMission.title',
    descKey: 'achievements.malwareMission.desc',
    maxProgress: 1,
    unit: 'simulasi',
    route: '#/games/malware-mission',
    evaluate(state) {
      const done = !!state.gamesCompletedMap?.['malware-mission'];
      return {
        isUnlocked: done,
        currentProgress: done ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'cyber-game-explorer',
    category: 'games',
    icon: '🕹️',
    titleKey: 'achievements.cyberGameExplorer.title',
    descKey: 'achievements.cyberGameExplorer.desc',
    maxProgress: 5,
    unit: 'game',
    route: '#/games',
    evaluate(state) {
      const count = state.completedGamesCount || 0;
      return {
        isUnlocked: count >= 5,
        currentProgress: Math.min(5, count),
        maxProgress: 5
      };
    }
  },

  // ── 4. Consistency Achievements ───────────────────────────
  {
    id: 'back-for-more',
    category: 'consistency',
    icon: '📆',
    titleKey: 'achievements.backForMore.title',
    descKey: 'achievements.backForMore.desc',
    maxProgress: 3,
    unit: 'hari',
    route: '#/analytics',
    evaluate(state) {
      const days = state.distinctActiveDaysCount || 0;
      return {
        isUnlocked: days >= 3,
        currentProgress: Math.min(3, days),
        maxProgress: 3
      };
    }
  },
  {
    id: 'weekly-learner',
    category: 'consistency',
    icon: '🔥',
    titleKey: 'achievements.weeklyLearner.title',
    descKey: 'achievements.weeklyLearner.desc',
    maxProgress: 7,
    unit: 'hari',
    route: '#/analytics',
    evaluate(state) {
      const days = state.distinctActiveDaysCount || 0;
      return {
        isUnlocked: days >= 7,
        currentProgress: Math.min(7, days),
        maxProgress: 7
      };
    }
  },

  // ── 5. Exploration & Mastery Achievements ─────────────────
  {
    id: 'glossary-explorer',
    category: 'exploration',
    icon: '📚',
    titleKey: 'achievements.glossaryExplorer.title',
    descKey: 'achievements.glossaryExplorer.desc',
    maxProgress: 5,
    unit: 'istilah',
    route: '#/glossary',
    evaluate(state) {
      const count = state.exploredTermsCount || 0;
      return {
        isUnlocked: count >= 5,
        currentProgress: Math.min(5, count),
        maxProgress: 5
      };
    }
  },
  {
    id: 'note-taker',
    category: 'exploration',
    icon: '📝',
    titleKey: 'achievements.noteTaker.title',
    descKey: 'achievements.noteTaker.desc',
    maxProgress: 1,
    unit: 'catatan',
    route: '#/notes',
    evaluate(state) {
      const count = state.notesCount || 0;
      return {
        isUnlocked: count >= 1,
        currentProgress: Math.min(1, count),
        maxProgress: 1
      };
    }
  },
  {
    id: 'prepared-learner',
    category: 'exploration',
    icon: '💡',
    titleKey: 'achievements.preparedLearner.title',
    descKey: 'achievements.preparedLearner.desc',
    maxProgress: 1,
    unit: 'tinjauan',
    route: '#/quiz',
    evaluate(state) {
      const reviewed = !!state.hasReviewedQuiz;
      return {
        isUnlocked: reviewed,
        currentProgress: reviewed ? 1 : 0,
        maxProgress: 1
      };
    }
  },
  {
    id: 'cyberwise-completionist',
    category: 'exploration',
    icon: '👑',
    titleKey: 'achievements.cyberwiseCompletionist.title',
    descKey: 'achievements.cyberwiseCompletionist.desc',
    maxProgress: 10,
    unit: 'lencana',
    route: '#/achievements',
    evaluate(state) {
      const count = state.otherUnlockedCount || 0;
      return {
        isUnlocked: count >= 10,
        currentProgress: Math.min(10, count),
        maxProgress: 10
      };
    }
  }
];

export function getAchievementById(id) {
  return ACHIEVEMENTS_LIST.find(a => a.id === id) || null;
}
