import { useEffect, useState } from 'react'
import client from '../api/client'
import useGameStore from '../store/gameStore'
import audioManager from '../game/AudioManager'

export default function WinScreen() {
  const { hintsUsed, startTime, username, startGame, setScreen, logout } = useGameStore()
  const [leaderboard, setLeaderboard] = useState([])
  const [submitted, setSubmitted]     = useState(false)
  const timeSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  const minutes = Math.floor(timeSeconds / 60)
  const seconds = timeSeconds % 60

  useEffect(() => {
    // Play win music sequence
    audioManager.playWin()

    const run = async () => {
      if (!submitted) {
        try {
          await client.post('/api/scores', { timeSeconds, hints: hintsUsed })
          setSubmitted(true)
        } catch {}
      }
      try {
        const res = await client.get('/api/scores/leaderboard')
        setLeaderboard(res.data)
      } catch {}
    }
    run()
  }, [])

  const handlePlayAgain = () => {
    audioManager.stopBg()
    audioManager.reset()
    startGame()
    setScreen('game')
  }

  const handleReset = async () => {
    if (!window.confirm('Delete all saved progress?')) return
    try {
      await client.delete('/api/game/save')
      audioManager.stopBg()
      audioManager.reset()
      startGame()
      setScreen('game')
    } catch { alert('Reset failed.') }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100%', gap: 28,
      background: 'radial-gradient(ellipse at center, #0a1a08 0%, #0a0a0a 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          color: '#6dbf67', fontFamily: 'Georgia, serif',
          fontSize: 52, marginBottom: 6,
        }}>
          YOU ESCAPED
        </h1>
        <p style={{ color: '#3a6b38', fontSize: 12, letterSpacing: '0.3em' }}>
          WELL DONE, {username?.toUpperCase()}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {[
          { label: 'TIME', value: `${minutes}:${String(seconds).padStart(2, '0')}` },
          { label: 'HINTS USED', value: hintsUsed },
        ].map(({ label, value }) => (
          <div key={label} style={{
            textAlign: 'center', padding: '16px 24px', borderRadius: 8,
            background: '#0d1a0c', border: '1px solid #2a4a28',
          }}>
            <div style={{ color: '#6dbf67', fontSize: 32, fontFamily: 'Georgia, serif' }}>
              {value}
            </div>
            <div style={{ color: '#3a6b38', fontSize: 10, letterSpacing: '0.2em', marginTop: 4 }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div style={{ width: 320 }}>
        <h2 style={{
          textAlign: 'center', fontSize: 11, letterSpacing: '0.2em',
          color: '#6b5a3e', marginBottom: 10, fontFamily: 'Georgia, serif',
        }}>
          LEADERBOARD
        </h2>
        <div style={{ borderRadius: 8, border: '1px solid #2a4a28', overflow: 'hidden' }}>
          {leaderboard.length === 0
            ? <p style={{ textAlign: 'center', padding: 14, color: '#3a6b38', fontSize: 12 }}>
                No scores yet
              </p>
            : leaderboard.map((entry, i) => {
                const m = Math.floor(entry.timeSeconds / 60)
                const s = entry.timeSeconds % 60
                return (
                  <div key={entry.id} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '8px 16px', fontSize: 12,
                    background: i % 2 === 0 ? '#0d1a0c' : '#0a160a',
                    borderBottom: '1px solid #1a2e18',
                  }}>
                    <span style={{ color: i === 0 ? '#c9a84c' : '#6b5a3e' }}>#{i + 1}</span>
                    <span style={{ color: '#e8e0d0' }}>{entry.user.username}</span>
                    <span style={{ color: '#6dbf67' }}>{m}:{String(s).padStart(2, '0')}</span>
                  </div>
                )
              })
          }
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handlePlayAgain} style={{
          padding: '8px 20px', borderRadius: 6, border: 'none',
          background: '#6dbf67', color: '#0a0a0a',
          fontSize: 13, cursor: 'pointer',
        }}>
          Play Again
        </button>
        <button onClick={handleReset} style={{
          padding: '8px 20px', borderRadius: 6,
          border: '1px solid #5a2020', color: '#e05555',
          background: 'transparent', fontSize: 13, cursor: 'pointer',
        }}>
          Reset Save
        </button>
        <button onClick={() => { audioManager.stopBg(); logout(); setScreen('title') }} style={{
          padding: '8px 20px', borderRadius: 6,
          border: '1px solid #3a6b38', color: '#6b5a3e',
          background: 'transparent', fontSize: 13, cursor: 'pointer',
        }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}