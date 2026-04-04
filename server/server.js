import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { connectDB, isDbConnected } from './config/db.js'
import { env } from './config/env.js'
import authRoutes from './routes/auth.js'
import resumeRoutes from './routes/resume.js'
import jobRoutes from './routes/job.js'
import analyticsRoutes from './routes/analytics.js'

dotenv.config()
const app = express()
const PORT = env.PORT

// Security middleware
app.use(helmet())
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 })
app.use('/api/', limiter)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/resumes', resumeRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  const db = isDbConnected() ? 'connected' : 'disconnected'
  const status = db === 'connected' || env.ALLOW_DB_OPTIONAL ? 'ok' : 'degraded'
  res.json({ status, db, timestamp: new Date().toISOString(), version: '1.0.0' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  })
})

// Start server
const start = async () => {
  try {
    const connected = await connectDB()
    app.listen(PORT, () => {
      console.log(`\n  🚀 ResumeAI API running on http://localhost:${PORT}`)
      console.log(`  📦 Environment: ${env.NODE_ENV}\n`)
      if (!connected) {
        console.log('  ⚠️  API started without MongoDB. DB-backed routes will return 503.')
      }
    })
  } catch (error) {
    console.error('Startup failed:', error.message)
    process.exit(1)
  }
}

start()
