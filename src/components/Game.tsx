import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { MiningService } from '../lib/miningService';

const Game: React.FC = () => {
  const { signOut } = useAuth();
  const { gameState, loading, error } = useGame();
  
  const [actionInput, setActionInput] = useState('');

  const handleQuickAction = (actionType: string, description: string) => {
    console.log(`${gameState.playerName} performs ${actionType}: ${description}`);
    // For now, just log the action. In a real implementation, this would update the game state
  };

  const handlePerformAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (actionInput.trim()) {
      console.log(`${gameState.playerName}: ${actionInput}`);
      setActionInput('');
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
        Loading game...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>
        Error: {error}
      </div>
    );
  }

  if (!gameState.playerName) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>
        No player data found
      </div>
    );
  }

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700' }}>Murim Universe</h1>
          <button
            onClick={signOut}
            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Current Activity Display */}
      {gameState.currentActivity && (
        <div style={{ 
          background: '#1a1a1a', 
          padding: '12px 16px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          border: '1px solid #444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffd700' }}>
              Current Activity
            </div>
            <div style={{ fontSize: '12px', color: '#ccc' }}>
              {gameState.currentActivity}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
        {/* Left Panel - Player Stats */}
        <div style={{ width: '25%', background: '#2a2a2a', padding: '16px', borderRadius: '8px', border: '1px solid #444' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd700', marginBottom: '16px' }}>Player Status</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ color: '#ccc' }}>Name:</span> {gameState.playerName}</div>
              <div><span style={{ color: '#ccc' }}>Level:</span> {gameState.level}</div>
              <div><span style={{ color: '#ccc' }}>Experience:</span> {gameState.experience}</div>
              <div><span style={{ color: '#ccc' }}>Health:</span> {gameState.health}/{gameState.maxHealth}</div>
              <div><span style={{ color: '#ccc' }}>Energy:</span> {gameState.energy}/{gameState.maxEnergy}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '8px' }}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => handleQuickAction('train', `${gameState.playerName} begins training`)}
                style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
              >
                Train
              </button>
              <button
                onClick={() => handleQuickAction('meditate', `${gameState.playerName} enters meditation`)}
                style={{ width: '100%', background: '#7c3aed', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
              >
                Meditate
              </button>
              <button
                onClick={() => handleQuickAction('rest', `${gameState.playerName} takes a rest`)}
                style={{ width: '100%', background: '#059669', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 12px', cursor: 'pointer', fontSize: '14px' }}
              >
                Rest
              </button>
            </div>
          </div>
        </div>

        {/* Center Panel - Game World */}
        <div style={{ flex: 1, padding: '16px', background: '#2a2a2a', borderRadius: '8px', border: '1px solid #444' }}>
          {/* Current Location */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', marginBottom: '8px' }}>
              {gameState.currentAreaName || 'Mortal Realm'}
            </h2>
            <p style={{ color: '#ccc', marginBottom: '16px' }}>
              {gameState.currentLocationName ? 
                `You are currently at ${gameState.currentLocationName} in ${gameState.currentAreaName || 'the Mortal Realm'}.` :
                'You find yourself in the bustling streets of the Mortal Realm. Cultivators and commoners alike walk these paths, each with their own destiny to fulfill.'
              }
            </p>
          </div>

          {/* Current Mining Action */}
          {gameState.currentMiningAction && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '12px' }}>🚧 Current Activity</h3>
              <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {MiningService.getMaterialEmoji(gameState.currentMiningAction.material?.name || '')}
                  </span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffd700' }}>
                      Mining {gameState.currentMiningAction.material?.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#ccc' }}>
                      at {gameState.currentMiningAction.location?.name}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '4px',
                    fontSize: '12px',
                    color: '#ccc'
                  }}>
                    <span>Progress</span>
                    <span>{MiningService.formatTimeRemaining(gameState.currentMiningAction.end_time)}</span>
                  </div>
                  <div style={{ 
                    background: '#2a2a2a', 
                    height: '8px', 
                    borderRadius: '4px', 
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      background: '#2563eb',
                      height: '100%',
                      width: `${MiningService.calculateProgress(gameState.currentMiningAction.start_time, gameState.currentMiningAction.end_time)}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                
                <div style={{ fontSize: '11px', color: '#666' }}>
                  Mining will automatically stop when the timer expires or your inventory is full.
                </div>
              </div>
            </div>
          )}

          {/* Recent Actions */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '12px' }}>Recent Activity</h3>
            <div style={{ background: '#1a1a1a', padding: '16px', borderRadius: '8px', height: '200px', overflowY: 'auto' }}>
              <div style={{ color: '#666', fontStyle: 'italic' }}>No recent activity...</div>
            </div>
          </div>

          {/* Action Input */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '8px' }}>Perform Action</h3>
            <form onSubmit={handlePerformAction} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                placeholder="Describe your action..."
                style={{ flex: 1, padding: '8px 12px', background: '#1a1a1a', border: '1px solid #444', borderRadius: '4px', color: 'white' }}
              />
              <button
                type="submit"
                style={{ background: '#ca8a04', color: 'white', border: 'none', borderRadius: '4px', padding: '8px 16px', cursor: 'pointer' }}
              >
                Act
              </button>
            </form>
          </div>
        </div>

        {/* Right Panel - Navigation */}
        <div style={{ width: '25%', background: '#2a2a2a', padding: '16px', borderRadius: '8px', border: '1px solid #444' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '12px' }}>Available Locations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ color: '#ccc', fontSize: '14px' }}>
                <div>• Training Grounds</div>
                <div>• Meditation Chamber</div>
                <div>• Market District</div>
                <div>• Cultivation Pavilion</div>
              </div>
              <p style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
                Location travel will be implemented in future updates.
              </p>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#ffd700', marginBottom: '12px' }}>Current Location</h3>
            <div style={{ background: '#1a1a1a', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontSize: '14px', color: '#ccc' }}>
                <div><span style={{ color: '#ffd700' }}>Area:</span> {gameState.currentAreaName || 'Mortal Realm'}</div>
                <div><span style={{ color: '#ffd700' }}>Location:</span> {gameState.currentLocationName || 'Training Grounds'}</div>
                <div><span style={{ color: '#ffd700' }}>Status:</span> <span style={{ color: '#059669' }}>Online</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;