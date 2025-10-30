import React, { useEffect, useState } from 'react';
import { getForms, deleteForm } from '../../api/forms';
import FormCard from '../../components/FormCard';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Fetch forms for admin
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await getForms(token);
      setForms(res || []);

      // Count how many forms each user created
      const userCount = {};
      res.forEach((form) => {
        const owner = form.owner || {};
        const name =
          typeof owner.name === 'string'
            ? owner.name
            : owner.name?.name || owner.email || 'Unknown';
        userCount[name] = (userCount[name] || 0) + 1;
      });

      // Convert counts into chart-friendly array
      const chartArray = Object.entries(userCount).map(([name, count]) => ({
        name,
        forms: count,
      }));
      setChartData(chartArray);
    } catch (err) {
      console.error('Failed to fetch forms:', err);
      setError('Failed to load forms.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when admin logs in
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchForms();
    } else {
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user, token]);

  // Delete form handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this form?')) return;
    try {
      await deleteForm(token, id);
      const updatedForms = forms.filter((f) => f.id !== id);
      setForms(updatedForms);

      // Recalculate chart after deletion
      const userCount = {};
      updatedForms.forEach((form) => {
        const owner = form.owner || {};
        const name =
          typeof owner.name === 'string'
            ? owner.name
            : owner.name?.name || owner.email || 'Unknown';
        userCount[name] = (userCount[name] || 0) + 1;
      });
      setChartData(
        Object.entries(userCount).map(([name, count]) => ({ name, forms: count }))
      );
    } catch (err) {
      console.error('Failed to delete form:', err);
      alert('Delete failed');
    }
  };

  // Loading / Error UI
  if (loading) return <p className="p-6 text-gray-500">Loading forms...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-700">Admin Dashboard</h1>
        <p className="text-gray-500 text-lg mt-2">
          Manage all user forms and view analytics
        </p>
        <p className="text-gray-600 font-medium mt-1">
          Total Forms: <span className="text-blue-600">{forms.length}</span>
        </p>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
            📊 Forms Created by Each User
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              />
              <Legend />
              <Bar dataKey="forms" fill="#2563eb" barSize={40} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <p className="text-gray-500 text-center">No forms available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
