import React, { useEffect, useState, useMemo } from "react";
import { getFormById, getFormResponses, deleteResponse } from "../../api/forms";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { io } from "socket.io-client";
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { CSVLink } from "react-csv";
import { motion } from "framer-motion";

export default function FormResponses() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper();

  // ------------------- WebSocket connection for real-time updates -------------------
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("FormResponses socket connected:", socket.id);
      socket.emit("joinFormRoom", id);
    });

    socket.on("formSubmitted", (data) => {
      if (data.formId === id) {
        console.log("New response received for this form:", id);
        const fetchUpdatedResponses = async () => {
          try {
            const res = await getFormResponses(token, id);
            setResponses(res || []);
          } catch (err) {
            console.error("Failed to fetch updated responses:", err);
          }
        };
        fetchUpdatedResponses();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  // ------------------- Fetch form & responses -------------------
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const f = await getFormById(token, id);
        setForm(f);
        const res = await getFormResponses(token, id);
        setResponses(res || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm("Are you sure you want to delete this response?")) return;
    try {
      await deleteResponse(token, responseId);
      setResponses(responses.filter((r) => r.id !== responseId));
    } catch (err) {
      console.error("Failed to delete response:", err);
      alert("Delete failed");
    }
  };

  // ------------------- Build table data from JSON -------------------
  const data = useMemo(() => {
    if (!responses.length || !form) return [];

    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      form.fields.forEach((field) => {
        const val = r.responseData?.[field.id];
        if (!val) row[field.label] = "-";
        else if (Array.isArray(val)) row[field.label] = val.join(", ");
        else if (typeof val === "string" && val.startsWith("/uploads/")) {
          const filename = val.split("/").pop();
          row[field.label] = (
            <a
              href={`http://localhost:4000${val}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {filename}
            </a>
          );
        } else {
          row[field.label] = val.toString();
        }
      });
      return row;
    });
  }, [responses, form]);

  // ------------------- CSV Export -------------------
  const csvData = useMemo(() => {
    if (!responses.length || !form) return [];
    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      form.fields.forEach((field) => {
        const val = r.responseData?.[field.id];
        if (Array.isArray(val)) row[field.label] = val.join(", ");
        else if (typeof val === "string" && val.startsWith("/uploads/"))
          row[field.label] = val.split("/").pop();
        else row[field.label] = val || "-";
      });
      return row;
    });
  }, [responses, form]);

  // ------------------- Table Columns -------------------
  const columns = useMemo(() => {
    if (!form) return [];
    return [
      columnHelper.accessor("submittedAt", { header: "Submitted At" }),
      ...form.fields.map((f) =>
        columnHelper.accessor(f.label, {
          header: f.label,
        })
      ),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleDeleteResponse(responses[row.index].id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        ),
      }),
    ];
  }, [form, responses, columnHelper]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: "includesString",
  });

  // ------------------- Summary -------------------
  const totalResponses = responses.length;
  const latestResponseTime = responses.length
    ? new Date(responses[responses.length - 1].createdAt).toLocaleString()
    : "No responses yet";

  // ------------------- Render -------------------
  if (loading)
    return (
      <motion.div className="p-6 text-center text-gray-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Loading responses...
      </motion.div>
    );

  if (!form)
    return (
      <motion.div className="p-6 text-center text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Form not found.
      </motion.div>
    );

  return (
    <motion.div
      className="p-6 max-w-7xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Back button */}
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          &larr; Back
        </motion.button>
      </div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Total Responses</h2>
          <p className="text-gray-600">{totalResponses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">Latest Submission</h2>
          <p className="text-gray-600">{latestResponseTime}</p>
        </div>
      </div>

      {/* Table */}
      <motion.div className="bg-white rounded-lg shadow-lg overflow-x-auto">
        <div className="p-4 space-y-4">
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search responses..."
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-end">
            <CSVLink
              data={csvData}
              filename={`${form.title}-responses.csv`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              Export CSV
            </CSVLink>
          </div>
        </div>

        <table className="min-w-full">
          <thead className="bg-blue-600 text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <span>
                      {header.column.getIsSorted() === "asc"
                        ? " 🔼"
                        : header.column.getIsSorted() === "desc"
                        ? " 🔽"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <motion.tr key={row.id} className="border-b hover:bg-gray-100 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="mt-4 text-gray-500 text-center">No responses yet.</p>
        )}
      </motion.div>
    </motion.div>
  );
}
