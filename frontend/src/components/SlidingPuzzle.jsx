import { useState, useEffect } from 'react'
import useGameStore from '../store/gameStore'

// The "picture" is 9 SVG tiles that form a raven eye
// Each tile is a piece of the image at position [row, col]
const TILE_SIZE = 120
const GRID = 3

// Solved order: 0-7 are tiles, 8 is the blank
const SOLVED = [0, 1, 2, 3, 4, 5, 6, 7, 8]

// Each tile renders a portion of the full SVG image
function Tile({ index, position }) {
  if (index === 8) return null // blank tile

  const row = Math.floor(index / GRID)
  const col = index % GRID

  // Offset into the full image
  const bgX = -col * TILE_SIZE
  const bgY = -row * TILE_SIZE

  return (
    <div style={{
      width: TILE_SIZE,
      height: TILE_SIZE,
      backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(RAVEN_EYE_SVG)}")`,
      backgroundSize: `${TILE_SIZE * GRID}px ${TILE_SIZE * GRID}px`,
      backgroundPosition: `${bgX}px ${bgY}px`,
      border: '1px solid #2a2010',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
    }} />
  )
}

// Shuffle helper — always solvable
function shuffle(arr) {
  const a = [...arr]
  let inversions
  do {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    inversions = 0
    for (let i = 0; i < a.length - 1; i++)
      for (let j = i + 1; j < a.length; j++)
        if (a[i] !== 8 && a[j] !== 8 && a[i] > a[j]) inversions++
  } while (inversions % 2 !== 0)
  return a
}

// The full raven eye SVG (360×360)
const RAVEN_EYE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
  <rect width="360" height="360" fill="#0a0805"/>
  <!-- outer glow -->
  <ellipse cx="180" cy="180" rx="160" ry="100" fill="#1a1208"/>
  <ellipse cx="180" cy="180" rx="140" ry="85" fill="#2a1f10"/>
  <!-- iris -->
  <ellipse cx="180" cy="180" rx="70" ry="70" fill="#3a2800"/>
  <ellipse cx="180" cy="180" rx="65" ry="65" fill="#8b4513"/>
  <ellipse cx="180" cy="180" rx="55" ry="55" fill="#c47a2a"/>
  <!-- pupil -->
  <ellipse cx="180" cy="180" rx="30" ry="30" fill="#050302"/>
  <!-- iris detail lines -->
  <line x1="180" y1="115" x2="180" y2="145" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="180" y1="215" x2="180" y2="245" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="115" y1="180" x2="145" y2="180" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="215" y1="180" x2="245" y2="180" stroke="#a0601a" stroke-width="1.5" opacity="0.6"/>
  <line x1="131" y1="131" x2="152" y2="152" stroke="#a0601a" stroke-width="1" opacity="0.5"/>
  <line x1="208" y1="208" x2="229" y2="229" stroke="#a0601a" stroke-width="1" opacity="0.5"/>
  <line x1="229" y1="131" x2="208" y2="152" stroke="#a0601a" stroke-width="1" opacity="0.5"/>
  <line x1="152" y1="208" x2="131" y2="229" stroke="#a0601a" stroke-width="1" opacity="0.5"/>
  <!-- highlight -->
  <ellipse cx="155" cy="155" rx="12" ry="8" fill="white" opacity="0.15"/>
  <ellipse cx="150" cy="152" rx="5" ry="4" fill="white" opacity="0.3"/>
  <!-- eyelid lines -->
  <path d="M40 180 Q180 60 320 180" stroke="#c9a84c" stroke-width="2" fill="none" opacity="0.7"/>
  <path d="M40 180 Q180 300 320 180" stroke="#8b6914" stroke-width="1.5" fill="none" opacity="0.5"/>
  <!-- feather hints at corners -->
  <path d="M40 180 Q20 150 10 120 Q30 140 40 180" fill="#1a1208" opacity="0.8"/>
  <path d="M40 180 Q20 210 10 240 Q30 220 40 180" fill="#1a1208" opacity="0.8"/>
  <path d="M320 180 Q340 150 350 120 Q330 140 320 180" fill="#1a1208" opacity="0.8"/>
  <path d="M320 180 Q340 210 350 240 Q330 220 320 180" fill="#1a1208" opacity="0.8"/>
