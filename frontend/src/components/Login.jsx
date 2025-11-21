import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Demo users with pre-assigned roles (simulating backend role assignment)
const DEMO_USERS = [
  { label: 'Viewer Demo', email: 'viewer@test.com', role: 'viewer' },
  { label: 'Editor Demo', email: 'editor@test.com', role: 'editor' },
  { label: 'Admin Demo', email: 'admin@test.com', role: 'admin' }
]

export default function Login() {
  const { login, register } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please provide an email')
      return
    }
    if (!password) {
      setError('Please provide a password')
      return
    }
    setError('')
    
    // Call appropriate function based on mode
    const result = isRegister 
      ? await register({ name, email, password })
      : await login({ email, password })
    
    if (!result.success) {
      setError(result.message || 'Authentication failed')
    }
  }

  const selectDemoUser = ({ email: demoEmail }) => {
    setEmail(demoEmail)
    setPassword('demo123')
    setIsRegister(false)
    // User must click Sign in button to login
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome back 👋</h1>
          <p>{isRegister ? 'Create a role to explore the dashboard.' : 'Sign in with any role to explore the dashboard.'}</p>
        </div>

        <form onSubmit={handle} className="auth-form">
          {isRegister && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Samantha Carter" />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn primary" type="submit">{isRegister ? 'Create account' : 'Sign in'}</button>
        </form>

        <div className="auth-footer">
          <span>{isRegister ? 'Already have an account?' : "Need an account?"}</span>
          <button type="button" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign in instead' : 'Register'}
          </button>
        </div>

        <div className="quick-roles">
          <p>Quick demo accounts</p>
          <div className="quick-roles-grid">
            {DEMO_USERS.map(q => (
              <button type="button" key={q.role} onClick={() => selectDemoUser(q)}>
                <span>{q.label}</span>
                <small>{q.email}</small>
              </button>
            ))}
          </div>
        </div>

        <p className="hint">
          This is a frontend demo. Roles are assigned by the system, not chosen by users.
        </p>
      </div>
    </div>
  )
}
