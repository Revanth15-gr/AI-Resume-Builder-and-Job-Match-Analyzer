import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import {
  Sparkles, User, GraduationCap, Briefcase, Code2,
  ChevronRight, ChevronLeft, Download, Save, Eye,
  CheckCircle, Loader2, FileText, Printer, LayoutTemplate
} from 'lucide-react'

const steps = [
  { id: 1, label: 'Personal Info', icon: User },
  { id: 2, label: 'Education', icon: GraduationCap },
  { id: 3, label: 'Experience', icon: Briefcase },
  { id: 4, label: 'Skills', icon: Code2 },
  { id: 5, label: 'Template', icon: LayoutTemplate },
  { id: 6, label: 'Generate', icon: Sparkles },
]

const TEMPLATES = [
  { id: 'modern-pro', name: 'Modern Pro', color: 'from-primary-500 to-primary-600', accent: '#10b981' },
  { id: 'executive', name: 'Executive', color: 'from-slate-700 to-slate-900', accent: '#334155' },
  { id: 'creative', name: 'Creative', color: 'from-violet-500 to-purple-600', accent: '#8b5cf6' },
  { id: 'tech-focus', name: 'Tech Focus', color: 'from-sky-500 to-blue-600', accent: '#0ea5e9' },
  { id: 'minimal', name: 'Minimal Clean', color: 'from-emerald-400 to-teal-600', accent: '#14b8a6' },
  { id: 'bold', name: 'Bold Impact', color: 'from-orange-500 to-rose-500', accent: '#f97316' },
]

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200 z-0" />
      {steps.map((step) => {
        const Icon = step.icon
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex flex-col items-center gap-2 z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              isDone ? 'bg-primary-500 border-primary-500' :
              isActive ? 'bg-white border-primary-500 shadow-lg shadow-primary-100' :
              'bg-white border-slate-200'
            }`}>
              {isDone ? <CheckCircle className="w-5 h-5 text-white" /> : <Icon className={`w-4 h-4 ${isActive ? 'text-primary-600' : 'text-slate-300'}`} />}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-primary-700' : isDone ? 'text-primary-500' : 'text-slate-400'}`}>{step.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function PersonalInfoStep({ data, setData }) {
  const fields = [
    { key: 'name', label: 'Full Name', placeholder: 'Rahul Sharma', type: 'text' },
    { key: 'email', label: 'Email Address', placeholder: 'rahul@example.com', type: 'email' },
    { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
    { key: 'location', label: 'Location', placeholder: 'Bangalore, India', type: 'text' },
    { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'linkedin.com/in/rahulsharma', type: 'url' },
    { key: 'portfolio', label: 'Portfolio / GitHub', placeholder: 'github.com/rahul', type: 'url' },
  ]
  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Personal Information</h2>
      <p className="text-sm text-slate-400 mb-6">Let's start with the basics. This info appears at the top of your resume.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">{label}</label>
            <input type={type} placeholder={placeholder} value={data[key] || ''} onChange={e => setData(prev => ({ ...prev, [key]: e.target.value }))} className="input-glass" />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Professional Summary</label>
        <textarea rows={4} placeholder="Write a brief professional summary or let AI generate one..." value={data.summary || ''} onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))} className="input-glass resize-none" />
      </div>
    </div>
  )
}

