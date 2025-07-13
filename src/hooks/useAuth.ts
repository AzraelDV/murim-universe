import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  console.log('useAuth hook called, current state:', { user, session, loading })

  useEffect(() => {
    console.log('useAuth useEffect running')
    
    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting session from Supabase...')
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('Session retrieved:', session)
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Error in getSession:', err)
      } finally {
        console.log('Setting loading to false')
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event, session?.user?.email)
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      )

      return () => subscription.unsubscribe()
    } catch (err) {
      console.error('Error setting up auth listener:', err)
      setLoading(false)
    }
  }, [])

  return {
    user,
    session,
    loading
  }
}