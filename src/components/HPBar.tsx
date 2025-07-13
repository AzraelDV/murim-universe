import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface VitalStats {
  health: number;
  max_health: number;
  energy: number;
  max_energy: number;
}

const HPBar: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VitalStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('players')
          .select('health, max_health, energy, max_energy')
          .eq('id', user.id)
          .maybeSingle();
          
        if (!error && data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch vital stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Set up real-time subscription for updates
    const channel = supabase
      .channel('vital-stats')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'players', filter: `id=eq.${user?.id}` },
        (payload) => {
          setStats(payload.new as VitalStats);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || !stats) return null;

  const healthPercent = (stats.health / stats.max_health) * 100;
  const energyPercent = (stats.energy / stats.max_energy) * 100;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      width: '200px',
      height: '40px',
      background: '#1a1a1a',
      borderRadius: '6px',
      border: '1px solid #333',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      padding: '4px',
      gap: '2px'
    }}>
      {/* Health Bar */}
      <div style={{
        flex: 1,
        background: '#333',
        borderRadius: '3px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: healthPercent > 50 ? '#4CAF50' : healthPercent > 25 ? '#FF9800' : '#F44336',
          width: `${healthPercent}%`,
          transition: 'width 0.3s ease',
          borderRadius: '3px'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '4px',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          ❤️ {stats.health}/{stats.max_health}
        </div>
      </div>
      
      {/* Energy Bar */}
      <div style={{
        flex: 1,
        background: '#333',
        borderRadius: '3px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          background: '#2196F3',
          width: `${energyPercent}%`,
          transition: 'width 0.3s ease',
          borderRadius: '3px'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '4px',
          transform: 'translateY(-50%)',
          fontSize: '10px',
          color: 'white',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}>
          🔥 {stats.energy}/{stats.max_energy}
        </div>
      </div>
    </div>
  );
};

export default HPBar; 