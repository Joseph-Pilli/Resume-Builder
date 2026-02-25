/**
 * ATS-friendly resume preview - single column, plain text, ATS fonts, 12px body
 */

import { useResumeFont } from '../../context/ResumeFontContext'
import './ResumePreview.css'

export default function ResumePreview({ data }) {
  const { font } = useResumeFont()
  const d = data || {}
  const sep = ' | '
  const row2 = [d.phone, d.email, d.linkedin ? `LinkedIn: ${d.linkedin}` : ''].filter(Boolean).join(sep)
  const row3 = [d.github ? `GitHub: ${d.github}` : '', d.portfolio ? `Portfolio: ${d.portfolio}` : ''].filter(Boolean).join(sep)
  const hasRow2 = !!row2
  const hasRow3 = !!row3

  const skillGroups = Array.isArray(d.skillGroups) ? d.skillGroups : []
  // Support legacy technicalSkills/softSkills if no skillGroups
  const hasSkillGroups = skillGroups.some(g => (g.title || g.skills))
  const legacyTech = Array.isArray(d.technicalSkills) ? d.technicalSkills : []
  const legacySoft = Array.isArray(d.softSkills) ? d.softSkills : []
  const useLegacy = !hasSkillGroups && (legacyTech.length > 0 || legacySoft.length > 0)

  return (
    <div className="resume-preview" id="resume-preview" style={{ fontFamily: `${font}, sans-serif` }}>
      {/* Personal Information – strict 3-row structure */}
      <header className="rp-header">
        <h1 className="rp-name">{d.fullName || 'Your Name'}</h1>
        {hasRow2 && (
          <p className="rp-contact-row rp-contact-row--line2" aria-label="Contact: Mobile, Email, LinkedIn">
            {row2}
          </p>
        )}
        {hasRow3 && (
          <p className="rp-contact-row rp-contact-row--line3" aria-label="GitHub, Portfolio">
            {row3}
          </p>
        )}
      </header>

      {/* Summary */}
      {d.summary && (
        <section className="rp-section">
          <h2 className="rp-section-title">Professional Summary</h2>
          <p className="rp-summary">{d.summary}</p>
        </section>
      )}

      {/* Skills */}
      {(hasSkillGroups || useLegacy) && (
        <section className="rp-section">
          <h2 className="rp-section-title">Skills</h2>
          {useLegacy ? (
            <p className="rp-skills">{(legacyTech.concat(legacySoft)).join(', ')}</p>
          ) : (
            <div className="rp-skills-group">
              {skillGroups.filter(g => g.title || g.skills).map((g, i) => {
                const skillsStr = (g.skills || '').split(',').map(s => s.trim()).filter(Boolean).join(', ')
                if (!skillsStr && !g.title) return null
                return (
                  <p key={i} className="rp-skill-line">
                    {g.title ? <strong>{g.title}: </strong> : null}
                    {skillsStr}
                  </p>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Experience - Job Title | Duration, Company | Location */}
      {d.experience?.length > 0 && d.experience.some(e => e.company || e.role) && (
        <section className="rp-section">
          <h2 className="rp-section-title">Experience</h2>
          {d.experience.map((exp, i) => (
            <div key={i} className="rp-block">
              <div className="rp-block-header rp-bold-row">
                <strong>{exp.role || 'Job Title'}</strong>
                <strong>{exp.duration}</strong>
              </div>
              <div className="rp-block-header rp-bold-row">
                <strong>{exp.company}</strong>
                <strong>{exp.location}</strong>
              </div>
              {(exp.responsibilities || []).filter(Boolean).length > 0 && (
                <ul className="rp-bullets">
                  {exp.responsibilities.filter(Boolean).map((r, j) => (
                    <li key={j}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Projects – compact block spacing, no margin stacking */}
      {d.projects?.length > 0 && d.projects.some(p => p.title || p.description) && (
        <section className="rp-section rp-section--projects">
          <h2 className="rp-section-title">Projects</h2>
          <div className="rp-project-list">
            {d.projects.map((proj, i) => (
              <div key={i} className="rp-block rp-project-block">
                <div className="rp-block-header">
                  <strong>{proj.title || 'Project Title'}</strong>
                </div>
                {(proj.techStack?.length > 0 || (typeof proj.techStack === 'string' && proj.techStack)) && (
                  <p className="rp-tech-stack">
                    <strong>Tech Stack: </strong>
                    {Array.isArray(proj.techStack) ? proj.techStack.join(', ') : (proj.techStack || '')}
                  </p>
                )}
                {proj.description && <p className="rp-desc">{proj.description}</p>}
                {(proj.achievements || []).filter(Boolean).length > 0 && (
                  <ul className="rp-bullets">
                    {proj.achievements.filter(Boolean).map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education - Degree (CGPA) | Duration, University | Location */}
      {d.education?.length > 0 && d.education.some(e => e.degree || e.institution) && (
        <section className="rp-section">
          <h2 className="rp-section-title">Education</h2>
          {d.education.map((edu, i) => (
            <div key={i} className="rp-block">
              <div className="rp-block-header rp-bold-row">
                <strong>{edu.degree}{edu.cgpa ? ` (${edu.cgpa})` : ''}</strong>
                <strong>{edu.year}</strong>
              </div>
              <div className="rp-block-header">
                <span className="rp-institution">{edu.institution}</span>
                <span className="rp-right">{edu.location}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Certifications - Company | Duration, Specialization */}
      {d.certifications?.length > 0 && (() => {
        const certs = d.certifications
        const isNewFormat = certs[0] && typeof certs[0] === 'object' && (certs[0].company != null || certs[0].specialization != null)
        if (isNewFormat) {
          return (
            <section className="rp-section">
              <h2 className="rp-section-title">Certifications</h2>
              {certs.filter(c => c && (c.company || c.specialization)).map((c, i) => (
                <div key={i} className="rp-block rp-cert-block">
                  <div className="rp-block-header rp-bold-row">
                    <strong>{c.specialization || ''}</strong>
                    <strong>{c.duration}</strong>
                  </div>
                  {c.company && <p className="rp-cert-company">{c.company}</p>}
                </div>
              ))}
            </section>
          )
        }
        return (
          <section className="rp-section">
            <h2 className="rp-section-title">Certifications</h2>
            <ul className="rp-bullets rp-certs">
              {certs.filter(Boolean).map((c, i) => (
                <li key={i}>{typeof c === 'string' ? c : c.specialization || c.company}</li>
              ))}
            </ul>
          </section>
        )
      })()}

      {/* Achievements */}
      {d.achievements?.length > 0 && d.achievements.some(Boolean) && (
        <section className="rp-section">
          <h2 className="rp-section-title">Achievements</h2>
          <ul className="rp-bullets">
            {d.achievements.filter(Boolean).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
