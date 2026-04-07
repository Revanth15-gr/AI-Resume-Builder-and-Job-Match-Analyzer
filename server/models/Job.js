import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, default: '' },
  url: { type: String, default: '' },
  salary: { type: String, default: '' },
  description: { type: String, default: '' },

  // Tracking
  stage: {
    type: String,
    enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
    default: 'saved',
  },
  appliedDate: Date,
  interviewDate: Date,
  notes: { type: String, default: '' },

  // Match Analysis
  matchScore: { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  aiSuggestions: [String],
  keywordAnalysis: [{
    keyword: String,
    found: Boolean,
    importance: { type: String, enum: ['high', 'medium', 'low'] },
  }],
  learningResources: [{
    skill: String,
    links: [{
      platform: String,
      url: String,
    }],
  }],
}, { timestamps: true })

jobSchema.index({ user: 1, stage: 1 })
jobSchema.index({ user: 1, matchScore: -1 })

export default mongoose.model('Job', jobSchema)
