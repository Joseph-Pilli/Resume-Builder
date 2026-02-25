import { useRef } from 'react'
import { useResumeData } from '../hooks/useResumeData'
import {
  PersonalInfo,
  Summary,
  Skills,
  Experience,
  Projects,
  Education,
  Certifications,
  Achievements
} from '../components/ResumeForm'
import ResumePreview from '../components/ResumePreview/ResumePreview'
import { exportPDF, exportWord } from '../utils/exportResume'
import './ResumeBuilder.css'

export default function ResumeBuilder() {
  const { data, update, updateSection, updateSectionItem, addItem, removeItem } = useResumeData()
  const previewRef = useRef(null)

  const handleCertUpdate = (value) => updateSection('certifications', value)

  return (
    <div className="builder-layout">
      <aside className="builder-form">
        <div className="form-scroll">
          <PersonalInfo data={data} onChange={(k, v) => update(k, v)} />
          <Summary data={data} onChange={(k, v) => update(k, v)} />
          <Skills
            data={data}
            onUpdate={updateSectionItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <Experience
            data={data}
            onUpdate={updateSectionItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <Projects
            data={data}
            onUpdate={updateSectionItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <Education
            data={data}
            onUpdate={updateSectionItem}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <Certifications
            data={data}
            onUpdateCerts={v => updateSection('certifications', v)}
            onAdd={addItem}
            onRemove={removeItem}
          />
          <Achievements
            data={data}
            onUpdateAchievements={v => updateSection('achievements', v)}
            onAdd={addItem}
            onRemove={removeItem}
          />
        </div>
      </aside>

      <section className="builder-preview-wrap">
        <div className="preview-toolbar">
          <h2>Live Preview</h2>
          <div className="preview-actions">
            <button className="btn-download" onClick={() => exportPDF(data)}>
              Download PDF
            </button>
            <button className="btn-download btn-download-word" onClick={() => exportWord(data)}>
              Download Word
            </button>
          </div>
        </div>
        <div className="preview-container" ref={previewRef}>
          <ResumePreview data={data} />
        </div>
      </section>
    </div>
  )
}
