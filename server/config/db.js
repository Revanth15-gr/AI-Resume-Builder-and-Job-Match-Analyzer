import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`  ✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`  ❌ MongoDB connection error: ${err.message}`)
    // Don't crash — allow the app to run with mock data if no DB
    console.log('  ⚠️  Running without database — API will return mock data')
  }
}
