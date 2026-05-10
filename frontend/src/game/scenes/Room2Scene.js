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

    // Background
    this.add.rectangle(400, 250, 800, 500, 0x0a0e12)
    this.add.rectangle(400, 200, 800, 340, 0x0c1016)
    this.add.rectangle(400, 460, 800, 80, 0x080c10)

    this.add.text(400, 20, 'THE CHAMBER', {
      fontSize: '11px', color: '#1a2030',
      fontFamily: 'Georgia, serif', letterSpacing: 6
    }).setOrigin(0.5)

    this.drawMirror()
    this.drawFinalDoor()

    this.cameras.main.fadeIn(800, 0, 0, 0)

    this.solvedHandler = (e) => this.onPuzzleSolved(e.detail)
    window.addEventListener('puzzleSolved', this.solvedHandler)
  }

  drawMirror() {
    const store = useGameStore.getState()

    this.add.rectangle(180, 220, 120, 160, 0x2a3040)
    this.add.rectangle(180, 220, 112, 152, 0x1a2535)
    this.add.rectangle(155, 190, 4, 80, 0x2a4060, 0.5)

    this.add.text(180, 210, 'ǝɟıl', {
      fontSize: '22px', color: '#2a4a6a', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5)
    this.add.text(180, 240, '(reflected)', {
      fontSize: '9px', color: '#1a2535', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5)
    this.add.text(180, 312, 'MIRROR', {
      fontSize: '9px', color: '#1a2535',
      fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5)

    if (store.solvedPuzzles.includes('mirror_puzzle')) {
      this.add.text(180, 140, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      return
    }

    const glow = this.add.rectangle(180, 220, 120, 160, 0x6a9abf, 0)
    const hotspot = this.add.rectangle(180, 220, 120, 160, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    hotspot.on('pointerover', () => glow.setAlpha(0.1))
    hotspot.on('pointerout',  () => glow.setAlpha(0))
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

  drawFinalDoor() {
    const store = useGameStore.getState()
    const isUnlocked = store.solvedPuzzles.includes('final_lock')

    this.add.rectangle(700, 300, 100, 240, 0x1a2030)
    const doorColor = isUnlocked ? 0x1a4a2a : 0x0e1620
    this.add.rectangle(700, 300, 90, 228, doorColor).setName('door_rect')
    this.add.rectangle(685, 290, 14, 6, 0x2a3a50)

    if (!isUnlocked) {
      this.add.text(700, 300, '🔒', { fontSize: '20px' }).setOrigin(0.5)
    }

    this.add.text(700, 430, isUnlocked ? 'ESCAPE →' : 'EXIT', {
      fontSize: '10px',
      color: isUnlocked ? '#6dbf67' : '#1a2535',
      fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5).setName('exit_label')

    const doorHotspot = this.add.rectangle(700, 300, 100, 240, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    doorHotspot.on('pointerdown', () => {
      const state = useGameStore.getState()
      if (state.solvedPuzzles.includes('final_lock')) {
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.time.delayedCall(1000, () => state.setScreen('win'))
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

  onPuzzleSolved({ puzzleId }) {
    const store = useGameStore.getState()

    if (puzzleId === 'mirror_puzzle') {
      this.add.text(180, 140, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      this.showRoomMessage('The mirror glows — a coin falls to the floor!')
      this.time.delayedCall(600, () => {
        const coin = this.add.text(300, 390, '🪙', { fontSize: '24px' })
          .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
        this.add.text(300, 415, 'silver coin', {
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
      this.showRoomMessage('The door swings open... you\'re free!')
      this.time.delayedCall(1800, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.time.delayedCall(1000, () => store.setScreen('win'))
      })
    }
  }

  showRoomMessage(text) {
    this.children.getByName('room_msg')?.destroy()
    this.children.getByName('room_msg_bg')?.destroy()
    this.add.rectangle(400, 470, 500, 30, 0x0e1620)
      .setStrokeStyle(1, 0x1a2535).setName('room_msg_bg')
    this.add.text(400, 470, text, {
      fontSize: '12px', color: '#6a9abf', fontFamily: 'Georgia, serif'
    }).setOrigin(0.5).setName('room_msg')
    this.time.delayedCall(3000, () => {
      this.children.getByName('room_msg')?.destroy()
      this.children.getByName('room_msg_bg')?.destroy()
    })
  }

  shutdown() {
    if (this.solvedHandler)
      window.removeEventListener('puzzleSolved', this.solvedHandler)
  }
}