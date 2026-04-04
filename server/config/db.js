import mongoose from 'mongoose'
import { env } from './env.js'

export const isDbConnected = () => mongoose.connection.readyState === 1

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI)
    console.log(`  ✅ MongoDB connected: ${conn.connection.host}`)
    return true
  } catch (err) {
    console.error(`  ❌ MongoDB connection error: ${err.message}`)
    if (env.ALLOW_DB_OPTIONAL) {
      console.warn('  ⚠️  Continuing in offline mode (ALLOW_DB_OPTIONAL=true)')
      return false
    }
    throw err
  }
}
