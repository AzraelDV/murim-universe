import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../contexts/GameContext';
import Game from './Game';
import PlayerSetup from './PlayerSetup';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { player, loading, error } = useGame();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading your cultivation journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  // If user is authenticated but no player profile exists, show player setup
  if (user && !player) {
    return <PlayerSetup />;
  }

  // If player exists, show the main game interface
  if (player) {
    return <Game />;
  }

  // Fallback (shouldn't normally reach here)
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Preparing your journey...</div>
    </div>
  );
};

export default Dashboard;