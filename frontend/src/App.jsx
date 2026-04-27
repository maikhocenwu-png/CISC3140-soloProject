import TitleScreen from './screens/TitleScreen'
import GameScreen from './screens/GameScreen'
import WinScreen from './screens/WinScreen'
import useGameStore from './store/gameStore'

export default function App() {
  const screen = useGameStore((state) => state.screen)

  return (
    <>
      {screen === 'title' && <TitleScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'win' && <WinScreen />}
    </>
  )
}