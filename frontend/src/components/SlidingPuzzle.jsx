import { useState } from 'react'
import useGameStore from '../store/gameStore'

const TILE_SIZE = 120
const GRID = 3
const SOLVED = [0, 1, 2, 3, 4, 5, 6, 7, 8]

const RAVEN_EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
  <rect width="360" height="360" fill="#0a0805"/>
  <ellipse cx="180" cy="180" rx="160" ry="100" fill="#1a1208"/>
  <ellipse cx="180" cy="180" rx="140" ry="85" fill="#2a1f10"/>
  <ellipse cx="180" cy="180" rx="70" ry="70" fill="#3a2800"/>
  <ellipse cx="180" cy="180" rx="65" ry="65" fill="#8b4513"/>
  <ellipse cx="180" cy="180" rx="55" ry="55" fill="#c47a2a"/>
  <ellipse cx="180" cy="180" rx="30" ry="30" fill="#050302"/>
  <line x1="180" y1="115" x2="180" y2="145" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="180" y1="215" x2="180" y2="245" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="115" y1="180" x2="145" y2="180" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="215" y1="180" x2="245" y2="180" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <ellipse cx="155" cy="155" rx="12" ry="8" fill="white" opacity="0.15"/>
  <ellipse cx="150" cy="152" rx="5" ry="4" fill="white" opacity="0.3"/>
  <path d="M40 180 Q180 60 320 180" stroke="#c9a84c" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M40 180 Q180 300 320 180" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.5"/>
</svg>`

function shuffle(arr) {
  const a = [...arr]
  let inv
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    inv = 0
    for (let i = 0; i < a.length - 1; i++)
      for (let j = i + 1; j < a.length; j++)
        if (a[i] !== 8 && a[j] !== 8 && a[i] > a[j]) inv++
  } while (inv % 2 !== 0)
  return a
}

function Tile({ index }) {
  if (index === 8) return null
  const row = Math.floor(index / GRID)
  const col = index % GRID
  return (
    <div style={{
      width: TILE_SIZE,
      height: TILE_SIZE,
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(RAVEN_EYE_SVG)}")`,
      backgroundSize: `${TILE_SIZE * GRID}px ${TILE_SIZE * GRID}px`,
      backgroundPosition: `${-col * TILE_SIZE}px ${-row * TILE_SIZE}px`,
      border: '1px solid #2a2010',
    }} />
  )
}

export default function SlidingPuzzle({ onSolve, onClose }) {
  const [tiles, setTiles]     = useState(() => shuffle([...SOLVED]))
  const [solved, setSolved]   = useState(false)
  const [moves, setMoves]     = useState(0)
  const [showHint, setShowHint] = useState(false)
  const useHint = useGameStore((s) => s.useHint)

  const blankIdx = tiles.indexOf(8)

  const canMove = (i) => {
    const br = Math.floor(blankIdx / GRID), bc = blankIdx % GRID
    const tr = Math.floor(i / GRID),       tc = i % GRID
    return (Math.abs(br - tr) === 1 && bc === tc) ||
           (Math.abs(bc - tc) === 1 && br === tr)
  }

  const handleTileClick = (i) => {
    if (solved || !canMove(i)) return
    const next = [...tiles];
    [next[i], next[blankIdx]] = [next[blankIdx], next[i]]
    setTiles(next)
    setMoves(m => m + 1)
    if (next.every((v, idx) => v === SOLVED[idx])) {
      setSolved(true)
      setTimeout(() => onSolve?.(), 1200)
    }
  }

  const handleSkip = () => {
    setSolved(true)
    setTimeout(() => onSolve?.(), 400)
  }

  const handleHint = () => {
    setShowHint(true)
    useHint()
  }

  // Show small target image
  const previewSvg = RAVEN_EYE_SVG
    .replace('width="360"', 'width="90"')
    .replace('height="360"', 'height="90"')

  return (
    <div style={{
      background: '#120f0a',
      border: '1px solid #3a2f1e',
      borderRadius: 10,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      position: 'relative',
      maxWidth: 430,
      width: '100%',
    }}>

      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 12, right: 14,
        background: 'none', border: 'none',
        color: '#6b5a3e', fontSize: 18, cursor: 'pointer',
      }}>✕</button>

      {/* Header */}
      <h2 style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', fontSize: 18, margin: 0 }}>
        The Eye of the Raven
      </h2>
      <p style={{
        color: '#6b5a3e', fontFamily: 'Georgia, serif',
        fontSize: 12, textAlign: 'center', margin: 0,
      }}>
        Restore the ancient symbol. Slide the tiles to complete the image.
      </p>

      {/* Target preview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: '#3a2f1e', fontSize: 11 }}>Target:</span>
        <div
          style={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #3a2f1e' }}
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID}, ${TILE_SIZE}px)`,
        gridTemplateRows:    `repeat(${GRID}, ${TILE_SIZE}px)`,
        border: '2px solid #3a2f1e',
        gap: 2,
        background: '#0a0805',
      }}>
        {tiles.map((tileIdx, pos) => (
          <div
            key={pos}
            onClick={() => handleTileClick(pos)}
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              background: tileIdx === 8 ? '#050302' : 'none',
              cursor: canMove(pos) && !solved ? 'pointer' : 'default',
            }}>
            {tileIdx !== 8 && <Tile index={tileIdx} />}
          </div>
        ))}
      </div>

      {/* Status row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', width: '100%',
      }}>
        <span style={{ color: '#3a2f1e', fontSize: 11 }}>Moves: {moves}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {solved
            ? <span style={{ color: '#6dbf67', fontSize: 11 }}>✓ The eye opens...</span>
            : <>
                <button onClick={handleHint} style={{
                  background: 'none', border: 'none',
                  color: '#4a3a2a', fontSize: 11,
                  cursor: 'pointer', textDecoration: 'underline',
                }}>
                  {showHint ? '💡 Arrange the golden eye whole' : 'Hint'}
                </button>
                <button onClick={handleSkip} style={{
                  background: 'none', border: '1px solid #3a2010',
                  color: '#8b4a1a', fontSize: 11,
                  borderRadius: 4, padding: '2px 8px', cursor: 'pointer',
                }}>
                  Skip puzzle
                </button>
              </>
          }
        </div>
      </div>

      {solved && (
        <p style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', fontSize: 13, textAlign: 'center' }}>
          The raven's eye blinks. A secret is revealed.
        </p>
      )}
    </div>
  )
}