function EducationStep({ data, setData }) {
  const edu = data.education || [{ degree: 'B.Tech Computer Science', institution: 'VIT University', year: '2019 – 2023', gpa: '8.7 CGPA', coursework: 'Data Structures, Cloud Computing, Machine Learning' }]
  const updateEdu = (i, field, val) => {
    const updated = [...edu]; updated[i] = { ...updated[i], [field]: val }
    setData(prev => ({ ...prev, education: updated }))
  }
  const addEdu = () => setData(prev => ({ ...prev, education: [...edu, { degree: '', institution: '', year: '', gpa: '', coursework: '' }] }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Education</h2>
      <p className="text-sm text-slate-400 mb-6">Add your academic qualifications.</p>
      {edu.map((e, i) => (
        <div key={i} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Degree</label><input placeholder="B.Tech Computer Science" value={e.degree} onChange={ev => updateEdu(i,'degree',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Institution</label><input placeholder="IIT Delhi" value={e.institution} onChange={ev => updateEdu(i,'institution',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Year</label><input placeholder="2020 – 2024" value={e.year} onChange={ev => updateEdu(i,'year',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">GPA / Percentage</label><input placeholder="8.5 CGPA" value={e.gpa} onChange={ev => updateEdu(i,'gpa',ev.target.value)} className="input-glass" /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Coursework</label><textarea rows={2} placeholder="Data Structures, ML..." value={e.coursework} onChange={ev => updateEdu(i,'coursework',ev.target.value)} className="input-glass resize-none" /></div>
        </div>
      ))}
      <button onClick={addEdu} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Another Education</button>
    </div>
  )
}

function ExperienceStep({ data, setData }) {
  const exp = data.experience || [{ title: 'Full Stack Developer', company: 'Infosys', duration: 'Jun 2023 – Present', location: 'Pune, India', responsibilities: '• Built scalable REST APIs using Node.js\n• Developed React frontend components\n• Collaborated with cross-functional teams' }]
  const updateExp = (i, field, val) => {
    const updated = [...exp]; updated[i] = { ...updated[i], [field]: val }
    setData(prev => ({ ...prev, experience: updated }))
  }
  const addExp = () => setData(prev => ({ ...prev, experience: [...exp, { title: '', company: '', duration: '', location: '', responsibilities: '' }] }))

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Work Experience</h2>
      <p className="text-sm text-slate-400 mb-6">Add your work history. AI will enhance your bullet points.</p>
      {exp.map((e, i) => (
        <div key={i} className="glass-card p-5 space-y-4 mb-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Job Title</label><input placeholder="Software Engineer" value={e.title} onChange={ev => updateExp(i,'title',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Company</label><input placeholder="TechCorp India" value={e.company} onChange={ev => updateExp(i,'company',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Duration</label><input placeholder="Jan 2023 – Present" value={e.duration} onChange={ev => updateExp(i,'duration',ev.target.value)} className="input-glass" /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location</label><input placeholder="Bangalore, India" value={e.location} onChange={ev => updateExp(i,'location',ev.target.value)} className="input-glass" /></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Key Responsibilities</label>
            <textarea rows={4} placeholder="• Built React dashboard reducing load time by 40%" value={e.responsibilities} onChange={ev => updateExp(i,'responsibilities',ev.target.value)} className="input-glass resize-none" />
          </div>
        </div>
      ))}
      <button onClick={addExp} className="text-sm text-primary-600 font-semibold flex items-center gap-1 hover:text-primary-700"><span className="text-lg">+</span> Add Another Experience</button>
    </div>
  )
}

function SkillsStep({ data, setData }) {
  const skills = data.skills || { technical: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'], tools: ['Git', 'Jira', 'Figma', 'VS Code', 'Postman'], soft: ['Problem Solving', 'Team Leadership', 'Communication'] }
  const [newSkill, setNewSkill] = useState({ technical: '', tools: '', soft: '' })

  const addSkill = (cat) => {
    if (!newSkill[cat].trim()) return
    const updated = { ...skills, [cat]: [...skills[cat], newSkill[cat].trim()] }
    setData(prev => ({ ...prev, skills: updated }))
    setNewSkill(prev => ({ ...prev, [cat]: '' }))
  }
  const removeSkill = (cat, skill) => {
    const updated = { ...skills, [cat]: skills[cat].filter(s => s !== skill) }
    setData(prev => ({ ...prev, skills: updated }))
  }

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Skills</h2>
      <p className="text-sm text-slate-400 mb-6">Add your technical and soft skills.</p>
      <div className="space-y-5">
        {[{ cat: 'technical', label: 'Technical Skills' }, { cat: 'tools', label: 'Tools & Platforms' }, { cat: 'soft', label: 'Soft Skills' }].map(({ cat, label }) => (
          <div key={cat} className="glass-card p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">{label}</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(skills[cat] || []).map(skill => (
                <span key={skill} onClick={() => removeSkill(cat, skill)} className="badge-green cursor-pointer hover:bg-red-100 hover:text-red-600 transition-colors">{skill} ×</span>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder={`Add ${label.toLowerCase()}...`} value={newSkill[cat]} onChange={e => setNewSkill(p => ({ ...p, [cat]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addSkill(cat)} className="input-glass text-sm py-2 flex-1" />
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
      <p className="text-sm text-slate-400 mb-6">Select a template for your resume. This will determine the final layout.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <div key={t.id} onClick={() => setSelectedTemplate(t.id)}
            className={`glass-card overflow-hidden cursor-pointer group transition-all duration-200 ${selectedTemplate === t.id ? 'ring-2 ring-primary-400 shadow-glow-green' : 'hover:shadow-lg'}`}>
            <div className={`h-32 bg-gradient-to-br ${t.color} relative p-4`}>
              <div className="absolute inset-0 p-4 opacity-30">
                <div className="w-3/4 h-2.5 bg-white/80 rounded mb-2" /><div className="w-1/2 h-2 bg-white/60 rounded mb-3" />
                <div className="w-full h-1 bg-white/40 rounded mb-1" /><div className="w-full h-1 bg-white/40 rounded mb-1" /><div className="w-4/5 h-1 bg-white/40 rounded" />
              </div>
              {selectedTemplate === t.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-500" />
                </div>
              )}
            </div>
            <div className="p-3 text-center">
              <p className="text-sm font-bold text-slate-800">{t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GenerateStep({ data, generating, generated, generatedData, onGenerate, selectedTemplate }) {
  const resumeRef = useRef(null)
  const template = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0]

  const handlePrint = () => {
    const content = resumeRef.current
    if (!content) return
    const printWin = window.open('', '_blank', 'width=800,height=1100')
    printWin.document.write(`<!DOCTYPE html><html><head><title>${data.name || 'Resume'} - Resume</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; background: white; line-height: 1.6; }
      h1 { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; color: #0f172a; }
      h2 { font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: ${template.accent}; border-bottom: 2px solid ${template.accent}20; padding-bottom: 4px; margin-bottom: 10px; margin-top: 20px; }
      .subtitle { color: ${template.accent}; font-weight: 600; font-size: 14px; margin-top: 2px; }
      .contact { display: flex; gap: 12px; justify-content: center; margin-top: 6px; font-size: 11px; color: #64748b; flex-wrap: wrap; }
      .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 16px; }
      .section { margin-bottom: 12px; }
      .exp-title { font-weight: 600; font-size: 14px; color: #1e293b; }
      .exp-meta { font-size: 11px; color: #64748b; margin-bottom: 4px; }
      ul { padding-left: 18px; }
      li { font-size: 12px; color: #475569; margin-bottom: 3px; }
      .skills-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .skill-tag { background: ${template.accent}15; color: ${template.accent}; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
      @media print { body { padding: 20px; } }
    </style></head><body>`)
    printWin.document.write(content.innerHTML)
    printWin.document.write('</body></html>')
    printWin.document.close()
    setTimeout(() => { printWin.print() }, 500)
  }

  const d = generatedData || {}
  const personal = data || {}
  const summary = d.summary || personal.summary || ''
  const experience = d.experience || data.experience || []
  const education = d.education || data.education || []
  const skills = d.skills || data.skills || { technical: [], tools: [], soft: [] }

  return (
    <div>
      <h2 className="font-display font-bold text-xl text-slate-800 mb-1">Generate Your Resume</h2>
      <p className="text-sm text-slate-400 mb-6">Review your information and let AI create your perfect resume.</p>

      {!generated ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6 shadow-glow-green">
            {generating ? <Loader2 className="w-12 h-12 text-white animate-spin" /> : <Sparkles className="w-12 h-12 text-white" />}
          </div>
          {generating ? (
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">AI is building your resume...</h3>
              <p className="text-slate-400 text-sm mb-6">Connecting to NVIDIA GPT-OSS-20B API...</p>
              <div className="max-w-xs mx-auto space-y-2">
                {['Analyzing profile...', 'Generating ATS-optimized content...', 'Formatting with template...'].map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-500"><Loader2 className="w-3 h-3 animate-spin text-primary-500" />{t}</div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Ready to generate!</h3>
              <p className="text-slate-400 text-sm mb-2">Template: <strong className="text-primary-600">{template.name}</strong></p>
              <p className="text-slate-400 text-sm mb-8">AI will create a professional, ATS-optimized resume using NVIDIA GPT.</p>
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
            <p className="text-primary-700 font-semibold text-sm">Resume generated successfully using NVIDIA GPT-OSS-20B!</p>
          </div>

          {/* Resume Preview */}
          <div ref={resumeRef} className="glass-card p-8 shadow-glass-lg" style={{ borderTop: `4px solid ${template.accent}` }}>
            <div className="header text-center border-b border-slate-200 pb-5 mb-5">
              <h1 className="font-display font-bold text-2xl text-slate-900">{personal.name || 'Your Name'}</h1>
              <p className="subtitle font-medium mt-1" style={{ color: template.accent }}>{experience[0]?.title || 'Professional'}</p>
              <div className="contact flex items-center justify-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                {personal.email && <span>{personal.email}</span>}
                {personal.phone && <><span>•</span><span>{personal.phone}</span></>}
                {personal.location && <><span>•</span><span>{personal.location}</span></>}
                {personal.linkedin && <><span>•</span><span>{personal.linkedin}</span></>}
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
                  {experience.map((exp, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm font-semibold text-slate-800">{exp.title} — {exp.company}</p>
                      <p className="text-xs text-slate-400 mb-1">{exp.duration} {exp.location ? `| ${exp.location}` : ''}</p>
                      <ul className="space-y-1">
                        {(exp.bullets || (exp.responsibilities ? exp.responsibilities.split('\n').filter(Boolean) : [])).map((b, j) => (
                          <li key={j} className="text-xs text-slate-600 flex gap-2"><span style={{ color: template.accent }}>•</span>{b.replace(/^[•\-]\s*/, '')}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {education.length > 0 && (
                <div className="section">
                  <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Education</h2>
                  {education.map((e, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm font-semibold text-slate-800">{e.degree}</p>
                      <p className="text-xs text-slate-400">{e.institution} {e.year ? `| ${e.year}` : ''} {e.gpa ? `| ${e.gpa}` : ''}</p>
                    </div>
                  ))}
                </div>
              )}

              {(skills.technical?.length > 0 || skills.tools?.length > 0) && (
                <div className="section">
                  <h2 className="text-xs font-black uppercase tracking-widest mb-2 pb-1" style={{ color: template.accent, borderBottom: `2px solid ${template.accent}20` }}>Skills</h2>
                  <div className="skills-row flex flex-wrap gap-2">
                    {[...(skills.technical || []), ...(skills.tools || [])].map(s => (
                      <span key={s} className="skill-tag px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${template.accent}15`, color: template.accent }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
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
  const initialTemplate = location.state?.templateId || 'modern-pro'
  const initialStep = location.state?.step || 1

  const [step, setStep] = useState(initialStep)
  const [data, setData] = useState({
    name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210',
    location: 'Bangalore, India', linkedin: 'linkedin.com/in/rahulsharma', portfolio: 'github.com/rahul',
    summary: '',
    education: [{ degree: 'B.Tech Computer Science', institution: 'VIT University', year: '2019 – 2023', gpa: '8.7 CGPA', coursework: 'Data Structures, Cloud Computing, ML' }],
    experience: [{ title: 'Full Stack Developer', company: 'Infosys', duration: 'Jun 2023 – Present', location: 'Pune, India', responsibilities: '• Built scalable REST APIs using Node.js\n• Developed React frontend components\n• Collaborated with cross-functional teams' }],
    skills: { technical: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS', 'Docker'], tools: ['Git', 'Jira', 'Figma', 'VS Code', 'Postman'], soft: ['Problem Solving', 'Team Leadership', 'Communication'] },
  })
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [generatedData, setGeneratedData] = useState(null)

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/resumes/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal: { name: data.name, email: data.email, phone: data.phone, location: data.location, linkedin: data.linkedin, portfolio: data.portfolio, summary: data.summary },
          education: data.education,
          experience: data.experience,
          skills: data.skills,
          template: selectedTemplate,
        }),
      })
      const json = await res.json()
      if (json.success && json.generated) {
        setGeneratedData(json.generated)
      }
    } catch (err) {
      console.error('Generation failed:', err)
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
            {step === 4 && <SkillsStep data={data} setData={setData} />}
            {step === 5 && <TemplateStep selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate} />}
            {step === 6 && <GenerateStep data={data} generating={generating} generated={generated} generatedData={generatedData} onGenerate={handleGenerate} selectedTemplate={selectedTemplate} />}
          </motion.div>
        </AnimatePresence>

        {step < 6 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button onClick={() => setStep(s => Math.min(6, s + 1))} className="btn-primary">
              {step === 5 ? 'Generate Resume' : 'Next Step'} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
