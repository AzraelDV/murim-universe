import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const AdminGlobalNotification: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<string>('player');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('players')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role || 'player'));
  }, [user]);

  const isAdmin = ['admin', 'owner', 'developer'].includes(role);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      // Fetch all player IDs
      const { data: players, error } = await supabase.from('players').select('id');
      if (error) throw error;
      if (!players || players.length === 0) throw new Error('No players found');
      // Insert a notification for each player
      const notifications = players.map((p: any) => ({
        player_id: p.id,
        type: 'global',
        message,
        priority: true,
      }));
      const { error: insertError } = await supabase.from('notifications').insert(notifications);
      if (insertError) throw insertError;
      setStatus('Notification sent to all players!');
      setMessage('');
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Failed to send notification'));
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <div style={{ color: 'white', textAlign: 'center', padding: 40 }}>You do not have permission to access this page.</div>;
  }

  return (
    <div style={{ color: 'white', maxWidth: 500, margin: '40px auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Send Global Notification</h1>
      <form onSubmit={handleSend} style={{ background: '#23272f', borderRadius: 8, padding: 24 }}>
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Enter your global notification message..."
          style={{ width: '100%', minHeight: 80, marginBottom: 16, padding: 10, borderRadius: 4, border: '1px solid #444', background: '#181818', color: 'white', fontSize: 16 }}
          required
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer', width: '100%' }}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
        {status && <div style={{ marginTop: 16, color: status.startsWith('Error') ? 'red' : '#61dafb', textAlign: 'center' }}>{status}</div>}
      </form>
    </div>
  );
};

export default AdminGlobalNotification; 