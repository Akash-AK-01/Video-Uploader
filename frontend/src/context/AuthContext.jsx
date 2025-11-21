import React, { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../services/api'
import { initSocket, disconnectSocket } from '../services/socket'

const AuthContext = createContext(null)

// Check if we should use backend or mock mode
const USE_BACKEND = true // Set to true to use real backend

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to restore session from localStorage
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        if (token && storedUser && USE_BACKEND) {
          // Verify token with backend
          try {
            const response = await authAPI.getMe()
            setUser(response.data.data)
            initSocket(response.data.data._id)
          } catch (error) {
            // Token invalid, clear storage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }
        } else if (storedUser) {
          // Mock mode - just restore from storage
          const parsed = JSON.parse(storedUser)
          if (parsed && parsed.role) setUser(parsed)
        }
      } catch (e) {
        console.error('Session restore error:', e)
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  const login = async (payload) => {
    try {
      if (USE_BACKEND) {
        // Real backend login
        const response = await authAPI.login({
          email: payload.email,
          password: payload.password
        })
        
        const userData = response.data.data
        setUser(userData)
        localStorage.setItem('token', userData.token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Initialize Socket.io connection
        initSocket(userData._id)
        
        return { success: true }
      } else {
        // Mock login (original behavior)
        const data = typeof payload === 'string' ? { role: payload } : payload
        if (!data?.role) return { success: false, message: 'Role required' }
        
        const normalized = {
          role: data.role,
          email: data.email || '',
          name: data.name || ''
        }
        setUser(normalized)
        localStorage.setItem('user', JSON.stringify(normalized))
        return { success: true }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const register = async (payload) => {
    try {
      if (USE_BACKEND) {
        const response = await authAPI.register(payload)
        const userData = response.data.data
        setUser(userData)
        localStorage.setItem('token', userData.token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Initialize Socket.io connection
        initSocket(userData._id)
        
        return { success: true }
      } else {
        // Mock register
        return login(payload)
      }
    } catch (error) {
      console.error('Register error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    disconnectSocket()
  }

  const role = user?.role || null

  if (loading) {
    return <div style={{display: 'grid', placeItems: 'center', minHeight: '100vh'}}>
      <div>Loading...</div>
    </div>
  }

  return (
    <AuthContext.Provider value={{ role, user, login, register, logout, useBackend: USE_BACKEND }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
