import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Resume' },
  template: { type: String, default: 'modern-pro' },
  status: { type: String, enum: ['draft', 'generated', 'exported'], default: 'draft' },

  // Personal Info
  personal: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    summary: { type: String, default: '' },
  },

  // Education
  education: [{
    degree: String,
    institution: String,
    year: String,
    gpa: String,
    coursework: String,
  }],

  // Experience
  experience: [{
    title: String,
    company: String,
    duration: String,
    location: String,
    responsibilities: [String],
    aiEnhanced: { type: Boolean, default: false },
  }],

  // Skills
  skills: {
    technical: [String],
    tools: [String],
    soft: [String],
  },

  // AI Generation
  aiGenerated: {
    summary: { type: String, default: '' },
    bulletPoints: [String],
    keywords: [String],
    generatedAt: Date,
  },

  // ATS Score
  atsScore: {
    overall: { type: Number, default: 0 },
    keywordDensity: { type: Number, default: 0 },
    formatScore: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
    lastScanned: Date,
    issues: [{
      severity: { type: String, enum: ['critical', 'warning', 'info'] },
      message: String,
      suggestion: String,
    }],
    platformScores: {
      naukri: { type: Number, default: 0 },
      linkedin: { type: Number, default: 0 },
      indeed: { type: Number, default: 0 },
      workday: { type: Number, default: 0 },
      greenhouse: { type: Number, default: 0 },
    },
  },

  // Metadata
  downloadCount: { type: Number, default: 0 },
  lastEdited: { type: Date, default: Date.now },
}, { timestamps: true })

resumeSchema.index({ user: 1, updatedAt: -1 })

export default mongoose.model('Resume', resumeSchema)
