// src/pages/Forms/FormResponses.jsx
import React, { useEffect, useState, useMemo } from "react";
import { getFormById, getFormResponses } from "../../api/forms";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { CSVLink } from "react-csv";

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

  // ------------------- Summary data -------------------
  const totalResponses = responses.length;
  const latestResponseTime = responses.length
    ? new Date(responses[responses.length - 1].createdAt).toLocaleString()
    : "No responses yet";

  // ------------------- Table data -------------------
  const data = useMemo(() => {
    return responses.map((r) => {
      const row = { submittedAt: new Date(r.createdAt).toLocaleString() };
      r.items.forEach((item) => {
        let val = item.value;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) val = parsed.join(", ");
        } catch {}
        row[item.field.label] = val;
      });
      return row;
    });
  }, [responses]);

  const columns = useMemo(() => {
    if (!responses.length) return [];
    const labels = responses[0].items.map((item) => item.field.label);
    return [
      columnHelper.accessor("submittedAt", { header: "Submitted At" }),
      ...labels.map((label) => columnHelper.accessor(label, { header: label })),
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
    const labels = responses[0].items.map((item) => item.field.label);
    return labels.filter((label) => ["Age", "Rating", "Satisfaction"].includes(label));
  }, [responses]);

  const chartData = useMemo(() => {
    const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
    const result = [];
    chartFields.forEach((fieldLabel) => {
      const counts = {};
      responses.forEach((r) => {
        const item = r.items.find((i) => i.field.label === fieldLabel);
        if (!item) return;
        let val = item.value;
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) parsed.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
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
  if (loading) return <div className="p-6 text-center text-gray-600 animate-pulse">Loading responses...</div>;
  if (!form) return <div className="p-6 text-center text-red-500">Form not found.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition transform hover:scale-105"
        >
          &larr; Back
        </button>
      </div>

      {/* Summary cards */}
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

      {/* Table with search + export CSV */}
      <div className="bg-white rounded-lg shadow-lg overflow-x-auto animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-2">
          <input
            value={globalFilter || ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search responses..."
            className="w-full md:w-1/3 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <CSVLink
            data={data}
            filename={`${form.title}-responses.csv`}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition transform hover:scale-105"
          >
            Export CSV
          </CSVLink>
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
              <tr key={row.id} className="border-b hover:bg-gray-100 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <p className="mt-4 text-gray-500 text-center">No responses yet.</p>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between p-4 gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
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
      </div>

      {/* Charts for selected fields */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          {chartData.map((chart, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow animate-fadeIn">
              <h2 className="text-lg font-semibold mb-2">{chart.field}</h2>
              <div className="h-64">
                {chart.data.length <= 6 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={80} label>
                        {chart.data.map((entry, i) => (
                          <Cell key={i} fill={chart.COLORS[i % chart.COLORS.length]} />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
