import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Sparkles, ArrowUp, Loader2 } from 'lucide-react'
import api from '../../lib/api'

function CircleGauge({ value, size = 160, color = '#10b981', label, sublabel }) {
  const r = size / 2 - 12
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
          <motion.circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            transform={`rotate(-90 ${size/2} ${size/2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-extrabold text-3xl text-slate-900">{value}</span>
          <span className="text-xs text-slate-400">/ 100</span>
        </div>
      </div>
      {label && <p className="font-semibold text-slate-700 text-sm mt-2">{label}</p>}
      {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
    </div>
  )
}

export default function ATSScore() {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [atsData, setAtsData] = useState({
    overall: 87,
    keywordDensity: 74,
    formatScore: 92,
    readability: 81,
    issues: [
      { severity: 'warning', message: 'Add more role-specific keywords for higher ATS relevance.', suggestion: 'Include 5 to 7 exact skills from the JD.' },
      { severity: 'info', message: 'Resume is readable and cleanly structured.', suggestion: 'Keep section headings concise.' },
    ],
    platformScores: { naukri: 94, linkedin: 88, indeed: 84, workday: 82, greenhouse: 86 },
  })

  const scores = [
    { label: 'Overall ATS Score', value: atsData.overall || 0, color: '#10b981', sublabel: (atsData.overall || 0) >= 85 ? 'Excellent' : 'Good' },
    { label: 'Keyword Density', value: atsData.keywordDensity || 0, color: '#6366f1', sublabel: 'Keyword Match' },
    { label: 'Format Score', value: atsData.formatScore || 0, color: '#f59e0b', sublabel: 'Formatting' },
    { label: 'Readability', value: atsData.readability || 0, color: '#8b5cf6', sublabel: 'Readability' },
  ]

  const issues = useMemo(() => {
    const mapped = (atsData.issues || []).map((issue) => {
      const isPositive = issue.severity === 'info'
      return {
        severity: issue.severity,
        title: issue.message,
        desc: issue.suggestion || 'No suggestion provided',
        icon: isPositive ? CheckCircle : AlertTriangle,
        color: isPositive ? 'primary' : issue.severity === 'critical' ? 'rose' : 'orange',
      }
    })

    return mapped.length
      ? mapped
      : [
          {
            severity: 'info',
            title: 'No ATS issues detected yet',
            desc: 'Run a new scan with a job description to get recommendations.',
            icon: CheckCircle,
            color: 'primary',
          },
        ]
  }, [atsData])

  const atsSystems = [
    { name: 'Workday', score: atsData.platformScores?.workday || 0, logo: '🔵' },
    { name: 'Greenhouse', score: atsData.platformScores?.greenhouse || 0, logo: '🟢' },
    { name: 'Lever', score: atsData.platformScores?.linkedin || 0, logo: '🟡' },
    { name: 'Taleo (Oracle)', score: atsData.platformScores?.indeed || 0, logo: '🔴' },
    { name: 'iCIMS', score: atsData.platformScores?.linkedin || 0, logo: '🟠' },
    { name: 'Naukri ATS', score: atsData.platformScores?.naukri || 0, logo: '🇮🇳' },
  ]

  const handleRunScan = async () => {
    setLoading(true)
    setError('')

    try {
      const latest = await api.getLatestResume()
      let response

      if (latest?.resume?._id) {
        response = await api.scanATS(latest.resume._id, jobDescription)
        if (response?.success && response.atsScore) {
          setAtsData(response.atsScore)
        }
      } else {
        response = await api.atsScanDirect(
          {
            personal: {},
            experience: [],
            skills: { technical: [], tools: [], soft: [] },
            education: [],
          },
          jobDescription
        )
        if (response?.success && response.atsScore) {
          setAtsData(response.atsScore)
        }
      }
    } catch (scanError) {
      setError(scanError.message || 'Failed to run ATS scan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-slate-800">ATS Score Report</h2>
          <p className="text-sm text-slate-400">Detailed breakdown of how ATS systems parse your resume</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-primary-600 text-sm font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>+12 from last scan</span>
        </div>
      </div>

      {/* Scan Controls */}
      <div className="glass-card p-6">
        <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Job Description</label>
        <textarea
          rows={5}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste a target JD to run ATS scoring against backend routes"
          className="input-glass resize-none"
        />
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        <button onClick={handleRunScan} disabled={loading} className="btn-primary mt-4 disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Running Scan...' : 'Run ATS Scan'}
        </button>
      </div>

      {/* Score Circles */}
      <div className="glass-card p-8">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-8 text-center">Score Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
          {scores.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
            >
              <CircleGauge {...s} size={140} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ATS System Scores */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-5">ATS Platform Compatibility</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {atsSystems.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{s.logo}</span>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                  <span className="text-sm font-bold text-slate-800">{s.score}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.score}%` }}
                    transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
                    className={`h-full rounded-full ${s.score >= 90 ? 'bg-primary-500' : s.score >= 80 ? 'bg-accent-500' : 'bg-orange-500'}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Issues & Suggestions */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-5">Issues & Recommendations</h3>
        <div className="space-y-3">
          {issues.map((issue, i) => {
            const colorMap = {
              rose: 'bg-rose-50 border-rose-100 text-rose-700',
              orange: 'bg-orange-50 border-orange-100 text-orange-700',
              yellow: 'bg-yellow-50 border-yellow-100 text-yellow-700',
              primary: 'bg-primary-50 border-primary-100 text-primary-700',
            }
            const iconColor = {
              rose: 'text-rose-500',
              orange: 'text-orange-500',
              yellow: 'text-yellow-500',
              primary: 'text-primary-500',
            }
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-start gap-3 p-4 rounded-xl border ${colorMap[issue.color]}`}
              >
                <issue.icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor[issue.color]}`} />
                <div>
                  <p className="font-semibold text-sm">{issue.title}</p>
                  <p className="text-xs mt-0.5 opacity-80">{issue.desc}</p>
                </div>
                {issue.severity !== 'good' && (
                  <button className="ml-auto shrink-0 text-xs font-semibold px-3 py-1.5 bg-white/60 rounded-lg hover:bg-white transition-colors">
                    Fix Now
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Improve CTA */}
      <div className="glass-card p-6 text-center border-primary-100 bg-gradient-to-br from-primary-50/50 to-accent-50/50">
        <Sparkles className="w-8 h-8 text-primary-500 mx-auto mb-3" />
        <h3 className="font-display font-bold text-lg text-slate-800 mb-2">Boost your score to 95+</h3>
        <p className="text-slate-400 text-sm mb-4">AI can automatically fix all issues and optimize your resume for top ATS systems.</p>
        <button className="btn-primary mx-auto">
          <ArrowUp className="w-4 h-4" />
          Auto-Optimize with AI
        </button>
      </div>
    </motion.div>
  )
}
