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

  const [answer, setAnswer]             = useState('')
  const [feedback, setFeedback]         = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [loading, setLoading]           = useState(false)
  const [showHint, setShowHint]         = useState(false)

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

  const handleGiveAnswer = async () => {
  try {
    const res = await client.post('/api/game/puzzles/reveal', {
      puzzleId: activePuzzle.id,
    })
    setAnswer(String(res.data.answer))
    useHint() // costs a hint
  } catch {
    setFeedback('Could not fetch answer.')
    setFeedbackType('error')
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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.85)',
      pointerEvents: 'auto',
    }}>
      <div style={{
        width: 380,
        background: '#120f0a',
        border: '1px solid #3a2f1e',
        borderRadius: 10,
        padding: 32,
        position: 'relative',
        pointerEvents: 'auto',
      }}>
        {/* Close */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: 12, right: 14,
            background: 'none', border: 'none',
            color: '#6b5a3e', fontSize: 18, cursor: 'pointer',
            lineHeight: 1,
          }}>
          ✕
        </button>

        {/* Title */}
        <h2 style={{
          color: '#c9a84c', fontFamily: 'Georgia, serif',
          fontSize: 18, textAlign: 'center', marginBottom: 8,
        }}>
          {activePuzzle.title}
        </h2>

        {/* Description */}
        <p style={{
          color: '#8b7a5e', fontFamily: 'Georgia, serif',
          fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 1.6,
        }}>
          {activePuzzle.description}
        </p>

        {/* Answer input */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="text"
            placeholder={activePuzzle.placeholder || 'Enter your answer...'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '8px 16px',
              borderRadius: 6, border: '1px solid #3a2f1e',
              background: '#1e1810', color: '#e8e0d0',
              fontSize: 14, textAlign: 'center',
              letterSpacing: '0.1em', outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          {feedback && (
            <p style={{
              fontSize: 12, textAlign: 'center', padding: '6px 12px',
              borderRadius: 6,
              background: feedbackType === 'success' ? '#0d1a0c' : '#2a1010',
              color: feedbackType === 'success' ? '#6dbf67' : '#e05555',
              border: `1px solid ${feedbackType === 'success' ? '#2a4a28' : '#5a2020'}`,
            }}>
              {feedback}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '8px 0',
              borderRadius: 6, border: 'none',
              background: '#c9a84c', color: '#0a0a0a',
              fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? 'Checking...' : 'Submit Answer'}
          </button>
        </form>

        {/* Hint + Give Answer row */}
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleHint}
            style={{
              background: 'none', border: 'none',
              color: '#4a3a2a', fontSize: 11,
              cursor: 'pointer', textDecoration: 'underline',
            }}>
            {showHint ? '💡 ' + activePuzzle.hint : 'Show hint'}
          </button>
          <button
            onClick={handleGiveAnswer}
            style={{
              background: 'none', border: '1px solid #3a2010',
              color: '#8b4a1a', fontSize: 11, borderRadius: 4,
              padding: '2px 8px', cursor: 'pointer',
            }}>
            Give me the answer
          </button>
        </div>
      </div>
    </div>
  )
}