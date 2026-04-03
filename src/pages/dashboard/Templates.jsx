import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, Download, Star, Crown, Sparkles, LayoutTemplate } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const templates = [
  { id: 1, templateId: 'modern-pro', name: 'Modern Pro', tag: 'Most Popular', tagColor: 'badge-green', color: 'from-primary-400 to-primary-600', stars: 4.9, downloads: '12K' },
  { id: 2, templateId: 'executive', name: 'Executive', tag: 'Premium', tagColor: 'badge-indigo', color: 'from-slate-700 to-slate-900', stars: 4.8, downloads: '8K' },
  { id: 3, templateId: 'creative', name: 'Creative', tag: 'Design', tagColor: 'badge-orange', color: 'from-violet-400 to-purple-600', stars: 4.7, downloads: '6K' },
  { id: 4, templateId: 'tech-focus', name: 'Tech Focus', tag: 'Engineers', tagColor: 'badge-green', color: 'from-sky-400 to-blue-600', stars: 4.9, downloads: '10K' },
  { id: 5, templateId: 'minimal', name: 'Minimal Clean', tag: 'Fresher', tagColor: 'badge-green', color: 'from-emerald-400 to-teal-600', stars: 4.6, downloads: '9K' },
  { id: 6, templateId: 'bold', name: 'Bold Impact', tag: 'Sales & Marketing', tagColor: 'badge-orange', color: 'from-orange-400 to-rose-500', stars: 4.8, downloads: '7K' },
  { id: 7, templateId: 'minimal', name: 'Academic', tag: 'Research', tagColor: 'badge-indigo', color: 'from-indigo-400 to-accent-600', stars: 4.5, downloads: '4K' },
  { id: 8, templateId: 'modern-pro', name: 'Startup Ready', tag: 'Hot 🔥', tagColor: 'badge-green', color: 'from-primary-500 to-accent-500', stars: 5.0, downloads: '15K' },
]

function TemplateCard({ template, isSelected, onSelect, onUse }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onSelect}
      className={`glass-card overflow-hidden cursor-pointer group transition-all duration-200 ${
        isSelected ? 'ring-2 ring-primary-400 shadow-glow-green' : ''
      }`}
    >
      {/* Template Preview */}
      <div className={`h-44 bg-gradient-to-br ${template.color} relative overflow-hidden`}>
        {/* Mock resume lines */}
        <div className="absolute inset-0 p-5 opacity-30">
          <div className="w-3/4 h-3 bg-white/80 rounded mb-2" />
          <div className="w-1/2 h-2 bg-white/60 rounded mb-4" />
          <div className="w-full h-1 bg-white/40 rounded mb-1" />
          <div className="w-full h-1 bg-white/40 rounded mb-1" />
          <div className="w-4/5 h-1 bg-white/40 rounded mb-4" />
          <div className="w-2/3 h-2 bg-white/60 rounded mb-2" />
          <div className="w-full h-1 bg-white/40 rounded mb-1" />
          <div className="w-full h-1 bg-white/40 rounded" />
        </div>

        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span className={`${template.tagColor} text-xs`}>{template.tag}</span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onUse(template.templateId); }}
            className="px-3 py-2 bg-primary-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-primary-600 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> Use Template
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-sm text-slate-800">{template.name}</h3>
          {isSelected && <Crown className="w-4 h-4 text-primary-500" />}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs text-slate-500">{template.stars}</span>
          </div>
          <span className="text-slate-200">|</span>
          <div className="flex items-center gap-1">
            <Download className="w-3 h-3 text-slate-400" />
            <span className="text-xs text-slate-500">{template.downloads} uses</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Templates() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(1)
  const [filter, setFilter] = useState('All')
  const categories = ['All', 'Engineering', 'Design', 'Management', 'Fresher', 'Premium']

  const handleUseTemplate = (templateId) => {
    navigate('/dashboard/resume-builder', { state: { templateId, step: 5 } })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Resume Templates</h2>
          <p className="text-sm text-slate-400">20+ ATS-friendly templates designed by HR professionals</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
          <LayoutTemplate className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              filter === cat
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            isSelected={selected === t.id}
            onSelect={() => setSelected(t.id)}
            onUse={handleUseTemplate}
          />
        ))}
      </div>

      {/* Use Selected CTA */}
      <div className="glass-card p-6 flex items-center justify-between flex-wrap gap-4 border border-primary-100 bg-primary-50/50">
        <div>
          <p className="font-semibold text-slate-800">
            Selected: <span className="text-primary-600">{templates.find(t => t.id === selected)?.name}</span>
          </p>
          <p className="text-sm text-slate-400 mt-0.5">Apply this template to your existing resume</p>
        </div>
        <button 
          onClick={() => handleUseTemplate(templates.find(t => t.id === selected)?.templateId)}
          className="btn-primary"
        >
          <Sparkles className="w-4 h-4" />
          Use {templates.find(t => t.id === selected)?.name} Template
        </button>
      </div>
    </motion.div>
  )
}
