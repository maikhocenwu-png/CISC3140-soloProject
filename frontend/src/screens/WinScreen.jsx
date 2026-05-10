import { useEffect, useState } from 'react'
import client from '../api/client'
import useGameStore from '../store/gameStore'

export default function WinScreen() {
  const { hintsUsed, startTime, username, startGame, setScreen, logout } = useGameStore()
  const [leaderboard, setLeaderboard] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const timeSeconds = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0
  const minutes = Math.floor(timeSeconds / 60)
  const seconds = timeSeconds % 60

  useEffect(() => {
    const submitAndFetch = async () => {
      if (!submitted) {
        try {
          await client.post('/api/scores', { timeSeconds, hints: hintsUsed })
          setSubmitted(true)
        } catch (err) {
          console.error('Score submit failed', err)
        }
      }
      try {
        const res = await client.get('/api/scores/leaderboard')
        setLeaderboard(res.data)
      } catch (err) {
        console.error('Leaderboard fetch failed', err)
      }
    }
    submitAndFetch()
  }, [])

  const handlePlayAgain = () => {
    startGame()
    setScreen('game')
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8"
      style={{ background: 'radial-gradient(ellipse at center, #0a1a08 0%, #0a0a0a 100%)' }}>

      <div className="text-center">
        <h1 className="text-5xl mb-2" style={{ color: '#6dbf67', fontFamily: 'Georgia, serif' }}>
          YOU ESCAPED
        </h1>
        <p className="text-sm tracking-widest" style={{ color: '#3a6b38' }}>WELL DONE, {username?.toUpperCase()}</p>
      </div>

      <div className="flex gap-8">
        <div className="text-center px-6 py-4 rounded-lg border" style={{ background: '#0d1a0c', borderColor: '#2a4a28' }}>
          <div className="text-3xl" style={{ color: '#6dbf67' }}>{minutes}:{String(seconds).padStart(2, '0')}</div>
          <div className="text-xs mt-1" style={{ color: '#3a6b38' }}>TIME</div>
        </div>
        <div className="text-center px-6 py-4 rounded-lg border" style={{ background: '#0d1a0c', borderColor: '#2a4a28' }}>
          <div className="text-3xl" style={{ color: '#6dbf67' }}>{hintsUsed}</div>
          <div className="text-xs mt-1" style={{ color: '#3a6b38' }}>HINTS USED</div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="w-80">
        <h2 className="text-center text-sm tracking-widest mb-3" style={{ color: '#6b5a3e' }}>LEADERBOARD</h2>
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: '#2a4a28' }}>
          {leaderboard.length === 0 ? (
            <p className="text-center py-4 text-sm" style={{ color: '#3a6b38' }}>No scores yet</p>
          ) : leaderboard.map((entry, i) => {
            const m = Math.floor(entry.timeSeconds / 60)
            const s = entry.timeSeconds % 60
            return (
              <div key={entry.id} className="flex justify-between items-center px-4 py-2 text-sm"
                style={{ background: i % 2 === 0 ? '#0d1a0c' : '#0a160a', borderBottom: '1px solid #1a2e18' }}>
                <span style={{ color: i === 0 ? '#c9a84c' : '#6b5a3e' }}>#{i + 1}</span>
                <span style={{ color: '#e8e0d0' }}>{entry.user.username}</span>
                <span style={{ color: '#6dbf67' }}>{m}:{String(s).padStart(2, '0')}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={handlePlayAgain}
          className="px-6 py-2 rounded text-sm"
          style={{ background: '#6dbf67', color: '#0a0a0a' }}>
          Play Again
        </button>
        <button onClick={() => { logout(); setScreen('title') }}
          className="px-6 py-2 rounded text-sm border"
          style={{ borderColor: '#3a6b38', color: '#6b5a3e' }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}