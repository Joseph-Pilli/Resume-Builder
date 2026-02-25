import { createContext, useContext, useState, useEffect } from 'react'

const FONT_KEY = 'resume-font-type'

export const ATS_FONTS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Garamond', label: 'Garamond' }
]

const ResumeFontContext = createContext(null)

export function ResumeFontProvider({ children }) {
  const [font, setFont] = useState(() => {
    try {
      return localStorage.getItem(FONT_KEY) || 'Arial'
    } catch {
      return 'Arial'
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(FONT_KEY, font)
    } catch {}
  }, [font])

  return (
    <ResumeFontContext.Provider value={{ font, setFont }}>
      {children}
    </ResumeFontContext.Provider>
  )
}

export function useResumeFont() {
  const ctx = useContext(ResumeFontContext)
  return ctx || { font: 'Arial', setFont: () => {} }
}
