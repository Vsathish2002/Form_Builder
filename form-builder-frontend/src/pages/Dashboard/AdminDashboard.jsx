import React, { useEffect, useState } from "react";
import { getForms, deleteForm } from "../../api/forms";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);

  // Fetch all forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      const res = await getForms(token);
      setForms(res || []);

      // Chart 1: Forms per User
      const userCount = {};
      res.forEach((form) => {
        const owner = form.owner || {};
        const name = owner.name || owner.email || "Unknown User";
        userCount[name] = (userCount[name] || 0) + 1;
      });
      const chartArray = Object.entries(userCount).map(([name, count]) => ({
        name,
        forms: count,
      }));
      setChartData(chartArray);

      // Chart 2: Pie of Active vs Inactive
      const active = Math.floor(res.length * 0.8);
      const inactive = res.length - active;
      setPieData([
        { name: "Active Forms", value: active },
        { name: "Inactive Forms", value: inactive },
      ]);

      // Chart 3: Form creation over time (simulate timeline)
      const timeline = res.slice(0, 7).map((f, i) => ({
        date: f.createdAt
          ? new Date(f.createdAt).toLocaleDateString()
          : `Day ${i + 1}`,
        forms: i + 1,
      }));
      setLineData(timeline);
    } catch (err) {
      console.error("Failed to fetch forms:", err);
      setError("Failed to load forms.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchForms();
    else {
      setError("You are not authorized to view this page.");
      setLoading(false);
    }
  }, [user, token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this form?")) return;
    try {
      await deleteForm(token, id);
      setForms((prev) => prev.filter((f) => f.id !== id));
      fetchForms(); // refresh data
    } catch (err) {
      console.error("Failed to delete form:", err);
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600 animate-pulse">
        Loading Admin Dashboard...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-semibold">{error}</div>
    );

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 space-y-12">
      {/* Header */}
      <motion.div
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-4xl font-extrabold text-blue-700 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg mt-2">
          Monitor user activity and manage all created forms
        </p>
        <p className="mt-1 text-gray-700 font-medium">
          Total Forms: <span className="text-blue-600">{forms.length}</span>
        </p>
      </motion.div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Forms",
            value: forms.length,
            color: "from-blue-500 to-indigo-600",
          },
          {
            title: "Total Users",
            value: chartData.length,
            color: "from-green-500 to-emerald-600",
          },
          {
            title: "Active Forms",
            value: Math.floor(forms.length * 0.8),
            color: "from-yellow-400 to-orange-500",
          },
          {
            title: "Inactive Forms",
            value: Math.floor(forms.length * 0.2),
            color: "from-pink-500 to-rose-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6 }}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-xl shadow-lg p-6 flex flex-col items-center`}
          >
            <p className="text-sm opacity-90">{stat.title}</p>
            <motion.p
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-4xl font-extrabold mt-2"
            >
              {stat.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            📊 Forms Created by Each User
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="forms" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            🥧 Active vs Inactive Forms
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            📈 Form Creation Trend (Last 7 Entries)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="forms"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Forms List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📄 All Submitted Forms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.length > 0 ? (
            forms.map((form, index) => (
              <motion.div
                key={form.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white border-l-4 border-blue-600 rounded-xl shadow-lg hover:shadow-2xl transition-all p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {form.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {form.description || "No description provided"}
                </p>
                <p className="text-sm mt-2 text-gray-600">
                  <span className="font-medium text-gray-700">Owner:</span>{" "}
                  {form.owner?.name || form.owner?.email || "Unknown"}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Created:</span>{" "}
                  {form.createdAt
                    ? new Date(form.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>

                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleDelete(form.id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg shadow-md"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = `/forms/${form.id}/responses`)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg shadow-md"
                  >
                    View Responses
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-gray-500 italic text-center col-span-full">
              No forms available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
