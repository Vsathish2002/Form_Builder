import React, { useEffect, useState } from 'react';
import { getUserForms, getFormResponses } from '../../api/forms';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export default function UserDashboard() {
  const [forms, setForms] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // 1️⃣ Fetch user's forms
        const userForms = await getUserForms(token);
        setForms(userForms);

        // 2️⃣ Fetch responses in parallel
        const responsesArray = await Promise.all(
          userForms.map(f => getFormResponses(token, f.id))
        );

        // 3️⃣ Sum total responses
        const total = responsesArray.reduce((sum, res) => sum + res.length, 0);
        setTotalResponses(total);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching forms or responses:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const COLORS = ['#4f46e5', '#10b981'];
  const chartData = [
    { name: 'Forms', value: forms.length },
    { name: 'Responses', value: totalResponses },
  ];

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-gray-800">My Dashboard</h1>
        <Link
          to="/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold shadow"
        >
          Create Form
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 font-medium">Forms Created</p>
          <p className="text-5xl font-extrabold text-blue-600">{forms.length}</p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center">
          <p className="text-gray-500 font-medium">Total Responses</p>
          <p className="text-5xl font-extrabold text-green-600">{totalResponses}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow flex justify-center">
        <PieChart width={300} height={300}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Forms List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map(form => (
          <div key={form.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-bold">{form.title}</h3>
            <div className="flex gap-4 mt-3 text-sm font-medium">
              <Link to={`/edit/${form.id}`} className="text-green-600 hover:underline">
                Edit
              </Link>
              <Link to={`/forms/${form.id}/responses`} className="text-blue-600 hover:underline">
                Responses
              </Link>
              <Link to={`/public/${form.slug}`} className="text-indigo-600 hover:underline">
                Share
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
