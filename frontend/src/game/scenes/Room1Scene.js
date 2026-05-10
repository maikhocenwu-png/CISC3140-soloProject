import Phaser from 'phaser'
import useGameStore from '../../store/gameStore'

export default class Room1Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Room1Scene' })
    this.solvedHandler = null
  }

  create() {
    const store = useGameStore.getState()
    const { solvedPuzzles, inventory } = store

    // ── Background ──────────────────────────────────────────
    this.add.rectangle(400, 250, 800, 500, 0x12100a)

    // Floor
    this.add.rectangle(400, 460, 800, 80, 0x1a1208)

    // Back wall
    this.add.rectangle(400, 200, 800, 340, 0x0f0e0b)

    // ── Room label ──────────────────────────────────────────
    this.add.text(400, 20, 'THE STUDY', {
      fontSize: '11px', color: '#2a2010',
      fontFamily: 'Georgia, serif', letterSpacing: 6
    }).setOrigin(0.5)

    // ── Bookshelf (left wall) ────────────────────────────────
    this.drawBookshelf()

    // ── Desk with drawer (center) ────────────────────────────
    this.drawDesk()

    // ── Clock (right wall) ───────────────────────────────────
    this.drawClock()

    // ── Door to Room 2 (far right) ───────────────────────────
    this.drawDoor(solvedPuzzles)

    // ── Restore already-collected items ─────────────────────
    if (inventory.includes('torn_paper')) {
      this.markSolved('bookshelf')
    }
    if (inventory.includes('brass_key') || solvedPuzzles.includes('drawer_code')) {
      this.markSolved('drawer')
    }

    // ── Listen for puzzle solved events from React ───────────
    this.solvedHandler = (e) => this.onPuzzleSolved(e.detail)
    window.addEventListener('puzzleSolved', this.solvedHandler)
  }

  drawBookshelf() {
    const store = useGameStore.getState()

    // Shelf frame
    this.add.rectangle(120, 220, 140, 200, 0x2a1f0f)
    this.add.rectangle(120, 220, 136, 196, 0x1a1208)

    // Books — 3 red, rest brown
    const bookColors = [0x8b2020, 0x4a3520, 0x8b2020, 0x4a3520, 0x8b2020, 0x3a2a15, 0x4a3520]
    const bookWidths = [14, 12, 16, 10, 14, 12, 16]
    let xPos = 55
    bookColors.forEach((color, i) => {
      this.add.rectangle(xPos + bookWidths[i] / 2, 235, bookWidths[i], 130, color)
      xPos += bookWidths[i] + 3
    })

    // Shelf planks
    this.add.rectangle(120, 175, 136, 4, 0x3a2a15)
    this.add.rectangle(120, 310, 136, 4, 0x3a2a15)

    // Clickable hotspot
    if (!store.solvedPuzzles.includes('bookshelf_puzzle')) {
      const hotspot = this.add.rectangle(120, 220, 140, 200, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' })
        .setName('bookshelf')

      hotspot.on('pointerover', () => {
        this.add.rectangle(120, 220, 140, 200, 0xc9a84c, 0.08)
          .setName('bookshelf_hover')
      })
      hotspot.on('pointerout', () => {
        this.children.getByName('bookshelf_hover')?.destroy()
      })
      hotspot.on('pointerdown', () => {
        store.openPuzzle({
          id: 'bookshelf_puzzle',
          title: 'The Bookshelf',
          description: 'Dusty books line the shelf. Something about their colors feels deliberate. How many red books are there?',
          placeholder: 'Enter a number',
          hint: 'Count only the red books on the shelf'
        })
      })
    }
  }

  drawDesk() {
    const store = useGameStore.getState()

    // Desk surface
    this.add.rectangle(400, 360, 200, 20, 0x3a2a10)
    // Desk legs
    this.add.rectangle(320, 400, 15, 80, 0x2a1f0a)
    this.add.rectangle(480, 400, 15, 80, 0x2a1f0a)
    // Drawer
    const drawer = this.add.rectangle(400, 340, 120, 25, 0x2a1f0a)
    // Drawer handle
    this.add.rectangle(400, 340, 20, 5, 0x8b6914)

    // Torn paper on desk (collectible) — only if not already collected
    if (!store.inventory.includes('torn_paper') && !store.solvedPuzzles.includes('bookshelf_puzzle')) {
      // Paper appears after bookshelf solved — handled in onPuzzleSolved
    }

    // Drawer puzzle hotspot
    if (!store.solvedPuzzles.includes('drawer_code')) {
      drawer.setInteractive({ cursor: 'pointer' })
      drawer.on('pointerover', () => drawer.setFillStyle(0x3a2f10))
      drawer.on('pointerout', () => drawer.setFillStyle(0x2a1f0a))
      drawer.on('pointerdown', () => {
        const { inventory } = useGameStore.getState()
        if (!inventory.includes('torn_paper')) {
          this.showRoomMessage('The drawer is locked. Maybe there\'s a clue somewhere...')
          return
        }
        store.openPuzzle({
          id: 'drawer_code',
          title: 'The Locked Drawer',
          description: 'Four digits are scrawled on the torn paper. The drawer needs a 4-digit code.',
          placeholder: 'Enter 4-digit code',
          hint: 'Rearrange the four digits on the torn paper'
        })
      })
    }
  }

  drawClock() {
    const store = useGameStore.getState()

    // Clock body
    this.add.circle(650, 180, 45, 0x2a1f0a)
    this.add.circle(650, 180, 42, 0x1a1208)
    // Clock face markings
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r = 34
      this.add.circle(
        650 + Math.cos(angle) * r,
        180 + Math.sin(angle) * r,
        2, 0x3a2f1e
      )
    }
    // Hour hand pointing to 3
    this.add.line(650, 180, 0, 0, 28, 0, 0xc9a84c).setLineWidth(2)
    // Minute hand
    this.add.line(650, 180, 0, 0, 0, -32, 0x8b7a5e).setLineWidth(1.5)
    // Center dot
    this.add.circle(650, 180, 4, 0xc9a84c)

    // Clock label
    this.add.text(650, 235, 'CLOCK', {
      fontSize: '9px', color: '#3a2f1e', fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5)

    // Clickable
    if (!store.solvedPuzzles.includes('clock_puzzle')) {
      const hotspot = this.add.circle(650, 180, 45, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' })
      hotspot.on('pointerdown', () => {
        store.openPuzzle({
          id: 'clock_puzzle',
          title: 'The Old Clock',
          description: 'The clock has stopped. The hour hand points firmly in one direction. What hour does it indicate?',
          placeholder: 'Enter the hour',
          hint: 'The hour hand points to the hour of the shadow'
        })
      })
    }
  }

  drawDoor(solvedPuzzles) {
    const store = useGameStore.getState()
    const isUnlocked = solvedPuzzles.includes('door_lock')

    // Door frame
    this.add.rectangle(720, 330, 80, 180, 0x2a1f0a)
    // Door panel
    const doorColor = isUnlocked ? 0x3a5a2a : 0x1e1810
    const door = this.add.rectangle(720, 330, 74, 174, doorColor)
      .setName('door')
    // Door handle
    this.add.circle(706, 330, 5, 0x8b6914)

    // Lock icon
    if (!isUnlocked) {
      this.add.text(720, 330, '🔒', { fontSize: '18px' }).setOrigin(0.5)
    }

    // Room 2 label
    this.add.text(720, 430, 'ROOM 2', {
      fontSize: '9px', color: isUnlocked ? '#6dbf67' : '#2a2010',
      fontFamily: 'Georgia, serif', letterSpacing: 2
    }).setOrigin(0.5)

    door.setInteractive({ cursor: 'pointer' })
    door.on('pointerdown', () => {
      const state = useGameStore.getState()
      if (state.solvedPuzzles.includes('door_lock')) {
        this.scene.start('Room2Scene')
        state.loadSave({ ...state, currentRoom: 'room2' })
      } else if (state.inventory.includes('brass_key')) {
        state.openPuzzle({
          id: 'door_lock',
          title: 'The Locked Door',
          description: 'You have the brass key. Type "open" to use it on the door.',
          placeholder: 'Type "open"',
          hint: 'You already have what you need'
        })
      } else {
        this.showRoomMessage('The door is locked. You need a key.')
      }
    })
  }

  onPuzzleSolved({ puzzleId, reward }) {
    const store = useGameStore.getState()

    if (puzzleId === 'bookshelf_puzzle') {
      // Spawn torn paper on desk
      this.markSolved('bookshelf')
      const paper = this.add.rectangle(400, 345, 30, 22, 0xe8e0d0)
        .setInteractive({ cursor: 'pointer' })
      this.add.text(400, 345, '📄', { fontSize: '14px' }).setOrigin(0.5).setName('paper_icon')
      this.add.text(400, 370, 'torn paper', {
        fontSize: '9px', color: '#8b7a5e', fontFamily: 'Georgia, serif'
      }).setOrigin(0.5).setName('paper_label')

      paper.on('pointerdown', () => {
        store.addItem('torn_paper')
        paper.destroy()
        this.children.getByName('paper_icon')?.destroy()
        this.children.getByName('paper_label')?.destroy()
        this.showRoomMessage('You picked up the torn paper.')
      })
    }

    if (puzzleId === 'drawer_code') {
      // Show brass key on desk
      this.showRoomMessage('The drawer opens — a brass key inside!')
      this.time.delayedCall(500, () => {
        const key = this.add.text(450, 350, '🗝️', { fontSize: '20px' })
          .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
        key.on('pointerdown', () => {
          store.addItem('brass_key')
          key.destroy()
          this.showRoomMessage('You picked up the brass key.')
        })
      })
    }

    if (puzzleId === 'clock_puzzle') {
      this.showRoomMessage('The clock ticks once... something shifts in the room.')
    }

    if (puzzleId === 'door_lock') {
      // Unlock the door visually
      const door = this.children.getByName('door')
      door?.setFillStyle(0x3a5a2a)
      this.showRoomMessage('The door unlocks. Room 2 awaits...')
    }
  }

  markSolved(name) {
    // Visual indicator that something has been examined
    this.add.text(
      name === 'bookshelf' ? 120 : 400,
      name === 'bookshelf' ? 140 : 290,
      '✓', { fontSize: '12px', color: '#6dbf67' }
    ).setOrigin(0.5)
  }

  showRoomMessage(text) {
    const existing = this.children.getByName('room_msg')
    existing?.destroy()
    this.children.getByName('room_msg_bg')?.destroy()

    const bg = this.add.rectangle(400, 470, 500, 30, 0x1e1810)
      .setStrokeStyle(1, 0x3a2f1e).setName('room_msg_bg')
    const msg = this.add.text(400, 470, text, {
      fontSize: '12px', color: '#c9a84c', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setName('room_msg')

    this.time.delayedCall(3000, () => {
      bg.destroy()
      msg.destroy()
    })
  }

  shutdown() {
    if (this.solvedHandler) {
      window.removeEventListener('puzzleSolved', this.solvedHandler)
    }
  }
}