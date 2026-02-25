export default function Experience({ data, onUpdate, onAdd, onRemove }) {
  const exp = data.experience || []

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Experience</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('experience', { company: '', role: '', duration: '', location: '', responsibilities: [''] })}>
          + Add
        </button>
      </div>
      {exp.map((item, i) => (
        <div key={i} className="nested-card">
          <div className="form-row">
            <div className="form-group">
              <label>Company</label>
              <input
                value={item.company || ''}
                onChange={e => onUpdate('experience', i, { company: e.target.value })}
                placeholder="Company Name"
              />
            </div>
            <div className="form-group">
              <label>Job Title</label>
              <input
                value={item.role || ''}
                onChange={e => onUpdate('experience', i, { role: e.target.value })}
                placeholder="Job Title"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration</label>
              <input
                value={item.duration || ''}
                onChange={e => onUpdate('experience', i, { duration: e.target.value })}
                placeholder="Jan 2020 - Present"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                value={item.location || ''}
                onChange={e => onUpdate('experience', i, { location: e.target.value })}
                placeholder="San Francisco, CA"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Responsibilities</label>
            {(item.responsibilities || ['']).map((r, j) => (
              <div key={j} className="bullet-row">
                <input
                  value={r}
                  onChange={e => {
                    const resp = [...(item.responsibilities || [''])]
                    resp[j] = e.target.value
                    onUpdate('experience', i, { responsibilities: resp })
                  }}
                  placeholder="• Led team of 5 engineers..."
                />
                <button
                  type="button"
                  className="btn-remove-small"
                  onClick={() => {
                    const resp = (item.responsibilities || []).filter((_, k) => k !== j)
                    onUpdate('experience', i, { responsibilities: resp.length ? resp : [''] })
                  }}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-add-bullet"
              onClick={() => onUpdate('experience', i, { responsibilities: [...(item.responsibilities || ['']), ''] })}
            >
              + Add bullet
            </button>
          </div>
          {exp.length > 1 && (
            <button type="button" className="btn-remove" onClick={() => onRemove('experience', i)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
