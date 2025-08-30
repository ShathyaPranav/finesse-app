import React, { useState, useEffect } from 'react';
import './App.css';

interface Lesson {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  progress: number;
}

function App() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate API call to fetch lessons
    const fetchLessons = async () => {
      try {
        // This would be an actual API call in a real app
        const mockLessons: Lesson[] = [
          {
            id: 1,
            title: 'Introduction to Stock Market',
            description: 'Learn the basics of stock market investing',
            xp_reward: 100,
            progress: 0
          },
          {
            id: 2,
            title: 'Technical Analysis',
            description: 'Master charts and technical indicators',
            xp_reward: 150,
            progress: 30
          },
          {
            id: 3,
            title: 'Fundamental Analysis',
            description: 'Analyze company financials like a pro',
            xp_reward: 200,
            progress: 0
          },
          {
            id: 4,
            title: 'Risk Management',
            description: 'Protect your investments effectively',
            xp_reward: 250,
            progress: 10
          }
        ];

        setLessons(mockLessons);
        setScore(350);
        setStreak(3);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lessons:', error);
        setLoading(false);
      }
    };

    fetchLessons();
  }, []);

  if (loading) {
    return (
      <div className="finesse-app">
        <div className="loading-container">
          <h2>Loading your lessons...</h2>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="finesse-app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Finesse</h1>
          <nav className="navbar">
            <a href="/" className="nav-link">Home</a>
            <a href="/lessons" className="nav-link">Lessons</a>
            <a href="/portfolio" className="nav-link">Portfolio</a>
            <a href="/profile" className="nav-link">Profile</a>
          </nav>
          <div className="user-stats">
            <div className="stat">
              <span className="stat-icon sun-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" className="sun-core"/>
                  <g className="sun-rays">
                    <line x1="12" y1="3" x2="12" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="12" y1="23" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </g>
                </svg>
              </span>
              <span>{streak} Day Streak</span>
            </div>
            <div className="stat">
              <span className="stat-icon trophy-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 5H17V3H7V5H5C3.9 5 3 5.9 3 7V8C3 10.55 4.92 12.63 7.39 12.94C8.02 14.44 9.37 15.57 11 15.9V19H8V21H16V19H13V15.9C14.63 15.57 15.98 14.44 16.61 12.94C19.08 12.63 21 10.55 21 8V7C21 5.9 20.1 5 19 5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="trophy-body"/>
                  <path d="M5 8V7H7V11.82C5.84 11.4 5 10.3 5 9V8Z" fill="currentColor" className="trophy-highlight"/>
                </svg>
              </span>
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
              key={lesson.id} 
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
              
              <button className="btn">
                {lesson.progress === 0 ? 'Start Lesson' : 'Continue'}
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="btn primary quick-action-btn">
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-fill"/>
              </svg>
            </span>
            <span>Daily Challenge</span>
          </button>
          <button className="btn secondary quick-action-btn">
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="icon-fill"/>
              </svg>
            </span>
            <span>Ask AI Tutor</span>
          </button>
          <button className="btn secondary quick-action-btn">
            <span className="action-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 19L8 11L12 15L19 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="line-chart"/>
                <path d="M20 8L12 0L4 8L20 8Z" fill="currentColor" className="arrow-tip" stroke="currentColor" strokeWidth="0.5"/>
              </svg>
            </span>
            <span>Practice Trading</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p> Finesse App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
