import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Faction {
  id: string;
  name: string;
  alignment: string;
}

interface ReputationRow {
  faction_id: string;
  reputation: number;
}

const FactionReputation: React.FC = () => {
  const { user } = useAuth();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [reputation, setReputation] = useState<ReputationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all factions
        const { data: factionsData, error: factionsError } = await supabase
          .from('factions')
          .select('id, name, alignment');
        if (factionsError) throw factionsError;
        setFactions(factionsData || []);

        // Fetch player reputation
        const { data: repData, error: repError } = await supabase
          .from('player_faction_reputation')
          .select('faction_id, reputation')
          .eq('player_id', user?.id);
        if (repError) throw repError;
        setReputation(repData || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const getReputation = (factionId: string) => {
    const row = reputation.find(r => r.faction_id === factionId);
    return row ? row.reputation : 0;
  };

  if (loading) return (
    <div style={{ 
      color: 'white', 
      width: '100%',
      background: '#2a2a2a', 
      padding: '40px', 
      borderRadius: '8px', 
      border: '1px solid #444',
      textAlign: 'center'
    }}>
      Loading faction data...
    </div>
  );
  
  if (error) return (
    <div style={{ 
      color: '#dc2626', 
      width: '100%',
      background: '#2a2a2a', 
      padding: '40px', 
      borderRadius: '8px', 
      border: '1px solid #444',
      textAlign: 'center'
    }}>
      Error: {error}
    </div>
  );

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>Faction Reputation</h1>
      </div>
      
      <div style={{ 
        background: '#2a2a2a', 
        borderRadius: '8px', 
        border: '1px solid #444',
        overflow: 'hidden'
      }}>
        <div style={{ 
          background: '#1a1a1a', 
          padding: '16px', 
          borderBottom: '1px solid #444'
        }}>
          <h2 style={{ 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: '#ffd700', 
            margin: 0 
          }}>
            🏛️ Faction Relations
          </h2>
        </div>
        
        <div style={{ padding: '20px' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ 
                borderBottom: '2px solid #444',
                background: '#1a1a1a'
              }}>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  color: '#ffd700',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  🏰 Faction
                </th>
                <th style={{ 
                  textAlign: 'left', 
                  padding: '12px 16px',
                  color: '#ffd700',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  ⚖️ Alignment
                </th>
                <th style={{ 
                  textAlign: 'right', 
                  padding: '12px 16px',
                  color: '#ffd700',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  📊 Reputation
                </th>
              </tr>
            </thead>
            <tbody>
              {factions.map((faction, index) => {
                const rep = getReputation(faction.id);
                const repColor = rep > 50 ? '#059669' : rep > 0 ? '#ca8a04' : rep < 0 ? '#dc2626' : '#666';
                
                return (
                  <tr key={faction.id} style={{ 
                    borderBottom: '1px solid #444',
                    background: index % 2 === 0 ? '#2a2a2a' : '#1a1a1a',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? '#2a2a2a' : '#1a1a1a'}
                  >
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ccc'
                    }}>
                      {faction.name}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      fontSize: '14px',
                      color: '#ccc'
                    }}>
                      <span style={{
                        background: faction.alignment === 'Good' ? '#059669' : 
                                   faction.alignment === 'Evil' ? '#dc2626' : '#ca8a04',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {faction.alignment}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px 16px', 
                      textAlign: 'right',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: repColor
                    }}>
                      {rep > 0 ? '+' : ''}{rep}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FactionReputation; 