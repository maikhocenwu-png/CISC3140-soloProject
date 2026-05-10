import Phaser from 'phaser'
import useGameStore from '../../store/gameStore'

export default class Room2Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Room2Scene' })
    this.solvedHandler = null
    this.eggClicks = 0
  }

  create() {
    const store = useGameStore.getState()
    store.loadSave({ ...store, currentRoom: 'room2' })

    const { solvedPuzzles } = useGameStore.getState()

    // Background
    this.add.rectangle(400, 250, 800, 500, 0x0a0e12)
    this.add.rectangle(400, 200, 800, 340, 0x0c1016)
    this.add.rectangle(400, 460, 800, 80, 0x080c10)

    this.add.text(400, 18, 'THE CHAMBER', {
      fontSize: '11px', color: '#1a2030',
      fontFamily: 'Georgia, serif', letterSpacing: 6
    }).setOrigin(0.5)

    this.drawMirror(solvedPuzzles)
    this.drawFinalDoor(solvedPuzzles)
    this.drawEasterEgg()
    this.drawSlidingPuzzlePedestal(solvedPuzzles)

    this.cameras.main.fadeIn(800, 0, 0, 0)

    this.solvedHandler = (e) => this.onPuzzleSolved(e.detail)
    window.addEventListener('puzzleSolved', this.solvedHandler)
  }

  drawSlidingPuzzlePedestal(solvedPuzzles) {
    const isSolved = solvedPuzzles.includes('sliding_puzzle')

    // Stone pedestal
    this.add.rectangle(400, 390, 100, 60, 0x1a1f28)
      .setStrokeStyle(1, 0x2a3040)

    // Eye symbol on pedestal
    if (isSolved) {
      this.add.text(400, 390, '👁️', { fontSize: '24px' }).setOrigin(0.5)
      this.add.text(400, 420, 'SOLVED', {
        fontSize: '9px', color: '#6dbf67',
        fontFamily: 'Georgia, serif', letterSpacing: 3
      }).setOrigin(0.5)
    } else {
      this.add.text(400, 385, '👁', { fontSize: '22px' }).setOrigin(0.5)
      this.add.text(400, 410, 'THE RAVEN\'S EYE', {
        fontSize: '9px', color: '#2a3a50',
        fontFamily: 'Georgia, serif', letterSpacing: 2
      }).setOrigin(0.5)

      const pedHit = this.add.rectangle(400, 390, 100, 60, 0x000000, 0)
        .setInteractive({ cursor: 'pointer' })
      const glow = this.add.rectangle(400, 390, 100, 60, 0x4a6a8a, 0)

      pedHit.on('pointerover', () => glow.setAlpha(0.15))
      pedHit.on('pointerout',  () => glow.setAlpha(0))
      pedHit.on('pointerdown', () => {
        window.dispatchEvent(new CustomEvent('openSlidingPuzzle'))
      })
    }
  }

  drawEasterEgg() {
    // Hidden raven painting — click 5 times for a secret message
    const raven = this.add.text(580, 120, '🐦‍⬛', { fontSize: '28px' })
      .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
      .setAlpha(0.3)

    raven.on('pointerover', () => raven.setAlpha(0.6))
    raven.on('pointerout',  () => raven.setAlpha(this.eggClicks >= 5 ? 1 : 0.3))
    raven.on('pointerdown', () => {
      this.eggClicks++
      if (this.eggClicks === 5) {
        raven.setAlpha(1)
        this.showRoomMessage('🐦 The raven whispers: "Caw caw!"')
        // Give player a bonus hint use
        useGameStore.getState().addItem('raven_key')
        this.time.delayedCall(2000, () => {
          this.showRoomMessage('✨ Easter egg found! Raven Key added to inventory.')
        })
      } else if (this.eggClicks < 5) {
        this.showRoomMessage(`The raven stirs... (${this.eggClicks}/5)`)
      }
    })
  }

  drawMirror(solvedPuzzles) {
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

    if (solvedPuzzles.includes('mirror_puzzle')) {
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
        hint: 'Read the word in the mirror — it reverses letters',
      })
    })
  }

  drawFinalDoor(solvedPuzzles) {
    const store = useGameStore.getState()
    const isUnlocked = solvedPuzzles.includes('final_lock')

    this.add.rectangle(700, 300, 100, 240, 0x1a2030)
    this.add.rectangle(700, 300, 90, 228, isUnlocked ? 0x1a4a2a : 0x0e1620)
      .setName('door_rect')
    this.add.rectangle(685, 290, 14, 6, 0x2a3a50)

    if (!isUnlocked) {
      this.add.text(700, 300, '🔒', { fontSize: '20px' }).setOrigin(0.5)
    }

    this.add.text(700, 428, isUnlocked ? 'ESCAPE →' : 'EXIT', {
      fontSize: '10px',
      color: isUnlocked ? '#6dbf67' : '#1a2535',
      fontFamily: 'Georgia, serif', letterSpacing: 3
    }).setOrigin(0.5)

    const doorHit = this.add.rectangle(700, 300, 100, 240, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' })

    doorHit.on('pointerdown', () => {
      const state = useGameStore.getState()

      if (state.solvedPuzzles.includes('final_lock')) {
        this.cameras.main.fadeOut(1000, 0, 0, 0)
        this.time.delayedCall(1000, () => state.setScreen('win'))
        return
      }

      // Must solve sliding puzzle first
      if (!state.solvedPuzzles.includes('sliding_puzzle')) {
        this.showRoomMessage('The eye on the pedestal blocks your path. Restore it first.')
        return
      }

      if (state.inventory.includes('golden_coin')) {
        state.openPuzzle({
          id: 'final_lock',
          title: 'The Final Door',
          description: 'There is a small slot in the door — just the right size for a coin. What do you insert?',
          placeholder: 'Type what you insert',
          hint: 'The coin fits the slot in the final door',
        })
      } else {
        this.showRoomMessage('The door has a strange slot. You need something to open it.')
      }
    })
  }

  onPuzzleSolved({ puzzleId }) {
    const store = useGameStore.getState()

    if (puzzleId === 'sliding_puzzle') {
      // Refresh pedestal visually
      this.showRoomMessage('The eye opens! A path forward reveals itself...')
      this.time.delayedCall(800, () => {
        // Soft flash
        const flash = this.add.rectangle(400, 250, 800, 500, 0x4a6a8a, 0.3)
        this.tweens.add({
          targets: flash, alpha: 0, duration: 1000,
          onComplete: () => flash.destroy()
        })
      })
    }

    if (puzzleId === 'mirror_puzzle') {
      this.add.text(180, 140, '✓', { fontSize: '14px', color: '#6dbf67' }).setOrigin(0.5)
      this.showRoomMessage('The mirror glows — a coin falls to the floor!')
      this.time.delayedCall(600, () => {
        const coin = this.add.text(260, 380, '🪙', { fontSize: '24px' })
          .setOrigin(0.5).setInteractive({ cursor: 'pointer' })
        this.add.text(260, 408, 'Golden Coin', {
          fontSize: '9px', color: '#6b5a3e', fontFamily: 'Georgia, serif'
        }).setOrigin(0.5).setName('coin_label')
        coin.on('pointerdown', () => {
          store.addItem('Golden_coin')
          coin.destroy()
          this.children.getByName('coin_label')?.destroy()
          this.showRoomMessage('You picked up the golden coin.')
        })
      })
    }

    if (puzzleId === 'final_lock') {
      const door = this.children.getByName('door_rect')
      door?.setFillStyle(0x1a4a2a)
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
    this.add.rectangle(400, 470, 560, 28, 0x0e1620)
      .setStrokeStyle(1, 0x1a2535).setName('room_msg_bg')
    this.add.text(400, 470, text, {
      fontSize: '12px', color: '#6a9abf', fontFamily: 'Georgia, serif'
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