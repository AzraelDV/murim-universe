import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface PlayerStats {
  strength: number;
  dexterity: number;
  constitution: number;
  qi: number;
  wisdom: number;
  intellect: number;
  perception: number;
  charisma: number;
  health: number;
  max_health: number;
  energy: number;
  max_energy: number;
}

const statsConfig = [
  {
    key: 'strength' as keyof PlayerStats,
    name: 'Strength',
    emoji: '💪',
    description: 'Melee damage, carry weight, heavy weapons'
  },
  {
    key: 'dexterity' as keyof PlayerStats,
    name: 'Dexterity',
    emoji: '🏃‍♂️',
    description: 'Accuracy, dodge rate, attack speed'
  },
  {
    key: 'constitution' as keyof PlayerStats,
    name: 'Constitution',
    emoji: '❤️',
    description: 'Max HP, stamina recovery, damage resistance'
  },
  {
    key: 'qi' as keyof PlayerStats,
    name: 'Energy/Qi',
    emoji: '🔥',
    description: 'Martial arts, Qi capacity, special skills'
  },
  {
    key: 'wisdom' as keyof PlayerStats,
    name: 'Wisdom',
    emoji: '📖',
    description: 'Cultivation speed, Qi recovery, healing'
  },
  {
    key: 'intellect' as keyof PlayerStats,
    name: 'Intellect',
    emoji: '🧠',
    description: 'Advanced techniques, crafting, strategy'
  },
  {
    key: 'perception' as keyof PlayerStats,
    name: 'Perception',
    emoji: '🎯',
    description: 'Detection, critical hits, reaction speed'
  },
  {
    key: 'charisma' as keyof PlayerStats,
    name: 'Charisma',
    emoji: '🗣️',
    description: 'NPC interactions, reputation, leadership'
  }
];

const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('players')
          .select('strength, dexterity, constitution, qi, wisdom, intellect, perception, charisma, health, max_health, energy, max_energy')
          .eq('id', user.id)
          .maybeSingle();
          
        if (error) throw error;
        if (!data) {
          setError('No player record found. Please complete player setup first.');
          return;
        }
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) return <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Loading stats...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center', padding: '40px' }}>Error: {error}</div>;
  if (!stats) return <div style={{ color: 'white', textAlign: 'center', padding: '40px' }}>No stats found</div>;

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>Character Statistics</h1>
      </div>
      
      {/* Vital Stats */}
      <div style={{ 
        background: '#2a2a2a', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        width: '100%',
        border: '1px solid #444'
      }}>
        <div style={{ textAlign: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffd700', fontWeight: '600' }}>❤️ Health</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626' }}>
            {stats.health} / {stats.max_health}
          </div>
        </div>
        <div style={{ textAlign: 'center', background: '#1a1a1a', padding: '16px', borderRadius: '6px', border: '1px solid #444' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffd700', fontWeight: '600' }}>🔥 Energy</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ca8a04' }}>
            {stats.energy} / {stats.max_energy}
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '20px',
        width: '100%'
      }}>
        {statsConfig.map(stat => (
          <div key={stat.key} style={{ 
            background: '#2a2a2a', 
            padding: '20px', 
            borderRadius: '8px',
            border: '1px solid #444',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '2.5rem', marginRight: '16px' }}>{stat.emoji}</span>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ffd700' }}>{stat.name}</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {stats[stat.key]}
                </div>
              </div>
            </div>
            <div style={{ color: '#ccc', fontSize: '0.95rem', lineHeight: '1.4' }}>
              {stat.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage; 