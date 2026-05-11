import Phaser from 'phaser'
import useGameStore from '../../store/gameStore'
import audioManager from '../AudioManager'

export default class Room1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Room1Scene' })
    this.solvedHandler = null
    this.paperSpawned  = false
  }

  preload() {
    // Load candle cursor gif if available
    // Falls back gracefully if file missing
  }

  create() {
    const store = useGameStore.getState()
    const { solvedPuzzles, inventory } = store

    // Start room 1 ambient music
    audioManager.playBg('ambient1')

    // Background layers
    this.add.rectangle(400, 250, 800, 500, 0x12100a)
    this.add.rectangle(400, 460, 800, 80, 0x1a1208)
    this.add.rectangle(400, 200, 800, 340, 0x0f0e0b)

    this.add.text(400, 18, 'THE STUDY', {
      fontSize: '11px', color: '#2a2010',
      fontFamily: 'Georgia, serif', letterSpacing: 6,
    }).setOrigin(0.5)

    // Draw all room elements
    this.drawBookshelf(solvedPuzzles)
    this.drawDesk(solvedPuzzles, inventory)
    this.drawClock(solvedPuzzles)
    this.drawCandle(inventory)
    this.drawDoor(solvedPuzzles, inventory)

    // If bookshelf already solved but paper not collected, spawn it now
    if (solvedPuzzles.includes('bookshelf_puzzle') && !inventory.includes('torn_paper')) {
      this.time.delayedCall(100, () => this.spawnTornPaper())
    }

    // If drawer solved but key not collected, spawn it
    if (solvedPuzzles.includes('drawer_code') && !inventory.includes('brass_key')) {
      this.time.delayedCall(100, () => this.spawnBrassKey())
    }

    // Listen for puzzle solved events from React
    this.solvedHandler = (e) => this.onPuzzleSolved(e.detail)
    window.addEventListener('puzzleSolved', this.solvedHandler)
  }

  drawCandle(inventory) {
    const store = useGameStore.getState()
    if (inventory.includes('candle')) return

    // Flame (triangle)
    const flame = this.add.triangle(200, 272, 0, 18, 7, 0, 14, 18, 0xf4a020)

    // Body
    const body = this.add.rectangle(200, 298, 14, 36, 0xe8d8b0)
    this.add.rectangle(200, 312, 9, 5, 0xc8a870)

    // Flicker
    this.tweens.add({
      targets: flame,
      scaleX: 1.3, scaleY: 0.85,
      duration: 280, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    this.add.text(200, 326, 'candle', {
      fontSize: '9px', color: '#6b5a3e', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5).setName('candle_label')

    const hitbox = this.add.rectangle(200, 295, 32, 70, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })
      .setName('candle_hitbox')

    hitbox.on('pointerover', () => {
      body.setFillStyle(0xfff0c0)
      flame.setFillStyle(0xffcc00)
    })
    hitbox.on('pointerout', () => {
      body.setFillStyle(0xe8d8b0)
      flame.setFillStyle(0xf4a020)
    })
    hitbox.on('pointerdown', () => {
      store.addItem('candle')
      audioManager.playSfx('pickup')

      // Change cursor to candle
      window.dispatchEvent(new CustomEvent('setCursor', { detail: 'candle' }))

      // Destroy candle visuals
      flame.destroy()
      body.destroy()
      hitbox.destroy()
      this.children.getByName('candle_label')?.destroy()
      this.showRoomMessage('You picked up the candle. Its warmth guides you.')
    })
  }

  drawBookshelf(solvedPuzzles) {
    const store = useGameStore.getState()

    this.add.rectangle(120, 220, 140, 200, 0x2a1f0f)
    this.add.rectangle(120, 220, 136, 196, 0x1a1208)

    const colors = [0x8b2020, 0x4a3520, 0x8b2020, 0x4a3520, 0x8b2020, 0x3a2a15, 0x4a3520]
    const widths = [14, 12, 16, 10, 14, 12, 16]
    let xPos = 55
    colors.forEach((color, i) => {
      this.add.rectangle(xPos + widths[i] / 2, 235, widths[i], 130, color)
      xPos += widths[i] + 3
    })
    this.add.rectangle(120, 175, 136, 4, 0x3a2a15)
    this.add.rectangle(120, 310, 136, 4, 0x3a2a15)

    if (solvedPuzzles.includes('bookshelf_puzzle')) {
      this.add.text(120, 135, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      return
    }

    const glow = this.add.rectangle(120, 220, 140, 200, 0xc9a84c, 0)
    const hotspot = this.add.rectangle(120, 220, 140, 200, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    hotspot.on('pointerover', () => glow.setAlpha(0.08))
    hotspot.on('pointerout',  () => glow.setAlpha(0))
    hotspot.on('pointerdown', () => {
      store.openPuzzle({
        id: 'bookshelf_puzzle',
        title: 'The Bookshelf',
        description: 'Dusty books line the shelf. Something about their colors feels deliberate. How many red books are there?',
        placeholder: 'Enter a number',
        hint: 'Count only the red books on the shelf',
      })
    })
  }

  drawDesk(solvedPuzzles, inventory) {
    const store = useGameStore.getState()

    // Desk surface
    this.add.rectangle(400, 360, 200, 18, 0x3a2a10)
    this.add.rectangle(320, 400, 14, 78, 0x2a1f0a)
    this.add.rectangle(480, 400, 14, 78, 0x2a1f0a)

    // Drawer
    const drawer = this.add.rectangle(400, 342, 118, 22, 0x2a1f0a)
      .setName('drawer_rect')
    this.add.rectangle(400, 342, 18, 5, 0x8b6914) // handle

    // Drawer puzzle
    if (solvedPuzzles.includes('drawer_code')) {
      this.add.text(400, 322, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
    } else {
      drawer.setInteractive({ cursor: 'pointer' })
      drawer.on('pointerover', () => drawer.setFillStyle(0x3a2f10))
      drawer.on('pointerout',  () => drawer.setFillStyle(0x2a1f0a))
      drawer.on('pointerdown', () => {
        const { inventory: inv } = useGameStore.getState()
        if (!inv.includes('torn_paper')) {
          this.showRoomMessage("The drawer is locked. Maybe there's a clue somewhere...")
          return
        }
        store.openPuzzle({
          id: 'drawer_code',
          title: 'The Locked Drawer',
          description: 'Four digits are scrawled on the torn paper. The drawer needs a 4-digit code.',
          placeholder: 'Enter 4-digit code',
          hint: 'Check the torn paper in your inventory — click it to examine it',
        })
      })
    }
  }

  drawClock(solvedPuzzles) {
    const store = useGameStore.getState()

    this.add.circle(650, 180, 45, 0x2a1f0a)
    this.add.circle(650, 180, 42, 0x1a1208)

    // Hour tick marks
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      this.add.circle(650 + Math.cos(angle) * 34, 180 + Math.sin(angle) * 34, 2, 0x3a2f1e)
    }

    // Hour hand pointing to 3 o'clock (pointing RIGHT = 0 degrees from center)
    const handAngle = 0 // 3 o'clock = pointing right
    this.add.line(
      650, 180,
      0, 0,
      Math.cos(handAngle) * 26, Math.sin(handAngle) * 26,
      0xc9a84c
    ).setLineWidth(2).setOrigin(0, 0)

    // Minute hand pointing to 12 (pointing UP)
    this.add.line(
      650, 180,
      0, 0,
      0, -32,
      0x8b7a5e
    ).setLineWidth(1.5).setOrigin(0, 0)

    this.add.circle(650, 180, 4, 0xc9a84c)
    if (solvedPuzzles.includes('clock_puzzle')) {
      this.add.text(650, 128, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      return
    }

    const glow    = this.add.circle(650, 180, 48, 0xc9a84c, 0)
    const hotspot = this.add.circle(650, 180, 48, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    hotspot.on('pointerover', () => glow.setAlpha(0.08))
    hotspot.on('pointerout',  () => glow.setAlpha(0))
    hotspot.on('pointerdown', () => {
      store.openPuzzle({
        id: 'clock_puzzle',
        title: 'The Old Clock',
        description: 'The clock has stopped. The hour hand points directly to one side. What hour does it show?',
        placeholder: 'Enter the hour (1-12)',
        hint: 'The hour hand points directly to the right',
      })
    })
  }

  drawDoor(solvedPuzzles, inventory) {
    const store = useGameStore.getState()
    const isUnlocked = solvedPuzzles.includes('door_lock')

    this.add.rectangle(730, 320, 78, 200, 0x2a1f0a)
    this.add.rectangle(730, 320, 70, 190, isUnlocked ? 0x3a5a2a : 0x1e1810)
      .setName('door_panel')
    this.add.circle(718, 318, 5, 0x8b6914)

    if (!isUnlocked) {
      this.add.text(730, 318, '🔒', { fontSize: '17px' }).setOrigin(0.5)
    }

    this.add.text(730, 428, isUnlocked ? 'ROOM 2 →' : 'ROOM 2', {
      fontSize: '9px',
      color: isUnlocked ? '#6dbf67' : '#2a2010',
      fontFamily: 'Georgia, serif', letterSpacing: 2,
    }).setOrigin(0.5)

    const doorHit = this.add.rectangle(730, 320, 78, 200, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    doorHit.on('pointerdown', () => {
      const state = useGameStore.getState()
      if (state.solvedPuzzles.includes('door_lock')) {
        audioManager.playSfx('doorOpen')
        this.cameras.main.fadeOut(600, 0, 0, 0)
        this.time.delayedCall(600, () => this.scene.start('Room2Scene'))
      } else if (state.inventory.includes('brass_key')) {
        state.openPuzzle({
          id: 'door_lock',
          title: 'The Locked Door',
          description: 'You have the brass key. Type "open" to use it on the door.',
          placeholder: 'Type "open"',
          hint: 'You already have what you need',
        })
      } else {
        this.showRoomMessage('The door is locked. You need a key.')
      }
    })
  }

  spawnTornPaper() {
    if (this.paperSpawned) return
    this.paperSpawned = true

    const store = useGameStore.getState()

    const paperGroup = this.add.container(400, 348)

    const bg = this.add.rectangle(0, 0, 34, 24, 0xe8e0d0)
      .setInteractive({ cursor: 'pointer' })

    // Draw "4729" on the paper
    const digits = this.add.text(0, 0, '4729', {
      fontSize: '10px', color: '#2a1f0a',
      fontFamily: 'Georgia, serif', letterSpacing: 2,
    }).setOrigin(0.5)

    paperGroup.add([bg, digits])

    this.add.text(400, 366, 'torn paper', {
      fontSize: '9px', color: '#8b7a5e', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5).setName('paper_label')

    bg.on('pointerover', () => bg.setFillStyle(0xfff8e8))
    bg.on('pointerout',  () => bg.setFillStyle(0xe8e0d0))
    bg.on('pointerdown', () => {
      store.addItem('torn_paper')
      audioManager.playSfx('pickup')
      paperGroup.destroy()
      this.children.getByName('paper_label')?.destroy()
      this.showRoomMessage('You picked up the torn paper. Numbers are written on it.')
    })
  }

  spawnBrassKey() {
    const store = useGameStore.getState()
    const key = this.add.text(460, 348, '🗝️', { fontSize: '22px' })
      .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
    this.add.text(460, 368, 'brass key', {
      fontSize: '9px', color: '#8b7a5e', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5).setName('key_label')

    key.on('pointerdown', () => {
      store.addItem('brass_key')
      audioManager.playSfx('pickup')
      key.destroy()
      this.children.getByName('key_label')?.destroy()
      this.showRoomMessage('You picked up the brass key.')
    })
  }

  onPuzzleSolved({ puzzleId }) {
    audioManager.playSfx('correct')

    if (puzzleId === 'bookshelf_puzzle') {
      this.add.text(120, 135, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      this.showRoomMessage('You count carefully. Something falls from between the books...')
      this.time.delayedCall(500, () => this.spawnTornPaper())
    }

    if (puzzleId === 'drawer_code') {
      this.add.text(400, 322, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      this.showRoomMessage('The drawer clicks open — a brass key gleams inside!')
      this.time.delayedCall(500, () => this.spawnBrassKey())
    }

    if (puzzleId === 'clock_puzzle') {
      this.add.text(650, 128, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      this.showRoomMessage('The clock ticks once... something shifts in the room.')
    }

    if (puzzleId === 'door_lock') {
      const door = this.children.getByName('door_panel')
      door?.setFillStyle(0x3a5a2a)
      this.showRoomMessage('The door unlocks. Room 2 awaits...')
    }
  }

  showRoomMessage(text) {
    this.children.getByName('room_msg')?.destroy()
    this.children.getByName('room_msg_bg')?.destroy()
    this.add.rectangle(400, 470, 560, 28, 0x1e1810)
      .setStrokeStyle(1, 0x3a2f1e).setName('room_msg_bg')
    this.add.text(400, 470, text, {
      fontSize: '12px', color: '#c9a84c', fontFamily: 'Georgia, serif',
    }).setOrigin(0.5).setName('room_msg')
    this.time.delayedCall(3500, () => {
      this.children.getByName('room_msg')?.destroy()
      this.children.getByName('room_msg_bg')?.destroy()
    })
  }

  shutdown() {
    if (this.solvedHandler)
      window.removeEventListener('puzzleSolved', this.solvedHandler)
  }
}