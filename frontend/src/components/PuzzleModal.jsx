import { useState } from 'react'
import useGameStore from '../store/gameStore'
import client from '../api/client'

export default function PuzzleModal() {
  const activePuzzle = useGameStore((state) => state.activePuzzle)
  const closePuzzle  = useGameStore((state) => state.closePuzzle)
  const inventory    = useGameStore((state) => state.inventory)
  const addItem      = useGameStore((state) => state.addItem)
  const solvePuzzle  = useGameStore((state) => state.solvePuzzle)
  const useHint      = useGameStore((state) => state.useHint)

  const [answer, setAnswer]         = useState('')
  const [feedback, setFeedback]     = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [loading, setLoading]       = useState(false)
  const [showHint, setShowHint]     = useState(false)

  if (!activePuzzle) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!answer.trim()) return
    setLoading(true)
    setFeedback('')

    try {
      const res = await client.post('/api/game/puzzles/check', {
        puzzleId: activePuzzle.id,
        answer: answer.trim(),
        inventory,
      })

      if (res.data.success) {
        setFeedbackType('success')
        setFeedback('Correct!')
        solvePuzzle(activePuzzle.id)
        if (res.data.reward) addItem(res.data.reward)
        setTimeout(() => {
          closePuzzle()
          setAnswer('')
          setFeedback('')
          setShowHint(false)
          window.dispatchEvent(new CustomEvent('puzzleSolved', {
            detail: { puzzleId: activePuzzle.id, reward: res.data.reward }
          }))
        }, 1200)
      } else {
        setFeedbackType('error')
        setFeedback(res.data.message || 'Wrong answer, try again')
      }
    } catch {
      setFeedbackType('error')
      setFeedback('Could not reach server. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleHint = () => {
    setShowHint(true)
    useHint()
  }

  const handleClose = () => {
    closePuzzle()
    setAnswer('')
    setFeedback('')
    setShowHint(false)
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-96 rounded-lg border p-8 relative"
        style={{ background: '#120f0a', borderColor: '#3a2f1e' }}>

        <button onClick={handleClose}
          className="absolute top-4 right-4 text-xs"
          style={{ color: '#3a2f1e' }}>✕</button>

        <h2 className="text-lg mb-2 text-center"
          style={{ color: '#c9a84c', fontFamily: 'Georgia, serif' }}>
          {activePuzzle.title}
        </h2>

        <p className="text-sm text-center mb-6"
          style={{ color: '#8b7a5e', fontFamily: 'Georgia, serif' }}>
          {activePuzzle.description}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder={activePuzzle.placeholder || 'Enter your answer...'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
            className="w-full px-4 py-2 rounded text-sm text-center outline-none tracking-widest"
            style={{ background: '#1e1810', border: '1px solid #3a2f1e', color: '#e8e0d0' }}
          />

          {feedback && (
            <p className="text-xs text-center py-2 px-3 rounded"
              style={{
                background: feedbackType === 'success' ? '#0d1a0c' : '#2a1010',
                color: feedbackType === 'success' ? '#6dbf67' : '#e05555',
                border: `1px solid ${feedbackType === 'success' ? '#2a4a28' : '#5a2020'}`
              }}>
              {feedback}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2 rounded text-sm"
            style={{ background: '#c9a84c', color: '#0a0a0a', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Checking...' : 'Submit Answer'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {!showHint
            ? <button onClick={handleHint} className="text-xs underline" style={{ color: '#3a2f1e' }}>
                Use a hint (costs 1 hint)
              </button>
            : <p className="text-xs italic" style={{ color: '#6b5a3e', fontFamily: 'Georgia, serif' }}>
                💡 {activePuzzle.hint}
              </p>
          }
        </div>
      </div>
    </div>
  )
}