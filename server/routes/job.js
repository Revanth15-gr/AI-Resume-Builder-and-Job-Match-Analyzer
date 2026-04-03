import { Router } from 'express'
import Job from '../models/Job.js'
import { protect } from '../middleware/auth.js'
import { analyzeJobMatch } from '../services/ai.js'

const router = Router()

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

// POST /api/jobs — add job to tracker
router.post('/', protect, async (req, res) => {
  try {
    const job = await Job.create({ user: req.user._id, ...req.body })
    res.status(201).json({ success: true, job })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/jobs/:id — update job (change stage, add notes, etc)
router.put('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
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

// POST /api/jobs/analyze — analyze job match against resume
router.post('/analyze', protect, async (req, res) => {
  try {
    const { jobDescription, resumeId } = req.body

    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' })
    }

    const result = await analyzeJobMatch(jobDescription, req.user._id, resumeId)
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

export default router
