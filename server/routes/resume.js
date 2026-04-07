import { Router } from 'express'
import Resume from '../models/Resume.js'
import { protect } from '../middleware/auth.js'
import {
  generateResumeSummary,
  analyzeATS,
  suggestSkills,
  generateResumeContent,
  generateCoverLetter,
  tailorResumeForJob,
} from '../services/ai.js'

const router = Router()

function normalizeResumePayload(body = {}) {
  return {
    title: String(body.title || 'Untitled Resume').trim(),
    template: String(body.template || 'modern-pro').trim(),
    status: body.status || 'draft',
    personal: {
      name: String(body.personal?.name || '').trim(),
      email: String(body.personal?.email || '').trim(),
      phone: String(body.personal?.phone || '').trim(),
      location: String(body.personal?.location || '').trim(),
      linkedin: String(body.personal?.linkedin || '').trim(),
      portfolio: String(body.personal?.portfolio || '').trim(),
      summary: String(body.personal?.summary || '').trim(),
    },
    education: Array.isArray(body.education) ? body.education : [],
    experience: Array.isArray(body.experience) ? body.experience : [],
    skills: body.skills || { technical: [], tools: [], soft: [] },
    projects: Array.isArray(body.projects) ? body.projects : [],
    certifications: Array.isArray(body.certifications) ? body.certifications : [],
    achievements: Array.isArray(body.achievements) ? body.achievements : [],
    aiGenerated: body.aiGenerated,
  }
}

function createSnapshot(resumeDoc) {
  return {
    title: resumeDoc.title,
    template: resumeDoc.template,
    status: resumeDoc.status,
    personal: resumeDoc.personal,
    education: resumeDoc.education,
    experience: resumeDoc.experience,
    skills: resumeDoc.skills,
    projects: resumeDoc.projects,
    certifications: resumeDoc.certifications,
    achievements: resumeDoc.achievements,
    aiGenerated: resumeDoc.aiGenerated,
    atsScore: resumeDoc.atsScore,
    lastEdited: resumeDoc.lastEdited,
  }
}

function appendVersion(resumeDoc, label = 'Saved Version') {
  const nextVersions = [
    {
      label,
      snapshot: createSnapshot(resumeDoc),
      createdAt: new Date(),
    },
    ...(Array.isArray(resumeDoc.versionHistory) ? resumeDoc.versionHistory : []),
  ].slice(0, 20)

  resumeDoc.versionHistory = nextVersions
}

