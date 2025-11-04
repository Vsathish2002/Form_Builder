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
  const [filePreviews, setFilePreviews] = useState({});

  const handleChange = (field, value, checked) => {
    if (field.type === "checkbox") {
      const prev = values[field.id] || [];
      if (checked) setValues({ ...values, [field.id]: [...prev, value] });
      else setValues({ ...values, [field.id]: prev.filter((v) => v !== value) });
    } else if (field.type === "file") {
      const file = value?.target?.files?.[0];
      if (file) {
        setValues({ ...values, [field.id]: file });
        setFilePreviews({
          ...filePreviews,
          [field.id]: URL.createObjectURL(file),
        });
      }
    } else {
      setValues({ ...values, [field.id]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const answers = {};
    const files = {};

    (form.fields || []).forEach((f) => {
      const val = values[f.id];
      if (f.type === "file" && val) files[f.id] = val;
      else if (Array.isArray(val)) answers[f.id] = JSON.stringify(val);
      else answers[f.id] = val;
    });

    if (onSubmit) await onSubmit(answers, files);
    setShowModal(true);
  };

  return (
    <div className="relative w-full flex justify-center items-center py-10 px-4">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-3xl px-8 py-10 sm:px-10 sm:py-12
          transition-all duration-500 hover:shadow-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">{form.title}</h2>
          {form.description && (
            <p className="text-gray-500 mt-2 text-lg">{form.description}</p>
          )}
        </div>

        <div className="space-y-7">
          {(form.fields || []).map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition"
            >
              <label className="block text-lg font-medium text-gray-700 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {/* TEXT */}
              {field.type === "text" && (
                <input
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}

              {/* TEXTAREA */}
              {field.type === "textarea" && (
                <textarea
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}

              {/* NUMBER */}
              {field.type === "number" && (
                <input
                  type="number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}

              {/* DATE */}
              {field.type === "date" && (
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={values[field.id] || ""}
                  onChange={(e) => handleChange(field, e.target.value)}
                  required={!!field.required}
                />
              )}

              {/* SELECT */}
              {field.type === "select" && (
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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

              {/* RADIO */}
              {field.type === "radio" &&
                (field.options || []).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center mr-5 mt-2 cursor-pointer"
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
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}

              {/* CHECKBOX */}
              {field.type === "checkbox" &&
                (field.options || []).map((opt) => (
                  <label
                    key={opt}
                    className="inline-flex items-center mr-5 mt-2 cursor-pointer"
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
                    <span className="text-gray-700">{opt}</span>
                  </label>
                ))}

              {/* FILE */}
              {field.type === "file" && (
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full p-2 border border-gray-300 rounded-lg"
                    onChange={(e) => handleChange(field, e)}
                    required={!!field.required}
                  />
                  {filePreviews[field.id] && (
                    <img
                      src={filePreviews[field.id]}
                      alt="Preview"
                      className="mt-3 w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                    />
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.button
          type="submit"
          className="mt-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-3 rounded-lg font-semibold 
            shadow-md hover:shadow-lg hover:scale-[1.02] transition duration-300"
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
              transition={{ type: 'spring', duration: 0.5 }}
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
