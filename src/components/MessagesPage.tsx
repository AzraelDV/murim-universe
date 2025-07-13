import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender_username?: string;
  recipient_username?: string;
}

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [selected, setSelected] = useState<Message | null>(null);
  const [compose, setCompose] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const fetchMessages = async () => {
      try {
        // Inbox: messages where recipient is current user
        const { data: inboxData, error: inboxError } = await supabase
          .from('messages')
          .select('*, sender:sender_id(username)')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
        if (inboxError) throw inboxError;
        setInbox((inboxData || []).map((msg: any) => ({ ...msg, sender_username: msg.sender?.username })));

        // Sent: messages where sender is current user
        const { data: sentData, error: sentError } = await supabase
          .from('messages')
          .select('*, recipient:recipient_id(username)')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
        if (sentError) throw sentError;
        setSent((sentData || []).map((msg: any) => ({ ...msg, recipient_username: msg.recipient?.username })));
      } catch (err: any) {
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [user]);

  const handleSelect = async (msg: Message) => {
    if (!user?.id) return;
    setSelected(msg);
    if (!msg.read && msg.recipient_id === user.id) {
      // Mark as read
      await supabase.from('messages').update({ read: true }).eq('id', msg.id);
      setInbox(inbox => inbox.map(m => m.id === msg.id ? { ...m, read: true } : m));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSending(true);
    setError(null);
    try {
      // Find recipient by username
      const { data: recipientData, error: recipientError } = await supabase
        .from('players')
        .select('id')
        .eq('username', recipient)
        .maybeSingle();
      if (recipientError) throw recipientError;
      if (!recipientData) throw new Error('Recipient not found');
      if (recipientData.id === user.id) throw new Error('Cannot send message to yourself');

      // Insert message
      const { error: sendError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientData.id,
          content,
        });
      if (sendError) throw sendError;
      setContent('');
      setRecipient('');
      setCompose(false);
      // Optionally, refresh inbox
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ color: 'white', width: '100%' }}>
      {/* Header */}
      <div style={{ background: '#2a2a2a', padding: '16px', borderBottom: '1px solid #444', marginBottom: '20px', borderRadius: '8px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffd700', margin: 0 }}>Message Center</h1>
      </div>
      
      <div style={{ display: 'flex', gap: '24px', width: '100%' }}>
        {/* Inbox */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: '#2a2a2a', padding: '16px', borderRadius: '8px', border: '1px solid #444', marginBottom: '16px' }}>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px', color: '#ffd700' }}>📥 Inbox</div>
            {loading ? (
              <div style={{ color: '#ccc', textAlign: 'center', padding: '20px' }}>Loading messages...</div>
            ) : inbox.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No messages in inbox.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {inbox.map(msg => (
                  <li key={msg.id} style={{
                    background: selected?.id === msg.id ? '#1a1a1a' : msg.read ? '#2a2a2a' : '#1a1a1a',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    padding: '12px',
                    cursor: 'pointer',
                    border: msg.read ? '1px solid #444' : '2px solid #2563eb',
                    fontWeight: msg.read ? '400' : '600',
                    transition: 'all 0.2s'
                  }} 
                  onClick={() => handleSelect(msg)}
                  onMouseOver={(e) => {
                    if (selected?.id !== msg.id) {
                      e.currentTarget.style.background = '#1a1a1a';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selected?.id !== msg.id) {
                      e.currentTarget.style.background = msg.read ? '#2a2a2a' : '#1a1a1a';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                  >
                    <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600', marginBottom: '4px' }}>{msg.sender_username || msg.sender_id}</div>
                    <div style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ccc' }}>{msg.content}</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{new Date(msg.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
            <button
              style={{ 
                marginTop: '16px', 
                background: '#2563eb', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                padding: '10px 16px', 
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
              onClick={() => { setCompose(true); setSelected(null); }}
            >
              ✉️ New Message
            </button>
          </div>
        </div>
        
        {/* Sent */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ background: '#2a2a2a', padding: '16px', borderRadius: '8px', border: '1px solid #444' }}>
            <div style={{ fontWeight: '700', fontSize: '18px', marginBottom: '12px', color: '#ffd700' }}>📤 Sent</div>
            {loading ? (
              <div style={{ color: '#ccc', textAlign: 'center', padding: '20px' }}>Loading sent messages...</div>
            ) : sent.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>No sent messages.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {sent.map(msg => (
                  <li key={msg.id} style={{
                    background: '#2a2a2a',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    padding: '12px',
                    fontWeight: '400',
                    border: '1px solid #444'
                  }}>
                    <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600', marginBottom: '4px' }}>{msg.recipient_username || msg.recipient_id}</div>
                    <div style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ccc' }}>{msg.content}</div>
                    <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{new Date(msg.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Message View / Compose */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {selected && (
            <div style={{ background: '#2a2a2a', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid #444' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: '#ffd700' }}>📖 Message Details</div>
              <div style={{ fontSize: '13px', color: '#2563eb', marginBottom: '8px', fontWeight: '600' }}>From: {selected.sender_username || selected.sender_id}</div>
              <div style={{ fontSize: '14px', marginBottom: '12px', color: '#ccc', lineHeight: '1.4', background: '#1a1a1a', padding: '12px', borderRadius: '6px' }}>{selected.content}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{new Date(selected.created_at).toLocaleString()}</div>
            </div>
          )}
          {compose && (
            <form onSubmit={handleSend} style={{ background: '#2a2a2a', borderRadius: '8px', padding: '16px', border: '1px solid #444' }}>
              <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '12px', color: '#ffd700' }}>✍️ Compose Message</div>
              <input
                type="text"
                placeholder="Recipient username"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid #444', 
                  background: '#1a1a1a', 
                  color: 'white',
                  fontSize: '14px'
                }}
                required
              />
              <textarea
                placeholder="Message content"
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ 
                  width: '100%', 
                  minHeight: '80px', 
                  marginBottom: '12px', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid #444', 
                  background: '#1a1a1a', 
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
                required
              />
              {error && <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
              <button
                type="submit"
                disabled={sending}
                style={{ 
                  background: '#2563eb', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  padding: '10px 16px', 
                  cursor: 'pointer', 
                  width: '100%',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => !sending && (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => !sending && (e.currentTarget.style.background = '#2563eb')}
              >
                {sending ? '📤 Sending...' : '📤 Send Message'}
              </button>
              <button
                type="button"
                onClick={() => setCompose(false)}
                style={{ 
                  marginTop: '8px', 
                  background: '#444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  width: '100%',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#555'}
                onMouseOut={(e) => e.currentTarget.style.background = '#444'}
              >
                ❌ Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 