export default function Achievements({ data, onUpdateAchievements, onAdd, onRemove }) {
  const items = data.achievements || ['']

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Achievements</h3>
        <button type="button" className="btn-add" onClick={() => onAdd('achievements', '')}>
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="bullet-row">
          <input
            value={item}
            onChange={e => {
              const next = [...items]
              next[i] = e.target.value
              onUpdateAchievements(next)
            }}
            placeholder="e.g. Awarded Employee of the Year 2023"
          />
          {items.length > 1 && (
            <button type="button" className="btn-remove-small" onClick={() => onRemove('achievements', i)}>
              ×
            </button>
          )}
        </div>
      ))}
    </section>
  )
}
