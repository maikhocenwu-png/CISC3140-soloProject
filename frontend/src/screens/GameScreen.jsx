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
  fontSize: 11, padding: '3px 9px', borderRadius: 4,
  border: `1px solid ${borderColor}`, color,
  background: 'transparent', cursor: 'pointer',
})

export default function GameScreen() {
  const gameRef     = useRef(null)
  const phaserGame  = useRef(null)
  const timers      = useRef([])
  const [showSliding, setShowSliding] = useState(false)
  const { inventory, solvedPuzzles, currentRoom, addItem, solvePuzzle } = useGameStore()
  const musicOn     = useGameStore((s) => s.musicOn)
  const toggleMusic = useGameStore((s) => s.toggleMusic)

  // Restore candle cursor if already in inventory
  useEffect(() => {
    if (inventory.includes('candle')) {
      document.body.style.cursor = 'url(/assets/ui/candle.gif) 16 32, auto'
    }
  }, [inventory])

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
        c.style.display  = 'block'
        c.style.top      = 'auto'
        c.style.left     = 'auto'
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
        document.body.style.cursor = 'url(/assets/ui/candle.gif) 16 32, auto'
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
    window.dispatchEvent(new CustomEvent('puzzleSolved', {
      detail: { puzzleId: 'sliding_puzzle', reward: 'raven_key' }
    }))
  }

  const handleMusicToggle = () => {
    const next = !musicOn
    toggleMusic()
    audioManager.setEnabled(next)
  }

  return (
    <div style={{ width: 800, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '5px 10px', background: '#0d0b08',
        borderBottom: '1px solid #2a2010',
      }}>
        <span style={{
          fontSize: 11, letterSpacing: '0.1em',
          color: '#6b5a3e', fontFamily: 'Georgia, serif',
        }}>
          THE FORGOTTEN ROOM
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={handleMusicToggle}
            title={musicOn ? 'Mute' : 'Unmute'}
            style={topBtnStyle('#3a2f1e', '#6b5a3e')}>
            {musicOn ? '🔊' : '🔇'}
          </button>
          <button onClick={handleSave}
            style={topBtnStyle('#3a2f1e', '#c9a84c')}>
            Save
          </button>
          <button onClick={handleReset}
            style={topBtnStyle('#5a2020', '#e05555')}>
            Reset
          </button>
        </div>
      </div>

      {/* Phaser canvas — fixed height, no overflow */}
      <div ref={gameRef}
        style={{ width: 800, height: 500, overflow: 'hidden', flexShrink: 0 }} />

      {/* Inventory — plain sibling below canvas */}
      <InventoryBar />

      {/* Puzzle modal — self-contained fixed overlay */}
      <PuzzleModal />

      {/* Sliding puzzle — full fixed overlay, dark background blocks canvas */}
      {showSliding && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
        }}>
          <SlidingPuzzle
            onSolve={handleSlidingSolved}
            onClose={() => setShowSliding(false)}
          />
        </div>
      )}

    </div>
  )
}