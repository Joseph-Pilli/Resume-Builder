export default function Education({ data, onUpdate, onAdd, onRemove }) {
  const edu = data.education || []

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Education</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('education', { degree: '', institution: '', year: '', cgpa: '', location: '' })}>
          + Add
        </button>
      </div>
      {edu.map((item, i) => (
        <div key={i} className="nested-card">
          <div className="form-row">
            <div className="form-group">
              <label>Degree</label>
              <input
                value={item.degree || ''}
                onChange={e => onUpdate('education', i, { degree: e.target.value })}
                placeholder="B.S. Computer Science"
              />
            </div>
            <div className="form-group">
              <label>CGPA</label>
              <input
                value={item.cgpa || ''}
                onChange={e => onUpdate('education', i, { cgpa: e.target.value })}
                placeholder="3.8/4.0"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Institution</label>
            <input
              value={item.institution || ''}
              onChange={e => onUpdate('education', i, { institution: e.target.value })}
              placeholder="University Name"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (Year)</label>
              <input
                value={item.year || ''}
                onChange={e => onUpdate('education', i, { year: e.target.value })}
                placeholder="2020"
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                value={item.location || ''}
                onChange={e => onUpdate('education', i, { location: e.target.value })}
                placeholder="City, State"
              />
            </div>
          </div>
          {edu.length > 1 && (
            <button type="button" className="btn-remove" onClick={() => onRemove('education', i)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
