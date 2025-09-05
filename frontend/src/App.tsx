import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/dashboard';
import Leaderboard from './pages/Leaderboard';
import Tutor from './pages/Tutor';
import LessonPage from './pages/LessonPage';
import DailyChallengePage from './pages/DailyChallengePage';
import './App.css';
import './styles/Auth.css';
import './styles/Dashboard.css';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a nice loading spinner
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
        />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/lesson/:id" element={<LessonPage />} />
          <Route path="/daily-challenge" element={<DailyChallengePage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route 
          path="*" 
          element={
            isAuthenticated 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  );
};

export default App;
