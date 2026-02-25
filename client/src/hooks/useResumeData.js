import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'resume-builder-data'

const initialResumeData = {
  fullName: '',
  phone: '',
  email: '',
  linkedin: '',
  github: '',
  portfolio: '',
  summary: '',
  skillGroups: [
    { title: '', skills: '' }
  ],
  experience: [
    { company: '', role: '', duration: '', location: '', responsibilities: [''] }
  ],
  projects: [
    { title: '', techStack: [], description: '', achievements: [''] }
  ],
  education: [
    { degree: '', institution: '', year: '', cgpa: '', location: '' }
  ],
  certifications: [{ company: '', duration: '', specialization: '' }],
  achievements: ['']
}

export function useResumeData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const merged = { ...initialResumeData, ...parsed }
        // Migrate old technicalSkills/softSkills to skillGroups
        if (parsed.certifications?.length && typeof parsed.certifications[0] === 'string') {
          merged.certifications = parsed.certifications.filter(Boolean).map(c => ({ company: c, duration: '', specialization: c }))
        }
        if ((parsed.technicalSkills?.length || parsed.softSkills?.length) && !parsed.skillGroups?.length) {
          const groups = []
          if (parsed.technicalSkills?.length) {
            groups.push({ title: 'Technical Skills', skills: Array.isArray(parsed.technicalSkills) ? parsed.technicalSkills.join(', ') : String(parsed.technicalSkills) })
          }
          if (parsed.softSkills?.length) {
            groups.push({ title: 'Soft Skills', skills: Array.isArray(parsed.softSkills) ? parsed.softSkills.join(', ') : String(parsed.softSkills) })
          }
          merged.skillGroups = groups
        }
        return merged
      }
    } catch (e) {}
    return initialResumeData
  })

  const update = useCallback((path, value) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let target = next
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]
        if (!(k in target)) target[k] = {}
        target = target[k]
      }
      target[keys[keys.length - 1]] = value
      return next
    })
  }, [])

  const updateSectionItem = useCallback((section, index, updates) => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const arr = next[section] || []
      if (arr[index]) {
        Object.assign(arr[index], updates)
      }
      return next
    })
  }, [])

  const updateSection = useCallback((section, value) => {
    setData(prev => ({ ...prev, [section]: value }))
  }, [])

  const addItem = useCallback((section, defaultItem) => {
    setData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), defaultItem ?? (section === 'certifications' ? { company: '', duration: '', specialization: '' } : section === 'achievements' ? '' : {})]
    }))
  }, [])

  const removeItem = useCallback((section, index) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {}
  }, [data])

  return { data, update, updateSection, updateSectionItem, addItem, removeItem, setData }
}
