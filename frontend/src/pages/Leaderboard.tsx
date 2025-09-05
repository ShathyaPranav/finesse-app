import React, { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { usersApi } from '../services/api';
import { Keys, getItemInt, fullyQualifiedKey } from '../utils/userStorage';
import '../styles/Dashboard.css';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardUser {
  id: number;
  username: string;
  email: string;
  xp_points: number;
  streak_days: number;
}

const Leaderboard: React.FC = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const { user } = useAuth();

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const data = await usersApi.getLeaderboard(6);
      setUsers((data || []).slice(0, 6));
    } catch (err: any) {
      setError(err?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(() => fetchLeaderboard(), 5000); // poll every 5s
    // Sync TopBar stats with Dashboard on focus and storage
    const updateStats = () => {
      setScore(getItemInt(Keys.userXP, 0));
      setStreak(getItemInt(Keys.currentStreak, 0));
    };
    updateStats();
    // Also push current streak to backend so leaderboard reflects latest immediately
    try {
      const s = getItemInt(Keys.currentStreak, 0);
      if (user?.id) {
        usersApi.setUserStreak(user.id, s).catch(() => {});
      }
    } catch {}
    const onFocus = () => updateStats();
    window.addEventListener('focus', onFocus);
    const keyXP = fullyQualifiedKey(Keys.userXP);
    const keyStreak = fullyQualifiedKey(Keys.currentStreak);
    const onStorage = (e: StorageEvent) => {
      if (e.key === keyXP || e.key === keyStreak || e.key === 'user') {
        updateStats();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <div className="finesse-app">
      <TopBar score={score} streak={streak} />

      <main className="main-content">
        <div className="welcome-section">
          <h2>Leaderboard</h2>
          <p>Top learners by XP</p>
        </div>

        {loading && <div className="lesson-card">Loading...</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && (
          <div className="lessons-grid">
            {users.map((u, index) => {
              const displayName = u.username && u.username.trim().length > 0 
                ? u.username 
                : (u.email ? u.email.split('@')[0] : `User ${u.id}`);
              const rankClass = `rank-${index + 1}`;
              return (
                <div key={u.id} className={`lesson-card leaderboard-card ${index < 6 ? 'top3' : ''} ${rankClass}`}>
                  <div className="lesson-header" style={{ alignItems: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="leader-rank" style={{ fontWeight: 800 }}>#{index + 1}</span>
                      <span className="leader-name">{displayName}</span>
                    </h3>
                  </div>
                  <div className="leaderboard-stats" style={{ marginTop: '0.75rem' }}>
                    <div className="stat" title="Points">
                      <span className="stat-icon" aria-hidden>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span>{u.xp_points} XP</span>
                    </div>
                    <div className="stat" title="Daily Streak">
                      <span className="stat-icon sun-icon" aria-hidden>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                          <line x1="12" y1="3" x2="12" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="12" y1="23" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <span>{u.streak_days} Day Streak</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="footer">
        <p> Finesse App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Leaderboard;
