/**
 * AI Service — NVIDIA OpenAI-Compatible API Integration
 * Uses GPT-OSS-20B via NVIDIA Integrate endpoint
 */

import Resume from '../models/Resume.js'

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const NVIDIA_API_KEY = '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'
const MODEL = 'openai/gpt-oss-20b'

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
  const { personal, experience, skills, education } = resume
  const allSkills = [...(skills?.technical || []), ...(skills?.tools || []), ...(skills?.soft || [])]

  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume against ${jobDescription ? 'the given job description' : 'general ATS standards'}.

Resume Skills: ${allSkills.join(', ')}
Experience: ${experience?.map(e => `${e.title} at ${e.company}`).join('; ') || 'None'}
Has Summary: ${personal?.summary ? 'Yes' : 'No'}
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
  "platformScores": {"naukri": <score>, "linkedin": <score>, "indeed": <score>, "workday": <score>, "greenhouse": <score>}
}

Be realistic with scores. Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }])

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          overall: parsed.overall || 70,
          keywordDensity: parsed.keywordDensity || 65,
          formatScore: parsed.formatScore || 80,
          readability: parsed.readability || 75,
          issues: parsed.issues || [],
          platformScores: parsed.platformScores || {},
        }
      }
    } catch (e) {
      console.error('Failed to parse ATS response:', e.message)
    }
  }

  return localAnalyzeATS(resume, jobDescription)
}

// ──────────────── Job Match Analysis (AI) ────────────────
export async function analyzeJobMatch(jobDescription, userId, resumeId) {
  let resume
  if (resumeId) {
    resume = await Resume.findOne({ _id: resumeId, user: userId })
  } else {
    resume = await Resume.findOne({ user: userId }).sort('-updatedAt')
  }

  const resumeSkills = resume
    ? [...(resume.skills?.technical || []), ...(resume.skills?.tools || []), ...(resume.skills?.soft || [])]
    : ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Python']

  const prompt = `You are a job match analyst. Compare these resume skills against the job description.

Resume Skills: ${resumeSkills.join(', ')}
Job Description: ${jobDescription.substring(0, 800)}

Return a JSON object with:
{
  "matchScore": <0-100>,
  "matchedSkills": ["skills found in both resume and JD"],
  "missingSkills": ["skills required by JD but missing from resume"],
  "aiSuggestions": ["4-5 specific, actionable suggestions to improve match"],
  "keywordAnalysis": [{"keyword": "skill", "found": true/false, "importance": "high/medium/low"}]
}

Be accurate with skill matching. Return ONLY valid JSON.`

  const aiResponse = await chatCompletion([{ role: 'user', content: prompt }])

  if (aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          matchScore: parsed.matchScore || 60,
          matchedSkills: parsed.matchedSkills || [],
          missingSkills: parsed.missingSkills || [],
          aiSuggestions: parsed.aiSuggestions || [],
          keywordAnalysis: parsed.keywordAnalysis || [],
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

// ──────────────── AI Resume Content Generation (for frontend) ────────────────
export async function generateResumeContent(resumeData) {
  const { personal, education, experience, skills, template } = resumeData

  const prompt = `You are a world-class resume writer. Generate a complete, polished resume content.

Personal: ${JSON.stringify(personal || {})}
Education: ${JSON.stringify(education || [])}
Experience: ${JSON.stringify(experience || [])}
Skills: ${JSON.stringify(skills || {})}
Template Style: ${template || 'modern-pro'}

Generate a complete resume with these sections. Return as JSON:
{
  "summary": "Professional summary (3 lines max)",
  "experience": [{"title":"","company":"","duration":"","location":"","bullets":["action-verb bullet with metrics"]}],
  "education": [{"degree":"","institution":"","year":"","gpa":""}],
  "skills": {"technical":[""],"tools":[""],"soft":[""]},
  "certifications": [""],
  "projects": [{"name":"","description":"","tech":""}]
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
    summary: `Results-driven ${experience?.[0]?.title || 'professional'} with expertise in ${(skills?.technical || []).slice(0, 3).join(', ')}. Proven track record of delivering impactful solutions.`,
    experience: experience || [],
    education: education || [],
    skills: skills || { technical: [], tools: [], soft: [] },
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
  const allSkills = [...(resume.skills?.technical || []), ...(resume.skills?.tools || []), ...(resume.skills?.soft || [])]
  const allText = JSON.stringify(resume).toLowerCase()
  const jdKeywords = jobDescription ? extractJDKeywords(jobDescription) : ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST API', 'CI/CD', 'Docker', 'AWS']
  const found = jdKeywords.filter(kw => allText.includes(kw.toLowerCase()))
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
  return { overall, keywordDensity: keywordScore, formatScore, readability: readabilityScore, issues, platformScores }
}

function localAnalyzeJobMatch(jobDescription, resumeSkills) {
  const jdKeywords = extractJDKeywords(jobDescription)
  const matchedSkills = resumeSkills.filter(skill => jdKeywords.some(kw => kw.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(kw.toLowerCase())))
  const missingSkills = jdKeywords.filter(kw => !resumeSkills.some(skill => kw.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(kw.toLowerCase()))).slice(0, 8)
  const matchScore = Math.min(98, Math.round((matchedSkills.length / Math.max(jdKeywords.length, 1)) * 100) + 15)
  return {
    matchScore,
    matchedSkills,
    missingSkills,
    aiSuggestions: [`Add ${missingSkills.slice(0, 3).join(', ')} to your skills`, 'Tailor your summary to match the role', 'Include relevant certifications'],
    keywordAnalysis: jdKeywords.map(kw => ({ keyword: kw, found: matchedSkills.some(s => s.toLowerCase() === kw.toLowerCase()), importance: 'medium' })),
  }
}

function extractJDKeywords(text) {
  const allKeywords = Object.values(TECH_KEYWORDS).flat()
  return allKeywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()))
}
