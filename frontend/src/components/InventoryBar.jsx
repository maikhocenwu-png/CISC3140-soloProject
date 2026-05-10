import useGameStore from '../store/gameStore'

const ITEMS = {
  torn_paper: { emoji: '📄', label: 'Torn Paper' },
  brass_key:  { emoji: '🗝️', label: 'Brass Key' },
  candle:     { emoji: '🕯️', label: 'Candle' },
  silver_coin:{ emoji: '🪙', label: 'Silver Coin' },
}

export default function InventoryBar() {
  const inventory = useGameStore((s) => s.inventory)

  return (
    <div className="flex items-center gap-3 w-full px-4 py-3"
      style={{ background: '#0d0b08', borderTop: '1px solid #2a2010', minHeight: 64 }}>
      <span className="text-xs tracking-widest mr-2 flex-shrink-0"
        style={{ color: '#3a2f1e' }}>INVENTORY</span>
      {inventory.length === 0
        ? <span className="text-xs" style={{ color: '#2a2010' }}>No items yet — explore the room</span>
        : inventory.map((item) => {
          const def = ITEMS[item] || { emoji: '?', label: item }
          return (
            <div key={item} className="flex items-center gap-1 px-3 py-1 rounded text-xs border"
              style={{ background: '#1e1810', borderColor: '#c9a84c', color: '#c9a84c' }}>
              <span>{def.emoji}</span>
              <span>{def.label}</span>
            </div>
          )
        })
      }
    </div>
  )
}