import { create } from 'zustand'

const useGameStore = create((set) => ({
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
  screen: 'title',        // 'title' | 'game' | 'win'
  setScreen: (screen) => set({ screen }),

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
}))

export default useGameStore