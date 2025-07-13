import { useState } from 'react'
import Login from './Login'
import SignUp from './SignUp'

export default function AuthContainer() {
  const [currentView, setCurrentView] = useState<'login' | 'signup'>('login')

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => setCurrentView('login')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: currentView === 'login' ? '#007bff' : '#f8f9fa',
            color: currentView === 'login' ? 'white' : '#212529',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Log In
        </button>
        <button
          onClick={() => setCurrentView('signup')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: currentView === 'signup' ? '#007bff' : '#f8f9fa',
            color: currentView === 'signup' ? 'white' : '#212529',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Sign Up
        </button>
      </div>
      
      {currentView === 'login' ? <Login /> : <SignUp />}
    </div>
  )
}