import React from "react";

export default function FormEditor({ form, setForm }) {
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleCheckboxChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.checked });

  return (
    <>
      <input
        name="title"
        placeholder="Form Title"
        value={form.title}
        onChange={handleChange}
        className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <textarea
        name="description"
        placeholder="Form Description"
        value={form.description}
        onChange={handleChange}
        className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="4"
      />
      {/* <label className="flex items-center mb-4">
        <input
          type="checkbox"
          name="isPublic"
          checked={form.isPublic || false}
          onChange={handleCheckboxChange}
          className="mr-2"
        />
        Make this form public
      </label> */}
    </>
  );
}
