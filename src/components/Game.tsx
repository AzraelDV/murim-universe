import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../hooks/useAuth';

const Game: React.FC = () => {
  const { signOut } = useAuth();
  const { 
    player, 
    currentLocation, 
    locations, 
    locationActions, 
    loading, 
    error,
    moveToLocation,
    performAction 
  } = useGame();
  
  const [actionInput, setActionInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  const handleMoveToLocation = async () => {
    if (selectedLocation) {
      const success = await moveToLocation(selectedLocation);
      if (success) {
        setSelectedLocation('');
      }
    }
  };

  const handlePerformAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (actionInput.trim()) {
      const success = await performAction('custom', `${player?.username}: ${actionInput}`);
      if (success) {
        setActionInput('');
      }
    }
  };

  const handleQuickAction = async (actionType: string, description: string) => {
    await performAction(actionType, description);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">No player data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-yellow-400">Murim Universe</h1>
          <button
            onClick={signOut}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Panel - Player Stats */}
        <div className="w-1/4 bg-gray-800 p-4 border-r border-gray-700">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Player Status</h2>
            <div className="space-y-2">
              <div><span className="text-gray-300">Name:</span> {player.username}</div>
              <div><span className="text-gray-300">Level:</span> {player.level}</div>
              <div><span className="text-gray-300">Experience:</span> {player.experience}</div>
              <div><span className="text-gray-300">Health:</span> {player.health}/{player.max_health}</div>
              <div><span className="text-gray-300">Energy:</span> {player.energy}/{player.max_energy}</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Attributes</h3>
            <div className="space-y-1">
              <div><span className="text-gray-300">Strength:</span> {player.strength}</div>
              <div><span className="text-gray-300">Agility:</span> {player.agility}</div>
              <div><span className="text-gray-300">Intelligence:</span> {player.intelligence}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('train', `${player.username} begins training`)}
                className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm"
              >
                Train
              </button>
              <button
                onClick={() => handleQuickAction('meditate', `${player.username} enters meditation`)}
                className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded text-sm"
              >
                Meditate
              </button>
              <button
                onClick={() => handleQuickAction('rest', `${player.username} takes a rest`)}
                className="w-full bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm"
              >
                Rest
              </button>
            </div>
          </div>
        </div>

        {/* Center Panel - Game World */}
        <div className="flex-1 p-4">
          {/* Current Location */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">
              {currentLocation?.name || 'Unknown Location'}
            </h2>
            <p className="text-gray-300 mb-4">
              {currentLocation?.description || 'No description available'}
            </p>
          </div>

          {/* Recent Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Recent Activity</h3>
            <div className="bg-gray-800 p-4 rounded-lg h-64 overflow-y-auto">
              {locationActions.length === 0 ? (
                <div className="text-gray-500 italic">No recent activity...</div>
              ) : (
                locationActions.map((action) => (
                  <div key={action.id} className="mb-2 text-sm">
                    <span className="text-gray-400">
                      {new Date(action.created_at).toLocaleTimeString()}
                    </span>{' '}
                    <span className="text-white">{action.description}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Input */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Perform Action</h3>
            <form onSubmit={handlePerformAction} className="flex gap-2">
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Describe your action..."
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white"
              >
                Act
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Navigation */}
        <div className="w-1/4 bg-gray-800 p-4 border-l border-gray-700">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Available Locations</h3>
            <div className="space-y-2">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="">Select a location...</option>
                {locations
                  .filter(loc => loc.id !== currentLocation?.id)
                  .map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
              </select>
              <button
                onClick={handleMoveToLocation}
                disabled={!selectedLocation}
                className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-3 py-2 rounded text-white"
              >
                Travel
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">Current Location</h3>
            <div className="bg-gray-700 p-3 rounded">
              <div className="text-sm text-gray-300">
                <div><span className="text-yellow-400">Type:</span> {currentLocation?.location_type}</div>
                <div><span className="text-yellow-400">Players here:</span> Online</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;