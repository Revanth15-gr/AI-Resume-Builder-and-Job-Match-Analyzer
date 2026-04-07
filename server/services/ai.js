/**
 * AI Service — NVIDIA OpenAI-Compatible API Integration
 * Uses GPT-OSS-20B via NVIDIA Integrate endpoint
 */

import Resume from '../models/Resume.js'
import { env } from '../config/env.js'

const NVIDIA_BASE_URL = env.NVIDIA_BASE_URL
const NVIDIA_API_KEY = env.NVIDIA_API_KEY
const MODEL = env.NVIDIA_MODEL

// ──────────────── NVIDIA Chat Helper ────────────────
async function chatCompletion(messages, maxTokens = 2048) {
  try {
    const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: maxTokens,
        stream: false,
      }),
    })

    if (!res.ok) {
      const errBody = await res.text()
      console.error('NVIDIA API error:', res.status, errBody)
      throw new Error(`NVIDIA API error: ${res.status}`)
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (err) {
    console.error('AI call failed:', err.message)
    // Fallback to local logic
    return null
  }
}

// ──────────────── Keyword Database ────────────────
const TECH_KEYWORDS = {
  'frontend': ['React', 'Angular', 'Vue.js', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Webpack', 'Vite'],
  'backend': ['Node.js', 'Express', 'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot', 'Go', 'Rust', 'GraphQL', 'REST API', 'Microservices'],
  'database': ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'DynamoDB', 'Cassandra', 'Firebase', 'Prisma', 'Mongoose'],
  'devops': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible'],
  'data': ['Python', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'SQL', 'Spark', 'Airflow', 'Kafka'],
  'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android', 'Expo'],
}

const EXTRA_KEYWORDS = [
  'C++',
  'C#',
  '.NET',
  'Machine Learning',
  'Deep Learning',
  'NLP',
  'LLM',
  'LangChain',
  'OpenAI',
  'RAG',
  'Prompt Engineering',
  'Jest',
  'Cypress',
  'Playwright',
  'Selenium',
  'Postman',
  'Linux',
  'Bash',
  'Shell Scripting',
  'System Design',
  'OOP',
  'Data Structures',
  'Algorithms',
]

const SKILL_ALIASES = {
  JavaScript: ['javascript', 'js', 'ecmascript'],
  TypeScript: ['typescript', 'ts'],
  'Node.js': ['node', 'nodejs', 'node.js'],
  React: ['react', 'reactjs', 'react.js'],
  'Next.js': ['next', 'nextjs', 'next.js'],
  'Vue.js': ['vue', 'vuejs', 'vue.js'],
  'REST API': ['rest', 'rest api', 'restful api', 'restful'],
  GraphQL: ['graphql', 'graph ql'],
  MongoDB: ['mongodb', 'mongo'],
  PostgreSQL: ['postgresql', 'postgres'],
  'CI/CD': ['ci/cd', 'ci cd', 'continuous integration', 'continuous deployment'],
  Docker: ['docker', 'containerization'],
  Kubernetes: ['kubernetes', 'k8s'],
  AWS: ['aws', 'amazon web services'],
  Azure: ['azure', 'microsoft azure'],
  GCP: ['gcp', 'google cloud', 'google cloud platform'],
  Python: ['python', 'py'],
  Git: ['git', 'github', 'gitlab'],
  'React Native': ['react native', 'rn'],
}

const JD_STOP_WORDS = new Set([
  'and', 'or', 'the', 'with', 'for', 'from', 'into', 'that', 'this', 'have', 'has', 'will', 'you', 'your', 'our',
  'are', 'is', 'was', 'were', 'be', 'been', 'being', 'can', 'could', 'should', 'would', 'must', 'able', 'ability',
  'experience', 'years', 'year', 'role', 'team', 'work', 'working', 'strong', 'good', 'excellent', 'skills', 'skill',
  'developer', 'engineer', 'development', 'design', 'build', 'building', 'knowledge', 'understanding', 'required',
  'preferred', 'plus', 'nice', 'to', 'in', 'on', 'at', 'by', 'as', 'an', 'a', 'of', 'using', 'use', 'hands', 'handson',
  'communication', 'problem', 'solving', 'collaboration', 'agile',
])

const KEYWORD_CATALOG = [...new Set([...Object.values(TECH_KEYWORDS).flat(), ...EXTRA_KEYWORDS])]

