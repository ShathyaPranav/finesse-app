import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import lessonService from '../services/lessonService';
import { Lesson, LessonContent, QuizContent } from '../types/lessons';
import '../styles/DailyChallenge.css';
import { Keys, getItemInt, setItemInt, getItem, setItem, fullyQualifiedKey } from '../utils/userStorage';

const formatDateKey = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dayOfYear = (date: Date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date as any) - (start as any);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getXPFromStorage = () => getItemInt(Keys.userXP, 0);
const getStreakFromStorage = () => getItemInt(Keys.currentStreak, 0);
const getPointsFromStorage = () => getItemInt(Keys.userPoints, 0);

interface DailyState {
  date: string;
  correct: boolean;
  selectedOption: number;
  questionId: number;
  lessonId: number;
}

const DailyChallengePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<number>(getXPFromStorage());
  const [streak, setStreak] = useState<number>(getStreakFromStorage());
  const [points, setPoints] = useState<number>(getPointsFromStorage());

  const [question, setQuestion] = useState<QuizContent | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [locked, setLocked] = useState<boolean>(false);
  const [animatePoints, setAnimatePoints] = useState<boolean>(false);

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);
  const doy = useMemo(() => dayOfYear(today), [today]);

  // Read XP/streak when window regains focus (stay consistent with Dashboard)
  useEffect(() => {
    const updateStats = () => {
      setScore(getXPFromStorage());
      setStreak(getStreakFromStorage());
      setPoints(getPointsFromStorage());
    };
    updateStats();
    window.addEventListener('focus', updateStats);
    return () => window.removeEventListener('focus', updateStats);
  }, []);

  // Real-time sync across tabs via storage events
  useEffect(() => {
    const keyXP = fullyQualifiedKey(Keys.userXP);
    const keyStreak = fullyQualifiedKey(Keys.currentStreak);
    const keyPoints = fullyQualifiedKey(Keys.userPoints);
    const keyDaily = fullyQualifiedKey(Keys.dailyChallengeState);
    const onStorage = (e: StorageEvent) => {
      if (e.key === keyXP) {
        setScore(getXPFromStorage());
      } else if (e.key === keyStreak) {
        setStreak(getStreakFromStorage());
      } else if (e.key === keyPoints) {
        setPoints(getPointsFromStorage());
      } else if (e.key === keyDaily) {
        try {
          const state = JSON.parse(getItem(Keys.dailyChallengeState) || '{}');
          if (state?.date === todayKey) {
            setLocked(true);
            setAnswered(true);
            setCorrect(!!state.correct);
            setSelected(typeof state.selectedOption === 'number' ? state.selectedOption : null);
          } else {
            // Different day key means unlock for new day
            setLocked(false);
            setAnswered(false);
            setCorrect(null);
            setSelected(null);
          }
        } catch {}
      } else if (e.key === 'user') {
        // Active user changed in another tab; refresh all local state from namespaced keys
        setScore(getXPFromStorage());
        setStreak(getStreakFromStorage());
        setPoints(getPointsFromStorage());
        try {
          const state = JSON.parse(getItem(Keys.dailyChallengeState) || '{}');
          if (state?.date === todayKey) {
            setLocked(true);
            setAnswered(true);
            setCorrect(!!state.correct);
            setSelected(typeof state.selectedOption === 'number' ? state.selectedOption : null);
          } else {
            setLocked(false);
            setAnswered(false);
            setCorrect(null);
            setSelected(null);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [todayKey]);

  // Initialize: choose lesson, pick quiz deterministically for the day
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);

        const chosenLessonId = (doy % 2 === 0) ? 1 : 2; // MVP: alternate between lessons 1 and 2
        const lesson = await lessonService.getLessonById(chosenLessonId);
        if (!lesson) throw new Error('Unable to load lesson for daily challenge');

        const quizzes = (lesson.content_items || []).filter(
          (c: LessonContent): c is QuizContent => c.content_type === 'quiz'
        );
        if (quizzes.length === 0) throw new Error('No quizzes available for daily challenge');

        const qIndex = doy % quizzes.length; // stable per day
        const q = quizzes[qIndex];
        setQuestion(q);

        // Check lock state
        const stored = getItem(Keys.dailyChallengeState);
        if (stored) {
          try {
            const state = JSON.parse(stored) as DailyState;
            if (state.date === todayKey) {
              setLocked(true);
              setAnswered(true);
              setCorrect(state.correct);
              setSelected(state.selectedOption);
            }
          } catch {}
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load daily challenge');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [doy, todayKey]);

  const handleAnswer = (idx: number) => {
    if (!question || locked || answered) return;

    const correctIndex = (typeof question.correctAnswer === 'number')
      ? question.correctAnswer
      : (question as any).correct_answer;

    const isCorrect = idx === correctIndex;
    setSelected(idx);
    setAnswered(true);
    setCorrect(isCorrect);
    setLocked(true);

    // Persist attempt for today
    const state: DailyState = {
      date: todayKey,
      correct: isCorrect,
      selectedOption: idx,
      questionId: question.id,
      lessonId: question.lesson_id,
    };
    setItem(Keys.dailyChallengeState, JSON.stringify(state));

    if (isCorrect) {
      const current = getPointsFromStorage();
      const updated = current + 100;
      setItemInt(Keys.userPoints, updated);
      setPoints(updated);
      // trigger star animation
      setAnimatePoints(true);
      setTimeout(() => setAnimatePoints(false), 1000);
    }
  };

  if (loading) {
    return <div className="daily-container"><div className="loading">Loading daily challenge...</div></div>;
  }

  if (error) {
    return <div className="daily-container"><div className="error">{error}</div></div>;
  }

  return (
    <div className="daily-page">
      <TopBar score={score} streak={streak} />

      <div className="daily-container">
        {/* Points bar */}
        <div className={`points-bar ${animatePoints ? 'bump' : ''}`}>
          <span className={`star-icon ${animatePoints ? 'pulse' : ''}`} aria-hidden>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="star-fill"/>
            </svg>
          </span>
          <div className="points-details">
            <div className="points-label">Points</div>
            <div className="points-value">{points}</div>
          </div>
        </div>

        {/* Lock banner if already attempted */}
        {locked && (
          <div className="locked-banner">
            You've already attempted today's Daily Challenge. Come back tomorrow!
          </div>
        )}

        {/* Question */}
        {question && (
          <div className="question-card">
            <div className="question-header">
              <h2>Daily Challenge</h2>
              <p className="question-lesson">From Lesson {question.lesson_id}</p>
            </div>
            <p className="question-text">{question.question}</p>

            <div className="options-grid">
              {question.options.map((opt, idx) => {
                const isSelected = selected === idx;
                const isCorrect = (typeof question.correctAnswer === 'number')
                  ? question.correctAnswer === idx
                  : (question as any).correct_answer === idx;
                const stateClass = answered
                  ? isCorrect
                    ? 'correct'
                    : isSelected
                      ? 'incorrect'
                      : ''
                  : isSelected
                    ? 'selected'
                    : '';
                return (
                  <button
                    key={idx}
                    className={`option-button ${stateClass}`}
                    onClick={() => handleAnswer(idx)}
                    disabled={locked}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div className={`feedback ${correct ? 'right' : 'wrong'}`}>
                {correct ? 'Great job! +100 points awarded.' : 'Not quite. No points this time. Try again tomorrow!'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyChallengePage;
