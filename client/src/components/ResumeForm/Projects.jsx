export default function Projects({ data, onUpdate, onAdd, onRemove }) {
  const proj = data.projects || []

  const parseTech = (str) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : []

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Projects</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('projects', { title: '', techStack: [], description: '', achievements: [''] })}>
          + Add
        </button>
      </div>
      {proj.map((item, i) => (
        <div key={i} className="nested-card">
          <div className="form-group">
            <label>Project Title</label>
            <input
              value={item.title || ''}
              onChange={e => onUpdate('projects', i, { title: e.target.value })}
              placeholder="E-Commerce Platform"
            />
          </div>
          <div className="form-group">
            <label>Tech Stack</label>
            <p className="form-hint-inline">Displayed as <strong>Tech Stack: </strong> + your input</p>
            <input
              value={Array.isArray(item.techStack) ? item.techStack.join(', ') : (item.techStack || '')}
              onChange={e => onUpdate('projects', i, { techStack: parseTech(e.target.value) })}
              placeholder="HTML, CSS, JavaScript"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={item.description || ''}
              onChange={e => onUpdate('projects', i, { description: e.target.value })}
              placeholder="Brief project description..."
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Key Achievements</label>
            {(item.achievements || ['']).map((a, j) => (
              <div key={j} className="bullet-row">
                <input
                  value={a}
                  onChange={e => {
                    const ach = [...(item.achievements || [''])]
                    ach[j] = e.target.value
                    onUpdate('projects', i, { achievements: ach })
                  }}
                  placeholder="• Improved load time by 40%"
                />
                <button
                  type="button"
                  className="btn-remove-small"
                  onClick={() => {
                    const ach = (item.achievements || []).filter((_, k) => k !== j)
                    onUpdate('projects', i, { achievements: ach.length ? ach : [''] })
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-bullet"
              onClick={() => onUpdate('projects', i, { achievements: [...(item.achievements || ['']), ''] })}
            >
              + Add achievement
            </button>
          </div>
          {proj.length > 1 && (
            <button type="button" className="btn-remove" onClick={() => onRemove('projects', i)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
