require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const morgan = require('morgan')
const corsMiddleware = require('./src/middleware/cors')
const errorHandler = require('./src/middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3000

app.use(helmet())
app.use(corsMiddleware)
app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth', require('./src/routes/auth'))
app.use('/api/game', require('./src/routes/gameStates'))
app.use('/api/scores', require('./src/routes/leaderboard'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use(errorHandler)

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

module.exports = app