import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { MiningService, type MiningMaterial, type MiningAction, type SpecialMiningLocation } from '../lib/miningService';

const MiningPage: React.FC = () => {
  const { user } = useAuth();
  const { gameState, updateCurrentActivity } = useGame();
  const [miningLocations, setMiningLocations] = useState<any[]>([]);
  const [specialLocations, setSpecialLocations] = useState<SpecialMiningLocation[]>([]);
  const [currentAction, setCurrentAction] = useState<MiningAction | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [availableMaterials, setAvailableMaterials] = useState<MiningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadMiningData();
  }, [user]);

  useEffect(() => {
    // Poll for current action updates every 30 seconds
    const interval = setInterval(() => {
      if (user?.id) {
        loadCurrentAction();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const loadMiningData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [locations, special, current] = await Promise.all([
        MiningService.getMiningLocations(),
        MiningService.getSpecialMiningLocations(),
        MiningService.getCurrentMiningAction(user.id)
      ]);
      
      setMiningLocations(locations);
      setSpecialLocations(special);
      setCurrentAction(current);
      
      // Update current activity if there's an active mining action
      if (current && current.material && current.location) {
        await updateCurrentActivity(`Mining ${current.material.name} at ${current.location.name}`);
      } else if (!current) {
        // Clear activity if no mining action
        await updateCurrentActivity(null);
      }
    } catch (err: any) {
      console.error('Error loading mining data:', err);
      setError(err.message || 'Failed to load mining data');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentAction = async () => {
    if (!user?.id) return;
    
    try {
      const current = await MiningService.getCurrentMiningAction(user.id);
      setCurrentAction(current);
      
      // Update current activity if there's an active mining action
      if (current && current.material && current.location) {
        await updateCurrentActivity(`Mining ${current.material.name} at ${current.location.name}`);
      } else if (!current) {
        // Clear activity if no mining action
        await updateCurrentActivity(null);
      }
    } catch (err) {
      console.error('Error loading current action:', err);
    }
  };

  const handleLocationSelect = async (location: any) => {
    setSelectedLocation(location);
    
    try {
      const materials = await MiningService.getAvailableMaterials(
        gameState.level, 
        location.isSpecialLocation || false
      );
      setAvailableMaterials(materials);
    } catch (err: any) {
      setError(err.message || 'Failed to load materials');
    }
  };

  const handleStartMining = async (materialId: string) => {
    if (!user?.id || !selectedLocation) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const result = await MiningService.startMining(
        user.id,
        selectedLocation.id,
        materialId,
        6 // 6 hours duration
      );
      
      if (result.success) {
        setNotification({ type: 'success', message: 'Mining started successfully!' });
        await loadMiningData(); // Reload to get current action
        
        // Update current activity
        const material = availableMaterials.find(m => m.id === materialId);
        if (material) {
          await updateCurrentActivity(`Mining ${material.name} at ${selectedLocation.name}`);
        }
      } else {
        setError(result.error || 'Failed to start mining');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start mining');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopMining = async () => {
    if (!user?.id) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const result = await MiningService.stopMining(user.id);
      
      if (result.success) {
        setNotification({ 
          type: 'success', 
          message: `Mining completed! You gained ${result.xp_gained} XP and ${result.ores_mined} ${result.material_name}.` 
        });
        await loadMiningData(); // Reload to clear current action
        
        // Clear current activity
        await updateCurrentActivity(null);
      } else {
        setError(result.error || 'Failed to stop mining');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to stop mining');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewMining = async () => {
    if (!user?.id) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const result = await MiningService.renewMining(user.id, 6);
      
      if (result.success) {
        setNotification({ type: 'success', message: 'Mining renewed for 6 more hours!' });
        await loadMiningData(); // Reload to get updated action
      } else {
        setError(result.error || 'Failed to renew mining');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to renew mining');
    } finally {
      setActionLoading(false);
    }
  };

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#ccc'
        }}>
          Loading mining locations...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 8px 0' }}>⛏️ Mining</h1>
        <p style={{ color: '#ccc', fontSize: '14px', margin: 0, lineHeight: '1.4' }}>
          Extract valuable ores from the Common Mine accessible from all cities. Mine 1 ore every 5 minutes, or visit special locations for rare materials.
        </p>
      </div>

      {/* Notification */}
      {notification && (
        <div style={{
          background: notification.type === 'success' ? '#059669' : '#dc2626',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '6px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{notification.type === 'success' ? '✅' : '❌'}</span>
          {notification.message}
        </div>
      )}

      {/* Current Mining Action */}
      {currentAction && (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 16px 0' }}>
            🚧 Currently Mining
          </h2>
          
          <div style={{ 
            background: '#1a1a1a', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            border: '1px solid #444'
          }}>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginBottom: '8px' }}>
              💡 You can cancel mining at any time to collect your rewards immediately!
            </div>
            <div style={{ fontSize: '11px', color: '#ccc', lineHeight: '1.3' }}>
              Mining rate: 1 ore every 5 minutes • Items are added to your inventory when you stop mining
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>
                  {MiningService.getMaterialEmoji(currentAction.material?.name || '')}
                </span>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffd700' }}>
                    {currentAction.material?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    at {currentAction.location?.name}
                  </div>
                </div>
              </div>
              
              {/* Current Rewards Display */}
              {(() => {
                const rewards = MiningService.calculateCurrentRewards(currentAction);
                return (
                  <div style={{ 
                    background: '#1a1a1a', 
                    padding: '8px 12px', 
                    borderRadius: '4px', 
                    marginBottom: '12px',
                    border: '1px solid #333'
                  }}>
                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginBottom: '4px' }}>
                      🎁 Current Rewards Ready to Collect:
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                      <span style={{ color: '#ffd700' }}>
                        {MiningService.getMaterialEmoji(currentAction.material?.name || '')} {rewards.ores} {currentAction.material?.name}
                      </span>
                      <span style={{ color: '#2563eb' }}>
                        ✨ {rewards.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })()}
              
              <div style={{ marginBottom: '12px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '4px',
                  fontSize: '12px',
                  color: '#ccc'
                }}>
                  <span>Progress</span>
                  <span>{MiningService.formatTimeRemaining(currentAction.end_time)}</span>
                </div>
                <div style={{ 
                  background: '#1a1a1a', 
                  height: '8px', 
                  borderRadius: '4px', 
                  overflow: 'hidden'
                }}>
                  <div style={{
                    background: '#2563eb',
                    height: '100%',
                    width: `${MiningService.calculateProgress(currentAction.start_time, currentAction.end_time)}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleRenewMining}
                disabled={actionLoading}
                style={{
                  background: '#ca8a04',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Renewing...' : 'Renew (6h)'}
              </button>
              <button
                onClick={handleStopMining}
                disabled={actionLoading}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  opacity: actionLoading ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Stopping...' : 'Stop & Collect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mining Locations */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #444',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 16px 0' }}>
          ⛏️ Common Mine
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {miningLocations.map((location) => (
            <div 
              key={location.id}
              style={{
                background: selectedLocation?.id === location.id ? '#1a1a1a' : '#1a1a1a',
                border: selectedLocation?.id === location.id ? '2px solid #ffd700' : '1px solid #444',
                borderRadius: '6px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => handleLocationSelect(location)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>⛏️</span>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffd700' }}>
                  {location.name}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#10b981', marginBottom: '8px', fontWeight: '600' }}>
                🌍 Accessible from all cities
              </div>
              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>
                {location.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Mining Locations */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #444',
        marginBottom: '20px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 16px 0' }}>
          ⭐ Special Locations
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {specialLocations.map((location) => (
            <div 
              key={location.id}
              style={{
                background: selectedLocation?.id === location.id ? '#1a1a1a' : '#1a1a1a',
                border: selectedLocation?.id === location.id ? '2px solid #ffd700' : '1px solid #444',
                borderRadius: '6px',
                padding: '16px',
                cursor: gameState.level >= location.min_level ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: gameState.level >= location.min_level ? 1 : 0.5
              }}
              onClick={() => gameState.level >= location.min_level && handleLocationSelect({
                ...location,
                id: location.id,
                name: location.name,
                isSpecialLocation: true
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {MiningService.getMaterialEmoji(location.material.name)}
                </span>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#ffd700' }}>
                  {location.name}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '8px' }}>
                Level {location.min_level}+ Required
              </div>
              <div style={{ fontSize: '11px', color: '#666', lineHeight: '1.3' }}>
                {location.description}
              </div>
              {gameState.level < location.min_level && (
                <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '8px' }}>
                  You need level {location.min_level} to access this location
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Available Materials */}
      {selectedLocation && availableMaterials.length > 0 && (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #444'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', margin: '0 0 16px 0' }}>
            Available Materials at {selectedLocation.name}
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '16px' 
          }}>
            {availableMaterials.map((material) => (
              <div 
                key={material.id}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #444',
                  borderRadius: '6px',
                  padding: '16px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.5rem' }}>
                    {MiningService.getMaterialEmoji(material.name)}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffd700' }}>
                      {material.name}
                    </div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: MiningService.getRarityColor(material.rarity),
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}>
                      {material.rarity}
                    </div>
                  </div>
                </div>
                
                <div style={{ fontSize: '11px', color: '#ccc', marginBottom: '12px', lineHeight: '1.3' }}>
                  {material.description}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    Level {material.min_level}+
                  </div>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '600' }}>
                    {material.xp_reward} XP/ore
                  </div>
                </div>
                
                <button
                  onClick={() => handleStartMining(material.id)}
                  disabled={actionLoading || !!currentAction}
                  style={{
                    width: '100%',
                    background: currentAction ? '#666' : '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: currentAction ? 'not-allowed' : 'pointer',
                    fontSize: '11px',
                    fontWeight: '600',
                    opacity: currentAction ? 0.6 : 1
                  }}
                >
                  {actionLoading ? 'Starting...' : currentAction ? 'Already Mining' : 'Start Mining (6h)'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Materials Message */}
      {selectedLocation && availableMaterials.length === 0 && (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#666',
          fontSize: '16px'
        }}>
          No materials available at this location for your current level.
        </div>
      )}
    </div>
  );
};

export default MiningPage; 