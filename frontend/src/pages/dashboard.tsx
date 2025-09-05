import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import lessonService from '../services/lessonService';
import TopBar from '../components/TopBar';
import { usersApi } from '../services/api';
import '../styles/Dashboard.css';
import { Keys, getItemInt, setItemInt, getItemJSON, setItemJSON, getItem, setItem, fullyQualifiedKey } from '../utils/userStorage';

interface Lesson {
  id: number;
  title: string;
  description: string;
  icon?: string;
  xp_reward: number;
  estimated_duration?: number;
  order_index?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  locked?: boolean;
  progress?: number;
  content_items?: any[];
}

const Dashboard: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<number>(1); // Track current lesson index
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [attemptedToday, setAttemptedToday] = useState<boolean>(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Function to update the streak
  const updateStreak = () => {
    const today = new Date().toDateString();
    const lastActive = getItem(Keys.lastActiveDate);
    const currentStreak = getItemInt(Keys.currentStreak, 0);
    
    if (lastActive === today) {
      // User already active today, no update needed
      return currentStreak;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let newStreak = currentStreak;
    
    if (!lastActive || new Date(lastActive).getTime() < yesterday.setHours(0, 0, 0, 0)) {
      // Reset streak if more than one day has passed
      newStreak = 1;
    } else {
      // Increment streak if active yesterday
      newStreak += 1;
    }
    
    // Update storage
    setItem(Keys.lastActiveDate, today);
    setItemInt(Keys.currentStreak, newStreak);

    // Sync updated streak to backend (non-blocking)
    try {
      if (user?.id && newStreak !== currentStreak) {
        usersApi.setUserStreak(user.id, newStreak).catch(() => {});
      }
    } catch {
      // ignore
    }
    
    return newStreak;
  };

  // Check for completed lessons and update XP
  const checkAndUpdateXP = (lessons: Lesson[]) => {
    const savedXP = getItemInt(Keys.userXP, 0);
    const completedLessons = getItemJSON<Record<string, boolean>>(Keys.completedLessons, {});
    
    let totalXP = savedXP;
    let xpEarned = 0;
    
    // Check each lesson for completion
    lessons.forEach(lesson => {
      if (lesson.progress === 100 && !completedLessons[lesson.id]) {
        // Mark lesson as completed and add XP
        completedLessons[lesson.id] = true;
        xpEarned += lesson.xp_reward;
      }
    });
    
    // Update XP if any lessons were completed
    if (xpEarned > 0) {
      totalXP += xpEarned;
      setItemInt(Keys.userXP, totalXP);
      setItemJSON(Keys.completedLessons, completedLessons);
      setScore(totalXP);

      // Sync updated XP to backend for leaderboard (non-blocking)
      try {
        if (user?.id) {
          usersApi.setUserXP(user.id, totalXP).catch(() => {});
        }
      } catch {
        // ignore
      }
    }
    
    return totalXP;
  };

  // Fetch lessons from the lesson service
  const fetchLessons = async () => {
    try {
      // Get all lessons from the lesson service
      let allLessons = await lessonService.getLessons();
      
      // Update XP based on completed lessons
      const currentXP = checkAndUpdateXP(allLessons);
      
      // Update state with all available lessons and XP
      setScore(currentXP);
      setLessons(allLessons);
      return allLessons;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return [];
    }
  };

  // Initial data fetch and setup
  useEffect(() => {
    // Initialize or update streak
    const currentStreak = updateStreak();
    setStreak(currentStreak);
    // Ensure backend has our latest streak even if updateStreak didn't change it
    try {
      if (user?.id) {
        usersApi.setUserStreak(user.id, currentStreak).catch(() => {});
      }
    } catch {}
    
    // Initialize XP from localStorage if it exists
    const savedXP = getItemInt(Keys.userXP, 0);
    setScore(savedXP);
    
    // Initial data fetch
    fetchLessons();

    // Set up focus listener to refresh data when returning to the dashboard
    const handleFocus = () => {
      fetchLessons();
      refreshDailyAttempt();
    };

    window.addEventListener('focus', handleFocus);

    // Clean up event listener
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Determine if today's daily challenge has already been attempted
  const getTodayKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const refreshDailyAttempt = () => {
    const stored = getItem(Keys.dailyChallengeState);
    if (!stored) {
      setAttemptedToday(false);
      return;
    }
    try {
      const state = JSON.parse(stored);
      setAttemptedToday(state?.date === getTodayKey());
    } catch {
      setAttemptedToday(false);
    }
  };

  useEffect(() => {
    refreshDailyAttempt();
  }, []);

  // Sync XP, streak, and daily lock across tabs via storage event
  useEffect(() => {
    const keyXP = fullyQualifiedKey(Keys.userXP);
    const keyStreak = fullyQualifiedKey(Keys.currentStreak);
    const keyDaily = fullyQualifiedKey(Keys.dailyChallengeState);
    const onStorage = (e: StorageEvent) => {
      if (e.key === keyXP) {
        const savedXP = getItemInt(Keys.userXP, 0);
        setScore(savedXP);
      } else if (e.key === keyStreak) {
        const current = getItemInt(Keys.currentStreak, 0);
        setStreak(current);
        try {
          if (user?.id) {
            usersApi.setUserStreak(user.id, current).catch(() => {});
          }
        } catch {}
      } else if (e.key === keyDaily) {
        refreshDailyAttempt();
      } else if (e.key === 'user') {
        // Active user changed in another tab; refresh all derived state
        fetchLessons();
        const savedXP = getItemInt(Keys.userXP, 0);
        setScore(savedXP);
        const current = getItemInt(Keys.currentStreak, 0);
        setStreak(current);
        refreshDailyAttempt();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Handle navigation to lessons
  const handleLessonsClick = () => {
    const lastVisitedLesson = getItem(Keys.lastVisitedLesson);
    if (lastVisitedLesson) {
      navigate(`/lesson/${lastVisitedLesson}`);
    } else {
      navigate('/lessons');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="finesse-app">
      <TopBar score={score} streak={streak} />

      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome back! Ready to learn?</h2>
          <p>Continue your journey to become a smarter investor</p>
        </div>

        <div className="lessons-grid">
          {lessons.map((lesson, index) => (
            <div 
              key={lesson.id} 
              className={`lesson-card ${lesson.id === currentLesson ? 'active' : ''}`}
              onClick={() => setCurrentLesson(lesson.id)}
            >
              <div className="lesson-header">
                <h3>{lesson.title}</h3>
                <span className="xp-badge">+{lesson.xp_reward} XP</span>
              </div>
              <p className="lesson-description">{lesson.description}</p>
              
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${lesson.progress || 0}%` }}
                  />
                </div>
                <span className="progress-text">{lesson.progress || 0}% Complete</span>
              </div>
              
              <button 
                className="btn"
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              >
                {lesson.progress === 0 ? 'Start Lesson' : 'Continue'}
              </button>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <button
            className="btn primary quick-action-btn"
            onClick={() => !attemptedToday && navigate('/daily-challenge')}
            disabled={attemptedToday}
            title={attemptedToday ? 'You\'ve already attempted today\'s challenge. Come back tomorrow!' : 'Take today\'s Daily Challenge'}
            style={attemptedToday ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-fill"/>
              </svg>
            </span>
            <span>{attemptedToday ? 'Daily Challenge (Completed)' : 'Daily Challenge'}</span>
          </button>
          <button className="btn secondary quick-action-btn" onClick={() => navigate('/tutor')}>
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-fill"/>
              </svg>
            </span>
            <span>Ask AI Tutor</span>
          </button>
          <a 
            href="https://investor.sebi.gov.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn secondary quick-action-btn"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 19L8 11L12 15L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="line-chart"/>
                <path d="M20 8L12 0L4 8L20 8Z" fill="currentColor" className="arrow-tip" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </span>
            <span>LEARN MORE</span>
          </a>
        </div>
      </main>

      <footer className="footer">
        <p> Finesse App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
