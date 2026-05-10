import Phaser from 'phaser'
import useGameStore from '../../store/gameStore'

export default class Room2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Room2Scene' })
    this.solvedHandler = null
  }

  create() {
    const store = useGameStore.getState()
    store.loadSave({ ...store, currentRoom: 'room2' })

    // ── Background ───────────────────────────────────────────
    this.add.rectangle(400, 250, 800, 500, 0x0a0e12)
    this.add.rectangle(400, 200, 800, 340, 0x0c1016)
    this.add.rectangle(400, 460, 800, 80, 0x080c10)

    this.add.text(400, 20, 'THE CHAMBER', {
      fontSize: '11px', color: '#1a2030',
      fontFamily: 'Georgia, serif', letterSpacing: 6
    }).setOrigin(0.5)

    // ── Mirror (left) ────────────────────────────────────────
    this.drawMirror()

    // ── Final door (right) ───────────────────────────────────
    this.drawFinalDoor()

    // ── Listen for puzzle solved events ──────────────────────
    this.solvedHandler = (e) => this.onPuzzleSolved(e.detail)
    window.addEventListener('puzzleSolved', this.solvedHandler)
  }

  drawMirror() {
    const store = useGameStore.getState()

    // Mirror frame
    this.add.rectangle(180, 220, 120, 160, 0x2a3040)
    // Mirror glass
    this.add.rectangle(180, 220, 112, 152, 0x1a2535)
    // Reflection effect
    this.add.rectangle(155, 190, 4, 80, 0x2a4060, 0.5)

    // Reversed word on mirror
    this.add.text(180, 210, 'ǝɟıl', {
      fontSize: '22px', color: '#2a4a6a',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5)
    this.add.text(180, 240, '(reflected)', {
      fontSize: '9px', color: '#1a2535',
      fontFamily: 'Georgia, serif'
    }).setOrigin(0.5)

    // Mirror label
    this.add.text(180, 315, 'MIRROR', {
      fontSize: '9px', color: '#1a2535',
      fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5)

    if (!store.solvedPuzzles.includes('mirror_puzzle')) {
      const hotspot = this.add.rectangle(180, 220, 120, 160, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' })
      hotspot.on('pointerdown', () => {
        store.openPuzzle({
          id: 'mirror_puzzle',
          title: 'The Mirror',
          description: 'Strange letters are etched into the mirror, reversed by the reflection. What word do they spell?',
          placeholder: 'Enter the word',
          hint: 'Read the word in the mirror — it reverses letters'
        })
      })
    }
  }

  drawFinalDoor() {
    const store = useGameStore.getState()
    const isUnlocked = store.solvedPuzzles.includes('final_lock')

    // Door frame
    this.add.rectangle(700, 300, 100, 240, 0x1a2030)
    // Door panel
    const doorColor = isUnlocked ? 0x1a4a2a : 0x0e1620
    const door = this.add.rectangle(700, 300, 90, 228, doorColor)
      .setName('final_door')

    // Coin slot
    this.add.rectangle(685, 290, 14, 6, 0x2a3a50)
    this.add.text(685, 290, '○', {
      fontSize: '10px', color: '#2a3a50'
    }).setOrigin(0.5)

    if (!isUnlocked) {
      this.add.text(700, 300, '🔒', { fontSize: '20px' }).setOrigin(0.5)
    } else {
      this.add.text(700, 300, '🚪', { fontSize: '30px' }).setOrigin(0.5)
    }

    this.add.text(700, 430, isUnlocked ? 'ESCAPE →' : 'EXIT', {
      fontSize: '10px',
      color: isUnlocked ? '#6dbf67' : '#1a2535',
      fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5).setName('exit_label')

    door.setInteractive({ cursor: 'pointer' })
    door.on('pointerdown', () => {
      const state = useGameStore.getState()
      if (state.solvedPuzzles.includes('final_lock')) {
        state.setScreen('win')
      } else if (state.inventory.includes('silver_coin')) {
        state.openPuzzle({
          id: 'final_lock',
          title: 'The Final Door',
          description: 'There is a small slot in the door — just the right size for a coin. What do you insert?',
          placeholder: 'Type what you insert',
          hint: 'The coin fits the slot in the final door'
        })
      } else {
        this.showRoomMessage('The door has a strange slot. You need something to open it.')
      }
    })
  }

  onPuzzleSolved({ puzzleId, reward }) {
    const store = useGameStore.getState()

    if (puzzleId === 'mirror_puzzle') {
      this.showRoomMessage('The mirror glows — a coin falls to the floor!')
      this.time.delayedCall(500, () => {
        const coin = this.add.text(280, 380, '🪙', { fontSize: '22px' })
          .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
        this.add.text(280, 410, 'silver coin', {
          fontSize: '9px', color: '#6b5a3e', fontFamily: 'Georgia, serif'
        }).setOrigin(0.5).setName('coin_label')

        coin.on('pointerdown', () => {
          store.addItem('silver_coin')
          coin.destroy()
          this.children.getByName('coin_label')?.destroy()
          this.showRoomMessage('You picked up the silver coin.')
        })
      })
    }

    if (puzzleId === 'final_lock') {
      const door = this.children.getByName('final_door')
      door?.setFillStyle(0x1a4a2a)
      this.showRoomMessage('The door swings open... you\'re free!')
      this.time.delayedCall(2000, () => {
        store.setScreen('win')
      })
    }
  }

  showRoomMessage(text) {
    const existing = this.children.getByName('room_msg')
    existing?.destroy()
    this.children.getByName('room_msg_bg')?.destroy()

    const bg = this.add.rectangle(400, 470, 500, 30, 0x0e1620)
      .setStrokeStyle(1, 0x1a2535).setName('room_msg_bg')
    const msg = this.add.text(400, 470, text, {
      fontSize: '12px', color: '#6a9abf', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setName('room_msg')

    this.time.delayedCall(3000, () => {
      bg?.destroy()
      msg?.destroy()
    })
  }

  shutdown() {
    if (this.solvedHandler) {
      window.removeEventListener('puzzleSolved', this.solvedHandler)
    }
  }
}