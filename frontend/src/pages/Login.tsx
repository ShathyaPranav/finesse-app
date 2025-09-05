import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoginFormData } from '../types';
import { MailIcon, LockIcon } from '../assets/icons';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append('username', formData.email);
      params.append('password', formData.password);
      params.append('grant_type', 'password');
      
      const response = await fetch('http://localhost:8000/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      // Use backend-provided user details when available
      const userData = {
        id: data.id ?? 0,
        username: data.username ?? formData.email.split('@')[0],
        email: data.email ?? formData.email,
        token: data.access_token
      };
      login(data.access_token, userData);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="lesson-card auth-card">
        <h2 className="auth-title"><span>Welcome Back!</span></h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-with-icon">
              <MailIcon className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <LockIcon className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="auth-actions">
            <button 
              type="submit" 
              className="btn primary"
              disabled={loading}
            >
              <span className="btn-text">
                {loading ? 'Signing In...' : 'Sign In'}
              </span>
            </button>
          </div>
          
          <div className="auth-footer">
            Don't have an account? <Link to="/register" className="auth-link">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
