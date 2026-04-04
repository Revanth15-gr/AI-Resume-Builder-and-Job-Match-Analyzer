import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import api from '../../lib/api'
import { useNotifications } from '../../context/NotificationContext'
import {
  Sparkles,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  FolderKanban,
  Medal,
  ChevronRight,
  ChevronLeft,
  Download,
  CheckCircle,
  Loader2,
  Printer,
  LayoutTemplate,
} from 'lucide-react'

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Education', icon: GraduationCap },
  { id: 3, label: 'Experience', icon: Briefcase },
  { id: 4, label: 'Projects', icon: FolderKanban },
  { id: 5, label: 'Certifications', icon: Medal },
  { id: 6, label: 'Skills', icon: Code2 },
  { id: 7, label: 'Template', icon: LayoutTemplate },
  { id: 8, label: 'Generate', icon: Sparkles },
]

const TEMPLATES = [
  { id: 'modern-pro', name: 'Modern Pro', color: 'from-primary-500 to-primary-600', accent: '#10b981' },
  { id: 'executive', name: 'Executive', color: 'from-slate-700 to-slate-900', accent: '#334155' },
  { id: 'creative', name: 'Creative', color: 'from-violet-500 to-purple-600', accent: '#8b5cf6' },
  { id: 'tech-focus', name: 'Tech Focus', color: 'from-sky-500 to-blue-600', accent: '#0ea5e9' },
  { id: 'minimal', name: 'Minimal Clean', color: 'from-emerald-400 to-teal-600', accent: '#14b8a6' },
  { id: 'bold', name: 'Bold Impact', color: 'from-orange-500 to-rose-500', accent: '#f97316' },
]

const emptyResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  portfolio: '',
  summary: '',
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  skills: { technical: [], tools: [], soft: [] },
}

function toCsv(values = []) {
  if (!Array.isArray(values)) return ''
  return values.filter(Boolean).join(', ')
}

