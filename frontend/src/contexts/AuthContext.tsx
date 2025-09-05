import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { runUserStorageMigrations } from '../utils/userStorage';

interface UserData {
  id: number;
  username: string;
  email: string;
  token: string;
  // Add other user fields as needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserData | null;
  login: (token: string, userData: UserData) => void;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // TODO: Validate token with backend
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Run migrations to move any legacy/anonymous data into the current user's namespace
        runUserStorageMigrations();
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
    setIsInitialized(true);
  }, [navigate]);

  const login = (token: string, userData: UserData) => {
    const userWithToken = { ...userData, token };
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userWithToken));
    setUser(userWithToken);
    setIsAuthenticated(true);
    // After setting the user, run migrations to preserve any existing data
    runUserStorageMigrations();
    navigate('/dashboard');
  };

  const register = async (userData: { username: string; email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          is_active: true,
          is_superuser: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Save token and user data
      localStorage.setItem('token', data.access_token);
      const userDataResponse: UserData = {
        id: data.id,
        username: data.username,
        email: data.email,
        token: data.access_token
      };
      localStorage.setItem('user', JSON.stringify(userDataResponse));
      
      setUser(userDataResponse);
      setIsAuthenticated(true);
      // After creating the user, run migrations to preserve any existing data
      runUserStorageMigrations();
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw to be handled by the component
    }
  };

  const logout = () => {
    // Clear only global auth keys; keep user-scoped data so progress persists across sessions
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Only render children when the auth state is initialized
  if (!isInitialized) {
    return null; // or a loading spinner
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
