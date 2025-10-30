// src/pages/Forms/FormResponses.jsx
import React, { useEffect, useState } from "react";
import { getFormById, getFormResponses } from "../../api/forms";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import io from "socket.io-client";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function FormResponses() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    (async () => {
      const f = await getFormById(token, id);
      setForm(f);
      const res = await getFormResponses(token, id);
      setResponses(res || []);
    })();
  }, [id, token]);

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socket.on("newFormResponse", async (data) => {
      if (data.formId === id) {
        const res = await getFormResponses(token, id);
        setResponses(res || []);
      }
    });
    return () => socket.disconnect();
  }, [id, token]);

  if (!form) return <div className="p-6">Loading...</div>;

  // ====== Summary Stats ======
  const totalResponses = responses.length;
  const latestResponseTime =
    totalResponses > 0
      ? new Date(responses[responses.length - 1].createdAt).toLocaleString()
      : "—";

  // ====== Chart Data Preparation ======
  const fieldCounts = {};
  responses.forEach((r) => {
    r.items.forEach((item) => {
      const label = item.field.label;
      if (!fieldCounts[label]) fieldCounts[label] = {};
      let val = item.value;
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) parsed.forEach((v) => (fieldCounts[label][v] = (fieldCounts[label][v] || 0) + 1));
        else fieldCounts[label][parsed] = (fieldCounts[label][parsed] || 0) + 1;
      } catch {
        fieldCounts[label][val] = (fieldCounts[label][val] || 0) + 1;
      }
    });
  });

  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

  // ====== UI ======
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
          <p className="text-gray-600">View and analyze form responses.</p>
        </div>
        <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
          Total Responses: {totalResponses}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Form ID</h2>
          <p className="text-gray-600">{form.id}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Total Responses</h2>
          <p className="text-gray-600">{totalResponses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Latest Submission</h2>
          <p className="text-gray-600">{latestResponseTime}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-6">
        {Object.keys(fieldCounts).map((fieldLabel, idx) => {
          const chartData = Object.entries(fieldCounts[fieldLabel]).map(([key, value]) => ({
            name: key,
            count: value,
          }));

          return (
            <div key={idx} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">{fieldLabel}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>

                {/* Pie Chart */}
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          );
        })}
      </div>

      {/* Response List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mt-8 mb-4">All Responses</h2>
        {responses.length === 0 ? (
          <p>No responses yet.</p>
        ) : (
          responses.map((r) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow">
              <div className="text-sm text-gray-500 mb-2">
                Submitted: {new Date(r.createdAt).toLocaleString()}
              </div>
              <div className="grid gap-2">
                {r.items.map((item) => {
                  let val = item.value;
                  try {
                    const parsed = JSON.parse(item.value);
                    if (Array.isArray(parsed)) val = parsed.join(", ");
                  } catch {}
                  return (
                    <div key={item.id} className="flex">
                      <div className="w-1/3 font-medium">{item.field.label}</div>
                      <div className="w-2/3">{val}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
