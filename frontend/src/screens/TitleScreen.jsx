import { useState } from 'react'
import client from '../api/client'
import useGameStore from '../store/gameStore'

export default function TitleScreen() {
  const [mode, setMode] = useState('login')   // 'login' or 'register'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setAuth, setScreen, startGame, loadSave } = useGameStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!email.includes('@')) return setError('Please enter a valid email')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (mode === 'register' && !username.trim()) return setError('Username is required')

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { email, password, username }

      const res = await client.post(endpoint, body)
      setAuth(res.data.token, res.data.username)

      // Try to load existing save
      try {
        const saveRes = await client.get('/api/game/save')
        if (saveRes.data.solved?.length > 0) {
          loadSave(saveRes.data)
        } else {
          startGame()
        }
      } catch {
        startGame()
      }

      setScreen('game')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full"
      style={{ background: 'radial-gradient(ellipse at center, #1a1008 0%, #0a0a0a 100%)' }}>

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-5xl mb-2" style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', letterSpacing: '0.1em' }}>
          THE FORGOTTEN ROOM
        </h1>
        <p className="text-sm tracking-widest" style={{ color: '#6b5a3e' }}>
          CAN YOU ESCAPE?
        </p>
      </div>

      {/* Auth card */}
      <div className="w-80 p-8 rounded-lg border" style={{ background: '#120f0a', borderColor: '#3a2f1e' }}>
        {/* Toggle */}
        <div className="flex mb-6 rounded overflow-hidden border" style={{ borderColor: '#3a2f1e' }}>
          <button
            onClick={() => { setMode('login'); setError('') }}
            className="flex-1 py-2 text-sm transition-colors"
            style={{ background: mode === 'login' ? '#c9a84c' : 'transparent', color: mode === 'login' ? '#0a0a0a' : '#6b5a3e' }}>
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setError('') }}
            className="flex-1 py-2 text-sm transition-colors"
            style={{ background: mode === 'register' ? '#c9a84c' : 'transparent', color: mode === 'register' ? '#0a0a0a' : '#6b5a3e' }}>
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded text-sm outline-none"
              style={{ background: '#1e1810', border: '1px solid #3a2f1e', color: '#e8e0d0' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded text-sm outline-none"
            style={{ background: '#1e1810', border: '1px solid #3a2f1e', color: '#e8e0d0' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded text-sm outline-none"
            style={{ background: '#1e1810', border: '1px solid #3a2f1e', color: '#e8e0d0' }}
          />

          {error && (
            <p className="text-xs text-center py-2 px-3 rounded" style={{ background: '#2a1010', color: '#e05555', border: '1px solid #5a2020' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded text-sm font-medium transition-opacity"
            style={{ background: '#c9a84c', color: '#0a0a0a', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Enter the Room' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}