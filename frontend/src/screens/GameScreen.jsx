import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import useGameStore from '../store/gameStore'
import { GameConfig } from '../game/GameConfig'
import InventoryBar from '../components/InventoryBar'
import PuzzleModal from '../components/PuzzleModal'
import SlidingPuzzle from '../components/SlidingPuzzle'
import client from '../api/client'
import audioManager from '../game/AudioManager'

export default function GameScreen() {
  const gameRef    = useRef(null)
  const phaserGame = useRef(null)
  const [showSliding, setShowSliding] = useState(false)
  const [cursorStyle, setCursorStyle] = useState('auto')
  const { inventory, solvedPuzzles, currentRoom, addItem, solvePuzzle } = useGameStore()
  const musicOn    = useGameStore((s) => s.musicOn)
  const toggleMusic = useGameStore((s) => s.toggleMusic)

  useEffect(() => {
    audioManager.setEnabled(musicOn)
    if (!musicOn) audioManager.stopBg()
  }, [musicOn])

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
        c.style.top = 'auto'
        c.style.left = 'auto'
      }
    }
    fix()
    setTimeout(fix, 100)
    setTimeout(fix, 500)
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

    // Candle cursor
    const cursorHandler = (e) => {
      if (e.detail === 'candle') {
        // Use animated GIF if available, fallback to emoji CSS trick
        setCursorStyle('url(/assets/ui/candle.gif) 16 32, auto')
      }
    }
    window.addEventListener('setCursor', cursorHandler)

    return () => {
      phaserGame.current?.destroy(true)
      window.removeEventListener('openSlidingPuzzle', openHandler)
      window.removeEventListener('gameWon', winHandler)
      window.removeEventListener('setCursor', cursorHandler)
    }
  }, [])

  const handleSave = async () => {
    try {
      await client.post('/api/game/save', { inventory, solved: solvedPuzzles, currentRoom })
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
      useGameStore.getState().startGame()
      audioManager.reset()
      setTimeout(() => mountPhaser(), 100)
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

  const anyModalOpen = showSliding

  return (
    <div style={{ width: 800, display: 'flex', flexDirection: 'column', cursor: cursorStyle }}>

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
          <button onClick={() => { toggleMusic(); audioManager.setEnabled(!musicOn) }}
            title={musicOn ? 'Mute' : 'Unmute'}
            style={topBtnStyle('#3a2f1e', '#6b5a3e')}>
            {musicOn ? '🔊' : '🔇'}
          </button>
          <button onClick={handleSave} style={topBtnStyle('#3a2f1e', '#c9a84c')}>
            Save
          </button>
          <button onClick={handleReset} style={topBtnStyle('#5a2020', '#e05555')}>
            Reset
          </button>
        </div>
      </div>

      {/* Phaser canvas */}
      <div ref={gameRef}
        style={{ width: 800, height: 500, overflow: 'hidden', flexShrink: 0 }} />

      {/* Inventory — always below canvas, never blocked */}
      <InventoryBar />

      {/* Fixed overlay for modals */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        pointerEvents: anyModalOpen ? 'auto' : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <PuzzleModal />
        {showSliding && (
          <SlidingPuzzle
            onSolve={handleSlidingSolved}
            onClose={() => setShowSliding(false)}
          />
        )}
      </div>
    </div>
  )
}

const topBtnStyle = (borderColor, color) => ({
  fontSize: 11, padding: '3px 9px', borderRadius: 4,
  border: `1px solid ${borderColor}`, color,
  background: 'transparent', cursor: 'pointer',
})