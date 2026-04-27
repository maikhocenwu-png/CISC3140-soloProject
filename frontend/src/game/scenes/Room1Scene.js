import * as Phaser from 'phaser';
import useGameStore from '../../store/gameStore'

export default class Room1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Room1Scene' })
  }

  preload() {
    // Placeholder colored background until you add real art
    // We'll replace these with real image assets in Phase 4
  }

  create() {
    const store = useGameStore.getState()

    // Dark room background placeholder
    this.add.rectangle(400, 250, 800, 500, 0x12100a)

    // Title text placeholder
    this.add.text(400, 250, 'Room 1 — Coming in Phase 4', {
      fontSize: '18px',
      color: '#3a2f1e',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)

    // Example clickable object placeholder
    const candleRect = this.add.rectangle(200, 300, 40, 60, 0x8b6914)
      .setInteractive({ cursor: 'pointer' })

    this.add.text(200, 350, 'candle', {
      fontSize: '11px', color: '#6b5a3e', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5)

    candleRect.on('pointerover', () => candleRect.setFillStyle(0xc9a84c))
    candleRect.on('pointerout', () => candleRect.setFillStyle(0x8b6914))
    candleRect.on('pointerdown', () => {
      store.addItem('candle')
      candleRect.destroy()
      this.add.text(200, 300, '✓', {
        fontSize: '20px', color: '#c9a84c'
      }).setOrigin(0.5)
    })
  }
}