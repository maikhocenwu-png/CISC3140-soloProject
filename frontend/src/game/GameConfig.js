import { AUTO } from 'phaser'
import Room1Scene from './scenes/Room1Scene'
import Room2Scene from './scenes/Room2Scene'

export const GameConfig = {
  type: AUTO,
  width: 800,
  height: 500,
  backgroundColor: '#0a0805',
  scene: [Room1Scene, Room2Scene],
}