</svg>`

export default function SlidingPuzzle({ onSolve, onClose }) {
  const [tiles, setTiles] = useState(() => shuffle([...SOLVED]))
  const [solved, setSolved] = useState(false)
  const [moves, setMoves] = useState(0)
  const useHint = useGameStore((state) => state.useHint)
  const [showHint, setShowHint] = useState(false)

  const isSolved = (t) => t.every((v, i) => v === SOLVED[i])

  const blankIndex = tiles.indexOf(8)

  const canMove = (i) => {
    const br = Math.floor(blankIndex / GRID)
    const bc = blankIndex % GRID
    const tr = Math.floor(i / GRID)
    const tc = i % GRID
    return (Math.abs(br - tr) === 1 && bc === tc) ||
           (Math.abs(bc - tc) === 1 && br === tr)
  }

  const handleTileClick = (i) => {
    if (solved || !canMove(i)) return
    const next = [...tiles]
    ;[next[i], next[blankIndex]] = [next[blankIndex], next[i]]
    setTiles(next)
    setMoves(m => m + 1)
    if (isSolved(next)) {
      setSolved(true)
      setTimeout(() => onSolve?.(), 1500)
    }
  }

  const handleHint = () => {
    setShowHint(true)
    useHint()
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="rounded-lg border p-6 relative flex flex-col items-center gap-4"
        style={{ background: '#120f0a', borderColor: '#3a2f1e', maxWidth: 440 }}>

        <button onClick={onClose}
          className="absolute top-4 right-4 text-xs"
          style={{ color: '#3a2f1e' }}>✕</button>

        <h2 className="text-lg" style={{ color: '#c9a84c', fontFamily: 'Georgia, serif' }}>
          The Eye of the Raven
        </h2>
        <p className="text-xs text-center" style={{ color: '#6b5a3e', fontFamily: 'Georgia, serif' }}>
          Restore the ancient symbol. Slide the tiles to complete the image.
        </p>

        {/* Puzzle grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID}, ${TILE_SIZE}px)`,
          border: '2px solid #3a2f1e',
          gap: 2,
          background: '#0a0805',
        }}>
          {tiles.map((tileIndex, position) => (
            <div
              key={position}
              onClick={() => handleTileClick(position)}
              style={{
                width: TILE_SIZE,
                height: TILE_SIZE,
                background: tileIndex === 8 ? '#050302' : 'none',
                cursor: canMove(position) && !solved ? 'pointer' : 'default',
                transition: 'opacity 0.1s',
                opacity: canMove(position) && !solved ? 1 : tileIndex === 8 ? 1 : 0.85,
              }}>
              {tileIndex !== 8 && (
                <Tile index={tileIndex} position={position} />
              )}
            </div>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center justify-between w-full px-2">
          <span className="text-xs" style={{ color: '#3a2f1e' }}>
            Moves: {moves}
          </span>
          {solved
            ? <span className="text-xs" style={{ color: '#6dbf67' }}>✓ The eye opens...</span>
            : <button onClick={handleHint} className="text-xs underline" style={{ color: '#3a2f1e' }}>
                Hint (costs 1)
              </button>
          }
        </div>

        {showHint && !solved && (
          <p className="text-xs text-center italic" style={{ color: '#6b5a3e', fontFamily: 'Georgia, serif' }}>
            💡 Arrange the pieces so the golden eye is whole and staring back at you.
          </p>
        )}

        {solved && (
          <div className="text-center">
            <p className="text-sm" style={{ color: '#c9a84c', fontFamily: 'Georgia, serif' }}>
              The raven's eye blinks. A secret is revealed.
            </p>
          </div>
        )}

        {/* Show the target image for reference */}
        <details className="w-full">
          <summary className="text-xs cursor-pointer text-center"
            style={{ color: '#2a2010' }}>
            Show target image
          </summary>
          <div className="mt-2 flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: RAVEN_EYE_SVG.replace('width="360"', 'width="180"').replace('height="360"', 'height="180"') }} />
          </div>
        </details>
      </div>
    </div>
  )
}