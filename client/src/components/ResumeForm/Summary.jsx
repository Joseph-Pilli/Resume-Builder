export default function Summary({ data, onChange }) {
  return (
    <section className="form-section">
      <h3>Professional Summary</h3>
      <div className="form-group">
        <textarea
          value={data.summary || ''}
          onChange={e => onChange('summary', e.target.value)}
          placeholder="A brief overview of your professional background, key skills, and career goals..."
          rows={4}
        />
      </div>
    </section>
  )
}
