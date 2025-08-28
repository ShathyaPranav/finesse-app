import React, { useState, useEffect } from 'react';
import './App.css';

interface Lesson {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  progress?: number;
}

function App() {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(7);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/lessons');
      if (response.ok) {
        const data = await response.json();
        // Add mock progress for demo purposes
        const lessonsWithProgress = data.map((lesson: Lesson, index: number) => ({
          ...lesson,
          progress: index === 0 ? 85 : index === 1 ? 60 : index === 2 ? 30 : 0
        }));
        setLessons(lessonsWithProgress);
      } else {
        // Fallback to hardcoded data if API fails
        setLessons([
          {
            id: 1,
            title: "Introduction to Stock Markets",
            description: "Learn the basics of how stock markets work",
            progress: 85,
            xp_reward: 150
          },
          {
            id: 2,
            title: "Algorithmic Trading Basics",
            description: "Understanding automated trading strategies",
            progress: 60,
            xp_reward: 200
          },
          {
            id: 3,
            title: "Risk Management",
            description: "Learn to protect your investments",
            progress: 30,
            xp_reward: 180
          },
          {
            id: 4,
            title: "Technical Analysis",
            description: "Chart patterns and indicators",
            progress: 0,
            xp_reward: 220
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
      // Fallback to hardcoded data
      setLessons([
        {
          id: 1,
          title: "Introduction to Stock Markets",
          description: "Learn the basics of how stock markets work",
          progress: 85,
          xp_reward: 150
        },
        {
          id: 2,
          title: "Algorithmic Trading Basics",
          description: "Understanding automated trading strategies",
          progress: 60,
          xp_reward: 200
        },
        {
          id: 3,
          title: "Risk Management",
          description: "Learn to protect your investments",
          progress: 30,
          xp_reward: 180
        },
        {
          id: 4,
          title: "Technical Analysis",
          description: "Chart patterns and indicators",
          progress: 0,
          xp_reward: 220
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="finesse-app">
        <div className="loading-container">
          <h2>Loading your lessons...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="finesse-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">📈 Finesse</h1>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-icon">🔥</span>
              <span>{streak} day streak</span>
            </div>
            <div className="stat">
              <span className="stat-icon">⭐</span>
              <span>{score} XP</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="welcome-section">
          <h2>Welcome back! Ready to learn?</h2>
          <p>Continue your journey to become a smarter investor</p>
        </div>

        {/* Lessons Grid */}
        <div className="lessons-grid">
          {lessons.map((lesson, index) => (
            <div 
              key={index} 
              className={`lesson-card ${index === currentLesson ? 'active' : ''}`}
              onClick={() => setCurrentLesson(index)}
            >
              <div className="lesson-header">
                <h3>{lesson.title}</h3>
                <span className="xp-badge">+{lesson.xp_reward} XP</span>
              </div>
              <p className="lesson-description">{lesson.description}</p>
              
              <div className="progress-section">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{lesson.progress}% complete</span>
              </div>
              
              <button className="lesson-button">
                {lesson.progress === 0 ? 'Start Lesson' : 'Continue'}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary">
            🎯 Daily Challenge
          </button>
          <button className="action-btn secondary">
            💬 Ask AI Tutor
          </button>
          <button className="action-btn secondary">
            📊 Practice Trading
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
