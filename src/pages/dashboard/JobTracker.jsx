import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Kanban, Plus, Building2, Calendar, Link as LinkIcon, MoreHorizontal } from 'lucide-react'
import api from '../../lib/api'

const columns = [
  {
    id: 'saved', label: 'Saved', color: 'bg-slate-100 text-slate-600', count: 5,
    jobs: [
      { id: 1, title: 'Senior Frontend Dev', company: 'Swiggy', date: 'Apr 1', salary: '₹18-24 LPA', logo: '🛵' },
      { id: 2, title: 'Full Stack Engineer', company: 'Zepto', date: 'Apr 2', salary: '₹20-28 LPA', logo: '⚡' },
    ]
  },
  {
    id: 'applied', label: 'Applied', color: 'bg-accent-50 text-accent-700', count: 8,
    jobs: [
      { id: 3, title: 'Backend Engineer', company: 'Razorpay', date: 'Mar 28', salary: '₹22-30 LPA', logo: '💳' },
      { id: 4, title: 'SWE II', company: 'Google India', date: 'Mar 25', salary: '₹35-50 LPA', logo: '🔍' },
      { id: 5, title: 'SDE-2', company: 'Flipkart', date: 'Mar 22', salary: '₹25-35 LPA', logo: '🛒' },
    ]
  },
  {
    id: 'interview', label: 'Interview', color: 'bg-orange-50 text-orange-700', count: 3,
    jobs: [
      { id: 6, title: 'Product Engineer', company: 'Cred', date: 'Apr 5', salary: '₹30-40 LPA', logo: '💪' },
      { id: 7, title: 'Staff Engineer', company: 'Meesho', date: 'Apr 8', salary: '₹28-38 LPA', logo: '👗' },
    ]
  },
  {
    id: 'offer', label: 'Offer', color: 'bg-primary-50 text-primary-700', count: 1,
    jobs: [
      { id: 8, title: 'Software Engineer', company: 'PhonePe', date: 'Apr 3', salary: '₹26-35 LPA', logo: '📱' },
    ]
  },
  {
    id: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700', count: 2,
    jobs: [
      { id: 9, title: 'ML Engineer', company: 'Ola', date: 'Mar 20', salary: '₹24-32 LPA', logo: '🚖' },
    ]
  },
]

function JobCard({ job }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="glass-card p-4 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{job.logo}</span>
          <div>
            <p className="text-sm font-bold text-slate-800">{job.title}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-400" />
              <p className="text-xs text-slate-400">{job.company}</p>
            </div>
          </div>
        </div>
        <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">{job.salary}</span>
        <div className="flex items-center gap-1 text-slate-400">
          <Calendar className="w-3 h-3" />
          <span className="text-xs">{job.date}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default function JobTracker() {
  const [apiColumns, setApiColumns] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadJobs() {
      try {
        const [jobsResponse, statsResponse] = await Promise.all([api.getJobs(), api.getJobStats()])
        if (!mounted || !jobsResponse?.success) return

        const jobs = jobsResponse.jobs || []
        const stats = statsResponse?.stats || {}
        const grouped = {
          saved: [],
          applied: [],
          interview: [],
          offer: [],
          rejected: [],
        }

        for (const job of jobs) {
          const stage = job.stage || 'saved'
          if (!grouped[stage]) grouped[stage] = []
          grouped[stage].push({
            id: job._id,
            title: job.title,
            company: job.company,
            date: job.updatedAt ? new Date(job.updatedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—',
            salary: job.salary || '—',
            logo: '💼',
          })
        }

        setApiColumns(columns.map((col) => ({
          ...col,
          count: typeof stats[col.id] === 'number' ? stats[col.id] : grouped[col.id]?.length || 0,
          jobs: grouped[col.id]?.length ? grouped[col.id] : col.jobs,
        })))
      } catch (_error) {
        // Keep static fallback when backend is unavailable.
      }
    }

    loadJobs()
    return () => {
      mounted = false
    }
  }, [])

  const effectiveColumns = apiColumns || columns

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <Kanban className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-slate-800">Job Tracker</h2>
            <p className="text-sm text-slate-400">19 total applications tracked</p>
          </div>
        </div>
        <button className="btn-primary text-sm py-2">
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {effectiveColumns.map((col) => (
            <div key={col.id} className="w-64 shrink-0">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${col.color}`}>{col.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{col.count}</span>
                </div>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-24">
                {col.jobs.map(job => <JobCard key={job.id} job={job} />)}
                {/* Add card button */}
                <button className="w-full p-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-medium hover:border-primary-300 hover:text-primary-500 transition-colors flex items-center justify-center gap-1">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {effectiveColumns.map(col => (
          <div key={col.id} className="glass-card p-4 text-center">
            <p className="font-display font-bold text-2xl text-slate-900">{col.count}</p>
            <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-md inline-block ${col.color}`}>{col.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
