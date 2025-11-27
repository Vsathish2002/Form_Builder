import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function FormRenderer({
  form,
  onSubmit,
  submitLabel = "Submit",
}) {
  const initialValues = {};
  (form.fields?.[0]?.fields || []).forEach((f) => {
    initialValues[f.id] = f.type === "checkbox" ? [] : "";
  });

  const [values, setValues] = useState(initialValues);
  const [filePreviews, setFilePreviews] = useState({});
  const [showModal, setShowModal] = useState(false);

  const glassInput =
    "w-full p-3 bg-white/10 text-white border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none placeholder-gray-300 shadow-inner";

  const glassBox =
    "p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl shadow";

  const handleChange = (field, value, checked) => {
    if (field.type === "checkbox") {
      const prev = values[field.id] || [];
      let updated;
      if (checked) {
        // Only add non-empty values and prevent duplicates
        if (value && value.toString().trim() !== "") {
          // Check if value already exists
          if (!prev.includes(value)) {
            updated = [...prev, value];
          } else {
            updated = prev; // Don't add duplicates
          }
        } else {
          updated = prev; // Don't add empty values
        }
      } else {
        updated = prev.filter((v) => v !== value);
      }
      setValues({ ...values, [field.id]: updated });
    } else {
      setValues({ ...values, [field.id]: value });
    }
  };

  const handleFile = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setValues({ ...values, [field.id]: file });
      setFilePreviews({
        ...filePreviews,
        [field.id]: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const f of (form.fields || [])) {
      if (f.required) {
        const val = values[f.id];

        if (
          ["text", "textarea", "number", "date", "select"].includes(f.type) &&
          (!val || val.toString().trim() === "")
        ) {
          toast.error(`Please fill: ${f.label}`);
          return;
        }

        if (f.type === "radio" && !val) {
          toast.error(`Please select an option for: ${f.label}`);
          return;
        }

        if (f.type === "checkbox" && (!val || val.length === 0)) {
          toast.error(`Please select at least one option for: ${f.label}`);
          return;
        }

        if ((f.type === "file" || f.type === "fileUpload") && !val) {
          toast.error(`Please upload a file for: ${f.label}`);
          return;
        }
      }
    }

    const formData = new FormData();

    (form.fields || []).forEach((f) => {
      const val = values[f.id];

      if (
        (f.type === "file" || f.type === "fileUpload") &&
        val instanceof File
      ) {
        formData.append(f.id, val, val.name);
      } else if (Array.isArray(val)) {
        formData.append(f.id, JSON.stringify(val));
      } else {
        formData.append(f.id, val);
      }
    });

    try {
      if (onSubmit) await onSubmit(formData);
      setShowModal(true);
    } catch (err) {
      console.error("Form submission failed:", err);
      toast.error("Submission failed. Please try again.");
    }
  };

  const normalizeOptions = (options) =>
    (options || []).map((opt, i) => {
      if (typeof opt === "object") {
        const baseValue = opt.value ?? opt.label;
        // Ensure we never have empty values
        const safeValue = baseValue && baseValue.toString().trim() !== "" 
          ? baseValue 
          : `option-${i}`;
          
        const normalized = {
          key: `${safeValue}-${i}` || `opt-${i}`,
          value: safeValue,
          label: opt.label || safeValue,
        };
        
        return normalized;
      }
      
      const baseValue = opt;
      const safeValue = baseValue && baseValue.toString().trim() !== "" 
        ? baseValue 
        : `option-${i}`;
        
      const normalized = { 
        key: `${safeValue}-${i}` || `opt-${i}`, 
        value: safeValue, 
        label: baseValue || safeValue
      };
      
      return normalized;
    });

  const renderField = (field) => {
    switch (field.type) {
      case "header": {
        const size = {
          h1: "text-4xl font-extrabold",
          h2: "text-3xl font-bold",
          h3: "text-2xl font-semibold",
          h4: "text-xl font-semibold",
          h5: "text-lg font-medium",
          h6: "text-base font-medium",
        };

        const level = (field.subtype || "h2 ").toLowerCase().trim();

        const Tag = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(level)
          ? level
          : "h3";

        return (
          <Tag
            className={`${size[level]} text-indigo-50 drop-shadow-sm  text-center `}
          >
            {field.label}
          </Tag>
        );
      }

      case "paragraph":
        return <p className="text-gray-300 text-base">{field.label}</p>;

      case "text":
        return (
          <input
            type="text"
            className={glassInput}
            value={values[field.id]}
            placeholder={field.placeholder || ""}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );

      case "textarea":
        return (
          <textarea
            rows="3"
            className={glassInput}
            value={values[field.id]}
            placeholder={field.placeholder || ""}
            onChange={(e) => handleChange(field, e.target.value)}
          ></textarea>
        );

      case "number":
        return (
          <input
            type="number"
            className={glassInput}
            value={values[field.id]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );

      case "date":
        return (
          <input
            type="date"
            className={glassInput}
            value={values[field.id]}
            onChange={(e) => handleChange(field, e.target.value)}
          />
        );

      case "select": {
        const opts = normalizeOptions(field.options);
        return (
          <select
            className={glassInput + " text-white bg-white/10"}
            style={{ colorScheme: "dark" }}
            value={values[field.id]}
            onChange={(e) => handleChange(field, e.target.value)}
          >
            <option value="" className="text-gray-600 bg-[#1b1c2a]">
              Select an option
            </option>

            {opts.map((opt) => (
              <option
                key={opt.key}
                value={opt.value}
                className="bg-[#1b1c2a] text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>
        );
      }

      case "radio": {
        const opts = normalizeOptions(field.options);
        return (
          <div className="flex flex-wrap gap-3">
            {opts.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 text-gray-200 cursor-pointer"
              >
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={values[field.id] === opt.value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="accent-indigo-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );
      }

      case "checkbox": {
        const opts = normalizeOptions(field.options);
        return (
          <div className="flex flex-wrap gap-3">
            {opts.map((opt) => (
              <label
                key={opt.key}
                className="flex items-center gap-2 text-gray-200 cursor-pointer"
              >
                <input
                  type="checkbox"
                  name={field.id}
                  value={opt.value}
                  checked={(values[field.id] || []).includes(opt.value)}
                  onChange={(e) =>
                    handleChange(field, opt.value, e.target.checked)
                  }
                  className="accent-indigo-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );
      }

      case "file":
      case "fileUpload":
        return (
          <div>
            <input
              type="file"
              className={glassInput}
              onChange={(e) => handleFile(field, e)}
            />
            {filePreviews[field.id] && (
              <img
                src={filePreviews[field.id]}
                className="mt-3 w-32 h-32 rounded-lg border border-white/20 object-cover"
              />
            )}
          </div>
        );

      default:
        return <p className="text-gray-400 italic">Unsupported field</p>;
    }
  };

  return (
    <div className="relative w-full flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/10 border border-white/20 backdrop-blur-2xl 
                   rounded-3xl px-8 py-10 shadow-2xl text-white"
      >
        <div className="space-y-7">
          {(form.fields || []).map((field) => (
            <div key={field.id} className={glassBox}>
              {!["header", "paragraph"].includes(field.type) && (
                <label className="block mb-2 font-medium text-indigo-200">
                  {field.label}
                  {field.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>
              )}
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-10 gap-4">
          <button
            type="button"
            onClick={() => {
              const reset = {};
              (form.fields || []).forEach((f) => {
                reset[f.id] = f.type === "checkbox" ? [] : "";
              });
              setValues(reset);
              setFilePreviews({});
            }}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold shadow-lg"
          >
            Clear All
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 px-8 py-3 rounded-lg font-semibold shadow-lg"
          >
            {submitLabel}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 text-center w-96"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                🎉 Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Your response has been recorded.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
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
