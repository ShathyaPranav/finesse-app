import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Keys, getItem } from '../utils/userStorage';

interface TopBarProps {
  score?: number;
  streak?: number;
}

const TopBar: React.FC<TopBarProps> = ({ score = 0, streak = 0 }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(path);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const handleLessonsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const lastVisited = getItem(Keys.lastVisitedLesson);
    if (lastVisited) {
      navigate(`/lesson/${lastVisited}`);
    } else {
      // No generic /lessons route; default to the first lesson
      navigate('/lesson/1');
    }
  };

  return (
    <header className="app-header">
      <div className="header-content" onClick={(e) => e.stopPropagation()}>
        <h1 
          className="app-title" 
          onClick={handleNavigation('/dashboard')} 
          style={{ cursor: 'pointer' }}
        >
          Finesse
        </h1>
        <nav className="navbar">
          <button className="nav-link" onClick={handleNavigation('/dashboard')}>Home</button>
          <button className="nav-link" onClick={handleLessonsClick}>Lessons</button>
          <button className="nav-link" onClick={handleNavigation('/leaderboard')}>Leaderboard</button>
          <button className="nav-link" onClick={handleLogout}>Logout</button>
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
  );
};

export default TopBar;
