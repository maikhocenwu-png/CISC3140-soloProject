const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const auth = require('../middleware/auth')

// GET /api/game/save — load progress
router.get('/save', auth, async (req, res, next) => {
  try {
    const save = await prisma.gameSave.findUnique({
      where: { userId: req.user.userId }
    })
    res.json(save || { inventory: [], solved: [], currentRoom: 'room1' })
  } catch (err) { next(err) }
})

// POST /api/game/save — save progress
router.post('/save', auth, async (req, res, next) => {
  try {
    const { inventory, solved, currentRoom } = req.body
    const save = await prisma.gameSave.upsert({
      where: { userId: req.user.userId },
      update: { inventory, solved, currentRoom },
      create: { userId: req.user.userId, inventory, solved, currentRoom }
    })
    res.json(save)
  } catch (err) { next(err) }
})

// DELETE /api/game/save — reset progress
router.delete('/save', auth, async (req, res, next) => {
  try {
    await prisma.gameSave.deleteMany({ where: { userId: req.user.userId } })
    res.json({ message: 'Progress reset' })
  } catch (err) { next(err) }
})

// POST /api/game/puzzles/check — validate answer
router.post('/puzzles/check', auth, (req, res) => {
  const puzzles = require('../data/puzzles.json')
  const { puzzleId, answer, inventory } = req.body
  const puzzle = puzzles.find(p => p.id === puzzleId)
  if (!puzzle) return res.status(404).json({ message: 'Puzzle not found' })
  if (puzzle.requiredItem && !inventory.includes(puzzle.requiredItem)) {
    return res.json({ success: false, message: `You need the ${puzzle.requiredItem} first` })
  }
  const correct = String(puzzle.answer).toLowerCase() === String(answer).toLowerCase()
  res.json({ success: correct, reward: correct ? puzzle.reward : null, message: correct ? 'Correct!' : 'Wrong answer, try again' })
})

module.exports = router