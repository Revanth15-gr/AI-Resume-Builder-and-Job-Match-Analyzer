import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  currentRole: { type: String, default: '' },
  targetRole: { type: String, default: '' },
  targetCompanies: [String],
  experienceLevel: { type: String, enum: ['junior', 'mid', 'senior'], default: 'mid' },
  workMode: { type: String, enum: ['remote', 'hybrid', 'onsite'], default: 'hybrid' },
  avatar: { type: String, default: '' },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  preferences: {
    notifications: {
      jobMatches: { type: Boolean, default: true },
      atsAlerts: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    theme: { type: String, default: 'emerald' },
    language: { type: String, default: 'en-IN' },
  },
}, { timestamps: true })

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Remove password from JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

export default mongoose.model('User', userSchema)
