class AudioManager {
  constructor() {
    this.elements   = {}
    this.currentBg  = null
    this.enabled    = true
    this.winPlayed  = false
    this._pendingBg = null
  }

  _get(key) {
    if (!this.elements[key]) {
      const srcs = {
        title:    '/assets/audio/title_music.mp3',
        ambient1: '/assets/audio/ambient1.mp3',
        ambient2: '/assets/audio/ambient2.mp3',
        winSong:  '/assets/audio/winning_song.mp3',
        fanfYay:  '/assets/audio/fanf_yay.mp3',
        correct:  '/assets/audio/correct.mp3',
        wrong:    '/assets/audio/wrong.mp3',
        pickup:   '/assets/audio/pickup.mp3',
        doorOpen: '/assets/audio/door_open.mp3',
      }
      const loops  = { title: true, ambient1: true, ambient2: true }
      const vols   = {
        title: 0.4, ambient1: 0.25, ambient2: 0.25,
        winSong: 0.7, fanfYay: 0.8,
        correct: 0.6, wrong: 0.5, pickup: 0.6, doorOpen: 0.7,
      }

      if (!srcs[key]) return null
      const el     = new Audio(srcs[key])
      el.loop      = loops[key]  ?? false
      el.volume    = vols[key]   ?? 0.5
      this.elements[key] = el
    }
    return this.elements[key]
  }

  // Call this whenever musicOn changes in the store
  setEnabled(val) {
    this.enabled = val
    if (!val) {
      // Pause current bg but remember what it was
      if (this.currentBg) {
        const el = this._get(this.currentBg)
        el?.pause()
      }
    } else {
      // Resume the current bg track
      if (this.currentBg) {
        const el = this._get(this.currentBg)
        if (el) {
          el.currentTime = 0
          el.play().catch(() => {})
        }
      }
    }
  }

  playBg(key) {
    // Always track what SHOULD be playing
    this._pendingBg = key

    // Stop previous
    if (this.currentBg && this.currentBg !== key) {
      const prev = this._get(this.currentBg)
      if (prev) { prev.pause(); prev.currentTime = 0 }
    }

    this.currentBg = key

    if (!this.enabled) return   // remember the key but don't play yet

    const el = this._get(key)
    if (el) {
      el.currentTime = 0
      el.play().catch(() => {})
    }
  }

  stopBg() {
    if (this.currentBg) {
      const el = this._get(this.currentBg)
      if (el) { el.pause(); el.currentTime = 0 }
    }
    this.currentBg  = null
    this._pendingBg = null
  }

  playSfx(key) {
    if (!this.enabled) return
    const el = this._get(key)
    if (!el) return
    // Clone for overlapping sfx
    const clone = el.cloneNode()
    clone.volume = el.volume
    clone.play().catch(() => {})
  }

  playWin() {
    this.stopBg()
    if (!this.enabled) return
    const song = this._get('winSong')
    if (!song) return
    song.currentTime = 0
    song.play().catch(() => {})
    song.onended = () => {
      if (this.winPlayed) return
      this.winPlayed = true
      const yay = this._get('fanfYay')
      if (yay) { yay.currentTime = 0; yay.play().catch(() => {}) }
    }
  }

  reset() {
    this.winPlayed  = false
    this.currentBg  = null
    this._pendingBg = null
  }
}

const audioManager = new AudioManager()
export default audioManager