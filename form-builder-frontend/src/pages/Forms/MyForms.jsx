// src/pages/Forms/MyForms.jsx
import React, { useEffect, useState } from 'react';
import { getUserForms, deleteForm } from '../../api/forms';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import FormCard from '../../components/FormCard';

export default function MyForms() {
  const [forms, setForms] = useState([]);
  const { token } = useAuth();

  const fetchForms = async () => {
    try {
      const data = await getUserForms(token);
      setForms(data);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await deleteForm(token, id);
      setForms(forms.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Delete failed');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Create Form Button on Top */}
      <div className="flex justify-end mb-6">
        <Link
          to="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow"
        >
          Create Form
        </Link>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map((form) => (
          <FormCard key={form.id} form={form} onDelete={handleDelete} />
        ))}
        {forms.length === 0 && (
          <p className="text-center text-gray-500 col-span-full mt-10">
            No forms created yet.
          </p>
        )}
      </div>
    </div>
  );
}