function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeText(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalizeSkill(skill = '') {
  const normalized = normalizeText(skill)
  if (!normalized) return ''

  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.some((alias) => normalized === normalizeText(alias))) return canonical
  }

  const exact = KEYWORD_CATALOG.find((item) => normalizeText(item) === normalized)
  return exact || String(skill).trim()
}

function containsSkill(text = '', skill = '') {
  const normalizedText = normalizeText(text)
  const canonical = canonicalizeSkill(skill)
  if (!canonical || !normalizedText) return false

  const aliases = [canonical, ...(SKILL_ALIASES[canonical] || [])]
  return aliases.some((alias) => {
    const normalizedAlias = normalizeText(alias)
    if (!normalizedAlias) return false
    const pattern = new RegExp(`(^|[^a-z0-9+#.])${escapeRegex(normalizedAlias)}($|[^a-z0-9+#.])`, 'i')
    return pattern.test(normalizedText)
  })
}

function uniqueCanonicalSkills(skills = []) {
  const seen = new Set()
  const result = []
  skills.forEach((skill) => {
    const canonical = canonicalizeSkill(skill)
    if (!canonical) return
    const key = canonical.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    result.push(canonical)
  })
  return result
}

function extractCandidateTerms(text = '') {
  const tokens = normalizeText(text).split(/\s+/).filter(Boolean)
  const terms = []
  for (let i = 0; i < tokens.length; i++) {
    const one = tokens[i]
    if (one.length > 2 && !JD_STOP_WORDS.has(one)) terms.push(one)
    if (i + 1 < tokens.length) {
      const two = `${tokens[i]} ${tokens[i + 1]}`
      if (two.length > 5 && !JD_STOP_WORDS.has(tokens[i]) && !JD_STOP_WORDS.has(tokens[i + 1])) terms.push(two)
    }
  }
  return terms
}

function normalizeResumePayload(resume = {}) {
  const personal = resume.personal || {
    name: resume.name || '',
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location || '',
    linkedin: resume.linkedin || '',
    portfolio: resume.portfolio || '',
    summary: resume.summary || '',
  }

  return {
    personal,
    education: Array.isArray(resume.education) ? resume.education : [],
    experience: Array.isArray(resume.experience) ? resume.experience : [],
    skills: resume.skills || { technical: [], tools: [], soft: [] },
    projects: Array.isArray(resume.projects) ? resume.projects : [],
    certifications: Array.isArray(resume.certifications) ? resume.certifications : [],
    achievements: Array.isArray(resume.achievements) ? resume.achievements : [],
  }
}

function getAllSkills(skills = {}) {
  return [...(skills.technical || []), ...(skills.tools || []), ...(skills.soft || [])].filter(Boolean)
}

function buildActionItems(missingSkills = [], matchedSkills = []) {
  const items = []

  if (missingSkills.length) {
    missingSkills.slice(0, 4).forEach((skill) => {
      items.push({
        type: 'skills',
        label: `Add ${skill} to your resume`,
        details: `${skill} appears in the job description but is missing in your profile.`,
        skills: [skill],
      })
    })

    items.push({
      type: 'skills',
      label: `Add ${missingSkills.slice(0, 3).join(', ')} to your resume`,
      details: 'These are the biggest gaps from the job description.',
      skills: missingSkills.slice(0, 5),
    })
  }

  if (matchedSkills.length) {
    items.push({
      type: 'summary',
      label: `Highlight ${matchedSkills.slice(0, 2).join(' and ')} more prominently`,
      details: 'Place the strongest overlap near the top of the resume.',
      skills: matchedSkills.slice(0, 2),
    })
  }

  items.push({
    type: 'bullet',
    label: 'Rewrite 1-2 experience bullets with measurable impact',
    details: 'Use metrics, results, and action verbs to improve ATS relevance.',
  })

  return items
}

