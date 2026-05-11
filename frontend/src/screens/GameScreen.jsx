import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import useGameStore from '../store/gameStore'
import { GameConfig } from '../game/GameConfig'
import InventoryBar from '../components/InventoryBar'
import PuzzleModal from '../components/PuzzleModal'
import SlidingPuzzle from '../components/SlidingPuzzle'
import client from '../api/client'
import audioManager from '../game/AudioManager'

const topBtnStyle = (borderColor, color) => ({
  fontSize: 11,
  padding: '3px 9px',
  borderRadius: 4,
  border: `1px solid ${borderColor}`,
  color,
  background: 'transparent',
  cursor: 'pointer',
})

export default function GameScreen() {
  const gameRef = useRef(null)
  const phaserGame = useRef(null)
  const timers = useRef([])

  const [showSliding, setShowSliding] = useState(false)

  const {
    inventory,
    solvedPuzzles,
    currentRoom,
    addItem,
    solvePuzzle,
  } = useGameStore()

  const musicOn = useGameStore((s) => s.musicOn)
  const toggleMusic = useGameStore((s) => s.toggleMusic)

  function applyCandleCursor() {
    const cursorUrl = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='18' rx='3' ry='5' fill='%23e8d8b0'/%3E%3Cellipse cx='12' cy='17' rx='2' ry='4' fill='%23c8a870'/%3E%3Cpath d='M12 2 Q14 6 13 9 Q12 11 12 13 Q12 11 11 9 Q10 6 12 2Z' fill='%23f4a020'/%3E%3Cpath d='M12 4 Q13 7 12.5 9 Q12 11 12 12 Q12 11 11.5 9 Q11 7 12 4Z' fill='%23ffcc00'/%3E%3C/svg%3E") 12 22, auto`

    document.body.style.cursor = cursorUrl

    const c = gameRef.current?.querySelector('canvas')
    if (c) {
      c.style.cursor = cursorUrl
    }
  }

  useEffect(() => {
    if (inventory.includes('candle')) {
      applyCandleCursor()
    }
  }, [inventory])

  useEffect(() => {
    audioManager.setEnabled(musicOn)

    if (!musicOn) {
      audioManager.stopBg()
    }
  }, [musicOn])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function mountPhaser() {
    if (!gameRef.current) return

    phaserGame.current = new Phaser.Game({
      ...GameConfig,
      parent: gameRef.current,
    })

    const fix = () => {
      const c = gameRef.current?.querySelector('canvas')

      if (c) {
        c.style.position = 'relative'
        c.style.display = 'block'
        c.style.top = 'auto'
        c.style.left = 'auto'

        if (useGameStore.getState().inventory.includes('candle')) {
          c.style.cursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cellipse cx='12' cy='18' rx='3' ry='5' fill='%23e8d8b0'/%3E%3Cellipse cx='12' cy='17' rx='2' ry='4' fill='%23c8a870'/%3E%3Cpath d='M12 2 Q14 6 13 9 Q12 11 12 13 Q12 11 11 9 Q10 6 12 2Z' fill='%23f4a020'/%3E%3Cpath d='M12 4 Q13 7 12.5 9 Q12 11 12 12 Q12 11 11.5 9 Q11 7 12 4Z' fill='%23ffcc00'/%3E%3C/svg%3E") 12 22, auto`
        }
      }
    }

    fix()

    const t1 = setTimeout(fix, 100)
    const t2 = setTimeout(fix, 500)

    timers.current = [t1, t2]
  }

  useEffect(() => {
    mountPhaser()

    const openHandler = () => setShowSliding(true)

    window.addEventListener('openSlidingPuzzle', openHandler)

    const winHandler = () => {
      phaserGame.current?.destroy(true)
      phaserGame.current = null
    }

    window.addEventListener('gameWon', winHandler)

    const cursorHandler = (e) => {
      if (e.detail === 'candle') {
        applyCandleCursor()
      }
    }

    window.addEventListener('setCursor', cursorHandler)

    return () => {
      clearTimers()

      phaserGame.current?.destroy(true)

      window.removeEventListener('openSlidingPuzzle', openHandler)
      window.removeEventListener('gameWon', winHandler)
      window.removeEventListener('setCursor', cursorHandler)

      document.body.style.cursor = 'auto'

      const c = gameRef.current?.querySelector('canvas')

      if (c) {
        c.style.cursor = 'auto'
      }
    }
  }, [])

  const handleSave = async () => {
    try {
      await client.post('/api/game/save', {
        inventory,
        solved: solvedPuzzles,
        currentRoom,
      })

      alert('Progress saved!')
    } catch {
      alert('Save failed. Are you logged in?')
    }
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all progress and start over?')) return

    try {
      await client.delete('/api/game/save')

      phaserGame.current?.destroy(true)
      phaserGame.current = null

      clearTimers()

      useGameStore.getState().startGame()

      audioManager.reset()

      setTimeout(() => mountPhaser(), 150)
    } catch {
      alert('Reset failed.')
    }
  }

  const handleSlidingSolved = () => {
    setShowSliding(false)

    solvePuzzle('sliding_puzzle')

    addItem('raven_key')

    window.dispatchEvent(
      new CustomEvent('puzzleSolved', {
        detail: {
          puzzleId: 'sliding_puzzle',
          reward: 'raven_key',
        },
      })
    )
  }

  const handleMusicToggle = () => {
    const next = !musicOn

    toggleMusic()

    audioManager.setEnabled(next)
  }

  return (
    <div
      style={{
        width: 800,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 10px',
          background: '#0d0b08',
          borderBottom: '1px solid #2a2010',
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#6b5a3e',
            fontFamily: 'Georgia, serif',
          }}
        >
          THE FORGOTTEN ROOM
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleMusicToggle}
            title={musicOn ? 'Mute' : 'Unmute'}
            style={topBtnStyle('#3a2f1e', '#6b5a3e')}
          >
            {musicOn ? '🔊' : '🔇'}
          </button>

          <button
            onClick={handleSave}
            style={topBtnStyle('#3a2f1e', '#c9a84c')}
          >
            Save
          </button>

          <button
            onClick={handleReset}
            style={topBtnStyle('#5a2020', '#e05555')}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Phaser canvas */}
      <div
        ref={gameRef}
        style={{
          width: 800,
          height: 500,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      />

      {/* Inventory */}
      <InventoryBar />

      {/* Puzzle modal */}
      <PuzzleModal />

      {/* Sliding puzzle */}
      {showSliding && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <SlidingPuzzle
            onSolve={handleSlidingSolved}
            onClose={() => setShowSliding(false)}
          />
        </div>
      )}
    </div>
  )
}