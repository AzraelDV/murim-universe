import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Notification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
  priority?: boolean; // Added priority field
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('player_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setNotifications(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(notifications => notifications.filter(n => n.id !== id));
  };

  // Only show unread notifications
  const sortedNotifications = [...notifications]
    .filter(n => !n.read)
    .sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>Notification Center</h1>
      </div>
      
      {loading ? (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#ccc'
        }}>
          Loading notifications...
        </div>
      ) : error ? (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center',
          color: '#dc2626'
        }}>
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          background: '#2a2a2a', 
          padding: '40px', 
          borderRadius: '8px', 
          border: '1px solid #444',
          textAlign: 'center', 
          color: '#666',
          fontSize: '16px'
        }}>
          📭 No notifications to display.
        </div>
      ) : (
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', border: '1px solid #444' }}>
          <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '16px', color: '#ffd700' }}>
            🔔 Active Notifications ({sortedNotifications.length})
          </div>
          <ul style={{ listStyle: 'none', padding: 0, width: '100%', margin: 0 }}>
            {sortedNotifications.map(n => (
              <li key={n.id} style={{
                background: n.priority ? '#1a1a1a' : n.read ? '#2a2a2a' : '#1a1a1a',
                border: n.priority ? '2px solid #dc2626' : n.read ? '1px solid #444' : '2px solid #2563eb',
                borderRadius: '8px',
                marginBottom: '12px',
                padding: '16px',
                position: 'relative',
                fontWeight: n.read ? '400' : '600',
                boxShadow: n.priority ? '0 0 12px 4px rgba(220, 38, 38, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = n.priority ? '0 4px 16px 6px rgba(220, 38, 38, 0.4)' : '0 4px 12px rgba(0,0,0,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = n.priority ? '0 0 12px 4px rgba(220, 38, 38, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)';
              }}
              >
                {n.priority && (
                  <span style={{ 
                    fontWeight: '700', 
                    marginRight: '8px',
                    background: '#dc2626',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                  }}>
                    ⚠️ Global
                  </span>
                )}
                <div style={{ 
                  fontSize: '15px', 
                  marginBottom: '8px', 
                  color: '#ccc',
                  lineHeight: '1.4'
                }}>
                  {n.message}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>📅 {new Date(n.created_at).toLocaleString()}</span>
                  {!n.read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      style={{
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
                      onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
                    >
                      ✓ Mark as read
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage; 