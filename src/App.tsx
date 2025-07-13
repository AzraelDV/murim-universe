import AuthContainer from './components/AuthContainer'
import Dashboard from './components/Dashboard'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="App">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1>Murim Universe</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // Show dashboard if user is authenticated, otherwise show auth forms
  return (
    <div className="App">
      {user ? (
        <Dashboard />
      ) : (
        <>
          <h1>Murim Universe</h1>
          <AuthContainer />
        </>
      )}
    </div>
  )
}

export default App