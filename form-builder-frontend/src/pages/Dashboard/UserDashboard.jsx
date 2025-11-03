import React, { useEffect, useState } from "react";
import { getUserForms, getFormResponses } from "../../api/forms";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [forms, setForms] = useState([]);
  const [responsesData, setResponsesData] = useState([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const userForms = await getUserForms(token);
        setForms(userForms);

        const responsesArray = await Promise.all(
          userForms.map((f) => getFormResponses(token, f.id))
        );

        const total = responsesArray.reduce((sum, res) => sum + res.length, 0);
        setTotalResponses(total);

        const formatted = userForms.map((f, i) => ({
          name: f.title || `Form ${i + 1}`,
          responses: responsesArray[i].length,
          id: f.id,
        }));
        setResponsesData(formatted);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  if (loading)
    return (
      <div className="p-10 text-center text-lg font-medium text-gray-600 animate-pulse">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        {error}
      </div>
    );

  // Chart Data
  const chartData = [
    { name: "Forms", value: forms.length },
    { name: "Responses", value: totalResponses },
  ];

  const lineData = responsesData.map((f) => ({
    name: f.name,
    growth: Math.floor(Math.random() * 100),
  }));

  const radarData = responsesData.map((f) => ({
    subject: f.name.length > 10 ? f.name.slice(0, 10) + "..." : f.name,
    engagement: Math.floor(Math.random() * 100),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight"
        >
          My Dashboard
        </motion.h1>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-md transition-all text-sm sm:text-base w-full sm:w-auto text-center"
          >
            + Create Form
          </Link>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Forms Created", value: forms.length, color: "from-blue-500 to-indigo-600" },
          { title: "Total Responses", value: totalResponses, color: "from-green-500 to-emerald-600" },
          { title: "Active Forms", value: forms.filter(f => f.status === 'Active').length, color: "from-yellow-400 to-orange-500" },
          { title: "Avg Responses/Form", value: forms.length ? (totalResponses / forms.length).toFixed(1) : 0, color: "from-pink-500 to-red-500" },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 200 }}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-xl shadow-lg p-6 flex flex-col items-center`}
          >
            <p className="text-sm opacity-90">{stat.title}</p>
            <motion.p
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-4xl font-extrabold mt-2"
            >
              {stat.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">Forms vs Responses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">Responses per Form</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responsesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="responses" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">Form Growth Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="growth" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">Form Engagement Radar</h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart outerRadius={100} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar
                name="Engagement"
                dataKey="engagement"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Forms List */}
      {/* <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Forms</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.length > 0 ? (
            forms.map((form, index) => (
              <motion.div
                key={form.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-5 border-l-4 border-blue-600"
              >
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {form.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {form.description || "No description provided"}
                </p>
                <div className="flex gap-5 mt-4 text-sm font-semibold">
                  <Link
                    to={`/edit/${form.id}`}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/forms/${form.id}/responses`}
                    className="text-blue-600 hover:underline"
                  >
                    Responses
                  </Link>
                  <Link
                    to={`/public/${form.slug}`}
                    className="text-indigo-600 hover:underline"
                  >
                    Share
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-gray-600 italic text-center col-span-full">
              You haven’t created any forms yet.
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
}
