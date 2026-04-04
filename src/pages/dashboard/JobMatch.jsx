import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Sparkles, CheckCircle, XCircle, AlertCircle, Loader2, Copy, WandSparkles, Plus } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
import api from '../../lib/api'

export default function JobMatch() {
  const { user } = useAuth()
  const { notify } = useNotifications()
  const [jd, setJd] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [loadingResume, setLoadingResume] = useState(true)
  const [latestResume, setLatestResume] = useState(null)
  const [applying, setApplying] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadLatestResume() {
      try {
        const response = await api.getLatestResume()
        if (!mounted) return
        setLatestResume(response?.resume || null)
      } catch (_err) {
        if (mounted) setLatestResume(null)
      } finally {
        if (mounted) setLoadingResume(false)
      }
    }

    loadLatestResume()
    return () => {
      mounted = false
    }
  }, [])

  const resumePayload = useMemo(() => {
    const resume = latestResume || {}
    const personal = resume.personal || {
      name: resume.name || user?.name || '',
      email: resume.email || user?.email || '',
      phone: resume.phone || user?.phone || '',
      location: resume.location || user?.location || '',
      linkedin: resume.linkedin || '',
      portfolio: resume.portfolio || '',
      summary: resume.summary || user?.currentRole || '',
    }

    return {
      personal,
      education: Array.isArray(resume.education) ? resume.education : [],
      experience: Array.isArray(resume.experience) ? resume.experience : [],
      skills: resume.skills || { technical: [], tools: [], soft: [] },
    }
  }, [latestResume, user])

  const saveResume = async (updates) => {
    if (latestResume?._id) {
      const response = await api.updateResume(latestResume._id, updates)
      setLatestResume(response?.resume || latestResume)
      return response
    }

    const response = await api.createResume({
      title: 'Job Match Resume',
      template: latestResume?.template || 'modern-pro',
      ...resumePayload,
      ...updates,
    })
    setLatestResume(response?.resume || null)
    return response
  }

  const handleAnalyze = async () => {
    if (!jd.trim()) return
    setAnalyzing(true)
    setError('')
    try {
      const json = await api.analyzeJob(jd, latestResume?._id, resumePayload)

      if (json.success) {
        setResult({
          matchScore: json.matchScore,
          matchedSkills: json.matchedSkills || [],
          missingSkills: json.missingSkills || [],
          suggestions: json.aiSuggestions || [],
          actionItems: json.actionItems || [],
          keywordAnalysis: json.keywordAnalysis || [],
          keywords: {
            found: json.matchedSkills || [],
            missing: json.missingSkills || [],
          },
        })
        notify({ type: 'match', title: 'Job Match Updated', message: `Match score calculated: ${json.matchScore || 0}%` })
      } else {
        setError(json.message || 'Analysis failed')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Analysis failed')
    }
    setAnalyzing(false)
  }

  const handleApplySkill = async (skill) => {
    if (!skill) return
    setApplying(true)
    setError('')
    try {
      const currentSkills = resumePayload.skills || { technical: [], tools: [], soft: [] }
      const technical = Array.from(new Set([...(currentSkills.technical || []), skill]))
      await saveResume({ skills: { ...currentSkills, technical } })
      setResult(prev => prev ? { ...prev, matchedSkills: Array.from(new Set([...(prev.matchedSkills || []), skill])), missingSkills: (prev.missingSkills || []).filter(item => item !== skill) } : prev)
      notify({ type: 'success', title: 'Skill Added', message: `${skill} was added to your resume skills.` })
    } catch (err) {
      setError(err.message || 'Could not add skill')
    } finally {
      setApplying(false)
    }
  }

  const handleAutoOptimize = async () => {
    setApplying(true)
    setError('')
    try {
      const generatedResponse = await api.generateResumeAI({
        personal: resumePayload.personal,
        education: resumePayload.education,
        experience: resumePayload.experience,
        skills: resumePayload.skills,
        template: latestResume?.template || 'modern-pro',
        jobDescription: jd,
      })
      const generated = generatedResponse?.generated || generatedResponse || {}

      const optimized = {
        personal: {
          ...resumePayload.personal,
          summary: generated?.summary || resumePayload.personal.summary,
        },
        education: generated?.education?.length ? generated.education : resumePayload.education,
        experience: generated?.experience?.length ? generated.experience : resumePayload.experience,
        skills: generated?.skills || resumePayload.skills,
      }

      await saveResume(optimized)
      setResult(prev => prev ? {
        ...prev,
        suggestions: ['Resume optimized from your profile and job description.', ...(prev.suggestions || [])],
      } : prev)
      notify({ type: 'success', title: 'Resume Optimized', message: 'AI optimization completed for this job description.' })
    } catch (err) {
      setError(err.message || 'Auto optimize failed')
    } finally {
      setApplying(false)
    }
  }

  const handleApplyAction = async (action) => {
    if (!action) return
    if (action.type === 'skills' && Array.isArray(action.skills) && action.skills.length) {
      await handleApplySkill(action.skills[0])
      return
    }

    await handleAutoOptimize()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">Job Match Analyzer</h2>
            <p className="text-sm text-slate-400">
              {loadingResume ? 'Loading your latest resume...' : latestResume?._id ? 'Using your latest saved resume plus profile data' : 'Using your profile data until a resume is saved'}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Job Description</label>
          <button
            onClick={() => setJd(`We are looking for a Full Stack Developer with strong experience in React, Node.js, TypeScript, and GraphQL. The ideal candidate has 2+ years of experience building scalable applications, is familiar with REST and GraphQL APIs, MongoDB, and has worked in an Agile team environment. Experience with Docker and Kubernetes is a plus.`)}
            className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"
          >
            <Copy className="w-3 h-3" /> Use Sample JD
          </button>
        </div>
        <textarea
          rows={8}
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the complete job description here..."
          className="input-glass resize-none mb-4"
        />
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button onClick={handleAnalyze} disabled={!jd.trim() || analyzing} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center py-3">
          {analyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</> : <><Sparkles className="w-5 h-5" /> Analyze Job Match</>}
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-8 text-center">
            <div className="relative inline-block mb-4">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                <motion.circle cx="70" cy="70" r="60" fill="none"
                  stroke={result.matchScore >= 80 ? '#10b981' : result.matchScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${2 * Math.PI * 60 * (1 - result.matchScore / 100)}`}
                  transform="rotate(-90 70 70)"
                  initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - result.matchScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-extrabold text-4xl text-slate-900">{result.matchScore}%</span>
              </div>
            </div>
            <h3 className="font-display font-bold text-xl text-slate-800">
              {result.matchScore >= 80 ? '🎉 Excellent Match!' : result.matchScore >= 60 ? '👍 Good Match' : '⚠️ Needs Work'}
            </h3>
          </div>

          {/* Matched + Missing */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-primary-500" /><h3 className="font-bold text-slate-800">Matched Skills</h3>
                <span className="badge-green ml-auto">{result.matchedSkills.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matchedSkills.map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-semibold border border-primary-100">
                    <CheckCircle className="w-3 h-3" /> {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-rose-500" /><h3 className="font-bold text-slate-800">Missing Skills</h3>
                <span className="badge-orange ml-auto">{result.missingSkills.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missingSkills.map(s => (
                  <button
                    key={s}
                    onClick={() => handleApplySkill(s)}
                    disabled={applying}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold border border-rose-100 hover:bg-rose-100 transition-colors disabled:opacity-60"
                  >
                    <Plus className="w-3 h-3" /> {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent-500" /><h3 className="font-bold text-slate-800">AI Suggestions</h3>
            </div>
            <div className="space-y-3 mb-5">
              {(result.actionItems || []).map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-accent-50 rounded-xl border border-accent-100">
                  <WandSparkles className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.details}</p>
                  </div>
                  <button onClick={() => handleApplyAction(item)} disabled={applying} className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-white rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-60">
                    Fix Now
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {result.suggestions.map((sug, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <AlertCircle className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">{sug}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 text-center border-primary-100 bg-gradient-to-br from-primary-50/50 to-accent-50/50">
            <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-slate-800 mb-2">Need the whole resume updated?</h3>
            <p className="text-slate-400 text-sm mb-4">Auto-optimize will use your current resume, the job description, and your profile data.</p>
            <button onClick={handleAutoOptimize} disabled={applying} className="btn-primary mx-auto disabled:opacity-60">
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
              Auto-Optimize with AI
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