// POST /api/resumes/generate-ai — Direct AI generation (no auth for demo)
router.post('/generate-ai', async (req, res) => {
  try {
    const result = await generateResumeContent(req.body)
    res.json({ success: true, generated: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/ats-scan-direct — Direct ATS scan without auth
router.post('/ats-scan-direct', async (req, res) => {
  try {
    const { resumeData, jobDescription } = req.body
    const fakeResume = {
      personal: resumeData?.personal || {},
      experience: resumeData?.experience || [],
      skills: resumeData?.skills || { technical: [], tools: [], soft: [] },
      education: resumeData?.education || [],
      projects: resumeData?.projects || [],
      certifications: resumeData?.certifications || [],
      achievements: resumeData?.achievements || [],
    }
    const result = await analyzeATS(fakeResume, jobDescription || '')
    res.json({ success: true, atsScore: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/match-direct — Direct job match without auth
router.post('/match-direct', async (req, res) => {
  try {
    const { jobDescription, skills } = req.body
    if (!jobDescription) return res.status(400).json({ success: false, message: 'Job description required' })
    const allSkills = skills || ['React', 'Node.js', 'JavaScript']
    const TECH_ALL = ['React', 'Angular', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Go', 'GraphQL', 'REST API', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Git', 'React Native', 'Flutter']
    const jdKeywords = TECH_ALL.filter(kw => jobDescription.toLowerCase().includes(kw.toLowerCase()))
    const matchedSkills = allSkills.filter(s => jdKeywords.some(kw => kw.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(kw.toLowerCase())))
    const missingSkills = jdKeywords.filter(kw => !allSkills.some(s => kw.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(kw.toLowerCase()))).slice(0, 8)
    const matchScore = Math.min(98, Math.round((matchedSkills.length / Math.max(jdKeywords.length, 1)) * 100) + 15)
    res.json({
      success: true,
      matchScore,
      matchedSkills,
      missingSkills,
      aiSuggestions: [
        `Add ${missingSkills.slice(0, 3).join(', ')} to your skills`,
        'Tailor your summary to the role',
        `Highlight ${matchedSkills.slice(0, 2).join(' and ')}`,
        'Include certifications',
      ],
      keywordAnalysis: jdKeywords.map(kw => ({ keyword: kw, found: matchedSkills.some(s => s.toLowerCase() === kw.toLowerCase()), importance: ['React', 'Python', 'AWS', 'Kubernetes', 'Node.js', 'TypeScript'].includes(kw) ? 'high' : 'medium' })),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/resumes
router.get('/', protect, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt')
    res.json({ success: true, count: resumes.length, resumes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/resumes/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, resume })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/resumes/:id/versions
router.get('/:id/versions', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id }).select('versionHistory updatedAt')
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, versions: resume.versionHistory || [], updatedAt: resume.updatedAt })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes
router.post('/', protect, async (req, res) => {
  try {
    const payload = normalizeResumePayload(req.body)
    if (!payload.personal.name || !payload.personal.email) {
      return res.status(400).json({ success: false, message: 'Name and email are required in personal details' })
    }

    const resume = await Resume.create({ user: req.user._id, ...payload, lastEdited: new Date() })
    appendVersion(resume, 'Initial Draft')
    await resume.save()
    res.status(201).json({ success: true, resume })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/resumes/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })

    appendVersion(resume, 'Before Manual Update')
    const payload = normalizeResumePayload({ ...resume.toObject(), ...req.body })
    Object.assign(resume, payload, { lastEdited: new Date() })

    await resume.save()
    res.json({ success: true, resume })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/restore/:versionId
router.post('/:id/restore/:versionId', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })

    const version = (resume.versionHistory || []).find((entry) => String(entry._id) === req.params.versionId)
    if (!version?.snapshot) {
      return res.status(404).json({ success: false, message: 'Version not found' })
    }

    appendVersion(resume, 'Before Restore')
    Object.assign(resume, normalizeResumePayload(version.snapshot), { lastEdited: new Date() })
    await resume.save()

    res.json({ success: true, resume, restoredVersionId: req.params.versionId })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/resumes/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({ success: true, message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/generate
router.post('/:id/generate', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })

    appendVersion(resume, 'Before AI Generate')
    const ai = await generateResumeSummary(resume)
    resume.aiGenerated = { summary: ai.summary, bulletPoints: ai.bulletPoints, keywords: ai.keywords, generatedAt: new Date() }
    resume.status = 'generated'
    await resume.save()
    res.json({ success: true, resume })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/tailor
router.post('/:id/tailor', protect, async (req, res) => {
  try {
    const { jobDescription } = req.body
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description is required' })
    }

    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })

    appendVersion(resume, 'Before Tailor')
    const tailored = await tailorResumeForJob({ resume, jobDescription })
    const merged = normalizeResumePayload({ ...resume.toObject(), ...tailored.tailoredResume })
    Object.assign(resume, merged, { status: 'generated', lastEdited: new Date() })
    resume.aiGenerated = {
      ...(resume.aiGenerated || {}),
      summary: merged.personal.summary || resume.aiGenerated?.summary || '',
      generatedAt: new Date(),
    }
    await resume.save()

    res.json({
      success: true,
      resume,
      tailoring: {
        matchScore: tailored.matchScore,
        missingSkills: tailored.missingSkills,
        matchedSkills: tailored.matchedSkills,
        suggestions: tailored.suggestions,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/cover-letter
router.post('/:id/cover-letter', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })

    const { jobDescription, company, role } = req.body
    const result = await generateCoverLetter({ resume, jobDescription, company, role })
    res.json({ success: true, coverLetter: result })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/ats-scan
router.post('/:id/ats-scan', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    const ats = await analyzeATS(resume, req.body.jobDescription)
    resume.atsScore = { ...ats, lastScanned: new Date() }
    await resume.save()
    res.json({ success: true, atsScore: resume.atsScore })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/resumes/:id/suggest-skills
router.post('/:id/suggest-skills', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    const suggestions = await suggestSkills(resume, req.body.targetRole)
    res.json({ success: true, suggestions })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

export default router
