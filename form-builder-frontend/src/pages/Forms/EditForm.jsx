import React, { useEffect, useState } from 'react';
import { getFormById, updateForm } from '../../api/forms';
import { useNavigate, useParams } from 'react-router-dom';
import FormEditor from '../../components/FormEditor';
import FormBuilderWrapper from '../../components/FormBuilderWrapper';
import { useAuth } from '../../context/AuthContext';

export default function EditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    isPublic: false,
    fields: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(token, id);
        const fieldsWithId = (data.fields || []).map((f, index) => ({
          id: f.id || `field-${index}`,
          ...f,
        }));
        setForm({
          id: data.id,
          title: data.title,
          description: data.description,
          isPublic: data.isPublic,
          fields: fieldsWithId,
        });
      } catch (err) {
        console.error('Failed to load form:', err);
        alert('Error loading form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, token]);

  const handleFieldsUpdate = (newFields) => {
    const fieldsWithId = newFields.map((f, index) => ({
      id: f.id || `field-${index}`,
      ...f,
    }));
    setForm((prev) => ({ ...prev, fields: fieldsWithId }));
  };

  const handleFormMetaChange = (updatedForm) => {
    setForm((prev) => ({
      ...prev,
      title: updatedForm.title,
      description: updatedForm.description,
      isPublic: updatedForm.isPublic,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert('Form title is required.');
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        fields: form.fields.map((field, index) => ({
          id: field.id,
          label: field.label,
          type: field.type,
          required: field.required || false,
          options: field.options || [],
          order: index,
          validation: field.validation || null,
          className: field.className || '', // include design
        })),
      };

      await updateForm(token, form.id, payload);

      alert('Form updated successfully!');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard');
    } catch (error) {
      console.error('Failed to update form:', error);
      alert('Failed to update form. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center p-10 text-gray-600">Loading form editor...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Form</h2>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
        <FormEditor form={form} setForm={handleFormMetaChange} />
        <FormBuilderWrapper fieldsJson={form.fields || []} onSave={handleFieldsUpdate} />
        <button
          type="submit"
          disabled={saving}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:bg-blue-300"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
