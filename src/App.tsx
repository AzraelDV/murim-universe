import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/dashboard" />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gray-900">
            <AppContent />
          </div>
        </Router>
      </GameProvider>
    </AuthProvider>
  );
};

export default App;