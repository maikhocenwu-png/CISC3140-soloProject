const cors = require('cors')

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}

module.exports = cors(corsOptions)