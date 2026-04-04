import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { TrendingUp, Target, Briefcase, Award } from 'lucide-react'
import api from '../../lib/api'

const fallbackWeeklyData = [
  { day: 'Mon', score: 68, matches: 4, applies: 2 },
  { day: 'Tue', score: 72, matches: 6, applies: 3 },
  { day: 'Wed', score: 79, matches: 8, applies: 4 },
  { day: 'Thu', score: 75, matches: 5, applies: 3 },
  { day: 'Fri', score: 83, matches: 9, applies: 5 },
  { day: 'Sat', score: 87, matches: 11, applies: 4 },
  { day: 'Sun', score: 87, matches: 7, applies: 2 },
]

const fallbackPieData = [
  { name: 'Applied', value: 18, color: '#6366f1' },
  { name: 'Interview', value: 5, color: '#10b981' },
  { name: 'Offer', value: 1, color: '#f59e0b' },
  { name: 'Rejected', value: 3, color: '#ef4444' },
]

const fallbackSkillGapData = [
  { skill: 'React', yours: 90, market: 95 },
  { skill: 'TypeScript', yours: 65, market: 88 },
  { skill: 'Node.js', yours: 85, market: 80 },
  { skill: 'AWS', yours: 55, market: 75 },
  { skill: 'Docker', yours: 40, market: 70 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-slate-100 rounded-xl shadow-glass p-3">
        <p className="text-xs font-bold text-slate-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null)
  const [weeklyData, setWeeklyData] = useState(fallbackWeeklyData)
  const [skillGapData, setSkillGapData] = useState(fallbackSkillGapData)

  useEffect(() => {
    let mounted = true

    async function loadAnalytics() {
      try {
        const [dashboardRes, scoreHistoryRes, skillGapsRes] = await Promise.all([
          api.getDashboard(),
          api.getScoreHistory(),
          api.getSkillGaps(),
        ])

        if (!mounted) return

        if (dashboardRes?.success) {
          setDashboard(dashboardRes.dashboard)
        }

        if (scoreHistoryRes?.success && Array.isArray(scoreHistoryRes.history) && scoreHistoryRes.history.length) {
          setWeeklyData(scoreHistoryRes.history.map((point) => ({
            day: point.day,
            score: point.score,
            matches: Math.max(1, Math.round((point.score || 0) / 12)),
            applies: Math.max(1, Math.round((point.score || 0) / 24)),
          })))
        }

        if (skillGapsRes?.success && Array.isArray(skillGapsRes.gaps) && skillGapsRes.gaps.length) {
          setSkillGapData(skillGapsRes.gaps.map((gap) => ({
            skill: gap.skill,
            yours: Math.max(35, 100 - gap.frequency * 12),
            market: gap.importance === 'high' ? 92 : gap.importance === 'medium' ? 80 : 68,
          })))
        }
      } catch (_error) {
        // Keep static analytics fallback when API is unavailable.
      }
    }

    loadAnalytics()

    return () => {
      mounted = false
    }
  }, [])

  const topStats = useMemo(() => {
    const interviews = dashboard?.interviews ?? 5
    const applications = dashboard?.applications ?? 18
    const interviewRate = applications > 0 ? ((interviews / applications) * 100).toFixed(1) : '0.0'

    return [
      { label: 'Avg ATS Score', value: `${dashboard?.resumeScore ?? 81.4}`, unit: '/100', trend: '+12', icon: Award, color: 'text-primary-600', bg: 'bg-primary-50' },
      { label: 'Total Job Matches', value: `${dashboard?.jobMatches ?? 24}`, unit: ' jobs', trend: '+6', icon: Target, color: 'text-accent-600', bg: 'bg-accent-50' },
      { label: 'Applications Sent', value: `${applications}`, unit: '', trend: '+3', icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Interview Rate', value: `${interviewRate}`, unit: '%', trend: '+5.2%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ]
  }, [dashboard])

  const pieData = useMemo(() => {
    if (!dashboard?.stageBreakdown) return fallbackPieData
    return [
      { name: 'Applied', value: dashboard.stageBreakdown.applied || 0, color: '#6366f1' },
      { name: 'Interview', value: dashboard.stageBreakdown.interview || 0, color: '#10b981' },
      { name: 'Offer', value: dashboard.stageBreakdown.offer || 0, color: '#f59e0b' },
      { name: 'Rejected', value: dashboard.stageBreakdown.rejected || 0, color: '#ef4444' },
    ]
  }, [dashboard])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map(({ label, value, unit, trend, icon: Icon, color, bg }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-primary-600 font-semibold">{trend}</span>
            </div>
            <p className="font-display font-extrabold text-2xl text-slate-900">
              {value}<span className="text-sm text-slate-400 font-medium">{unit}</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Resume Score Over Time */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-6">Resume Score — 7 Days</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="score" name="Score" stroke="#10b981" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Applications & Matches */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-base text-slate-800 mb-5">Matches vs Applications</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="matches" name="Matches" fill="#6366f1" radius={[4,4,0,0]} />
              <Bar dataKey="applies" name="Applied" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Application Pipeline Pie */}
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-base text-slate-800 mb-5">Application Pipeline</h3>
          <div className="flex items-center gap-4">
            <PieChart width={140} height={140}>
              <Pie data={pieData} cx={65} cy={65} innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
            <div className="space-y-2 flex-1">
              {pieData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-slate-600">{name}</span>
                    <span className="text-xs font-bold text-slate-700">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="glass-card p-6">
        <h3 className="font-display font-bold text-lg text-slate-800 mb-6">Skill Gap vs Market Demand</h3>
        <div className="space-y-5">
          {skillGapData.map(({ skill, yours, market }, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">{skill}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-primary-600 font-semibold">You: {yours}%</span>
                  <span className="text-slate-400">Market: {market}%</span>
                </div>
              </div>
              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${market}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  className="absolute h-full bg-slate-200 rounded-full"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${yours}%` }}
                  transition={{ delay: i * 0.1 + 0.5, duration: 0.8 }}
                  className={`absolute h-full rounded-full ${yours >= market ? 'bg-primary-500' : 'bg-accent-500'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
