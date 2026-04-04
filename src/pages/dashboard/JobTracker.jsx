import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Kanban,
  Plus,
  Building2,
  Calendar,
  MoreHorizontal,
  MapPin,
  ExternalLink,
  Sparkles,
  X,
  BookOpen,
} from 'lucide-react'
import api from '../../lib/api'
import { useNotifications } from '../../context/NotificationContext'

const FALLBACK_COLUMNS = [
  {
    id: 'saved',
    label: 'Saved',
    color: 'bg-slate-100 text-slate-600',
    count: 2,
    jobs: [
      {
        id: 1,
        title: 'Senior Frontend Dev',
        company: 'Swiggy',
        location: 'Bengaluru',
        date: 'Apr 1',
        salary: '₹18-24 LPA',
        logo: '🛵',
        description: 'Build high-performance frontend flows and collaborate with product teams.',
        requiredSkills: ['React', 'TypeScript', 'Performance Optimization'],
        missingSkills: ['TypeScript', 'Design Systems'],
      },
    ],
  },
  {
    id: 'applied',
    label: 'Applied',
    color: 'bg-accent-50 text-accent-700',
    count: 1,
    jobs: [
      {
        id: 2,
        title: 'Backend Engineer',
        company: 'Razorpay',
        location: 'Bengaluru',
        date: 'Mar 28',
        salary: '₹22-30 LPA',
        logo: '💳',
        description: 'Design backend services and APIs for scale.',
        requiredSkills: ['Node.js', 'PostgreSQL', 'System Design'],
        missingSkills: ['System Design'],
      },
    ],
  },
  { id: 'interview', label: 'Interview', color: 'bg-orange-50 text-orange-700', count: 0, jobs: [] },
  { id: 'offer', label: 'Offer', color: 'bg-primary-50 text-primary-700', count: 0, jobs: [] },
  { id: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700', count: 0, jobs: [] },
]

const LEARNING_RESOURCES = {
  Coursera: 'https://www.coursera.org/search?query=',
  Udemy: 'https://www.udemy.com/courses/search/?q=',
  YouTube: 'https://www.youtube.com/results?search_query=',
  LeetCode: 'https://leetcode.com/problemset/?search=',
}

function resourceLinksForSkill(skill) {
  return Object.entries(LEARNING_RESOURCES).map(([platform, base]) => ({
    platform,
    href: `${base}${encodeURIComponent(skill)}`,
  }))
}

function JobCard({ job, onOpen }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onOpen(job)}
      className="glass-card p-4 text-left w-full group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{job.logo || '💼'}</span>
          <div>
            <p className="text-sm font-bold text-slate-800 line-clamp-1">{job.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <p className="text-xs text-slate-400 line-clamp-1">{job.company}</p>
            </div>
          </div>
        </div>
        <span className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{job.salary || '—'}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">{job.date}</span>
        </div>
      </div>
    </motion.button>
  )
}

function SkillResource({ skill }) {
  const links = resourceLinksForSkill(skill)

  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
      <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">{skill}</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {links.map((link) => (
          <a
            key={`${skill}-${link.platform}`}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-primary-300 hover:text-primary-700 transition-colors"
          >
            {link.platform}
            <ExternalLink className="w-3 h-3" />
          </a>
        ))}
      </div>
    </div>
  )
}