// ──────────────── Resume Generation (AI) ────────────────
export async function generateResumeSummary(resume) {
  const { personal, experience, skills, education } = resume
  const allSkills = [...(skills?.technical || []), ...(skills?.tools || [])]
  const name = personal?.name || 'Professional'
  const role = experience?.[0]?.title || 'Software Developer'

  const prompt = `You are a professional resume writer specializing in Indian tech market. Generate a resume for:

Name: ${name}
Role: ${role}
Skills: ${allSkills.join(', ')}
Education: ${education?.map(e => `${e.degree} from ${e.institution} (${e.year})`).join('; ') || 'Not specified'}
Experience: ${experience?.map(e => `${e.title} at ${e.company} (${e.duration})`).join('; ') || 'Not specified'}

Return a JSON object with these exact fields:
{
  "summary": "A 2-3 sentence professional summary",
  "bulletPoints": ["5-7 achievement-focused bullet points using action verbs and metrics"],
  "keywords": ["10-15 relevant ATS keywords"]
}

Use Indian tech context. Include quantifiable metrics like percentages, team sizes, and impact numbers. Return ONLY valid JSON, no markdown.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }])

  if (aiResponse) {
    try {
      // Try to parse JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || '',
          bulletPoints: parsed.bulletPoints || [],
          keywords: parsed.keywords || [],
        }
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e.message)
    }
  }

  // Fallback to local generation
  return localGenerateResume(resume)
}

// ──────────────── ATS Score Analysis (AI) ────────────────
export async function analyzeATS(resume, jobDescription = '') {
  const normalized = normalizeResumePayload(resume)
  const { personal, experience, skills, education } = normalized
  const allSkills = getAllSkills(skills)
  const resumeText = JSON.stringify(normalized)
  const jdKeywords = jobDescription ? extractJDKeywords(jobDescription) : []
  const matchedFromResume = jdKeywords.filter((skill) => containsSkill(resumeText, skill))
  const missingFromResume = jdKeywords.filter((skill) => !containsSkill(resumeText, skill))

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume against ${jobDescription ? 'the given job description' : 'general ATS standards'}.

Resume Name: ${personal?.name || 'Not provided'}
Resume Summary: ${personal?.summary || 'Not provided'}
Resume Skills: ${allSkills.join(', ')}
Experience: ${experience?.map(e => `${e.title} at ${e.company}`).join('; ') || 'None'}
Has LinkedIn: ${personal?.linkedin ? 'Yes' : 'No'}
Education: ${education?.length || 0} entries
${jobDescription ? `Job Description: ${jobDescription.substring(0, 500)}` : ''}

Return a JSON object with:
{
  "overall": <score 0-100>,
  "keywordDensity": <score 0-100>,
  "formatScore": <score 0-100>,
  "readability": <score 0-100>,
  "issues": [{"severity": "critical|warning|info", "message": "issue description", "suggestion": "fix suggestion"}],
  "actionItems": [{"type": "skills|summary|bullet", "label": "action label", "details": "why it matters", "skills": ["optional"]}],
  "platformScores": {"naukri": <score>, "linkedin": <score>, "indeed": <score>, "workday": <score>, "greenhouse": <score>}
}

Be realistic with scores. Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }])

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const fallback = localAnalyzeATS(normalized, jobDescription)
        const issues = Array.isArray(parsed.issues) && parsed.issues.length ? parsed.issues : fallback.issues
        const actionItems = Array.isArray(parsed.actionItems) && parsed.actionItems.length
          ? parsed.actionItems
          : buildActionItems(missingFromResume, matchedFromResume)
        return {
          overall: Number.isFinite(parsed.overall) ? parsed.overall : fallback.overall,
          keywordDensity: Number.isFinite(parsed.keywordDensity) ? parsed.keywordDensity : fallback.keywordDensity,
          formatScore: Number.isFinite(parsed.formatScore) ? parsed.formatScore : fallback.formatScore,
          readability: Number.isFinite(parsed.readability) ? parsed.readability : fallback.readability,
          issues,
          actionItems,
          platformScores: parsed.platformScores || fallback.platformScores,
        }
      }
    } catch (e) {
      console.error('Failed to parse ATS response:', e.message)
    }
  }

  return localAnalyzeATS(normalized, jobDescription)
}

// ──────────────── Job Match Analysis (AI) ────────────────
export async function analyzeJobMatch(jobDescription, userId, resumeId, resumeData = null) {
  let resume
  if (resumeData) {
    resume = normalizeResumePayload(resumeData)
  } else if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, user: userId })
  } else {
    resume = await Resume.findOne({ user: userId }).sort('-updatedAt')
  }

  const normalized = resume ? normalizeResumePayload(resume) : normalizeResumePayload()
  const resumeSkills = getAllSkills(normalized.skills)
  const resumeSummary = normalized.personal?.summary || ''
  const experienceSummary = normalized.experience?.map(e => `${e.title} at ${e.company} (${e.duration || 'duration not provided'})`).join('; ') || 'None'
  const educationSummary = normalized.education?.map(e => `${e.degree} from ${e.institution}`).join('; ') || 'None'

  const prompt = `You are a job match analyst. Compare this resume against the job description and identify only the real overlap.

Resume Skills: ${resumeSkills.join(', ')}
Resume Summary: ${resumeSummary || 'Not provided'}
Experience: ${experienceSummary}
Education: ${educationSummary}
Job Description: ${jobDescription.substring(0, 800)}

Return a JSON object with:
{
  "matchScore": <0-100>,
  "matchedSkills": ["skills found in both resume and JD"],
  "missingSkills": ["skills required by JD but missing from resume"],
  "aiSuggestions": ["4-5 specific, actionable suggestions to improve match"],
  "actionItems": [{"type": "skills|summary|bullet", "label": "action label", "details": "why it matters", "skills": ["optional"]}],
  "keywordAnalysis": [{"keyword": "skill", "found": true/false, "importance": "high/medium/low"}]
}

Be accurate with skill matching. Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }])

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const fallback = localAnalyzeJobMatch(jobDescription, resumeSkills)
        const matchedSkills = uniqueCanonicalSkills(parsed.matchedSkills || [])
        const missingSkills = uniqueCanonicalSkills(parsed.missingSkills || [])
        const useFallback = matchedSkills.length === 0 && missingSkills.length === 0
        const finalMatchedSkills = useFallback ? fallback.matchedSkills : matchedSkills
        const finalMissingSkills = useFallback ? fallback.missingSkills : missingSkills
        const finalActionItems = Array.isArray(parsed.actionItems) && parsed.actionItems.length
          ? parsed.actionItems
          : buildActionItems(finalMissingSkills, finalMatchedSkills)

        const denominator = finalMatchedSkills.length + finalMissingSkills.length
        const deterministicScore = denominator > 0 ? Math.round((finalMatchedSkills.length / denominator) * 100) : 0

        return {
          matchScore: useFallback
            ? fallback.matchScore
            : Number.isFinite(parsed.matchScore) && parsed.matchScore >= 0 && parsed.matchScore <= 100
              ? parsed.matchScore
              : deterministicScore,
          matchedSkills: finalMatchedSkills,
          missingSkills: finalMissingSkills,
          aiSuggestions: Array.isArray(parsed.aiSuggestions) && parsed.aiSuggestions.length
            ? parsed.aiSuggestions
            : fallback.aiSuggestions,
          actionItems: finalActionItems,
          keywordAnalysis: Array.isArray(parsed.keywordAnalysis) && parsed.keywordAnalysis.length
            ? parsed.keywordAnalysis
            : fallback.keywordAnalysis,
        }
      }
    } catch (e) {
      console.error('Failed to parse match response:', e.message)
    }
  }

  return localAnalyzeJobMatch(jobDescription, resumeSkills)
}

