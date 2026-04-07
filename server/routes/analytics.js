import { Router } from 'express'
import Resume from '../models/Resume.js'
import Job from '../models/Job.js'
import { protect } from '../middleware/auth.js'
import { analyzeJobMatch } from '../services/ai.js'

const router = Router()

// GET /api/analytics/dashboard — dashboard summary
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id

    // Get latest resume ATS score
    const latestResume = await Resume.findOne({ user: userId }).sort('-updatedAt')
    const resumeScore = latestResume?.atsScore?.overall || 0

    // Get job stats
    const jobStats = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ])

    const jobs = { saved: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
    jobStats.forEach(s => { jobs[s._id] = s.count })
    const totalJobs = Object.values(jobs).reduce((a, b) => a + b, 0)

    // Top matches
    const topMatches = await Job.find({ user: userId, matchScore: { $gt: 0 } })
      .sort('-matchScore')
      .limit(5)
      .select('title company matchScore')

    // Resume count  
    const resumeCount = await Resume.countDocuments({ user: userId })

    res.json({
      success: true,
      dashboard: {
        resumeScore,
        jobMatches: totalJobs,
        applications: jobs.applied + jobs.interview + jobs.offer,
        interviews: jobs.interview,
        offers: jobs.offer,
        resumeCount,
        topMatches,
        stageBreakdown: jobs,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/analytics/score-history — ATS score over time (mock + real)
router.get('/score-history', protect, async (req, res) => {
  try {
    // In production, you'd store score history in a separate collection
    // For now, generate a realistic trend based on current score
    const latestResume = await Resume.findOne({ user: req.user._id }).sort('-updatedAt')
    const currentScore = latestResume?.atsScore?.overall || 75

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const history = days.map((day, i) => ({
      day,
      score: Math.max(50, Math.min(100, currentScore - (6 - i) * 3 + Math.floor(Math.random() * 5))),
    }))

    res.json({ success: true, history })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/analytics/skill-gaps — skill gap analysis
router.get('/skill-gaps', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const latestResume = await Resume.findOne({ user: userId }).sort('-updatedAt')

    // Backfill older jobs that do not have analyzed missing skills yet.
    const jobsNeedingAnalysis = await Job.find({
      user: userId,
      description: { $exists: true, $ne: '' },
      $or: [
        { missingSkills: { $exists: false } },
        { missingSkills: { $size: 0 } },
      ],
    }).limit(20)

    if (latestResume && jobsNeedingAnalysis.length) {
      for (const job of jobsNeedingAnalysis) {
        try {
          const analyzed = await analyzeJobMatch(job.description, userId, latestResume._id)
          job.matchScore = analyzed.matchScore || 0
          job.matchedSkills = analyzed.matchedSkills || []
          job.missingSkills = analyzed.missingSkills || []
          job.aiSuggestions = analyzed.aiSuggestions || []
          job.keywordAnalysis = analyzed.keywordAnalysis || []
          await job.save()
        } catch (_error) {
          // Skip a single failed analysis and continue processing others.
        }
      }
    }

    const jobs = await Job.find({ user: userId, missingSkills: { $exists: true, $ne: [] } })
    
    // Aggregate missing skills across all tracked jobs
    const skillCount = {}
    jobs.forEach(job => {
      job.missingSkills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1
      })
    })

    const gaps = Object.entries(skillCount)
      .map(([skill, count]) => ({ skill, frequency: count, importance: count > 3 ? 'high' : count > 1 ? 'medium' : 'low' }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10)

    res.json({ success: true, gaps, sources: jobs.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/analytics/insights — resume + job match insights for dashboard analytics page
router.get('/insights', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const latestResume = await Resume.findOne({ user: userId }).sort('-updatedAt')
    const jobs = await Job.find({ user: userId }).sort('-updatedAt').limit(30)

    const resumeSkills = [
      ...(latestResume?.skills?.technical || []),
      ...(latestResume?.skills?.tools || []),
      ...(latestResume?.skills?.soft || []),
    ]

    const uniqueResumeSkills = Array.from(new Set(resumeSkills.map((skill) => String(skill).trim()).filter(Boolean)))
    const jobMissingSkillSet = new Set()
    const jobMatchedSkillSet = new Set()

    jobs.forEach((job) => {
      ;(job.missingSkills || []).forEach((skill) => jobMissingSkillSet.add(String(skill).trim()))
      ;(job.matchedSkills || []).forEach((skill) => jobMatchedSkillSet.add(String(skill).trim()))
    })

    const totalReferencedSkills = new Set([...jobMissingSkillSet, ...jobMatchedSkillSet])
    const skillMatchPercentage = totalReferencedSkills.size
      ? Math.round((jobMatchedSkillSet.size / totalReferencedSkills.size) * 100)
      : 0

    const filledSections = [
      latestResume?.personal?.summary,
      latestResume?.experience?.length,
      latestResume?.education?.length,
      uniqueResumeSkills.length,
      latestResume?.projects?.length,
      latestResume?.certifications?.length,
    ].filter(Boolean).length

    const resumeStrengthScore = latestResume?.atsScore?.overall
      ? Math.round((latestResume.atsScore.overall * 0.7) + ((filledSections / 6) * 30))
      : Math.round((filledSections / 6) * 100)

    const matchTrend = jobs
      .filter((job) => typeof job.matchScore === 'number' && job.matchScore > 0)
      .slice(0, 12)
      .reverse()
      .map((job) => ({
        label: new Date(job.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        score: job.matchScore,
        company: job.company,
      }))

    const missingSkills = Array.from(jobMissingSkillSet)
      .filter(Boolean)
      .slice(0, 12)

    res.json({
      success: true,
      insights: {
        skillMatchPercentage,
        resumeStrengthScore: Math.min(100, Math.max(0, resumeStrengthScore)),
        missingSkills,
        jobMatchTrend: matchTrend,
        resumeSkillCount: uniqueResumeSkills.length,
        atsScore: latestResume?.atsScore?.overall || 0,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
