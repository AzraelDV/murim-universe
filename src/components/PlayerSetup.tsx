import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';

const PlayerSetup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { initializePlayer } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError('');

    try {
      await initializePlayer(username.trim());
      // If we get here, the player was initialized successfully
    } catch (err) {
      setError('An error occurred while creating your player.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
          Enter the Murim Universe
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
              Choose your cultivation name:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Enter your username"
              required
              minLength={3}
              maxLength={20}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? 'Creating Player...' : 'Begin Cultivation Journey'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-400 text-center">
          <p>Welcome to the world of martial arts and cultivation!</p>
          <p>Your journey begins in the Mortal Realm.</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerSetup;