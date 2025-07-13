import React, { useState, useEffect } from 'react';
import { AreaService } from '../lib/areaService';
import type { Area, AreaWithLocations } from '../lib/areaService';
import { useAuth } from '../hooks/useAuth';
import { useGame } from '../contexts/GameContext';
import './TravelPage.css';

const TravelPage: React.FC = () => {
  const { user } = useAuth();
  const { updatePlayerLocation, gameState } = useGame();
  const [areas, setAreas] = useState<Area[]>([]);
  const [selectedArea, setSelectedArea] = useState<AreaWithLocations | null>(null);
  const [loading, setLoading] = useState(true);
  const [areaLoading, setAreaLoading] = useState(false);
  const [traveling, setTraveling] = useState(false);

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    setLoading(true);
    try {
      const areasData = await AreaService.getAreas();
      setAreas(areasData);
    } catch (error) {
      console.error('Error loading areas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAreaClick = async (area: Area) => {
    setAreaLoading(true);
    try {
      const areaWithLocations = await AreaService.getAreaWithLocations(area.id);
      setSelectedArea(areaWithLocations);
    } catch (error) {
      console.error('Error loading area details:', error);
    } finally {
      setAreaLoading(false);
    }
  };

  const handleBackToAreas = () => {
    setSelectedArea(null);
  };

  const handleLocationClick = async (location: any) => {
    if (!user || !selectedArea) return;
    
    setTraveling(true);
    try {
      // Update the player's location
      await updatePlayerLocation(location.id, location.name, selectedArea.name);
      
      // Show success message
      alert(`You have successfully traveled to ${location.name} in ${selectedArea.name}!`);
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Failed to travel to location. Please try again.');
    } finally {
      setTraveling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        {/* Header */}
        <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>World Travel</h1>
        </div>
        
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#ccc'
        }}>
          Loading areas...
        </div>
      </div>
    );
  }

  if (selectedArea) {
    return (
      <div style={{ color: 'white', width: '100%' }}>
        {/* Header */}
        <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              style={{
                background: '#444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#555'}
              onMouseOut={(e) => e.currentTarget.style.background = '#444'}
              onClick={handleBackToAreas}
            >
              ← Back to Areas
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>{selectedArea.name}</h1>
          </div>
        </div>
        
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', border: '1px solid #444', marginBottom: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>{selectedArea.description}</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffd700', margin: 0 }}>Controlled by:</h3>
            <div 
              style={{ 
                border: `2px solid ${AreaService.getFactionAlignmentColor(selectedArea.faction_alignment)}`,
                color: AreaService.getFactionAlignmentColor(selectedArea.faction_alignment),
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                background: 'rgba(0,0,0,0.3)'
              }}
            >
              {selectedArea.faction_name}
            </div>
          </div>
        </div>

        {areaLoading ? (
          <div style={{ 
            background: '#2a2a2a', 
            padding: '40px', 
            borderRadius: '8px', 
            border: '1px solid #444',
            textAlign: 'center',
            color: '#ccc'
          }}>
            Loading locations...
          </div>
        ) : (
          <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffd700', marginBottom: '20px' }}>🗺️ Available Locations</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {selectedArea.locations.map((location) => {
                const isCurrentLocation = gameState.currentLocationId === location.id;
                
                return (
                  <div 
                    key={location.id} 
                    style={{
                      background: isCurrentLocation ? '#1a1a1a' : '#1a1a1a',
                      border: isCurrentLocation ? '2px solid #059669' : '1px solid #444',
                      borderRadius: '8px',
                      padding: '16px',
                      cursor: isCurrentLocation ? 'default' : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      if (!isCurrentLocation) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isCurrentLocation) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    onClick={() => !isCurrentLocation && handleLocationClick(location)}
                  >
                    {isCurrentLocation && (
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#059669',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        CURRENT
                      </div>
                    )}
                    <div style={{ fontSize: '24px' }}>
                      {AreaService.getLocationTypeEmoji(location.location_type)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: 'bold', 
                        color: isCurrentLocation ? '#059669' : '#ccc', 
                        margin: '0 0 4px 0' 
                      }}>
                        {location.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>
                        {AreaService.getLocationTypeName(location.location_type)}
                      </p>
                      <p style={{ fontSize: '13px', color: '#aaa', margin: 0, lineHeight: '1.4' }}>{location.description}</p>
                    </div>
                    <div style={{ fontSize: '18px', color: traveling ? '#ca8a04' : isCurrentLocation ? '#059669' : '#666' }}>
                      {traveling ? '⏳' : isCurrentLocation ? '✓' : '→'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>World Travel</h1>
        {gameState.currentLocationName && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '14px', 
            color: '#ccc',
            background: '#1a1a1a',
            padding: '8px 12px',
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            🗺️ Currently at: <span style={{ color: '#2563eb', fontWeight: '600' }}>
              {gameState.currentLocationName}
            </span> in <span style={{ color: '#ca8a04', fontWeight: '600' }}>
              {gameState.currentAreaName}
            </span>
          </div>
        )}
      </div>
      
      <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', border: '1px solid #444', marginBottom: '20px' }}>
        <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
          Choose a destination to travel to. Each area is controlled by a different faction 
          and offers unique locations and opportunities.
        </p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {areas.map((area) => (
          <div 
            key={area.id} 
            style={{
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            onClick={() => handleAreaClick(area)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>{area.name}</h2>
              <div 
                style={{ 
                  border: `2px solid ${AreaService.getFactionAlignmentColor(area.faction_alignment)}`,
                  color: AreaService.getFactionAlignmentColor(area.faction_alignment),
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  background: 'rgba(0,0,0,0.3)'
                }}
              >
                {area.faction_name}
              </div>
            </div>
            <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.4', margin: '0 0 16px 0' }}>{area.description}</p>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              color: '#2563eb',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              <span>🗺️ Explore Area</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelPage; 