import useGameStore from '../store/gameStore'

const ITEMS = {
  torn_paper:  {
    emoji: '📄', label: 'Torn Paper',
    image: null,
    // Inline SVG data showing "4729" written on torn paper
    imageContent: (
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="140" fill="#e8e0d0" rx="4"/>
        <path d="M0 0 L200 0 L195 140 L5 135 Z" fill="#ddd8c8"/>
        <text x="100" y="55" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="36" fill="#2a1f0a" letterSpacing="8">4729</text>
        <text x="100" y="90" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="11" fill="#6b5a3e">— the code —</text>
        <line x1="20" y1="105" x2="180" y2="108" stroke="#8b7a5e" strokeWidth="0.5"/>
        <line x1="20" y1="115" x2="150" y2="117" stroke="#8b7a5e" strokeWidth="0.5"/>
      </svg>
    ),
    description: 'A torn piece of paper. Numbers scrawled in ink: 4729'
  },
  brass_key:   {
    emoji: '🗝️', label: 'Brass Key',
    imageContent: (
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="140" fill="#1e1810" rx="4"/>
        <text x="100" y="75" textAnchor="middle" fontSize="60">🗝️</text>
        <text x="100" y="110" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="11" fill="#c9a84c">An old brass key</text>
      </svg>
    ),
    description: 'An ornate brass key. It looks like it fits the study door.'
  },
  candle:      {
    emoji: '🕯️', label: 'Candle',
    imageContent: (
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="140" fill="#1e1810" rx="4"/>
        <text x="100" y="75" textAnchor="middle" fontSize="60">🕯️</text>
        <text x="100" y="110" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="11" fill="#c9a84c">A wax candle, still warm</text>
      </svg>
    ),
    description: 'A wax candle. The flame flickers as you hold it.'
  },
  golden_coin: {
    emoji: '🪙', label: 'Golden Coin',
    imageContent: (
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="140" fill="#1e1810" rx="4"/>
        <text x="100" y="75" textAnchor="middle" fontSize="60">🪙</text>
        <text x="100" y="110" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="11" fill="#c9a84c">A golden coin, strangely warm</text>
      </svg>
    ),
    description: 'A golden coin with an eye engraved on one side.'
  },
  raven_key:   {
    emoji: '🪶', label: 'Raven Key',
    imageContent: (
      <svg width="200" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="140" fill="#1e1810" rx="4"/>
        <text x="100" y="75" textAnchor="middle" fontSize="60">🪶</text>
        <text x="100" y="110" textAnchor="middle" fontFamily="Georgia, serif"
          fontSize="11" fill="#c9a84c">A raven feather key</text>
      </svg>
    ),
    description: 'A key made from a raven\'s feather. Easter egg reward.'
  },
}

export default function InventoryBar() {
  const inventory           = useGameStore((s) => s.inventory)
  const activeInventoryItem = useGameStore((s) => s.activeInventoryItem)
  const setActiveItem       = useGameStore((s) => s.setActiveInventoryItem)

  const activeItemDef = activeInventoryItem ? ITEMS[activeInventoryItem] : null

  return (
    <>
      {/* Inventory bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '10px 16px',
        background: '#0d0b08', borderTop: '1px solid #2a2010',
        minHeight: 60, boxSizing: 'border-box',
        position: 'relative', zIndex: 20,
        pointerEvents: 'auto',
      }}>
        <span style={{
          fontSize: 10, letterSpacing: '0.2em',
          color: '#3a2f1e', fontFamily: 'Georgia, serif',
          flexShrink: 0, marginRight: 6,
        }}>
          INVENTORY
        </span>

        {inventory.length === 0
          ? <span style={{ fontSize: 11, color: '#2a2010', fontFamily: 'Georgia, serif' }}>
              No items yet — explore the room
            </span>
          : inventory.map((itemKey) => {
              const def = ITEMS[itemKey] || { emoji: '?', label: itemKey }
              const isActive = activeInventoryItem === itemKey
              return (
                <button
                  key={itemKey}
                  onClick={() => setActiveItem(isActive ? null : itemKey)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 5,
                    border: `1px solid ${isActive ? '#f0c060' : '#c9a84c'}`,
                    background: isActive ? '#2a1f08' : '#1e1810',
                    color: '#c9a84c', fontSize: 12,
                    cursor: 'pointer', fontFamily: 'Georgia, serif',
                    boxShadow: isActive ? '0 0 8px #c9a84c44' : 'none',
                    transition: 'all 0.15s',
                  }}>
                  <span>{def.emoji}</span>
                  <span>{def.label}</span>
                </button>
              )
            })
        }
      </div>

      {/* Item popup */}
      {activeItemDef && (
        <div
          onClick={() => setActiveItem(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.7)',
            pointerEvents: 'auto',
          }}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#120f0a', border: '1px solid #3a2f1e',
              borderRadius: 10, padding: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              maxWidth: 280,
            }}>
            <h3 style={{ color: '#c9a84c', fontFamily: 'Georgia, serif', fontSize: 16 }}>
              {activeItemDef.label}
            </h3>
            <div style={{ borderRadius: 6, overflow: 'hidden' }}>
              {activeItemDef.imageContent}
            </div>
            <p style={{
              color: '#8b7a5e', fontFamily: 'Georgia, serif',
              fontSize: 12, textAlign: 'center', lineHeight: 1.6,
            }}>
              {activeItemDef.description}
            </p>
            <button
              onClick={() => setActiveItem(null)}
              style={{
                background: 'none', border: '1px solid #3a2f1e',
                color: '#6b5a3e', fontSize: 12, cursor: 'pointer',
                borderRadius: 5, padding: '4px 16px',
              }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}