import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const clearSession = () => {
    api.setToken(null)
    setUser(null)
  }

  const refreshSession = async () => {
    const token = localStorage.getItem('resumeai_token')
    if (!token) {
      setLoading(false)
      return
    }

    api.setToken(token)
    try {
      const data = await api.getProfile()
      setUser(data.user)
    } catch (_error) {
      clearSession()
    } finally {
      setLoading(false)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    refreshSession()
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession()
    }

    window.addEventListener('resumeai:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('resumeai:unauthorized', handleUnauthorized)
    }
  }, [])

  useEffect(() => {
    const mode = user?.preferences?.mode || 'light'
    document.documentElement.classList.toggle('theme-dark', mode === 'dark')
  }, [user?.preferences?.mode])

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password)
    return data
  }

  const login = async (email, password) => {
    const data = await api.login(email, password)
    api.setToken(data.token)
    setUser(data.user)
    return data
  }

  const loginWithGoogle = async (credential) => {
    const data = await api.loginWithGoogle(credential)
    api.setToken(data.token)
    setUser(data.user)
    return data
  }

  const verifyEmail = async (email, token) => {
    return api.verifyEmail(email, token)
  }

  const resendVerification = async (email) => {
    return api.resendVerification(email)
  }

  const logout = () => {
    clearSession()
  }

  const updateProfile = async (updates) => {
    const data = await api.updateProfile(updates)
    setUser(data.user)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, verifyEmail, resendVerification, logout, updateProfile, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export default AuthContext
