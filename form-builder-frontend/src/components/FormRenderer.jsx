import React, { useState } from 'react';

export default function FormRenderer({ form, onSubmit, submitLabel = 'Submit' }) {
  const initial = {};
  (form.fields || []).forEach(f => {
    if (f.type === 'checkbox') initial[f.id] = [];
    else initial[f.id] = '';
  });

  const [values, setValues] = useState(initial);

  const handleChange = (field, value, checked) => {
    if (field.type === 'checkbox') {
      const prev = values[field.id] || [];
      if (checked) setValues({ ...values, [field.id]: [...prev, value] });
      else setValues({ ...values, [field.id]: prev.filter(v => v !== value) });
    } else {
      setValues({ ...values, [field.id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answers = (form.fields || []).map(f => {
      const val = values[f.id];
      if (Array.isArray(val)) return { fieldId: f.id, value: JSON.stringify(val) };
      if (f.type === 'number') return { fieldId: f.id, value: Number(val) };
      return { fieldId: f.id, value: String(val ?? '') };
    });
    if (onSubmit) await onSubmit(answers);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">{form.title}</h2>
      {form.description && <p className="text-gray-500 mb-4">{form.description}</p>}

      {(form.fields || []).map(field => (
        <div key={field.id} className="mb-4">
          <label className="block mb-1 font-medium">
            {field.label}{field.required ? ' *' : ''}
          </label>

          {field.type === 'text' && (
            <input
              className={`w-full p-2 border rounded ${field.className || ''}`}
              value={values[field.id] || ''}
              onChange={e => handleChange(field, e.target.value)}
              required={!!field.required}
            />
          )}
          {field.type === 'textarea' && (
            <textarea
              className={`w-full p-2 border rounded ${field.className || ''}`}
              value={values[field.id] || ''}
              onChange={e => handleChange(field, e.target.value)}
              required={!!field.required}
            />
          )}
          {field.type === 'number' && (
            <input
              type="number"
              className={`w-full p-2 border rounded ${field.className || ''}`}
              value={values[field.id] || ''}
              onChange={e => handleChange(field, e.target.value)}
              required={!!field.required}
            />
          )}
          {field.type === 'select' && (
            <select
              className={`w-full p-2 border rounded ${field.className || ''}`}
              value={values[field.id] || ''}
              onChange={e => handleChange(field, e.target.value)}
              required={!!field.required}
            >
              <option value="">Select</option>
              {(field.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {field.type === 'radio' && (field.options || []).map(opt => (
            <label key={opt} className="inline-flex items-center mr-4">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={values[field.id] === opt}
                onChange={e => handleChange(field, e.target.value)}
                required={!!field.required}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
          {field.type === 'checkbox' && (field.options || []).map(opt => (
            <label key={opt} className="inline-flex items-center mr-4">
              <input
                type="checkbox"
                value={opt}
                checked={(values[field.id] || []).includes(opt)}
                onChange={e => handleChange(field, opt, e.target.checked)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}

        </div>
      ))}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {submitLabel}
      </button>
    </form>
  );
}
