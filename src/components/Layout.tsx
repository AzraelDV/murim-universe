import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import HPBar from './HPBar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

const Layout: React.FC = () => {
  const { user } = useAuth();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [role, setRole] = useState<string>('player');

  useEffect(() => {
    if (!user?.id) return;
    // Fetch unread messages count
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadMessages(count || 0));
    // Fetch unread notifications count
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('player_id', user.id)
      .eq('read', false)
      .then(({ count }) => setUnreadNotifications(count || 0));
    // Fetch user role
    supabase
      .from('players')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => setRole(data?.role || 'player'));
  }, [user]);

  const isAdmin = ['admin', 'owner', 'developer'].includes(role);

  const sidebarSections = [
    {
      header: 'Account',
      links: [
        { to: '/dashboard', label: 'Home' },
        { to: '/messages', label: 'Messages', badge: unreadMessages },
        { to: '/notifications', label: 'Notifications', badge: unreadNotifications },
      ],
    },
    {
      header: 'Player',
      links: [
        { to: '/stats', label: 'Stats' },
        { to: '/inventory', label: 'Inventory' },
        { to: '/skills', label: 'Skills' },
        { to: '/mining', label: 'Mining' },
        { to: '/travel', label: 'Travel' },
      ],
    },
    ...(isAdmin ? [{
      header: 'Admin',
      links: [
        { to: '/admin/global-notification', label: 'Send Global Notification' },
        { to: '/admin/create-item', label: 'Create Item' },
      ],
    }] : []),
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#181818' }}>
      <HPBar />
      <aside
        style={{
          width: 220,
          background: '#23272f',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 0',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, textAlign: 'center', marginBottom: 40, letterSpacing: 1 }}>
          Murim Universe
        </div>
        <nav>
          {sidebarSections.map(section => (
            <div key={section.header} style={{ marginBottom: 24 }}>
              <div style={{
                fontWeight: 700,
                fontSize: 16,
                marginBottom: 8,
                marginLeft: 16,
                letterSpacing: 0.5,
              }}>{section.header}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {section.links.map(link => (
                  <li key={link.to} style={{ marginBottom: 0 }}>
                    <NavLink
                      to={link.to}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        color: isActive ? '#61dafb' : 'white',
                        background: isActive ? '#20232a' : 'transparent',
                        textDecoration: 'none',
                        fontSize: 15,
                        fontWeight: 500,
                        padding: '7px 0 7px 24px',
                        marginLeft: 4,
                        borderRadius: 4,
                        transition: 'background 0.2s',
                        position: 'relative',
                      })}
                    >
                      <span style={{ color: '#2196F3', fontSize: 13, marginRight: 8, display: 'inline-block', width: 12 }}>&#9654;</span>
                      {link.label}
                      {typeof link.badge === 'number' && link.badge > 0 && (
                        <span style={{
                          display: 'inline-block',
                          background: '#e53935',
                          color: 'white',
                          borderRadius: '50%',
                          minWidth: 16,
                          height: 16,
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: '16px',
                          textAlign: 'center',
                          marginLeft: 8,
                          padding: '0 4px',
                        }}>{link.badge > 99 ? '99+' : link.badge}</span>
                      )}
                    </NavLink>
                    <div style={{ borderBottom: '1px dotted #444', margin: '0 0 0 24px' }} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ 
        flex: 1, 
        padding: '40px 32px', 
        overflowY: 'auto', 
        minHeight: '100vh',
        width: '100%',
        maxWidth: 'none',
        boxSizing: 'border-box'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 