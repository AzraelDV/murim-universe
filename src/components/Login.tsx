import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface LoginFormData {
  email: string
  password: string
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        setError(error.message)
      } else {
        // Login successful - auth state will be handled by useAuth hook
        console.log('Login successful:', data)
        // No need for alert or manual navigation - useAuth will handle the state change
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Log In to Murim Universe</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      {error && (
        <div style={{ 
          color: '#721c24', 
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          marginTop: '10px',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>
          Sign up here
        </a>
      </p>
    </div>
  )
}