// ──────────────── Skill Suggestions (AI) ────────────────
export async function suggestSkills(resume, targetRole = '') {
  const currentSkills = [...(resume.skills?.technical || []), ...(resume.skills?.tools || [])]
  const role = targetRole || resume.experience?.[0]?.title || 'Software Developer'

  const prompt = `Suggest 8 in-demand skills for a "${role}" role in India that are NOT already in this list: ${currentSkills.join(', ')}

Return a JSON array of skill names only, like: ["Skill1", "Skill2", ...]
Return ONLY valid JSON array.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }], 512)

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]).slice(0, 8)
      }
    } catch (e) { }
  }

  // Fallback
  const allTech = Object.values(TECH_KEYWORDS).flat()
  return allTech.filter(s => !currentSkills.some(cs => cs.toLowerCase() === s.toLowerCase())).slice(0, 8)
}

export async function generateCoverLetter({ resume, jobDescription = '', company = '', role = '' }) {
  const normalized = normalizeResumePayload(resume || {})
  const skills = getAllSkills(normalized.skills)

  const prompt = `You are an expert career coach. Write a professional cover letter in under 350 words.

Resume data (JSON): ${JSON.stringify(normalized)}
Target company: ${company || 'Not specified'}
Target role: ${role || 'Not specified'}
Job description: ${jobDescription || 'Not provided'}

Rules:
- Use only facts available in the resume payload.
- Do not invent achievements, employers, projects, or certifications.
- Tone: confident, concise, professional.
- Include 3 concrete value points tied to user experience/skills.

Return JSON:
{
  "subject": "...",
  "coverLetter": "..."
}

Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }], 1200)
  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.coverLetter) return parsed
      }
    } catch (_error) {
      // Fallback below.
    }
  }

  const subject = `Application for ${role || 'the role'}${company ? ` at ${company}` : ''}`
  const coverLetter = `Dear Hiring Manager,\n\nI am excited to apply for ${role || 'this role'}${company ? ` at ${company}` : ''}. With hands-on experience in ${skills.slice(0, 4).join(', ') || 'software development'} and a strong focus on delivering measurable outcomes, I can contribute effectively to your team.\n\nIn my previous work, I have built and improved production-ready solutions, collaborated with cross-functional teams, and consistently focused on quality, performance, and reliability. I am particularly motivated by opportunities where I can solve meaningful problems and create business impact.\n\nI would welcome the opportunity to discuss how my background aligns with your needs. Thank you for your time and consideration.\n\nSincerely,\n${normalized.personal?.name || 'Candidate'}`
  return { subject, coverLetter }
}

