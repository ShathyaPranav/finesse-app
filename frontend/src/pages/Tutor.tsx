import React, { useEffect, useMemo, useState } from 'react';
import TopBar from '../components/TopBar';
import { tutorApi } from '../services/api';
import { Keys, getItemInt, fullyQualifiedKey } from '../utils/userStorage';
import '../styles/Dashboard.css';

const Tutor: React.FC = () => {
  // TopBar state (kept in sync with Dashboard)
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const updateStats = () => {
      setScore(getItemInt(Keys.userXP, 0));
      setStreak(getItemInt(Keys.currentStreak, 0));
    };
    updateStats();

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
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Tutor state
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canAsk = useMemo(() => question.trim().length > 0 && !loading, [question, loading]);

  const handleAsk = async () => {
    if (!canAsk) return;
    setError(null);
    setLoading(true);
    setAnswer('');
    try {
      const res = await tutorApi.ask(question.trim());
      if (res && typeof res.answer === 'string') {
        setAnswer(res.answer);
      } else {
        setError('Unexpected response from tutor. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to get an answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="finesse-app">
      <TopBar score={score} streak={streak} />

      <main className="main-content">
        <div className="welcome-section">
          <h2>AI Tutor</h2>
          <p>Ask any investing question. Responses are short and focused.</p>
        </div>

        <div className="lesson-card" style={{ cursor: 'default' }}>
          <div className="lesson-header" style={{ minHeight: 'unset', marginBottom: '1rem' }}>
            <h3>Ask a question</h3>
          </div>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={onKeyDown}
            className="form-input"
            placeholder="Type your question here (Ctrl/Cmd + Enter to send)"
            style={{ width: '100%', minHeight: 110, resize: 'vertical', padding: '0.75rem', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn primary" disabled={!canAsk} onClick={handleAsk}>
              <span className="btn-text">{loading ? 'Thinking…' : 'Ask'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="lesson-card" style={{ cursor: 'default' }}>
            <div className="error-message">{error}</div>
          </div>
        )}

        {answer && !error && (
          <div className="lesson-card" style={{ cursor: 'default' }}>
            <div className="lesson-header" style={{ minHeight: 'unset', marginBottom: '1rem' }}>
              <h3>Answer</h3>
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{answer}</div>
          </div>
        )}
      </main>

      <footer className="footer">
        <p> Finesse App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Tutor;
