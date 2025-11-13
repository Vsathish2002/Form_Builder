// src/pages/User/UserDashboard.jsx
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
} from "recharts";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { Search } from "lucide-react";

export default function UserDashboard() {
  const { token } = useAuth();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [formResponses, setFormResponses] = useState({});
  const [avgResponses, setAvgResponses] = useState(0);
  const [activeForms, setActiveForms] = useState(0);
  const [inactiveForms, setInactiveForms] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const setup = async () => {
      try {
        setLoading(true);
        const userForms = await getUserForms(token);
        setForms(userForms);
        setFilteredForms(userForms);

        // ✅ Fetch response counts for each form
        const responsesMap = {};
        const responsesArray = await Promise.all(
          userForms.map(async (form) => {
            const res = await getFormResponses(token, form.id);
            responsesMap[form.id] = res.length;
            return res.length;
          })
        );

        const totalResponses = responsesArray.reduce((sum, len) => sum + len, 0);
        setFormResponses(responsesMap);

        const active = userForms.filter((f) => f.status === "Active").length;
        const inactive = userForms.length - active;

        setActiveForms(active);
        setInactiveForms(inactive);
        setAvgResponses(
          userForms.length ? (totalResponses / userForms.length).toFixed(1) : 0
        );

        // ✅ WebSocket for real-time updates
        const socket = io("http://localhost:4000", {
          transports: ["websocket"],
          reconnection: true,
        });

        socket.on("connect", () => {
          userForms.forEach((form) => socket.emit("joinFormRoom", form.id));
        });

        socket.on("formSubmitted", (data) => {
          if (data?.formId) {
            setFormResponses((prev) => ({
              ...prev,
              [data.formId]: (prev[data.formId] || 0) + 1,
            }));

            setAvgResponses((prev) => {
              const total = Object.values(formResponses).reduce(
                (sum, val) => sum + val,
                0
              );
              return userForms.length
                ? ((total + 1) / userForms.length).toFixed(1)
                : 0;
            });
          }
        });

        window.dashboardSocket = socket;
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      if (window.dashboardSocket) window.dashboardSocket.disconnect();
    };
  }, [token]);

  // ✅ Search Filter
  useEffect(() => {
    const filtered = forms.filter((f) =>
      f.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [searchQuery, forms]);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-80 text-indigo-600 font-medium animate-pulse">
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-80 text-red-600 font-semibold">
        {error}
      </div>
    );

  const pieData = [
    { name: "Active Forms", value: activeForms },
    { name: "Inactive Forms", value: inactiveForms },
  ];

  const barData = filteredForms.map((f) => ({
    name: f.title || "Untitled",
    responses: formResponses[f.id] || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-5 sm:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl sm:text-4xl font-extrabold text-indigo-700 tracking-tight"
        >
          My Dashboard
        </motion.h1>

        <motion.div whileHover={{ scale: 1.05 }}>
          <Link
            to="/create"
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold shadow-md transition-all text-sm sm:text-base text-center"
          >
            + Create Form
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {[
          {
            title: "Forms Created",
            value: forms.length,
            color: "from-blue-500 to-indigo-600",
            desc: "Total number of forms you have created.",
          },
          {
            title: "Active Forms",
            value: activeForms,
            color: "from-green-500 to-emerald-600",
            desc: "Currently active and receiving responses.",
          },
          {
            title: "Inactive Forms",
            value: inactiveForms,
            color: "from-yellow-400 to-orange-500",
            desc: "Forms that are turned off or unpublished.",
          },
          {
            title: "Avg Responses/Form",
            value: avgResponses,
            color: "from-pink-500 to-rose-600",
            desc: "Average responses per created form.",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-xl shadow-md p-6 flex flex-col items-center justify-center text-center`}
          >
            <p className="text-base sm:text-lg font-semibold opacity-95">
              {stat.title}
            </p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-4xl sm:text-5xl font-extrabold mt-2"
            >
              {stat.value}
            </motion.p>
            <p className="text-sm sm:text-base font-medium mt-2 opacity-95">
              {stat.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            🥧 Active vs Inactive Forms
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
          <h2 className="text-xl font-bold text-gray-700 mb-4">
            📊 Responses per Form
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="responses" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* ✅ Updated Forms Table with Search and Real Counts */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-3">
            <h2 className="text-xl font-bold text-gray-700">
              📋 Forms Summary Table
            </h2>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search form by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm sm:text-base">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left">Form Title</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Responses</th>
                </tr>
              </thead>
              <tbody>
                {filteredForms.length > 0 ? (
                  filteredForms.map((form, i) => (
                    <tr
                      key={form.id}
                      className={`border-t ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-indigo-50 transition`}
                    >
                      <td className="p-3">{form.title}</td>
                      <td className="p-3 text-center">
                        {form.status === "Active" ? (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold text-indigo-600">
                        {formResponses[form.id] || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="text-center p-5 text-gray-500 font-medium"
                    >
                      No forms found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
 