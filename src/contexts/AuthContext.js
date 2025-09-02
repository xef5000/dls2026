import React, { createContext, useContext, useEffect, useState } from 'react'
import { authService } from '../services/supabase'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPreferences, setUserPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    notifications: true,
    rememberMe: true
  })

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { session } = await authService.getCurrentSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, userData) => {
    setLoading(true)
    try {
      const result = await authService.signUp(email, password, userData)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const result = await authService.signIn(email, password)
      return result
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const result = await authService.signOut()
      return result
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    return await authService.resetPassword(email)
  }

  const updatePassword = async (password) => {
    return await authService.updatePassword(password)
  }

  const updateUserPreferences = (newPreferences) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const value = {
    user,
    session,
    loading,
    userPreferences,
    updateUserPreferences,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
