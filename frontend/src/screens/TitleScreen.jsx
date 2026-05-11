import { useState, useEffect } from 'react'
import client from '../api/client'
import useGameStore from '../store/gameStore'
import audioManager from '../game/AudioManager'

export default function TitleScreen() {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { setAuth, setScreen, startGame, loadSave } = useGameStore()
  const musicOn = useGameStore((s) => s.musicOn)
  const toggleMusic = useGameStore((s) => s.toggleMusic)

  useEffect(() => {
  audioManager.setEnabled(musicOn)
  if (musicOn) audioManager.playBg('title')
  return () => audioManager.stopBg()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.includes('@')) return setError('Please enter a valid email')
    if (password.length < 8) return setError('Password must be at least 8 characters')
    if (mode === 'register' && !username.trim()) return setError('Username is required')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login' ? { email, password } : { email, password, username }
      const res = await client.post(endpoint, body)
      setAuth(res.data.token, res.data.username)
      try {
        const saveRes = await client.get('/api/game/save')
        if (saveRes.data.solved?.length > 0) loadSave(saveRes.data)
        else startGame()
      } catch { startGame() }
      audioManager.stopBg()
      setScreen('game')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at center, #1a1008 0%, #0a0a0a 100%)',
    }}>

      {/* Music toggle */}
      <button
  onClick={() => {
    const next = !musicOn
    toggleMusic()
    audioManager.setEnabled(next)
    if (next) audioManager.playBg('title')
  }}
  style={{
    position: 'fixed', top: 16, right: 16,
    background: 'none', border: '1px solid #3a2f1e',
    color: '#6b5a3e', fontSize: 18, cursor: 'pointer',
    borderRadius: 6, padding: '4px 10px', zIndex: 999,
  }}>
  {musicOn ? '🔊' : '🔇'}
</button>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          color: '#c9a84c', fontFamily: 'Georgia, serif',
          fontSize: 48, letterSpacing: '0.1em', marginBottom: 8,
        }}>
          THE FORGOTTEN ROOM
        </h1>
        <p style={{ color: '#6b5a3e', fontSize: 12, letterSpacing: '0.3em' }}>
          CAN YOU ESCAPE?
        </p>
      </div>

      {/* Auth card */}
      <div style={{
        width: 320, padding: 32, borderRadius: 10,
        background: '#120f0a', border: '1px solid #3a2f1e',
      }}>
        {/* Toggle login/register */}
        <div style={{
          display: 'flex', marginBottom: 24,
          border: '1px solid #3a2f1e', borderRadius: 6, overflow: 'hidden',
        }}>
          {['login', 'register'].map((m) => (
            <button key={m}
              onClick={() => { setMode(m); setError('') }}
              style={{
                flex: 1, padding: '8px 0', fontSize: 13, cursor: 'pointer',
                border: 'none',
                background: mode === m ? '#c9a84c' : 'transparent',
                color: mode === m ? '#0a0a0a' : '#6b5a3e',
              }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <input
              placeholder="Username" value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={inputStyle} />
          )}
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle} />
          <input
            type="password" placeholder="Password (min 8)" value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle} />

          {error && (
            <p style={{
              fontSize: 12, textAlign: 'center', padding: '6px 12px',
              borderRadius: 6, background: '#2a1010',
              color: '#e05555', border: '1px solid #5a2020',
            }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: '10px 0', borderRadius: 6, border: 'none',
              background: '#c9a84c', color: '#0a0a0a',
              fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Enter the Room' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '8px 14px', borderRadius: 6,
  border: '1px solid #3a2f1e', background: '#1e1810',
  color: '#e8e0d0', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
}