function JobDetailModal({ job, onClose }) {
  if (!job) return null

  const requiredSkills = job.requiredSkills || []
  const missingSkills = job.missingSkills || []

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] bg-slate-900/55 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
          className="mx-auto mt-4 w-full max-w-4xl glass-card p-6 md:p-7"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display font-bold text-2xl text-slate-900">{job.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> {job.company}</span>
                {job.location ? <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span> : null}
                {job.salary ? <span>{job.salary}</span> : null}
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            <section>
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{job.description || 'No description provided yet.'}</p>
            </section>

            <section className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-4">
                <h4 className="text-xs font-bold text-primary-700 uppercase tracking-wide mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.length ? requiredSkills.map((skill) => (
                    <span key={skill} className="badge-green">{skill}</span>
                  )) : <span className="text-xs text-slate-500">No required skills provided.</span>}
                </div>
              </div>

              <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                <h4 className="text-xs font-bold text-orange-700 uppercase tracking-wide mb-3">Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.length ? missingSkills.map((skill) => (
                    <span key={skill} className="badge-orange">{skill}</span>
                  )) : <span className="text-xs text-slate-500">No current skill gaps for this job.</span>}
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-accent-500" />
                <h4 className="font-semibold text-slate-800">Skill Improvement Resources</h4>
              </div>
              {missingSkills.length ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {missingSkills.map((skill) => (
                    <SkillResource key={skill} skill={skill} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-700">
                  Your skill profile already aligns well with this job.
                </div>
              )}
            </section>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function JobTracker() {
  const { notify } = useNotifications()
  const [apiColumns, setApiColumns] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadJobs() {
      try {
        const [jobsResponse, statsResponse] = await Promise.all([api.getJobs(), api.getJobStats()])
        if (!mounted || !jobsResponse?.success) return

        const jobs = jobsResponse.jobs || []
        const stats = statsResponse?.stats || {}
        const grouped = { saved: [], applied: [], interview: [], offer: [], rejected: [] }

        for (const job of jobs) {
          const stage = job.stage || 'saved'
          if (!grouped[stage]) grouped[stage] = []
          grouped[stage].push({
            id: job._id,
            title: job.title,
            company: job.company,
            location: job.location || '',
            date: job.updatedAt ? new Date(job.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—',
            salary: job.salary || '—',
            logo: '💼',
            description: job.description || '',
            requiredSkills: (job.keywordAnalysis || []).map((entry) => entry.keyword).filter(Boolean),
            missingSkills: job.missingSkills || [],
            matchedSkills: job.matchedSkills || [],
            url: job.url || '',
          })
        }

        setApiColumns(FALLBACK_COLUMNS.map((column) => ({
          ...column,
          count: typeof stats[column.id] === 'number' ? stats[column.id] : grouped[column.id]?.length || 0,
          jobs: grouped[column.id]?.length ? grouped[column.id] : column.jobs,
        })))
      } catch (_error) {
        // Keep fallback when backend is unavailable.
      }
    }

    loadJobs()
    return () => {
      mounted = false
    }
  }, [])

  const effectiveColumns = apiColumns || FALLBACK_COLUMNS
  const totalTracked = useMemo(() => effectiveColumns.reduce((sum, col) => sum + Number(col.count || 0), 0), [effectiveColumns])

  const openJob = (job) => {
    setSelectedJob(job)
    notify({ type: 'info', title: 'Job Detail Opened', message: `${job.title} at ${job.company}` })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 overflow-x-hidden">
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">Job Tracker</h2>
            <p className="text-sm text-slate-400">{totalTracked} total applications tracked</p>
          </div>
        </div>
        <button className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <div className="glass-card p-4 md:p-5 overflow-x-auto">
        <div className="grid grid-flow-col auto-cols-[minmax(260px,1fr)] gap-4 min-w-[980px] md:min-w-0 md:grid-flow-row md:grid-cols-3 lg:grid-cols-5">
          {effectiveColumns.map((column) => (
            <div key={column.id} className="min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${column.color}`}>{column.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{column.count}</span>
                </div>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 min-h-24">
                {column.jobs.map((job) => (
                  <JobCard key={job.id} job={job} onOpen={openJob} />
                ))}
                <button className="w-full p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-medium hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {effectiveColumns.map((column) => (
          <div key={column.id} className="glass-card p-4 text-center">
            <p className="font-display font-bold text-2xl text-slate-900">{column.count}</p>
            <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-md inline-block ${column.color}`}>{column.label}</p>
          </div>
        ))}
      </div>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </motion.div>
  )
}
