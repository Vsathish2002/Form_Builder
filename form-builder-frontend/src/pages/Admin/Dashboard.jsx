// src/pages/Admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getForms } from "../../api/forms";
import { getUsers } from "../../api/users";
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
import io from "socket.io-client";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [forms, setForms] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [lineData, setLineData] = useState([]);

  /** ---------------- Load Data ---------------- */
  const loadDashboardData = async () => {
    try {
      const formsRes = await getForms(token);
      const usersRes = await getUsers(token);

      setForms(formsRes ?? []);
      setUsersCount(usersRes?.length ?? 0);

      /** 🔹 Bar Chart Data → Forms per user */
      const userCount = {};
      formsRes?.forEach((form) => {
        const owner = form.owner || {};
        const name = owner.name || owner.email || "Unknown";
        userCount[name] = (userCount[name] || 0) + 1;
      });

      setBarData(
        Object.entries(userCount).map(([name, count]) => ({
          name,
          forms: count,
        }))
      );

      /** 🔹 Pie Chart → Active vs Inactive */
      const active = formsRes.filter((f) => f.status === "Active").length;
      const inactive = formsRes.length - active;

      setPieData([
        { name: "Active Forms", value: active },
        { name: "Inactive Forms", value: inactive },
      ]);

      /** 🔹 Line Chart → 7 latest forms (dummy timeline) */
      const timeline = formsRes.slice(0, 7).map((f, i) => ({
        date: f.createdAt
          ? new Date(f.createdAt).toLocaleDateString()
          : `Day ${i + 1}`,
        forms: i + 1,
      }));

      setLineData(timeline);

      setLoading(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadDashboardData();
  }, [token]);

  /** ---------------- Real-Time Updates via WebSocket ---------------- */
  useEffect(() => {
    const socket = io("http://localhost:4000", {
    // const socket = io("http://192.168.0.105:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("🔗 Admin Dashboard Socket Connected:", socket.id);

      // Join global room for admin
      socket.emit("joinAdminDashboard");
    });

    /** 🟢 When any form is updated (activate/deactivate/edit/delete) */
    socket.on("formUpdated", () => {
      console.log("📡 formUpdated → refreshing admin dashboard");
      loadDashboardData();
    });

    /** 🟢 When new form is created */
    socket.on("formCreated", () => {
      console.log("📡 formCreated → refreshing admin dashboard");
      loadDashboardData();
    });

    /** 🟢 When any form is deleted */
    socket.on("formDeleted", () => {
      console.log("📡 formDeleted → refreshing admin dashboard");
      loadDashboardData();
    });

    return () => socket.disconnect();
  }, []);

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"];

  if (loading)
    return (
      <div className="flex justify-center items-center h-96 text-indigo-600 font-semibold animate-pulse">
        Loading Admin Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen space-y-10">
      {/* Header */}
      <motion.div
        initial={{ y: -25, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Welcome back, <span className="font-semibold">{user?.name}</span>
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {[
          {
            title: "Total Users",
            value: usersCount,
            color: "from-indigo-500 to-blue-600",
          },
          {
            title: "Total Forms",
            value: forms.length,
            color: "from-green-500 to-emerald-600",
          },
          {
            title: "Active Forms",
            value: pieData[0]?.value ?? 0,
            color: "from-yellow-400 to-orange-500",
          },
          {
            title: "Inactive Forms",
            value: pieData[1]?.value ?? 0,
            color: "from-pink-500 to-rose-600",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className={`bg-gradient-to-r ${stat.color} text-white rounded-xl shadow-md p-5 sm:p-6 flex flex-col items-center justify-center`}
          >
            <p className="text-xs sm:text-sm opacity-90">{stat.title}</p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="text-3xl sm:text-4xl font-extrabold mt-1"
            >
              {stat.value}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
            📊 Forms Per User
          </h2>
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="forms" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-md p-5"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
            🥧 Active vs Inactive Forms
          </h2>
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </motion.div>

        {/* Line Chart */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.7 }}
          className="bg-white rounded-xl shadow-md p-5 lg:col-span-2"
        >
          <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
            📈 Form Creation Trend
          </h2>
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
