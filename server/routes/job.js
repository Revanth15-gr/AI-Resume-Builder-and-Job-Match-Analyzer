import { Router } from 'express'
import Job from '../models/Job.js'
import User from '../models/User.js'
import Resume from '../models/Resume.js'
import { protect } from '../middleware/auth.js'
import { analyzeJobMatch } from '../services/ai.js'

const router = Router()

const RESOURCE_TEMPLATES = {
  Coursera: 'https://www.coursera.org/search?query=',
  Udemy: 'https://www.udemy.com/courses/search/?q=',
  YouTube: 'https://www.youtube.com/results?search_query=',
  LeetCode: 'https://leetcode.com/problemset/?search=',
}

const buildLearningResources = (missingSkills = []) => {
  return missingSkills.slice(0, 6).map((skill) => ({
    skill,
    links: Object.entries(RESOURCE_TEMPLATES).map(([platform, base]) => ({
      platform,
      url: `${base}${encodeURIComponent(skill)}`,
    })),
  }))
}

const enrichWithAnalysis = async (jobPayload, userId, resumeId = null, resumeData = null) => {
  if (!jobPayload.description?.trim()) {
    return {
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
      aiSuggestions: [],
      keywordAnalysis: [],
      learningResources: [],
    }
  }

  const analyzed = await analyzeJobMatch(jobPayload.description, userId, resumeId, resumeData)
  return {
    matchScore: analyzed.matchScore || 0,
    matchedSkills: analyzed.matchedSkills || [],
    missingSkills: analyzed.missingSkills || [],
    aiSuggestions: analyzed.aiSuggestions || [],
    keywordAnalysis: analyzed.keywordAnalysis || [],
    learningResources: buildLearningResources(analyzed.missingSkills || []),
  }
}

// GET /api/jobs — list user's tracked jobs
router.get('/', protect, async (req, res) => {
  try {
    const { stage } = req.query
    const filter = { user: req.user._id }
    if (stage) filter.stage = stage

    const jobs = await Job.find(filter).sort('-updatedAt')
    res.json({ success: true, count: jobs.length, jobs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/jobs/analyze — analyze job match against resume
router.post('/analyze', protect, async (req, res) => {
  try {
    const { jobDescription, resumeId, resumeData } = req.body

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' })
    }

    const result = await analyzeJobMatch(jobDescription, req.user._id, resumeId, resumeData)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/jobs/stats — get job tracker stats
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { user: req.user._id } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ])

    const formatted = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
    stats.forEach(s => { formatted[s._id] = s.count })

    res.json({ success: true, stats: formatted, total: Object.values(formatted).reduce((a, b) => a + b, 0) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/jobs/recommendations — lightweight role recommendations from profile + resume
router.get('/recommendations', protect, async (req, res) => {
  try {
    const [user, latestResume] = await Promise.all([
      User.findById(req.user._id),
      Resume.findOne({ user: req.user._id }).sort('-updatedAt'),
    ])

    const currentRole = String(user?.currentRole || '').trim()
    const targetRole = String(user?.targetRole || '').trim()
    const skills = [
      ...(latestResume?.skills?.technical || []),
      ...(latestResume?.skills?.tools || []),
      ...(latestResume?.skills?.soft || []),
    ].filter(Boolean)

    const baseRoles = [
      { title: 'Frontend Developer', requiredSkills: ['React', 'TypeScript', 'Redux', 'CSS3'] },
      { title: 'Backend Developer', requiredSkills: ['Node.js', 'Express', 'MongoDB', 'REST API'] },
      { title: 'Full Stack Developer', requiredSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'] },
      { title: 'Data Analyst', requiredSkills: ['Python', 'SQL', 'Pandas', 'Visualization'] },
      { title: 'DevOps Engineer', requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'] },
    ]

    const prioritized = baseRoles
      .map((role) => {
        const matched = role.requiredSkills.filter((entry) => skills.some((skill) => String(skill).toLowerCase() === entry.toLowerCase()))
        const missing = role.requiredSkills.filter((entry) => !matched.includes(entry))
        const profileBoost = targetRole && role.title.toLowerCase().includes(targetRole.toLowerCase()) ? 15 : 0
        const currentBoost = currentRole && role.title.toLowerCase().includes(currentRole.toLowerCase()) ? 8 : 0
        const score = Math.min(99, Math.round((matched.length / role.requiredSkills.length) * 100) + profileBoost + currentBoost)
        return { ...role, matchScore: score, matchedSkills: matched, missingSkills: missing }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    res.json({ success: true, recommendations: prioritized })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/jobs — add job to tracker
router.post('/', protect, async (req, res) => {
  try {
    const payload = {
      title: String(req.body.title || '').trim(),
      company: String(req.body.company || '').trim(),
      location: String(req.body.location || '').trim(),
      url: String(req.body.url || '').trim(),
      salary: String(req.body.salary || '').trim(),
      description: String(req.body.description || '').trim(),
      stage: req.body.stage || 'saved',
      notes: String(req.body.notes || '').trim(),
      appliedDate: req.body.appliedDate || null,
      interviewDate: req.body.interviewDate || null,
    }

    if (!payload.title || !payload.company) {
      return res.status(400).json({ success: false, message: 'Title and company are required' })
    }

    if (payload.stage === 'applied' && !payload.appliedDate) payload.appliedDate = new Date()
    if (payload.stage === 'interview' && !payload.interviewDate) payload.interviewDate = new Date()

    const analysis = await enrichWithAnalysis(payload, req.user._id, req.body.resumeId, req.body.resumeData)
    const job = await Job.create({ user: req.user._id, ...payload, ...analysis })

    res.status(201).json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/jobs/:id — fetch single job details
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
    res.json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/jobs/:id — update job (change stage, add notes, etc)
router.put('/:id', protect, async (req, res) => {
  try {
    const current = await Job.findOne({ _id: req.params.id, user: req.user._id })
    if (!current) return res.status(404).json({ success: false, message: 'Job not found' })

    const allowed = ['title', 'company', 'location', 'url', 'salary', 'description', 'stage', 'notes', 'appliedDate', 'interviewDate']
    const updates = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    if (updates.stage === 'applied' && !updates.appliedDate && !current.appliedDate) updates.appliedDate = new Date()
    if (updates.stage === 'interview' && !updates.interviewDate && !current.interviewDate) updates.interviewDate = new Date()

    const needsAnalysis = typeof updates.description === 'string'
      ? updates.description.trim() !== String(current.description || '').trim()
      : false

    if (needsAnalysis) {
      const analysis = await enrichWithAnalysis({ ...current.toObject(), ...updates }, req.user._id, req.body.resumeId, req.body.resumeData)
      Object.assign(updates, analysis)
    }

    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    )

    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
    res.json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/jobs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' })
    res.json({ success: true, message: 'Job removed' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
