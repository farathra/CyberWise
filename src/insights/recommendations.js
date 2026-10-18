// src/insights/recommendations.js
// Local, deterministic recommendation engine based on real user activity

/**
 * Generates explainable, prioritized recommendations based on real learning data
 * 
 * @param {Object} params
 * @param {Array} params.lessons - Array of lessons from manifest
 * @param {Object} params.completedMap - Map of completed lesson IDs { [id]: boolean }
 * @param {Array} params.quizHistory - Array of quiz history records
 * @param {Object} params.gamesProgress - Map of games progress { [gameId]: data }
 * @param {Object} [params.goalsProgress] - Weekly goals progress
 * @returns {Array} List of prioritized recommendations (max 4-5)
 */
export function generateRecommendations({
  lessons = [],
  completedMap = {},
  quizHistory = [],
  gamesProgress = {},
  goalsProgress = null
}) {
  const recommendations = [];

  const totalLessons = lessons.length;
  const completedIds = Object.keys(completedMap).filter(id => !!completedMap[id]);
  const completedCount = completedIds.length;

  // 1. Group quiz history by subjectId
  const quizBySubject = {};
  quizHistory.forEach(q => {
    if (!q || !q.subjectId) return;
    if (!quizBySubject[q.subjectId]) quizBySubject[q.subjectId] = [];
    quizBySubject[q.subjectId].push(q);
  });

  // Helper to find latest quiz score for subject
  const getSubjectQuizInfo = (subjectId) => {
    const attempts = quizBySubject[subjectId];
    if (!attempts || attempts.length === 0) return null;
    const sorted = [...attempts].sort((a, b) => (b.date || 0) - (a.date || 0));
    const latest = sorted[0];
    const latestPct = Math.round((latest.score / latest.total) * 100);
    return {
      attemptsCount: attempts.length,
      latestScore: latestPct,
      latestRaw: `${latest.score}/${latest.total}`
    };
  };

  // RULE 1: Review Weak Topics (Priority 1)
  const weakTopics = [];
  lessons.forEach(lesson => {
    const info = getSubjectQuizInfo(lesson.id);
    if (info && info.latestScore < 70) {
      weakTopics.push({
        lesson,
        latestScore: info.latestScore,
        attemptsCount: info.attemptsCount
      });
    }
  });

  weakTopics.sort((a, b) => a.latestScore - b.latestScore);

  weakTopics.slice(0, 2).forEach(item => {
    recommendations.push({
      id: `review-${item.lesson.id}`,
      type: 'review_weak',
      priority: item.latestScore < 50 ? 1 : 2,
      categoryKey: 'analytics.recCategoryReview',
      title: `Tinjau Kembali: ${item.lesson.title}`,
      topic: `${item.lesson.id} — ${item.lesson.title}`,
      reason: `Skor kuis terakhir Anda ${item.latestScore}% (< 70%). Pelajari kembali materi ini untuk memperkuat pemahaman sebelum mencoba kuis lagi.`,
      actionText: 'Buka Materi',
      actionUrl: `#/learn/${item.lesson.id}`,
      secondaryText: 'Ulangi Kuis',
      secondaryUrl: `#/quiz/subchapter/${item.lesson.id}`
    });
  });

  // RULE 2: First-time learner (Priority 1 if completely new)
  if (completedCount === 0 && totalLessons > 0) {
    const firstLesson = lessons[0];
    recommendations.push({
      id: `start-${firstLesson.id}`,
      type: 'continue_learning',
      priority: 1,
      categoryKey: 'analytics.recCategoryContinue',
      title: `Mulai Belajar: ${firstLesson.title}`,
      topic: `${firstLesson.id} — ${firstLesson.title}`,
      reason: 'Langkah awal terbaik untuk membangun pemahaman fondasi keamanan siber dan perlindungan data.',
      actionText: 'Mulai Pelajaran',
      actionUrl: `#/learn/${firstLesson.id}`
    });
  }

  // RULE 3: Continue Unfinished Curriculum (Priority 2)
  if (completedCount > 0 && completedCount < totalLessons) {
    const nextLesson = lessons.find(l => !completedMap[l.id]);
    if (nextLesson) {
      recommendations.push({
        id: `next-${nextLesson.id}`,
        type: 'continue_learning',
        priority: 2,
        categoryKey: 'analytics.recCategoryContinue',
        title: `Lanjutkan: ${nextLesson.title}`,
        topic: `${nextLesson.id} — ${nextLesson.title}`,
        reason: 'Lanjutkan kurikulum pembelajaran berikutnya untuk menyelesaikan materi bab ini.',
        actionText: 'Lanjut Belajar',
        actionUrl: `#/learn/${nextLesson.id}`
      });
    }
  }

  // RULE 4: Practice After Learning (Lesson complete but quiz not attempted) (Priority 3)
  const completedWithoutQuiz = lessons.filter(l => {
    const isDone = !!completedMap[l.id];
    const quizInfo = getSubjectQuizInfo(l.id);
    return isDone && (!quizInfo || quizInfo.attemptsCount === 0);
  });

  if (completedWithoutQuiz.length > 0) {
    const target = completedWithoutQuiz[0];
    recommendations.push({
      id: `practice-${target.id}`,
      type: 'practice_quiz',
      priority: 3,
      categoryKey: 'analytics.recCategoryPractice',
      title: `Uji Pemahaman: ${target.title}`,
      topic: `${target.id} — ${target.title}`,
      reason: 'Anda telah menyelesaikan membaca materi ini. Uji seberapa baik pemahaman Anda melalui kuis interaktif.',
      actionText: 'Mulai Kuis',
      actionUrl: `#/quiz/subchapter/${target.id}`
    });
  }

  // RULE 5: Interactive Game Reinforcement based on completed chapters (Priority 3)
  const hasCompletedChapter = (chapterId) => {
    const chLessons = lessons.filter(l => l.chapterId === chapterId);
    return chLessons.length > 0 && chLessons.every(l => !!completedMap[l.id]);
  };

  const isGamePlayed = (gameId) => {
    const g = gamesProgress[gameId];
    return !!(g && (g.bestScore > 0 || g.score > 0 || g.lastPlayed));
  };

  if ((hasCompletedChapter('1') || completedCount >= 3) && !isGamePlayed('email-detective')) {
    recommendations.push({
      id: 'game-email-detective',
      type: 'play_game',
      priority: 3,
      categoryKey: 'analytics.recCategoryGame',
      title: 'Simulasi Email Detective',
      topic: 'Deteksi Phishing & Pesan Palsu',
      reason: 'Terapkan konsep keamanan data dan kenali email jebakan phishing dalam skenario investigasi nyata.',
      actionText: 'Mainkan Game',
      actionUrl: '#/games/email-detective'
    });
  } else if ((hasCompletedChapter('2') || completedCount >= 8) && !isGamePlayed('chat-trap')) {
    recommendations.push({
      id: 'game-chat-trap',
      type: 'play_game',
      priority: 3,
      categoryKey: 'analytics.recCategoryGame',
      title: 'Simulasi Chat Trap',
      topic: 'Rekayasa Sosial & Manipulasi Chat',
      reason: 'Uji kejelian Anda terhadap taktik manipulasi psikologis dan rekayasa sosial dalam obrolan daring.',
      actionText: 'Mainkan Game',
      actionUrl: '#/games/chat-trap'
    });
  } else if ((hasCompletedChapter('3') || completedCount >= 12) && !isGamePlayed('malware-mission')) {
    recommendations.push({
      id: 'game-malware-mission',
      type: 'play_game',
      priority: 3,
      categoryKey: 'analytics.recCategoryGame',
      title: 'Simulasi Malware Mission',
      topic: 'Inspeksi Berkas & Bahaya Malware',
      reason: 'Latih kemampuan mendeteksi ekstensi ganda (.pdf.exe) dan makro mencurigakan sebelum membuka file.',
      actionText: 'Mainkan Game',
      actionUrl: '#/games/malware-mission'
    });
  } else if (hasCompletedChapter('4') && !isGamePlayed('password-defender')) {
    recommendations.push({
      id: 'game-password-defender',
      type: 'play_game',
      priority: 3,
      categoryKey: 'analytics.recCategoryGame',
      title: 'Simulasi Password Defender',
      topic: 'Keamanan Kata Sandi & 2FA',
      reason: 'Terapkan strategi passphrase dan respons insiden kebocoran akun secara terstruktur.',
      actionText: 'Mainkan Game',
      actionUrl: '#/games/password-defender'
    });
  } else if (completedCount === totalLessons && totalLessons > 0 && !isGamePlayed('incident-commander')) {
    recommendations.push({
      id: 'game-incident-commander',
      type: 'play_game',
      priority: 3,
      categoryKey: 'analytics.recCategoryGame',
      title: 'Simulasi Incident Commander',
      topic: 'Tanggap Insiden & Digital Forensics',
      reason: 'Uji kemampuan strategi kepemimpinan Anda dalam menanggulangi insiden keamanan siber skala organisasi.',
      actionText: 'Mainkan Game',
      actionUrl: '#/games/incident-commander'
    });
  }

  // RULE 6: Master Quiz Mastery (If all lessons completed and no weak topics)
  if (completedCount === totalLessons && totalLessons > 0 && weakTopics.length === 0) {
    const masterAttempts = quizBySubject['all'] || [];
    const hasPassedMaster = masterAttempts.some(a => Math.round((a.score / a.total) * 100) >= 80);
    if (!hasPassedMaster) {
      recommendations.push({
        id: 'master-quiz',
        type: 'practice_quiz',
        priority: 2,
        categoryKey: 'analytics.recCategoryPractice',
        title: 'Tantangan Master Quiz',
        topic: 'Evaluasi Menyeluruh Seluruh Materi',
        reason: 'Selamat! Anda telah menuntaskan seluruh pelajaran. Uji penguasaan komprehensif Anda melalui Master Quiz 50 soal.',
        actionText: 'Mulai Master Quiz',
        actionUrl: '#/quiz/master'
      });
    }
  }

  // RULE 7: Weekly Goal Reminder
  if (goalsProgress && goalsProgress.completedLessonsThisWeek < goalsProgress.targetLessons) {
    const diff = goalsProgress.targetLessons - goalsProgress.completedLessonsThisWeek;
    if (diff > 0 && completedCount < totalLessons) {
      recommendations.push({
        id: 'weekly-goal-lesson',
        type: 'goal_next',
        priority: 4,
        categoryKey: 'analytics.recCategoryGoal',
        title: 'Target Belajar Pekan Ini',
        topic: `Sisa ${diff} Pelajaran Lagi`,
        reason: `Anda telah menyelesaikan ${goalsProgress.completedLessonsThisWeek} dari target ${goalsProgress.targetLessons} pelajaran pekan ini. Tetap konsisten!`,
        actionText: 'Lanjut Belajar',
        actionUrl: '#/learn'
      });
    }
  }

  recommendations.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.id.localeCompare(b.id);
  });

  return recommendations.slice(0, 4);
}
