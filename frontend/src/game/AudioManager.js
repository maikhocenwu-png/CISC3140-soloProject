// Singleton audio manager — works outside Phaser
// All audio is HTML5 Audio so it works in React too

const tracks = {
  title:     { src: '/assets/audio/title_music.mp3',  loop: true,  volume: 0.4 },
  ambient1:  { src: '/assets/audio/ambient1.mp3',     loop: true,  volume: 0.25 },
  ambient2:  { src: '/assets/audio/ambient2.mp3',     loop: true,  volume: 0.25 },
  winSong:   { src: '/assets/audio/winning_song.mp3', loop: false, volume: 0.7 },
  fanfYay:   { src: '/assets/audio/fanf_yay.mp3',     loop: false, volume: 0.8 },
  correct:   { src: '/assets/audio/correct.mp3',      loop: false, volume: 0.6 },
  wrong:     { src: '/assets/audio/wrong.mp3',        loop: false, volume: 0.5 },
  pickup:    { src: '/assets/audio/pickup.mp3',        loop: false, volume: 0.6 },
  doorOpen:  { src: '/assets/audio/door_open.mp3',    loop: false, volume: 0.7 },
}

class AudioManager {
  constructor() {
    this.elements = {}
    this.currentBg = null
    this.enabled = true
    this.winPlayed = false
  }

  _get(key) {
    if (!this.elements[key]) {
      const t = tracks[key]
      if (!t) return null
      const el = new Audio(t.src)
      el.loop   = t.loop
      el.volume = t.volume
      this.elements[key] = el
    }
    return this.elements[key]
  }

  setEnabled(val) {
    this.enabled = val
    if (!val) this.stopBg()
  }

  playBg(key) {
    if (this.currentBg === key) return
    this.stopBg()
    this.currentBg = key
    if (!this.enabled) return
    const el = this._get(key)
    if (el) { el.currentTime = 0; el.play().catch(() => {}) }
  }

  stopBg() {
    if (this.currentBg) {
      const el = this._get(this.currentBg)
      if (el) { el.pause(); el.currentTime = 0 }
    }
    this.currentBg = null
  }

  playSfx(key) {
    if (!this.enabled) return
    const el = this._get(key)
    if (el) { el.currentTime = 0; el.play().catch(() => {}) }
  }

  playWin() {
    if (!this.enabled) return
    this.stopBg()
    const song = this._get('winSong')
    if (song) {
      song.currentTime = 0
      song.play().catch(() => {})
      song.onended = () => {
        if (!this.winPlayed) {
          this.winPlayed = true
          const yay = this._get('fanfYay')
          if (yay) { yay.currentTime = 0; yay.play().catch(() => {}) }
        }
      }
    }
  }

  reset() {
    this.winPlayed = false
  }
}

const audioManager = new AudioManager()
export default audioManager