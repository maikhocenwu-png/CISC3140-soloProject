import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // Auth
  token: null,
  username: null,
  setAuth: (token, username) => {
    sessionStorage.setItem('token', token)
    set({ token, username })
  },
  logout: () => {
    sessionStorage.removeItem('token')
    set({ token: null, username: null })
  },

  // Screen navigation
  screen: 'title',
  setScreen: (screen) => {
    if (screen === 'win') {
      window.dispatchEvent(new CustomEvent('gameWon'))
    }
    set({ screen })
  },

  // Game state
  inventory: [],
  solvedPuzzles: [],
  currentRoom: 'room1',
  hintsUsed: 0,
  startTime: null,

  addItem: (item) => set((state) => ({
    inventory: state.inventory.includes(item)
      ? state.inventory
      : [...state.inventory, item]
  })),

  solvePuzzle: (puzzleId) => set((state) => ({
    solvedPuzzles: state.solvedPuzzles.includes(puzzleId)
      ? state.solvedPuzzles
      : [...state.solvedPuzzles, puzzleId]
  })),

  useHint: () => set((state) => ({ hintsUsed: state.hintsUsed + 1 })),

  startGame: () => set({
    inventory: [],
    solvedPuzzles: [],
    currentRoom: 'room1',
    hintsUsed: 0,
    startTime: Date.now(),
  }),

  loadSave: (save) => set({
    inventory: save.inventory || [],
    solvedPuzzles: save.solved || [],
    currentRoom: save.currentRoom || 'room1',
  }),

  // Puzzle modal
  activePuzzle: null,
  openPuzzle: (puzzle) => set({ activePuzzle: puzzle }),
  closePuzzle: () => set({ activePuzzle: null }),

  // Music
  musicOn: true,
  toggleMusic: () => set((state) => ({ musicOn: !state.musicOn })),

  // Active inventory item (for image popup)
  activeInventoryItem: null,
  setActiveInventoryItem: (item) => set({ activeInventoryItem: item }),
}))

export default useGameStore