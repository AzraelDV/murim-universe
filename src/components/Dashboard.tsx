import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '1px solid #eee',
        paddingBottom: '20px'
      }}>
        <h2>Welcome to Murim Universe</h2>
        <button
          onClick={handleSignOut}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #dee2e6' }}>
        <h3 style={{ color: '#212529', marginTop: '0' }}>User Information</h3>
        <p style={{ color: '#495057' }}><strong>Email:</strong> {user?.email}</p>
        <p style={{ color: '#495057' }}><strong>User ID:</strong> {user?.id}</p>
        <p style={{ color: '#495057' }}><strong>Email Verified:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}</p>
        <p style={{ color: '#495057' }}><strong>Last Sign In:</strong> {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
      </div>

      <div style={{ backgroundColor: '#d4edda', padding: '20px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
        <h3 style={{ color: '#155724', marginTop: '0' }}>🎉 Authentication Successful!</h3>
        <p style={{ color: '#155724' }}>You have successfully logged into Murim Universe. This is a protected route that only authenticated users can access.</p>
        <p style={{ color: '#155724' }}>Next steps will include building the actual game features:</p>
        <ul style={{ color: '#155724' }}>
          <li>Character creation and management</li>
          <li>Game world navigation</li>
          <li>Real-time multiplayer features</li>
          <li>Text-based gameplay mechanics</li>
        </ul>
      </div>
    </div>
  )
}