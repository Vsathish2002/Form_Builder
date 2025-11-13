import React, { useEffect, useState, useMemo } from "react";
import {
  getFormById,
  getFormResponses,
  deleteResponse,
} from "../../api/forms";
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
import toast, { Toaster } from "react-hot-toast";

export default function FormResponses() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnHelper = createColumnHelper();

  /** ---------------- WebSocket: Real-time updates ---------------- */
  useEffect(() => {
    const socket = io("http://localhost:4000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      socket.emit("joinFormRoom", id);
    });

    socket.on("formSubmitted", async (data) => {
      if (data.formId === id) {
        toast.success("🆕 New response received!");
        try {
          const res = await getFormResponses(token, id);
          setResponses(res || []);
        } catch (err) {
          console.error("Failed to fetch updated responses:", err);
        }
      }
    });

    return () => socket.disconnect();
  }, [id, token]);

  /** ---------------- Fetch form & responses ---------------- */
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
        toast.error("Failed to load responses.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  /** ---------------- Delete response ---------------- */
  const handleDeleteResponse = async (responseId) => {
    if (!window.confirm("Are you sure you want to delete this response?"))
      return;
    try {
      await deleteResponse(token, responseId);
      setResponses((prev) => prev.filter((r) => r.id !== responseId));
      toast.success("🗑️ Response deleted successfully!");
    } catch (err) {
      console.error("Failed to delete response:", err);
      toast.error("Delete failed!");
    }
  };

  /** ---------------- Build table data ---------------- */
  const data = useMemo(() => {
    if (!responses.length || !form) return [];

    const filteredFields = form.fields.filter(
      (f) => !["header", "paragraph"].includes(f.type)
    );

    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };

      filteredFields.forEach((field) => {
        let val =
          r.responseData?.[field.id] ??
          r.responseData?.[field.name] ??
          r.responseData?.[field.label] ??
          "-";

        if (val && typeof val === "object" && !Array.isArray(val)) {
          const innerValue = Object.values(val)[0];
          val = typeof innerValue === "string" ? innerValue : JSON.stringify(val);
        }

        if (typeof val === "string" && val.startsWith("[")) {
          try {
            val = JSON.parse(val);
          } catch {
            /* ignore invalid JSON */
          }
        }

        if (Array.isArray(val)) {
          row[field.label] = val.join(", ");
        } else if (typeof val === "string" && val.startsWith("/uploads/")) {
          const filename = val.split("/").pop();
          row[field.label] = (
            <a
              href={`http://localhost:4000${val}`}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {filename}
            </a>
          );
        } else if (val) {
          row[field.label] = String(val);
        } else {
          row[field.label] = "-";
        }
      });

      return row;
    });
  }, [responses, form]);

  /** ---------------- CSV Export ---------------- */
  const csvData = useMemo(() => {
    if (!responses.length || !form) return [];

    const filteredFields = form.fields.filter(
      (f) => !["header", "paragraph"].includes(f.type)
    );

    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      filteredFields.forEach((field) => {
        const val =
          r.responseData?.[field.id] ??
          r.responseData?.[field.name] ??
          r.responseData?.[field.label] ??
          "-";
        if (Array.isArray(val)) row[field.label] = val.join(", ");
        else if (typeof val === "string" && val.startsWith("/uploads/"))
          row[field.label] = val.split("/").pop();
        else row[field.label] = val || "-";
      });
      return row;
    });
  }, [responses, form]);

  /** ---------------- Table Columns ---------------- */
  const columns = useMemo(() => {
    if (!form) return [];

    const filteredFields = form.fields.filter(
      (f) => !["header", "paragraph"].includes(f.type)
    );

    return [
      columnHelper.accessor("submittedAt", { header: "Submitted At" }),
      ...filteredFields.map((f) =>
        columnHelper.display({
          id: f.label,
          header: f.label,
          cell: (info) => info.row.original[f.label],
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

  const globalFilterFn = (row, columnId, filterValue) => {
  const value = row.getValue(columnId);
  return String(value || "")
    .toLowerCase()
    .includes(String(filterValue || "").toLowerCase());
};

  /** ---------------- React Table Setup ---------------- */
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
     globalFilterFn, // ✅ fixed here
  });

  /** ---------------- Chart Data for checkbox/radio ---------------- */
  const chartFields = useMemo(() => {
    if (!form || !responses.length) return [];

    return form.fields
      .filter((f) => ["radio", "checkbox"].includes(f.type))
      .map((field) => {
        const countMap = {};
        responses.forEach((r) => {
          const val =
            r.responseData?.[field.id] ??
            r.responseData?.[field.name] ??
            r.responseData?.[field.label];

          if (Array.isArray(val)) {
            val.forEach((v) => (countMap[v] = (countMap[v] || 0) + 1));
          } else if (val) {
            countMap[val] = (countMap[val] || 0) + 1;
          }
        });
        const data = Object.keys(countMap).map((key) => ({
          name: key,
          value: countMap[key],
        }));
        return { field, data };
      });
  }, [form, responses]);

  /** ---------------- Summary ---------------- */
  const totalResponses = responses.length;
  const latestResponseTime = responses.length
    ? new Date(responses[responses.length - 1].createdAt).toLocaleString()
    : "No responses yet";

  /** ---------------- Render ---------------- */
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
      className="p-4 md:p-6 max-w-7xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Toaster position="top-right" reverseOrder={false} />

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
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold mb-1">Total Responses</h2>
          <p className="text-gray-600 text-2xl font-bold">{totalResponses}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-center">
          <h2 className="text-lg font-semibold mb-1">Latest Submission</h2>
          <p className="text-gray-600">{latestResponseTime}</p>
        </div>
      </div>

    {/* -------------------- TABLE SECTION -------------------- */}
<motion.div className="bg-white rounded-lg shadow-lg overflow-hidden">
  {/* 🔍 Top Controls: Search + Page Size Selector */}
  <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-3 border-b border-gray-100">
    <input
      value={globalFilter || ""}
      onChange={(e) => setGlobalFilter(e.target.value)}
      placeholder="🔍 Search responses..."
      className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />

    <div className="flex items-center gap-2">
      <label htmlFor="pageSize" className="text-gray-600 text-sm font-medium">
        Rows per page:
      </label>
      <select
        id="pageSize"
        value={table.getState().pagination.pageSize}
        onChange={(e) => table.setPageSize(Number(e.target.value))}
        className="border px-2 py-1 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        {[5, 10, 25, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  </div>

  {/* 🧾 Table Content */}
  <div className="overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead className="bg-blue-600 text-white">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-3 md:px-4 py-3 text-left font-semibold cursor-pointer whitespace-nowrap"
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
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="px-3 md:px-4 py-2 text-gray-700 whitespace-nowrap"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* 🧩 Empty State */}
  {data.length === 0 && (
    <p className="mt-4 text-gray-500 text-center">No responses yet.</p>
  )}

  {/* ⏩ Pagination Controls */}
  <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100 bg-gray-50">
    <div className="flex items-center gap-2">
      <button
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ← Previous
      </button>
      <button
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
        className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Next →
      </button>
    </div>

    <div className="text-sm text-gray-600">
      Page{" "}
      <span className="font-semibold">
        {table.getState().pagination.pageIndex + 1}
      </span>{" "}
      of <span className="font-semibold">{table.getPageCount()}</span>
    </div>
  </div>
</motion.div>

      {/* Export CSV */}
      <div className="flex justify-end mt-4">
        <CSVLink
          data={csvData}
          filename={`${form.title}-responses.csv`}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          ⬇️ Export CSV
        </CSVLink>
      </div>

      {/* Charts */}
      {chartFields.length > 0 && (
        <motion.div
          className="grid md:grid-cols-2 gap-6 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {chartFields.map(({ field, data }, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl shadow flex flex-col items-center"
            >
              <h3 className="text-lg font-semibold mb-3 text-center">
                {field.label}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                {data.length > 3 ? (
                  <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#2563eb" />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                      dataKey="value"
                    >
                      {data.map((_, i) => (
                        <Cell
                          key={i}
                          fill={["#2563eb", "#9333ea", "#22c55e"][i % 3]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
