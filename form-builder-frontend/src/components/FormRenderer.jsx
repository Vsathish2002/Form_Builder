//this use for render on public reponse 

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FormRenderer({
  form,
  onSubmit,
  submitLabel = "Submit",
}) {
  const initial = {};
  (form.fields || []).forEach((f) => {
    if (f.type === "checkbox") initial[f.id] = [];
    else initial[f.id] = "";
  });

  const [values, setValues] = useState(initial);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (field, value, checked) => {
    if (field.type === "checkbox") {
      const prev = values[field.id] || [];
      if (checked) setValues({ ...values, [field.id]: [...prev, value] });
      else setValues({ ...values, [field.id]: prev.filter((v) => v !== value) });
    } else {
      setValues({ ...values, [field.id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answers = (form.fields || []).map((f) => {
      const val = values[f.id];
      if (Array.isArray(val))
        return { fieldId: f.id, value: JSON.stringify(val) };
      if (f.type === "number") return { fieldId: f.id, value: Number(val) };
      return { fieldId: f.id, value: String(val ?? "") };
    });
    if (onSubmit) await onSubmit(answers);
    setShowModal(true); // show confirmation modal
  };

  return (
    <div className="relative">
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-2xl mx-auto border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">
          {form.title}
        </h2>
        {form.description && (
          <p className="text-gray-500 mb-6 text-center">{form.description}</p>
        )}

        <div className="space-y-5">
          {(form.fields || []).map((field, i) => (
            <motion.div
              key={field.id}
              className="mb-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <label className="block mb-1 font-medium text-gray-700">
                {field.label}
                {field.required ? <span className="text-red-500"> *</span> : ""}
              </label>

              {/* Inputs */}
              {field.type === "text" && (
                <input
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}
              {field.type === "number" && (
                <input
                  type="number"
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}
              {field.type === "select" && (
                <select
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                >
                  <option value="">Select an option</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
              {field.type === "radio" &&
                (field.options || []).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center mr-4 text-gray-700"
                  >
                    <input
                      type="radio"
                      name={field.id}
                      value={opt}
                      checked={values[field.id] === opt}
                      onChange={(e) => handleChange(field, e.target.value)}
                      required={!!field.required}
                      className="mr-2 accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              {field.type === "checkbox" &&
                (field.options || []).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center mr-4 text-gray-700"
                  >
                    <input
                      type="checkbox"
                      value={opt}
                      checked={(values[field.id] || []).includes(opt)}
                      onChange={(e) =>
                        handleChange(field, opt, e.target.checked)
                      }
                      className="mr-2 accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
            </motion.div>
          ))}
        </div>

        <motion.button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition duration-300"
          whileTap={{ scale: 0.96 }}
        >
          {submitLabel}
        </motion.button>
      </motion.form>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 text-center w-96"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                🎉 Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your response. Your submission has been recorded.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
