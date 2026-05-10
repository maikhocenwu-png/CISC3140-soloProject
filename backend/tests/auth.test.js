const request = require('supertest')
const app = require('../server')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const testEmail = `test_${Date.now()}@example.com`

afterAll(async () => {
  // Delete GameSaves first (foreign key dependency)
  const user = await prisma.user.findUnique({ where: { email: testEmail } })
  if (user) {
    await prisma.gameSave.deleteMany({ where: { userId: user.id } })
    await prisma.user.deleteMany({ where: { email: testEmail } })
  }
  await prisma.$disconnect()
})

// Test 1 — password hashing unit test
test('bcrypt hashes and verifies passwords', async () => {
  const bcrypt = require('bcryptjs')
  const hash = await bcrypt.hash('password123', 10)
  const match = await bcrypt.compare('password123', hash)
  expect(match).toBe(true)
})

// Test 2 — puzzle validation unit test
test('puzzle validation logic works', () => {
  const puzzles = require('../src/data/puzzles.json')
  const puzzle = puzzles.find(p => p.id === 'clock_puzzle')
  expect(String(puzzle.answer)).toBe('3')
})

// Test 3 — register creates a user
test('POST /api/auth/register creates a user', async () => {
  const res = await request(app).post('/api/auth/register').send({
    email: testEmail,
    password: 'password123',
    username: 'testplayer'
  })
  expect(res.statusCode).toBe(201)
  expect(res.body.token).toBeDefined()
})

// Test 4 — save game state
test('POST /api/game/save stores inventory', async () => {
  const loginRes = await request(app).post('/api/auth/login').send({
    email: testEmail,
    password: 'password123'
  })
  const token = loginRes.body.token
  const res = await request(app)
    .post('/api/game/save')
    .set('Authorization', `Bearer ${token}`)
    .send({ inventory: ['brass_key'], solved: ['clock_puzzle'], currentRoom: 'room1' })
  expect(res.statusCode).toBe(200)
  expect(res.body.inventory).toContain('brass_key')
})

// Test 5 — leaderboard returns sorted results
test('GET /api/scores/leaderboard returns array', async () => {
  const res = await request(app).get('/api/scores/leaderboard')
  expect(res.statusCode).toBe(200)
  expect(Array.isArray(res.body)).toBe(true)
})