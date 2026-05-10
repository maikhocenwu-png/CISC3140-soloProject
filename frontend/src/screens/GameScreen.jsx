import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import useGameStore from '../store/gameStore'
import { GameConfig } from '../game/GameConfig'
import InventoryBar from '../components/InventoryBar'
import PuzzleModal from '../components/PuzzleModal'
import SlidingPuzzle from '../components/SlidingPuzzle'
import client from '../api/client'

export default function GameScreen() {
  const gameRef    = useRef(null)
  const phaserGame = useRef(null)
  const [showSliding, setShowSliding] = useState(false)
  const { inventory, solvedPuzzles, currentRoom, addItem, solvePuzzle } = useGameStore()

  useEffect(() => {
    if (!gameRef.current) return

    const container = gameRef.current

    phaserGame.current = new Phaser.Game({
      ...GameConfig,
      parent: container,
    })

    const fixCanvas = () => {
      const canvas = container.querySelector('canvas')
      if (canvas) {
        canvas.style.position = 'relative'
        canvas.style.display  = 'block'
        canvas.style.top      = 'auto'
        canvas.style.left     = 'auto'
      }
    }

    fixCanvas()
    const t1 = setTimeout(fixCanvas, 100)
    const t2 = setTimeout(fixCanvas, 500)

    const openHandler = () => setShowSliding(true)
    window.addEventListener('openSlidingPuzzle', openHandler)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      phaserGame.current?.destroy(true)
      window.removeEventListener('openSlidingPuzzle', openHandler)
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
      useGameStore.getState().startGame()
      setTimeout(() => {
        if (gameRef.current) {
          phaserGame.current = new Phaser.Game({
            ...GameConfig,
            parent: gameRef.current,
          })
          const fixCanvas = () => {
            const canvas = gameRef.current?.querySelector('canvas')
            if (canvas) {
              canvas.style.position = 'relative'
              canvas.style.display  = 'block'
              canvas.style.top      = 'auto'
              canvas.style.left     = 'auto'
            }
          }
          setTimeout(fixCanvas, 100)
          setTimeout(fixCanvas, 500)
        }
      }, 100)
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
    <div style={{ width: 800, display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 8px', background: '#0d0b08',
        borderBottom: '1px solid #2a2010',
      }}>
        <span style={{ fontSize: 11, letterSpacing: '0.1em', color: '#6b5a3e', fontFamily: 'Georgia, serif' }}>
          THE FORGOTTEN ROOM
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleSave} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 4,
            border: '1px solid #3a2f1e', color: '#c9a84c',
            background: 'transparent', cursor: 'pointer',
          }}>
            Save
          </button>
          <button onClick={handleReset} style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 4,
            border: '1px solid #5a2020', color: '#e05555',
            background: 'transparent', cursor: 'pointer',
          }}>
            Reset
          </button>
        </div>
      </div>

      {/* Phaser canvas */}
      <div ref={gameRef} style={{ width: 800, height: 500, overflow: 'hidden', flexShrink: 0 }} />

      {/* Inventory bar — plain sibling below canvas, never blocked */}
      <InventoryBar />

      {/* Modal overlay — fixed position, outside normal flow */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        pointerEvents: anyModalOpen ? 'auto' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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