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
  const [pageSize, setPageSize] = useState(10);

  const columnHelper = createColumnHelper();

  // ------------------- WebSocket connection for real-time updates -------------------
  useEffect(() => {
    // Connect to WebSocket server for real-time response updates
    const socket = io('http://localhost:4000', {
    // const socket = io('http://192.168.0.105:5173:4000', {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('FormResponses socket connected:', socket.id);
      socket.emit('joinFormRoom', id);
    });

    socket.on('disconnect', () => {
      console.log('FormResponses socket disconnected');
    });

    // Listen for new form responses and update the UI instantly
    socket.on('formSubmitted', (data) => {
      console.log('Received formSubmitted event:', data);
      if (data.formId === id) {
        console.log('Updating responses for form:', id);
        // Refresh responses to show the new submission
        const fetchUpdatedResponses = async () => {
          try {
            const res = await getFormResponses(token, id);
            setResponses(res || []);
          } catch (err) {
            console.error('Failed to fetch updated responses:', err);
          }
        };
        fetchUpdatedResponses();
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [id, token]);

  // ------------------- Fetch data -------------------
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
    if (!window.confirm('Are you sure you want to delete this response?')) return;
    try {
      await deleteResponse(token, responseId);
      setResponses(responses.filter(r => r.id !== responseId));
    } catch (err) {
      console.error('Failed to delete response:', err);
      alert('Delete failed');
    }
  };

  // ------------------- Summary data -------------------
  const totalResponses = responses.length;
  const latestResponseTime = responses.length
    ? new Date(responses[responses.length - 1].createdAt).toLocaleString()
    : "No responses yet";

    // Table data for display
  const data = useMemo(() => {
    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      r.items.forEach((item) => {
        const type = item.field.type;
        let val = item.value;

        // Skip structural fields
        if (type === "header" || type === "section") return;

        // Parse JSON for multi-select/checkbox
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) val = parsed.join(", ");
        } catch {}

        // Format date fields
        if (type === "date" && val) {
          val = new Date(val).toLocaleDateString();
        }

        // Format file fields as clickable download link
        if (type === "file") {
          if (typeof val === 'string' && val && val.startsWith('/uploads/')) {
            const filename = val.split("/").pop();
            val = (
              <a
                href={val}
                download={filename}
                className="text-blue-600 underline"
              >
                {filename}
              </a>
            );
          } else {
            val = 'Uploaded file';
          }
        }

        // Ensure val is a string or JSX, not object (for non-file types)
        if (type !== "file" && typeof val === 'object' && val !== null) {
          val = val.toString();
        }

        row[item.field.label] = val;
      });
      return row;
    });
  }, [responses]);

  // CSV export data (plain text, no JSX)
  const csvData = useMemo(() => {
    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      r.items.forEach((item) => {
        const type = item.field.type;
        let val = item.value;

        // Skip structural fields
        if (type === "header" || type === "section") return;

        // Parse JSON for multi-select/checkbox
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) val = parsed.join(", ");
        } catch {}

        // Format date fields
        if (type === "date" && val) {
          val = new Date(val).toLocaleDateString();
        }

        // For CSV, use plain text for file fields (just the filename)
        if (type === "file" && val) {
          val = val.split("/").pop();
        }

        row[item.field.label] = val;
      });
      return row;
    });
  }, [responses]);

  const columns = useMemo(() => {
    if (!responses.length) return [];
    const labels = responses[0].items
      .filter((item) => !["header", "section"].includes(item.field.type))
      .map((item) => item.field.label);

    return [
      columnHelper.accessor("submittedAt", { header: "Submitted At" }),
      ...labels.map((label) => columnHelper.accessor(label, { header: label })),
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
  }, [responses, columnHelper]);

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

  // ------------------- Chart fields -------------------
  const chartFields = useMemo(() => {
    if (!responses.length) return [];
    return responses[0].items
      .filter(
        (item) =>
          !["header", "section", "file"].includes(item.field.type) &&
          ["number", "text", "select", "checkbox", "radio"].includes(
            item.field.type
          )
      )
      .map((item) => item.field.label)
      .filter((label) => ["Age", "Rating", "Satisfaction"].includes(label));
  }, [responses]);

  const chartData = useMemo(() => {
    const COLORS = [
      "#3b82f6",
      "#f59e0b",
      "#10b981",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];
    const result = [];

    chartFields.forEach((fieldLabel) => {
      const counts = {};
      responses.forEach((r) => {
        const item = r.items.find((i) => i.field.label === fieldLabel);
        if (!item) return;
        let val = item.value;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed))
            parsed.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
          else counts[parsed] = (counts[parsed] || 0) + 1;
        } catch {
          counts[val] = (counts[val] || 0) + 1;
        }
      });

      result.push({
        field: fieldLabel,
        data: Object.entries(counts).map(([name, value]) => ({ name, value })),
        COLORS,
      });
    });

    return result;
  }, [responses, chartFields]);
  // ------------------- Render -------------------
  if (loading)
    return (
      <motion.div
        className="p-6 text-center text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Loading responses...
      </motion.div>
    );
  if (!form)
    return (
      <motion.div
        className="p-6 text-center text-red-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
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

      {/* Summary cards */}
      <motion.div
        className="grid md:grid-cols-2 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.2 },
          },
        }}
      >
        {[
          { title: "Total Responses", value: totalResponses },
          { title: "Latest Submission", value: latestResponseTime },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white p-4 rounded-xl shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
            <p className="text-gray-600">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Table with search + export */}
      <motion.div
        className="bg-white rounded-lg shadow-lg overflow-x-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 space-y-4">
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search responses..."
            className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex justify-end">
            <motion.div whileHover={{ scale: 1.05 }}>
              <CSVLink
                data={csvData}
                filename={`${form.title}-responses.csv`}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
              >
                Export CSV
              </CSVLink>
            </motion.div>
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
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
              <motion.tr
                key={row.id}
                className="border-b hover:bg-gray-100 transition"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
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

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between p-4 gap-2">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next
            </motion.button>
          </div>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Charts */}
      {chartData.length > 0 && (
        <motion.div
          className="grid md:grid-cols-2 gap-4 mt-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          {chartData.map((chart, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-4 rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-lg font-semibold mb-2">{chart.field}</h2>
              <div className="h-64">
                {chart.data.length <= 6 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chart.data}
                        dataKey="value"
                        nameKey="name"
                        outerRadius={80}
                        label
                      >
                        {chart.data.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={chart.COLORS[i % chart.COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chart.data}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