function fromCsv(value = '') {
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeResponsibilities(item = {}) {
  if (Array.isArray(item.responsibilities)) return item.responsibilities.join('\n')
  return item.responsibilities || ''
}

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 relative overflow-x-auto pb-2">
      <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 z-0" />
      {steps.map((step) => {
        const Icon = step.icon
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex flex-col items-center gap-2 z-10 min-w-[88px]">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isDone
                  ? 'bg-primary-500 border-primary-500'
                  : isActive
                    ? 'bg-white border-primary-500 shadow-lg shadow-primary-100'
                    : 'bg-white border-slate-200'
              }`}
            >
              {isDone ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-300'}`} />
              )}
            </div>
            <span
              className={`text-xs font-medium text-center ${
                isActive ? 'text-primary-700' : isDone ? 'text-primary-500' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function PersonalInfoStep({ data, setData }) {
  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Enter your full name', type: 'text' },
    { key: 'email', label: 'Email Address', placeholder: 'Enter your email address', type: 'email' },
    { key: 'phone', label: 'Phone Number', placeholder: 'Enter your phone number', type: 'tel' },
    { key: 'location', label: 'Location', placeholder: 'Enter your location', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'Enter your LinkedIn profile URL', type: 'url' },
    { key: 'portfolio', label: 'Portfolio / GitHub', placeholder: 'Enter your portfolio or GitHub URL', type: 'url' },
  ]

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Personal Information</h2>
      <p className="text-sm text-slate-400 mb-6">This section appears in the resume header.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={data[key] || ''}
              onChange={(e) => setData((prev) => ({ ...prev, [key]: e.target.value }))}
              className="input-glass"
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Professional Summary</label>
        <textarea
          rows={5}
          placeholder="Briefly describe your profile, strengths, and target role..."
          value={data.summary || ''}
          onChange={(e) => setData((prev) => ({ ...prev, summary: e.target.value }))}
          className="input-glass resize-none"
        />
      </div>
    </div>
  )
}

function EducationStep({ data, setData }) {
  const list = data.education || []

  const update = (idx, field, value) => {
    const next = [...list]
    next[idx] = { ...next[idx], [field]: value }
    setData((prev) => ({ ...prev, education: next }))
  }

  const add = () =>
    setData((prev) => ({
      ...prev,
      education: [...list, { degree: '', institution: '', year: '', gpa: '', coursework: '' }],
    }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Education</h2>
      <p className="text-sm text-slate-400 mb-6">Add your academic background.</p>
      {list.length === 0 && (
        <div className="glass-card p-5 mb-4 text-sm text-slate-400 border-dashed border border-slate-200">
          No education entries yet. Click "Add Education" to start.
        </div>
      )}
      {list.map((item, idx) => (
        <div key={idx} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Degree</label><input placeholder="Enter degree" value={item.degree || ''} onChange={(e) => update(idx, 'degree', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Institution</label><input placeholder="Enter institution" value={item.institution || ''} onChange={(e) => update(idx, 'institution', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Year / Duration</label><input placeholder="2020 - 2024" value={item.year || ''} onChange={(e) => update(idx, 'year', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">GPA / Percentage</label><input placeholder="8.7 CGPA" value={item.gpa || ''} onChange={(e) => update(idx, 'gpa', e.target.value)} className="input-glass" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Coursework</label><textarea rows={2} placeholder="Data Structures, Distributed Systems" value={item.coursework || ''} onChange={(e) => update(idx, 'coursework', e.target.value)} className="input-glass resize-none" /></div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Education</button>
    </div>
  )
}

function ExperienceStep({ data, setData }) {
  const list = data.experience || []

  const update = (idx, field, value) => {
    const next = [...list]
    next[idx] = { ...next[idx], [field]: value }
    setData((prev) => ({ ...prev, experience: next }))
  }

  const add = () =>
    setData((prev) => ({
      ...prev,
      experience: [...list, { title: '', company: '', duration: '', location: '', responsibilities: '' }],
    }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Work Experience</h2>
      <p className="text-sm text-slate-400 mb-6">Add experience details. AI will enhance wording, not fabricate facts.</p>
      {list.length === 0 && (
        <div className="glass-card p-5 mb-4 text-sm text-slate-400 border-dashed border border-slate-200">
          No experience entries yet. Click "Add Experience" to start.
        </div>
      )}
      {list.map((item, idx) => (
        <div key={idx} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Job Title</label><input placeholder="Software Engineer" value={item.title || ''} onChange={(e) => update(idx, 'title', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Company</label><input placeholder="Company Name" value={item.company || ''} onChange={(e) => update(idx, 'company', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Duration</label><input placeholder="Jan 2023 - Present" value={item.duration || ''} onChange={(e) => update(idx, 'duration', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location</label><input placeholder="City, Country" value={item.location || ''} onChange={(e) => update(idx, 'location', e.target.value)} className="input-glass" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Key Responsibilities</label>
            <textarea rows={5} placeholder="Write bullets or lines about your measurable impact..." value={item.responsibilities || ''} onChange={(e) => update(idx, 'responsibilities', e.target.value)} className="input-glass resize-none" />
          </div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Experience</button>
    </div>
  )
}

function ProjectsStep({ data, setData }) {
  const list = data.projects || []

  const update = (idx, field, value) => {
    const next = [...list]
    next[idx] = { ...next[idx], [field]: value }
    setData((prev) => ({ ...prev, projects: next }))
  }

  const add = () =>
    setData((prev) => ({
      ...prev,
      projects: [...list, { title: '', description: '', technologies: '', link: '' }],
    }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Projects</h2>
      <p className="text-sm text-slate-400 mb-6">Add key projects to highlight practical experience.</p>
      {list.length === 0 && (
        <div className="glass-card p-5 mb-4 text-sm text-slate-400 border-dashed border border-slate-200">
          No project entries yet. Click "Add Project" to start.
        </div>
      )}
      {list.map((item, idx) => (
        <div key={idx} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Project Title</label><input placeholder="E-commerce Platform" value={item.title || ''} onChange={(e) => update(idx, 'title', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Project Link</label><input placeholder="https://github.com/..." value={item.link || ''} onChange={(e) => update(idx, 'link', e.target.value)} className="input-glass" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label><textarea rows={3} placeholder="What did you build and what impact did it create?" value={item.description || ''} onChange={(e) => update(idx, 'description', e.target.value)} className="input-glass resize-none" /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Technologies Used</label><input placeholder="React, Node.js, MongoDB" value={item.technologies || ''} onChange={(e) => update(idx, 'technologies', e.target.value)} className="input-glass" /></div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Project</button>
    </div>
  )
}

function CertificationsStep({ data, setData }) {
  const list = data.certifications || []

  const update = (idx, field, value) => {
    const next = [...list]
    next[idx] = { ...next[idx], [field]: value }
    setData((prev) => ({ ...prev, certifications: next }))
  }

  const add = () =>
    setData((prev) => ({
      ...prev,
      certifications: [...list, { title: '', issuer: '', year: '', credentialId: '' }],
    }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Certifications</h2>
      <p className="text-sm text-slate-400 mb-6">Add relevant certifications for stronger ATS signals.</p>
      {list.length === 0 && (
        <div className="glass-card p-5 mb-4 text-sm text-slate-400 border-dashed border border-slate-200">
          No certifications yet. Click "Add Certification" to start.
        </div>
      )}
      {list.map((item, idx) => (
        <div key={idx} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Certification Title</label><input placeholder="AWS Solutions Architect" value={item.title || ''} onChange={(e) => update(idx, 'title', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Issuer</label><input placeholder="Amazon Web Services" value={item.issuer || ''} onChange={(e) => update(idx, 'issuer', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Year</label><input placeholder="2025" value={item.year || ''} onChange={(e) => update(idx, 'year', e.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Credential ID (optional)</label><input placeholder="ABC-12345" value={item.credentialId || ''} onChange={(e) => update(idx, 'credentialId', e.target.value)} className="input-glass" /></div>
          </div>
        </div>
      ))}
      <button onClick={add} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Certification</button>
    </div>
  )
}

function SkillsStep({ data, setData }) {
  const skills = data.skills || { technical: [], tools: [], soft: [] }
  const [newSkill, setNewSkill] = useState({ technical: '', tools: '', soft: '' })

  const addSkill = (cat) => {
    if (!newSkill[cat].trim()) return
    const updated = { ...skills, [cat]: [...skills[cat], newSkill[cat].trim()] }
    setData((prev) => ({ ...prev, skills: updated }))
    setNewSkill((prev) => ({ ...prev, [cat]: '' }))
  }

  const removeSkill = (cat, skill) => {
    const updated = { ...skills, [cat]: skills[cat].filter((entry) => entry !== skill) }
    setData((prev) => ({ ...prev, skills: updated }))
  }

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Skills</h2>
      <p className="text-sm text-slate-400 mb-6">Add technical, tools, and soft skills.</p>
      <div className="space-y-5">
        {[
          { cat: 'technical', label: 'Technical Skills' },
          { cat: 'tools', label: 'Tools & Platforms' },
          { cat: 'soft', label: 'Soft Skills' },
        ].map(({ cat, label }) => (
          <div key={cat} className="glass-card p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">{label}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(skills[cat] || []).map((skill) => (
                <span key={skill} onClick={() => removeSkill(cat, skill)} className="badge-green cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors">{skill} ×</span>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder={`Add ${label.toLowerCase()}...`} value={newSkill[cat]} onChange={(e) => setNewSkill((prev) => ({ ...prev, [cat]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && addSkill(cat)} className="input-glass text-sm py-2 flex-1" />
              <button onClick={() => addSkill(cat)} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition">Add</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TemplateStep({ selectedTemplate, setSelectedTemplate }) {
  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Choose Template</h2>
      <p className="text-sm text-slate-400 mb-6">Select a template for your resume output.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((template) => (
          <div key={template.id} onClick={() => setSelectedTemplate(template.id)} className={`glass-card overflow-hidden cursor-pointer group transition-all duration-200 ${selectedTemplate === template.id ? 'ring-2 ring-primary-400 shadow-glow-green' : 'hover:shadow-lg'}`}>
            <div className={`h-32 bg-gradient-to-br ${template.color} relative p-4`}>
              <div className="absolute inset-0 p-4 opacity-30">
                <div className="w-3/4 h-2.5 bg-white/80 rounded mb-2" /><div className="w-1/2 h-2 bg-white/60 rounded mb-3" />
                <div className="w-full h-1 bg-white/40 rounded mb-1" /><div className="w-full h-1 bg-white/40 rounded mb-1" /><div className="w-4/5 h-1 bg-white/40 rounded" />
              </div>
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                </div>
              )}
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-bold text-slate-800">{template.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GenerateStep({ data, generating, generated, generatedData, onGenerate, selectedTemplate }) {
  const resumeRef = useRef(null)
  const template = TEMPLATES.find((item) => item.id === selectedTemplate) || TEMPLATES[0]

  const handlePrint = () => {
    const content = resumeRef.current
    if (!content) return
    const printWin = window.open('', '_blank', 'width=900,height=1200')
    printWin.document.write(`<!DOCTYPE html><html><head><title>${data.name || 'Resume'} - Resume</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 28px; background: white; line-height: 1.62; }
      .page { min-height: 1040px; }
      h1 { font-family: 'Outfit', sans-serif; font-size: 29px; font-weight: 700; color: #0f172a; }
      h2 { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: ${template.accent}; border-bottom: 2px solid ${template.accent}20; padding-bottom: 4px; margin-bottom: 10px; margin-top: 20px; }
      .subtitle { color: ${template.accent}; font-weight: 600; font-size: 14px; margin-top: 2px; }
      .contact { display: flex; gap: 12px; justify-content: center; margin-top: 6px; font-size: 11px; color: #64748b; flex-wrap: wrap; }
      .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; }
      .section { margin-bottom: 12px; }
      ul { padding-left: 18px; }
      li { font-size: 12px; color: #475569; margin-bottom: 4px; }
      .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .skill-tag { background: ${template.accent}15; color: ${template.accent}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
      .muted { font-size: 11px; color: #64748b; }
    </style></head><body>`)
    printWin.document.write(content.innerHTML)
    printWin.document.write('</body></html>')
    printWin.document.close()
    setTimeout(() => printWin.print(), 500)
  }

  const generatedResume = generatedData || {}
  const personal = data || {}
  const summary = generatedResume.summary || personal.summary || ''
  const experience = generatedResume.experience || data.experience || []
  const education = generatedResume.education || data.education || []
  const skills = generatedResume.skills || data.skills || { technical: [], tools: [], soft: [] }
  const projects = generatedResume.projects || data.projects || []
  const certifications = generatedResume.certifications || data.certifications || []

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Generate Your Resume</h2>
      <p className="text-sm text-slate-400 mb-6">AI uses your structured profile and enhances wording without inventing facts.</p>

      {!generated ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-green">
            {generating ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : <Sparkles className="w-12 h-12 text-white" />}
          </div>
          {generating ? (
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">AI is building your resume...</h3>
              <p className="text-slate-400 text-sm mb-6">Formatting for full-page, ATS-friendly output.</p>
              <div className="max-w-xs mx-auto space-y-2">
                {['Analyzing structured profile...', 'Enhancing experience bullets...', 'Finalizing professional layout...'].map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-3 h-3 animate-spin text-primary-500" />{text}</div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Ready to generate!</h3>
              <p className="text-slate-400 text-sm mb-2">Template: <strong className="text-primary-600">{template.name}</strong></p>
              <p className="text-slate-400 text-sm mb-8">Creates a complete professional resume with summary, experience, projects, skills, and certifications.</p>
              <button onClick={onGenerate} className="btn-primary text-base px-8 py-4 mx-auto">
                <Sparkles className="w-5 h-5" /> Generate with AI
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 p-4 bg-primary-50 border border-primary-200 rounded-xl mb-6">
            <CheckCircle className="w-5 h-5 text-primary-500" />
            <p className="text-primary-700 font-semibold text-sm">Resume generated successfully and saved.</p>
          </div>

          <div ref={resumeRef} className="glass-card p-8 shadow-glass-lg min-h-[1024px]" style={{ borderTop: `4px solid ${template.accent}` }}>
            <div className="page">
              <div className="header text-center border-b border-slate-200 pb-5 mb-5">
                <h1 className="font-display font-bold text-2xl text-slate-900">{personal.name || 'Your Name'}</h1>
                <p className="subtitle font-medium mt-1" style={{ color: template.accent }}>{experience[0]?.title || personal.targetRole || 'Professional'}</p>
                <div className="contact flex items-center justify-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                  {personal.email && <span>{personal.email}</span>}
                  {personal.phone && <><span>•</span><span>{personal.phone}</span></>}
                  {personal.location && <><span>•</span><span>{personal.location}</span></>}
                  {personal.linkedin && <><span>•</span><span>{personal.linkedin}</span></>}
                  {personal.portfolio && <><span>•</span><span>{personal.portfolio}</span></>}
                </div>
              </div>

              <div className="space-y-4">
                {summary && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Professional Summary</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">{summary}</p>
                  </div>
                )}

                {experience.length > 0 && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Experience</h2>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="mb-3">
                        <p className="text-sm font-semibold text-slate-800">{exp.title} — {exp.company}</p>
                        <p className="text-xs text-slate-400 mb-1">{exp.duration} {exp.location ? `| ${exp.location}` : ''}</p>
                        <ul className="space-y-1">
                          {(exp.bullets || (exp.responsibilities ? String(exp.responsibilities).split('\n').filter(Boolean) : [])).map((line, lineIdx) => (
                            <li key={lineIdx} className="text-xs text-slate-600 flex gap-2"><span style={{ color: template.accent }}>•</span>{String(line).replace(/^[•\-]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {projects.length > 0 && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Projects</h2>
                    {projects.map((project, idx) => (
                      <div key={idx} className="mb-3">
                        <p className="text-sm font-semibold text-slate-800">{project.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{project.description}</p>
                        <p className="muted mt-1">Tech: {Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}</p>
                      </div>
                    ))}
                  </div>
                )}

                {education.length > 0 && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Education</h2>
                    {education.map((item, idx) => (
                      <div key={idx} className="mb-2">
                        <p className="text-sm font-semibold text-slate-800">{item.degree}</p>
                        <p className="text-xs text-slate-400">{item.institution} {item.year ? `| ${item.year}` : ''} {item.gpa ? `| ${item.gpa}` : ''}</p>
                      </div>
                    ))}
                  </div>
                )}

                {(skills.technical?.length > 0 || skills.tools?.length > 0 || skills.soft?.length > 0) && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Skills</h2>
                    <div className="skills-row flex flex-wrap gap-2">
                      {[...(skills.technical || []), ...(skills.tools || []), ...(skills.soft || [])].map((skill) => (
                        <span key={skill} className="skill-tag px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${template.accent}15`, color: template.accent }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div className="section">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Certifications</h2>
                    {certifications.map((cert, idx) => (
                      <p key={idx} className="text-xs text-slate-600 mb-1">{cert.title} — {cert.issuer} {cert.year ? `(${cert.year})` : ''}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-center flex-wrap">
            <button onClick={handlePrint} className="btn-primary">
              <Download className="w-4 h-4" /> Export as PDF
            </button>
            <button onClick={() => window.print()} className="btn-secondary">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ResumeBuilder() {
  const location = useLocation()
  const { notify } = useNotifications()
  const initialTemplate = location.state?.templateId || 'modern-pro'
  const initialStep = location.state?.step || 1

  const [step, setStep] = useState(initialStep)
  const [data, setData] = useState(emptyResumeData)
  const [resumeId, setResumeId] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)

  useEffect(() => {
    let mounted = true

    async function loadResume() {
      try {
        const response = await api.getLatestResume()
        const resume = response?.resume
        if (!mounted || !resume) return

        setResumeId(resume._id)
        setSelectedTemplate(resume.template || initialTemplate)
        setData({
          name: resume.personal?.name || '',
          email: resume.personal?.email || '',
          phone: resume.personal?.phone || '',
          location: resume.personal?.location || '',
          linkedin: resume.personal?.linkedin || '',
          portfolio: resume.personal?.portfolio || '',
          summary: resume.personal?.summary || '',
          education: resume.education || [],
          experience: (resume.experience || []).map((item) => ({ ...item, responsibilities: normalizeResponsibilities(item) })),
          projects: (resume.projects || []).map((project) => ({ ...project, technologies: toCsv(project.technologies) })),
          certifications: resume.certifications || [],
          skills: resume.skills || { technical: [], tools: [], soft: [] },
        })
      } catch (_err) {
        // Keep empty form when no resume exists yet.
      }
    }

    loadResume()
    return () => {
      mounted = false
    }
  }, [initialTemplate])

  const buildResumePayload = (payload, generatedOutput = null) => {
    const active = generatedOutput || payload
    return {
      title: `${payload.name || 'Resume'} — ${new Date().toLocaleDateString('en-IN')}`,
      template: selectedTemplate,
      personal: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        location: payload.location,
        linkedin: payload.linkedin,
        portfolio: payload.portfolio,
        summary: active.summary || payload.summary,
      },
      education: active.education || payload.education,
      experience: (active.experience || payload.experience || []).map((item) => ({
        ...item,
        responsibilities: Array.isArray(item.responsibilities)
          ? item.responsibilities
          : String(item.responsibilities || '').split('\n').map((line) => line.trim()).filter(Boolean),
      })),
      projects: (active.projects || payload.projects || []).map((project) => ({
        title: project.title || '',
        description: project.description || '',
        technologies: Array.isArray(project.technologies) ? project.technologies : fromCsv(project.technologies),
        link: project.link || '',
      })),
      certifications: active.certifications || payload.certifications || [],
      skills: active.skills || payload.skills,
      status: generatedOutput ? 'generated' : 'draft',
      aiGenerated: generatedOutput
        ? {
            summary: generatedOutput.summary || '',
            bulletPoints: (generatedOutput.experience || []).flatMap((exp) => exp.bullets || []),
            keywords: [
              ...(generatedOutput.skills?.technical || []),
              ...(generatedOutput.skills?.tools || []),
              ...(generatedOutput.skills?.soft || []),
            ].slice(0, 24),
            generatedAt: new Date(),
          }
        : undefined,
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const structuredPayload = {
        personal: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          portfolio: data.portfolio,
          summary: data.summary,
        },
        education: data.education,
        experience: data.experience,
        projects: data.projects.map((project) => ({ ...project, technologies: fromCsv(project.technologies) })),
        certifications: data.certifications,
        skills: data.skills,
        template: selectedTemplate,
      }

      const response = await api.generateResumeAI(structuredPayload)
      const generatedOutput = response?.generated || null

      if (response?.success && generatedOutput) {
        setGeneratedData(generatedOutput)

        const payload = buildResumePayload(data, generatedOutput)
        const saved = resumeId ? await api.updateResume(resumeId, payload) : await api.createResume(payload)
        setResumeId(saved?.resume?._id || resumeId)

        notify({
          type: 'success',
          title: 'Resume Generated',
          message: 'AI generated and saved your resume successfully.',
        })
      }
    } catch (err) {
      notify({ type: 'error', title: 'Generation Failed', message: err.message || 'Could not generate resume.' })
    }

    setGenerating(false)
    setGenerated(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="glass-card p-8">
        <StepIndicator currentStep={step} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {step === 1 && <PersonalInfoStep data={data} setData={setData} />}
            {step === 2 && <EducationStep data={data} setData={setData} />}
            {step === 3 && <ExperienceStep data={data} setData={setData} />}
            {step === 4 && <ProjectsStep data={data} setData={setData} />}
            {step === 5 && <CertificationsStep data={data} setData={setData} />}
            {step === 6 && <SkillsStep data={data} setData={setData} />}
            {step === 7 && <TemplateStep selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />}
            {step === 8 && <GenerateStep data={data} generating={generating} generated={generated} generatedData={generatedData} onGenerate={handleGenerate} selectedTemplate={selectedTemplate} />}
          </motion.div>
        </AnimatePresence>

        {step < 8 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep((state) => Math.max(1, state - 1))} disabled={step === 1} className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={() => setStep((state) => Math.min(8, state + 1))} className="btn-primary">
              {step === 7 ? 'Generate Resume' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