export async function tailorResumeForJob({ resume, jobDescription = '' }) {
  const normalized = normalizeResumePayload(resume || {})
  const base = await generateResumeContent({
    personal: normalized.personal,
    education: normalized.education,
    experience: normalized.experience,
    skills: normalized.skills,
    projects: resume?.projects || [],
    certifications: resume?.certifications || [],
    achievements: resume?.achievements || [],
    template: resume?.template || 'modern-pro',
    jobDescription,
  })

  const match = await analyzeJobMatch(jobDescription || '', null, null, normalized)
  return {
    tailoredResume: base,
    matchScore: match.matchScore,
    missingSkills: match.missingSkills,
    matchedSkills: match.matchedSkills,
    suggestions: match.aiSuggestions,
  }
}

// ──────────────── AI Resume Content Generation (for frontend) ────────────────
export async function generateResumeContent(resumeData) {
  const { personal, education, experience, skills, projects, certifications, achievements, template, jobDescription } = resumeData

  const prompt = `You are a world-class resume writer. Generate a complete, polished resume content.

Personal: ${JSON.stringify(personal || {})}
Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}
Skills: ${JSON.stringify(skills || {})}
Projects: ${JSON.stringify(projects || [])}
Certifications: ${JSON.stringify(certifications || [])}
Achievements: ${JSON.stringify(achievements || [])}
Template Style: ${template || 'modern-pro'}
${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

Rules:
- Do not invent companies, dates, projects, certifications, or achievements that are not present in input.
- You may rephrase existing responsibilities into stronger ATS-friendly bullet points.
- Preserve user-provided facts and technologies.
- Expand with professional language so the resume content is sufficient for a full page when rendered.

Generate a complete resume with these sections. Return as JSON:
{
  "summary": "Professional summary (4-6 lines)",
  "experience": [{"title":"","company":"","duration":"","location":"","bullets":["4-6 bullet points enhanced from provided content"]}],
  "education": [{"degree":"","institution":"","year":"","gpa":""}],
  "skills": {"technical":[""],"tools":[""],"soft":[""]},
  "certifications": [{"title":"","issuer":"","year":"","credentialId":""}],
  "projects": [{"title":"","description":"","technologies":[""],"link":""}],
  "achievements": [{"title":"","description":"","impact":""}]
}

Make it ATS-optimized, use strong action verbs, include measurable achievements. Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }], 3000)

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse generated resume:', e.message)
    }
  }

  // Return basic structure
  return {
    summary: `Results-driven ${experience?.[0]?.title || 'professional'} with expertise in ${(skills?.technical || []).slice(0, 3).join(', ')}. Proven track record of delivering impactful solutions${jobDescription ? ' aligned to the target role' : ''}.`,
    experience: experience || [],
    education: education || [],
    skills: skills || { technical: [], tools: [], soft: [] },
    projects: projects || [],
    certifications: certifications || [],
    achievements: achievements || [],
  }
}


// ──────────────── LOCAL FALLBACKS ────────────────

function localGenerateResume(resume) {
  const allSkills = [...(resume.skills?.technical || []), ...(resume.skills?.tools || [])]
  const role = resume.experience?.[0]?.title || 'Software Developer'
  const summary = `Results-driven ${role} with expertise in ${allSkills.slice(0, 4).join(', ')}. Proven ability to deliver high-impact solutions in fast-paced environments with strong focus on clean code and performance.`
  const bulletPoints = [
    `Built production-grade applications using ${allSkills.slice(0, 3).join(', ')}, reducing deployment time by 40%`,
    'Led cross-functional collaboration with engineering and product teams to deliver features on schedule',
    'Implemented comprehensive test suites and CI/CD pipelines, improving code coverage to 90%',
    `Optimized database queries and API performance, reducing latency by 60%`,
    'Designed scalable microservices architecture serving 100K+ daily active users',
  ]
  const keywords = allSkills.slice(0, 15)
  return { summary, bulletPoints, keywords }
}

function localAnalyzeATS(resume, jobDescription) {
  const allSkills = getAllSkills(resume.skills || {})
  const allText = JSON.stringify(resume).toLowerCase()
  const jdKeywords = jobDescription ? extractJDKeywords(jobDescription) : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST API', 'CI/CD', 'Docker', 'AWS']
  const found = jdKeywords.filter((kw) => containsSkill(allText, kw))
  const keywordScore = Math.min(100, Math.round((found.length / Math.max(jdKeywords.length, 1)) * 100))
  const sections = { summary: !!resume.personal?.summary, education: resume.education?.length > 0, experience: resume.experience?.length > 0, skills: allSkills.length > 0 }
  const sectionCount = Object.values(sections).filter(Boolean).length
  const formatScore = Math.round((sectionCount / 4) * 100)
  const readabilityScore = 75
  const overall = Math.round(keywordScore * 0.35 + formatScore * 0.35 + readabilityScore * 0.3)
  const issues = []
  if (!resume.personal?.summary) issues.push({ severity: 'critical', message: 'Missing professional summary', suggestion: 'Add a 2-3 sentence professional summary' })
  if (allSkills.length < 5) issues.push({ severity: 'warning', message: 'Too few skills listed', suggestion: 'Add at least 8-10 relevant technical skills' })
  const platformScores = { naukri: overall + 3, linkedin: overall + 1, indeed: overall - 2, workday: overall - 5, greenhouse: overall + 2 }
  return { overall, keywordDensity: keywordScore, formatScore, readability: readabilityScore, issues, actionItems: buildActionItems(jdKeywords.filter(kw => !found.includes(kw)), found), platformScores }
}

function localAnalyzeJobMatch(jobDescription, resumeSkills) {
  const jdKeywords = extractJDKeywords(jobDescription)
  const canonicalResumeSkills = uniqueCanonicalSkills(resumeSkills)
  const matchedSkills = uniqueCanonicalSkills(jdKeywords.filter((skill) => canonicalResumeSkills.some((entry) => containsSkill(entry, skill) || containsSkill(skill, entry))))
  const missingSkills = uniqueCanonicalSkills(jdKeywords.filter((skill) => !canonicalResumeSkills.some((entry) => containsSkill(entry, skill) || containsSkill(skill, entry)))).slice(0, 10)
  const denominator = matchedSkills.length + missingSkills.length
  const matchScore = denominator > 0 ? Math.round((matchedSkills.length / denominator) * 100) : 0

  const importanceHigh = new Set(['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL'])
  return {
    matchScore,
    matchedSkills,
    missingSkills,
    aiSuggestions: [`Add ${missingSkills.slice(0, 3).join(', ')} to your skills`, 'Tailor your summary to match the role', 'Include relevant certifications'],
    actionItems: buildActionItems(missingSkills, matchedSkills),
    keywordAnalysis: jdKeywords.map((kw) => ({
      keyword: kw,
      found: matchedSkills.some((s) => s.toLowerCase() === kw.toLowerCase()),
      importance: importanceHigh.has(kw) ? 'high' : 'medium',
    })),
  }
}

function extractJDKeywords(text) {
  const explicit = KEYWORD_CATALOG.filter((keyword) => containsSkill(text, keyword))
  const candidateTerms = extractCandidateTerms(text)
  const inferred = candidateTerms.filter((term) => {
    if (term.length < 3 || term.length > 35) return false
    if (JD_STOP_WORDS.has(term)) return false
    return term.includes('+') || term.includes('#') || /^[a-z][a-z0-9.\- ]+$/.test(term)
  })

  return uniqueCanonicalSkills([...explicit, ...inferred]).slice(0, 30)
}
