import { useState, useRef } from 'react'
import { useResumeData } from '../hooks/useResumeData'
import ResumePreview from '../components/ResumePreview/ResumePreview'
import { exportPDF, exportWord } from '../utils/exportResume'
import './ResumeOptimizer.css'

const API_BASE = '/api'

export default function ResumeOptimizer() {
  const { data: builderData } = useResumeData()
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeSource, setResumeSource] = useState('builder') // 'builder' | 'upload'
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
      if (valid.includes(file.type)) {
        setUploadedFile(file)
        setError('')
      } else {
        setUploadedFile(null)
        setError('Please upload PDF, DOCX, or TXT file.')
      }
    }
  }

  const handleOptimize = async () => {
    setError('')
    setResult(null)

    if (!jobDescription.trim()) {
      setError('Please enter a job description.')
      return
    }

    if (resumeSource === 'upload' && !uploadedFile) {
      setError('Please upload your resume.')
      return
    }

    if (resumeSource === 'builder') {
      const hasData = builderData.fullName || builderData.summary || builderData.experience?.[0]?.company
      if (!hasData) {
        setError('Please add resume content in the Resume Builder first, or upload a resume file.')
        return
      }
    }

    setLoading(true)
    try {
      let res
      if (resumeSource === 'upload') {
        const formData = new FormData()
        formData.append('resume', uploadedFile)
        formData.append('jobTitle', jobTitle)
        formData.append('jobDescription', jobDescription)
        res = await fetch(`${API_BASE}/optimizer/optimize`, {
          method: 'POST',
          body: formData
        })
      } else {
        res = await fetch(`${API_BASE}/optimizer/optimize-json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resumeData: builderData,
            jobTitle,
            jobDescription
          })
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || res.statusText || 'Optimization failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to optimize resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="optimizer-page">
      <div className="optimizer-input">
        <h2>Resume Optimizer</h2>
        <p className="optimizer-desc">Optimize your resume based on a job description. Upload a resume or use the one from the Resume Builder.</p>

        <div className="form-section">
          <h3>Resume Source</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="source"
                checked={resumeSource === 'builder'}
                onChange={() => setResumeSource('builder')}
              />
              Use from Resume Builder
            </label>
            <label>
              <input
                type="radio"
                name="source"
                checked={resumeSource === 'upload'}
                onChange={() => setResumeSource('upload')}
              />
              Upload Resume (PDF, DOCX, TXT)
            </label>
          </div>
          {resumeSource === 'upload' && (
            <div className="file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="file-input"
              />
              <button type="button" className="btn-outline" onClick={() => fileInputRef.current?.click()}>
                {uploadedFile ? uploadedFile.name : 'Choose File'}
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={12}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

        <button
          className="btn-optimize"
          onClick={handleOptimize}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Optimizing...
            </>
          ) : (
            'Optimize Resume'
          )}
        </button>
      </div>

      {result && (
        <div className="optimizer-result">
          <h2>Optimized Resume</h2>
          <div className="ats-scores">
            <div className="score-card">
              <span className="score-label">Before</span>
              <span className="score-value">{result.beforeScore}%</span>
            </div>
            <div className="score-arrow">→</div>
            <div className="score-card score-improved">
              <span className="score-label">After</span>
              <span className="score-value">{result.afterScore}%</span>
            </div>
          </div>
          {result.changes?.length > 0 && (
            <div className="changes-section">
              <h3>Changes Made</h3>
              <ul>
                {result.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="result-preview-wrap">
            <div className="result-actions">
              <button className="btn-download" onClick={() => exportPDF(result.resume)}>
                Download PDF
              </button>
              <button className="btn-download btn-download-word" onClick={() => exportWord(result.resume)}>
                Download Word
              </button>
            </div>
            <div className="result-preview">
              <ResumePreview data={result.resume} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
