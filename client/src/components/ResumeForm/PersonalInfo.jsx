export default function PersonalInfo({ data, onChange }) {
  const fields = [
    { key: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
    { key: 'phone', label: 'Phone', placeholder: '+1 (555) 123-4567' },
    { key: 'email', label: 'Email', placeholder: 'john@example.com' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/johndoe' },
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/johndoe' },
    { key: 'portfolio', label: 'Portfolio', placeholder: 'https://johndoe.dev' }
  ]
  return (
    <section className="form-section">
      <h3>Personal Information</h3>
      {fields.map(({ key, label, placeholder }) => (
        <div key={key} className="form-group">
          <label>{label}</label>
          <input
            type="text"
            value={data[key] || ''}
            onChange={e => onChange(key, e.target.value)}
            placeholder={placeholder}
          />
        </div>
      ))}
    </section>
  )
}
