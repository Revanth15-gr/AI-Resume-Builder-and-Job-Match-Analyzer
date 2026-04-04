import { Router } from 'express'
import Resume from '../models/Resume.js'
import { protect } from '../middleware/auth.js'
import { generateResumeSummary, analyzeATS, suggestSkills, generateResumeContent } from '../services/ai.js'

const router = Router()

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
    const TECH_ALL = ['React','Angular','Vue.js','Next.js','TypeScript','JavaScript','HTML5','CSS3','Tailwind CSS','Redux','Node.js','Express','Python','Django','FastAPI','Java','Spring Boot','Go','GraphQL','REST API','MongoDB','PostgreSQL','MySQL','Redis','Docker','Kubernetes','AWS','Azure','GCP','CI/CD','Git','React Native','Flutter']
    const jdKeywords = TECH_ALL.filter(kw => jobDescription.toLowerCase().includes(kw.toLowerCase()))
    const matchedSkills = allSkills.filter(s => jdKeywords.some(kw => kw.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(kw.toLowerCase())))
    const missingSkills = jdKeywords.filter(kw => !allSkills.some(s => kw.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(kw.toLowerCase()))).slice(0, 8)
    const matchScore = Math.min(98, Math.round((matchedSkills.length / Math.max(jdKeywords.length, 1)) * 100) + 15)
    res.json({ success: true, matchScore, matchedSkills, missingSkills,
      aiSuggestions: [`Add ${missingSkills.slice(0,3).join(', ')} to your skills`, 'Tailor your summary to the role', `Highlight ${matchedSkills.slice(0,2).join(' and ')}`, 'Include certifications'],
      keywordAnalysis: jdKeywords.map(kw => ({ keyword: kw, found: matchedSkills.some(s => s.toLowerCase() === kw.toLowerCase()), importance: ['React','Python','AWS','Kubernetes','Node.js','TypeScript'].includes(kw) ? 'high' : 'medium' })),
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/resumes
router.get('/', protect, async (req, res) => {
  try { const resumes = await Resume.find({ user: req.user._id }).sort('-updatedAt'); res.json({ success: true, count: resumes.length, resumes }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// GET /api/resumes/:id
router.get('/:id', protect, async (req, res) => {
  try { const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id }); if (!resume) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, resume }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// POST /api/resumes
router.post('/', protect, async (req, res) => {
  try { const resume = await Resume.create({ user: req.user._id, ...req.body }); res.status(201).json({ success: true, resume }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// PUT /api/resumes/:id
router.put('/:id', protect, async (req, res) => {
  try { const resume = await Resume.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { ...req.body, lastEdited: new Date() }, { new: true }); if (!resume) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, resume }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// DELETE /api/resumes/:id
router.delete('/:id', protect, async (req, res) => {
  try { const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id }); if (!resume) return res.status(404).json({ success: false, message: 'Not found' }); res.json({ success: true, message: 'Deleted' }) }
  catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// POST /api/resumes/:id/generate
router.post('/:id/generate', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    const ai = await generateResumeSummary(resume)
    resume.aiGenerated = { summary: ai.summary, bulletPoints: ai.bulletPoints, keywords: ai.keywords, generatedAt: new Date() }
    resume.status = 'generated'
    await resume.save()
    res.json({ success: true, resume })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
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
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

// POST /api/resumes/:id/suggest-skills
router.post('/:id/suggest-skills', protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id })
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' })
    const suggestions = await suggestSkills(resume, req.body.targetRole)
    res.json({ success: true, suggestions })
  } catch (err) { res.status(500).json({ success: false, message: err.message }) }
})

export default router
