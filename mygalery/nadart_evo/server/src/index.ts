import 'dotenv/config'
import app from './app.js'
import { initializeDatabase } from './db/database.js'

const PORT = process.env.PORT || 3000

// Initialize database
initializeDatabase()

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
