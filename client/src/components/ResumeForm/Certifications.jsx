export default function Certifications({ data, onUpdateCerts, onAdd, onRemove }) {
  const certs = data.certifications || []
  const items = certs.length
    ? certs.map(c => (typeof c === 'object' && c ? c : { company: String(c || ''), duration: '', specialization: String(c || '') }))
    : [{ company: '', duration: '', specialization: '' }]

  const handleChange = (i, field, value) => {
    const next = [...items]
    if (!next[i]) next[i] = { company: '', duration: '', specialization: '' }
    next[i] = { ...next[i], [field]: value }
    onUpdateCerts(next)
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Certifications (Optional)</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('certifications', { company: '', duration: '', specialization: '' })}>
          + Add
        </button>
      </div>
      <p className="form-hint">Course Specialization | Duration on first line (bold), Company/Institute below</p>
      {items.map((c, i) => (
        <div key={i} className="nested-card">
          <div className="form-row">
            <div className="form-group">
              <label>Course Specialization</label>
              <input
                value={c.specialization || ''}
                onChange={e => handleChange(i, 'specialization', e.target.value)}
                placeholder="Full Stack Development"
              />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input
                value={c.duration || ''}
                onChange={e => handleChange(i, 'duration', e.target.value)}
                placeholder="Jan 2024 – Mar 2024"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Company / Institute</label>
            <input
              value={c.company || ''}
              onChange={e => handleChange(i, 'company', e.target.value)}
              placeholder="Amazon"
            />
          </div>
          {items.length > 1 && (
            <button type="button" className="btn-remove" onClick={() => onRemove('certifications', i)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
