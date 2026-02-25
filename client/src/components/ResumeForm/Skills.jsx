export default function Skills({ data, onUpdate, onAdd, onRemove }) {
  const groups = data.skillGroups || []

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Skills</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('skillGroups', { title: '', skills: '' })}>
          + Add Category
        </button>
      </div>
      <p className="form-hint">Add title (e.g. Frontend) and skills separated by commas. Output: Frontend: React, HTML, CSS, JavaScript</p>
      {groups.map((group, i) => (
        <div key={i} className="nested-card">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={group.title || ''}
              onChange={e => onUpdate('skillGroups', i, { title: e.target.value })}
              placeholder="e.g. Frontend, Backend, Soft Skills"
            />
          </div>
          <div className="form-group">
            <label>Skills (comma separated)</label>
            <input
              type="text"
              value={group.skills || ''}
              onChange={e => onUpdate('skillGroups', i, { skills: e.target.value })}
              placeholder="React, HTML, CSS, JavaScript"
            />
          </div>
          {groups.length > 1 && (
            <button type="button" className="btn-remove" onClick={() => onRemove('skillGroups', i)}>
              Remove
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
