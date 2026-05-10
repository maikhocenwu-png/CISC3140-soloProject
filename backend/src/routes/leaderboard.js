const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const auth = require('../middleware/auth')

// POST /api/scores — submit score
router.post('/', auth, async (req, res, next) => {
  try {
    const { timeSeconds, hints } = req.body
    const score = await prisma.score.create({
      data: { userId: req.user.userId, timeSeconds, hints }
    })
    res.status(201).json(score)
  } catch (err) { next(err) }
})

// GET /api/scores/leaderboard — top 10
router.get('/leaderboard', async (req, res, next) => {
  try {
    const scores = await prisma.score.findMany({
      take: 10,
      orderBy: { timeSeconds: 'asc' },
      include: { user: { select: { username: true } } }
    })
    res.json(scores)
  } catch (err) { next(err) }
})

module.exports = router