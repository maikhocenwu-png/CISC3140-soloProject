import * as Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene', active: false })
  }

  showMessage(text, duration = 2500) {
    const box = this.add.rectangle(400, 460, 500, 36, 0x1e1810)
      .setStrokeStyle(1, 0x3a2f1e)
    const label = this.add.text(400, 460, text, {
      fontSize: '13px',
      color: '#c9a84c',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5)
    this.time.delayedCall(duration, () => {
      box.destroy()
      label.destroy()
    })
  }
}