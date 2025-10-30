import React, { useState } from 'react';
import { createForm } from '../../api/forms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormEditor from '../../components/FormEditor';

export default function CreateForm() {
  const [form, setForm] = useState({ title: '', description: '', fields: [] });
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      alert('Form title is required.');
      return;
    }
    setLoading(true);

    try {
      const newForm = await createForm(token, {
        title: form.title,
        description: form.description,
        fields: [],
        isPublic: false,
      });
      navigate(`/edit/${newForm.id}`);
    } catch (error) {
      console.error('Failed to create form:', error);
      alert('Failed to create form. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          Create New Form
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Fill in the details below to start creating your form.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormEditor form={form} setForm={setForm} />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:bg-blue-300"
          >
            {loading ? 'Creating...' : 'Create and Add Fields'}
          </button>
        </form>
      </div>
    </div>
  );
}
