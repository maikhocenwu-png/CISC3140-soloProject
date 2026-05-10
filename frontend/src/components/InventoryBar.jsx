import useGameStore from '../store/gameStore'

const ITEM_LABELS = {
  brass_key: '🗝️ Key',
  torn_paper: '📄 Paper',
  candle: '🕯️ Candle',
  coin: '🪙 Coin',
}

export default function InventoryBar() {
  const { inventory } = useGameStore()

  return (
    <div className="flex items-center gap-3 w-full px-4 py-3"
      style={{ background: '#0d0b08', borderTop: '1px solid #2a2010', minHeight: 64 }}>
      <span className="text-xs tracking-widest mr-2" style={{ color: '#3a2f1e' }}>INVENTORY</span>
      {inventory.length === 0 ? (
        <span className="text-xs" style={{ color: '#2a2010' }}>No items collected yet</span>
      ) : inventory.map((item) => (
        <div key={item}
          className="px-3 py-1 rounded text-xs border"
          style={{ background: '#1e1810', borderColor: '#c9a84c', color: '#c9a84c' }}>
          {ITEM_LABELS[item] || item}
        </div>
      ))}
    </div>
  )
}