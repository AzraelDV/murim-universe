import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import FactionReputation from './components/FactionReputation';
import Layout from './components/Layout';
import StatsPage from './components/StatsPage';
import MessagesPage from './components/MessagesPage';
import NotificationsPage from './components/NotificationsPage';
import InventoryPage from './components/InventoryPage';
import SkillsPage from './components/SkillsPage';
import MiningPage from './components/MiningPage';
import AdminGlobalNotification from './components/AdminGlobalNotification';
import AdminItemCreation from './components/AdminItemCreation';
import TravelPage from './components/TravelPage';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('AppContent render:', { user, loading });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/dashboard" />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/factions" element={<FactionReputation />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/mining" element={<MiningPage />} />
        <Route path="/travel" element={<TravelPage />} />
        <Route path="/admin/global-notification" element={<AdminGlobalNotification />} />
        <Route path="/admin/create-item" element={<AdminItemCreation />} />
      </Route>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

const App: React.FC = () => {
  console.log('App component rendering');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <GameProvider>
          <Router>
            <AppContent />
          </Router>
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;