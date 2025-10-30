import React, { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/solid';

export default function FieldEditor({ fields, setFields }) {
  const addField = () => {
    setFields([
      ...fields,
      {
        id: `new-${Date.now()}`, // Temporary ID for new fields
        label: '',
        type: 'text',
        options: [],
        required: false,
      },
    ]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, prop, value) => {
    const newFields = [...fields];
    if (prop === 'options') {
      newFields[index][prop] = value.split(',').map(opt => opt.trim());
    } else if (prop === 'required') {
      newFields[index][prop] = !newFields[index][prop];
    } else {
      newFields[index][prop] = value;
    }
    setFields(newFields);
  };

  const isOptionBased = (type) => ['select', 'radio', 'checkbox'].includes(type);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">Form Fields</h3>
      {fields.map((field, index) => (
        <div key={field.id || index} className="p-4 border rounded-lg bg-gray-50 relative">
          <button
            type="button"
            onClick={() => removeField(index)}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
            aria-label="Remove field"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Label */}
            <input
              type="text"
              placeholder="Field Label (e.g., Your Name)"
              value={field.label}
              onChange={(e) => handleFieldChange(index, 'label', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />

            {/* Field Type */}
            <select
              value={field.type}
              onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="text">Text</option>
              <option value="textarea">Text Area</option>
              <option value="number">Number</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
            </select>
          </div>

          {/* Options for Select, Radio, Checkbox */}
          {isOptionBased(field.type) && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Comma-separated options (e.g., A, B, C)"
                value={(field.options || []).join(', ')}
                onChange={(e) => handleFieldChange(index, 'options', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
          )}

          {/* Required Checkbox */}
          <div className="mt-3">
            <label className="flex items-center text-gray-600">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={() => handleFieldChange(index, 'required', null)}
                className="mr-2 accent-blue-600"
              />
              Required
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addField}
        className="flex items-center justify-center w-full mt-4 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-500 hover:border-blue-500 hover:text-blue-500 transition"
      >
        <PlusIcon className="w-5 h-5 mr-2" /> Add Field
      </button>
    </div>
  );
}