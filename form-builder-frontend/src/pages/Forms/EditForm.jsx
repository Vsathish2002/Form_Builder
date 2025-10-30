// src/pages/Forms/EditForm.jsx
import React, { useEffect, useState } from 'react';
import { getFormById, updateForm } from '../../api/forms';
import { useNavigate, useParams } from 'react-router-dom';
import FormEditor from '../../components/FormEditor';
import FormBuilderWrapper from '../../components/FormBuilderWrapper';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

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
          className: field.className || '',
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

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-purple-50 to-pink-50 py-12 px-4 md:px-8 flex flex-col items-center">
      
      {/* Back Button */}
      <motion.button
        onClick={() => navigate(-1)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center mb-6 text-indigo-600 font-semibold hover:text-indigo-800"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back
      </motion.button>

      {/* Form Editor Container */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative z-10"
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          className="text-3xl md:text-4xl font-extrabold text-center text-blue-700 mb-6"
        >
          Edit Form
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.2 } }}
          className="text-center text-gray-500 mb-8"
        >
          Update your form title, description, and fields. Changes are saved immediately when you click "Save Changes".
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Meta */}
          <FormEditor form={form} setForm={handleFormMetaChange} />

          {/* Form Fields */}
          <FormBuilderWrapper fieldsJson={form.fields || []} onSave={handleFieldsUpdate} />

          {/* Save Button */}
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
