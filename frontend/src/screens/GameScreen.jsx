import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser';
import useGameStore from '../store/gameStore'
import { GameConfig } from '../game/GameConfig'
import InventoryBar from '../components/InventoryBar'
import client from '../api/client'

export default function GameScreen() {
  const gameRef = useRef(null)
  const phaserGame = useRef(null)
  const { inventory, solvedPuzzles, currentRoom } = useGameStore()

  useEffect(() => {
    // Start Phaser inside the div
    phaserGame.current = new Phaser.Game({
      ...GameConfig,
      parent: gameRef.current,
    })

    return () => {
      phaserGame.current?.destroy(true)
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

  return (
    <div className="flex flex-col items-center" style={{ width: 800 }}>
      {/* Top bar */}
      <div className="flex justify-between items-center w-full px-2 py-2"
        style={{ background: '#0d0b08', borderBottom: '1px solid #2a2010' }}>
        <span className="text-xs tracking-widest" style={{ color: '#6b5a3e' }}>THE FORGOTTEN ROOM</span>
        <button onClick={handleSave}
          className="text-xs px-3 py-1 rounded border transition-colors"
          style={{ borderColor: '#3a2f1e', color: '#c9a84c' }}>
          Save Progress
        </button>
      </div>

      {/* Phaser canvas mounts here */}
      <div ref={gameRef} style={{ width: 800, height: 500 }} />

      {/* Inventory bar below canvas */}
      <InventoryBar />
    </div>
  )
}