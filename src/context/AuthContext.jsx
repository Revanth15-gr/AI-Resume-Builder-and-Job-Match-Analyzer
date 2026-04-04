import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('resumeai_token')
    if (token) {
      api.setToken(token)
      api.getProfile()
        .then(data => setUser(data.user))
        .catch(() => {
          api.setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const mode = user?.preferences?.mode || 'light'
    document.documentElement.classList.toggle('theme-dark', mode === 'dark')
  }, [user?.preferences?.mode])

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password)
    api.setToken(data.token)
    setUser(data.user)
    return data
  }

  const login = async (email, password) => {
    const data = await api.login(email, password)
    api.setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    api.setToken(null)
    setUser(null)
  }

  const updateProfile = async (updates) => {
    const data = await api.updateProfile(updates)
    setUser(data.user)
    return data
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
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
