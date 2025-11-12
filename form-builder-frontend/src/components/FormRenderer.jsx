// import React, { useState, useRef, useEffect } from "react";
// import { AnimatePresence, motion } from "framer-motion";

// /** ✅ Helper: Split fields into pages based on `page` type */
// function splitIntoPages(fields) {
//   const pages = [];
//   let current = [];
//   for (const field of fields) {
//     if (field.type === "page") {
//       if (current.length) pages.push(current);
//       current = [];
//     } else {
//       current.push(field);
//     }
//   }
//   if (current.length) pages.push(current);
//   return pages;
// }

// export default function FormRenderer({
//   form,
//   onSubmit,
//   submitLabel = "Submit",
// }) {
//   // ✅ Initialize form values
//   const initial = {};
//   (form.fields || []).forEach((f) => {
//     if (f.type === "checkbox") initial[f.id] = [];
//     else initial[f.id] = "";
//   });

//   const [values, setValues] = useState(initial);
//   const [pageIndex, setPageIndex] = useState(0);
//   const [showModal, setShowModal] = useState(false);
//   const [filePreviews, setFilePreviews] = useState({});
//   const signatureRefs = useRef({});
//   const canvasRefs = useRef({});

//   const pages = splitIntoPages(form.fields || []);

//   // ✅ Handle input changes
//   const handleChange = (field, value, checked) => {
//     if (field.type === "checkbox") {
//       const prev = values[field.id] || [];
//       if (checked) setValues({ ...values, [field.id]: [...prev, value] });
//       else setValues({ ...values, [field.id]: prev.filter((v) => v !== value) });
//     } else {
//       setValues({ ...values, [field.id]: value });
//     }
//   };

//   // ✅ Handle file uploads
//   const handleFile = (field, e) => {
//     const file = e?.target?.files?.[0];
//     if (file) {
//       setValues({ ...values, [field.id]: file });
//       setFilePreviews({
//         ...filePreviews,
//         [field.id]: URL.createObjectURL(file),
//       });
//     }
//   };

//   // ✅ Submit handler
//  const handleSubmit = async (e) => {
//   e.preventDefault();

//   const formData = new FormData();

//   (form.fields || []).forEach((f) => {
//     const val = values[f.id];

//     if (f.type === "file" && val instanceof File) {
//       formData.append(f.id, val); // ✅ Use field ID, not 'files'
//     } else if (Array.isArray(val)) {
//       formData.append(f.id, JSON.stringify(val));
//     } else if (val !== undefined && val !== null) {
//       formData.append(f.id, val);
//     }
//   });

//   try {
//     if (onSubmit) await onSubmit(formData); // ✅ Send FormData directly
//     setShowModal(true);
//   } catch (err) {
//     console.error("Form submission failed:", err);
//     alert("Failed to submit form. Please try again.");
//   }
// };

//   // ✅ Handle signature drawing
//   const handleSignature = (fieldId, canvasRef) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     let drawing = false;

//     const startDraw = (e) => {
//       drawing = true;
//       ctx.beginPath();
//       ctx.moveTo(e.offsetX, e.offsetY);
//     };
//     const draw = (e) => {
//       if (!drawing) return;
//       ctx.lineWidth = 2;
//       ctx.lineCap = "round";
//       ctx.strokeStyle = "#000";
//       ctx.lineTo(e.offsetX, e.offsetY);
//       ctx.stroke();
//     };
//     const endDraw = () => {
//       drawing = false;
//       const dataURL = canvas.toDataURL();
//       handleChange({ id: fieldId, type: "signature" }, dataURL);
//     };

//     canvas.addEventListener("mousedown", startDraw);
//     canvas.addEventListener("mousemove", draw);
//     canvas.addEventListener("mouseup", endDraw);
//   };

//   // ✅ Render a single field type
//   const renderField = (field) => {
//     const common = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none";

//     switch (field.type) {
//       case "header":
//         const sizeClasses = {
//           h1: "text-4xl font-bold",
//           h2: "text-3xl font-bold",
//           h3: "text-2xl font-semibold",
//           h4: "text-xl font-semibold",
//           h5: "text-lg font-medium",
//           h6: "text-base font-medium",
//         };
//         const HeaderTag = field.subtype || "h3";
//         return (
//           <HeaderTag className={`${sizeClasses[field.subtype] || sizeClasses.h3} text-gray-800 mb-2`}>
//             {field.label}
//           </HeaderTag>
//         );

//       case "paragraph":
//         return <p className="text-gray-600">{field.label}</p>;

//       case "section":
//         return <hr className="border-2 border-blue-200 my-4" />;

//       case "text":
//         return (
//           <input
//             type="text"
//             className={common}
//             value={values[field.id] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             required={!!field.required}
//           />
//         );

//       case "textarea":
//         return (
//           <textarea
//             rows="3"
//             className={common}
//             value={values[field.id] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             required={!!field.required}
//           />
//         );

//       case "number":
//         return (
//           <input
//             type="number"
//             className={common}
//             value={values[field.id] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             required={!!field.required}
//           />
//         );

//       case "date":
//         return (
//           <input
//             type="date"
//             className={common}
//             value={values[field.id] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             required={!!field.required}
//           />
//         );

//       case "select":
//         const selectOptions = (field.options || []).map((opt, i) => {
//           const optStr = typeof opt === 'object' ? (opt.label || opt.value || opt.toString()) : opt;
//           return { key: optStr + i, value: optStr, label: optStr };
//         });
//         return (
//           <select
//             className={common}
//             value={values[field.id] || ""}
//             onChange={(e) => handleChange(field, e.target.value)}
//             required={!!field.required}
//           >
//             <option value="">Select an option</option>
//             {selectOptions.map((opt) => (
//               <option key={opt.key} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>
//         );

//       case "radio":
//         const radioOptions = (field.options || []).map((opt, i) => {
//           const optStr = typeof opt === 'object' ? (opt.label || opt.value || opt.toString()) : opt;
//           return { key: optStr + i, value: optStr, label: optStr };
//         });
//         return (
//           <div className="flex flex-wrap gap-3">
//             {radioOptions.map((opt) => (
//               <label key={opt.key} className="inline-flex items-center">
//                 <input
//                   type="radio"
//                   name={field.id}
//                   value={opt.value}
//                   checked={values[field.id] === opt.value}
//                   onChange={(e) => handleChange(field, e.target.value)}
//                   className="mr-2 accent-blue-600"
//                 />
//                 {opt.label}
//               </label>
//             ))}
//           </div>
//         );

//       case "checkbox":
//         const checkboxOptions = (field.options || []).map((opt, i) => {
//           const optStr = typeof opt === 'object' ? (opt.label || opt.value || opt.toString()) : opt;
//           return { key: optStr + i, value: optStr, label: optStr };
//         });
//         return (
//           <div className="flex flex-wrap gap-3">
//             {checkboxOptions.map((opt) => (
//               <label key={opt.key} className="inline-flex items-center">
//                 <input
//                   type="checkbox"
//                   value={opt.value}
//                   checked={(values[field.id] || []).includes(opt.value)}
//                   onChange={(e) => handleChange(field, opt.value, e.target.checked)}
//                   className="mr-2 accent-blue-600"
//                 />
//                 {opt.label}
//               </label>
//             ))}
//           </div>
//         );

//       case "file":
//         return (
//           <div>
//             <input
//               type="file"
//               className={common}
//               onChange={(e) => handleFile(field, e)}
//               required={!!field.required}
//             />
//             {filePreviews[field.id] && (
//               <img
//                 src={filePreviews[field.id]}
//                 alt="Preview"
//                 className="mt-3 w-32 h-32 object-cover rounded-lg border shadow-sm"
//               />
//             )}
//           </div>
//         );

//       case "signature":
//         const canvasRef = useRef(null);
//         useEffect(() => {
//           handleSignature(field.id, canvasRef);
//         }, []);
//         return (
//           <div className="mt-2">
//             <canvas
//               ref={canvasRef}
//               width={400}
//               height={150}
//               className="border rounded-md bg-gray-50 cursor-crosshair"
//             />
//             <small className="text-gray-500">Sign above</small>
//           </div>
//         );

//       case "rating":
//         return (
//           <div className="flex gap-2 text-yellow-500 text-3xl">
//             {[1, 2, 3, 4, 5].map((n) => (
//               <span
//                 key={n}
//                 className={`cursor-pointer ${
//                   values[field.id] >= n ? "text-yellow-400" : "text-gray-300"
//                 }`}
//                 onClick={() => handleChange(field, n)}
//               >
//                 ★
//               </span>
//             ))}
//           </div>
//         );

//       case "autocomplete":
//         return (
//           <>
//             <input
//               list={`opt-${field.id}`}
//               className={common}
//               value={values[field.id] || ""}
//               onChange={(e) => handleChange(field, e.target.value)}
//             />
//             <datalist id={`opt-${field.id}`}>
//               {(field.options || []).map((opt) => (
//                 <option key={opt.trim()} value={opt.trim()} />
//               ))}
//             </datalist>
//           </>
//         );

//       case "video":
//         return (
//           <video
//             src={field.extraValue || field.src}
//             controls
//             className="rounded-lg w-full max-h-64 border shadow-sm"
//           />
//         );

//       case "link":
//         return (
//           <a
//             href={field.extraValue || field.href}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-600 underline font-medium"
//           >
//             {field.label || field.href}
//           </a>
//         );

//       default:
//         return <p className="text-gray-400 italic">Unsupported field type</p>;
//     }
//   };

//   return (
//     <div className="relative w-full flex justify-center items-center py-10 px-4">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-3xl px-8 py-10 sm:px-10 sm:py-12
//           transition-all duration-500 hover:shadow-2xl"
//       >
//         {/* <div className="text-center mb-8">
//           <h2 className="text-4xl font-bold text-gray-800">{form.title}</h2>
//           {form.description && (
//             <p className="text-gray-500 mt-2 text-lg">{form.description}</p>
//           )}
//         </div> */}

//         {/* Render current page */}
//         <div className="space-y-7">
//           {(pages[pageIndex] || []).map((field) => (
//             <div
//               key={field.id}
//               className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition"
//             >
//               {["header", "paragraph", "section", "video", "link"].includes(field.type) ? (
//                 renderField(field)
//               ) : (
//                 <>
//                   <label className="block text-lg font-medium text-gray-700 mb-2">
//                     {field.label}
//                     {field.required && (
//                       <span className="text-red-500 ml-1">*</span>
//                     )}
//                   </label>
//                   {renderField(field)}
//                 </>
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Prev / Next / Submit Buttons */}
//         <div className="flex justify-between mt-10">
//           {pageIndex > 0 && (
//             <button
//               type="button"
//               onClick={() => setPageIndex(pageIndex - 1)}
//               className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg shadow"
//             >
//               ⬅ Prev
//             </button>
//           )}
//           {pageIndex < pages.length - 1 ? (
//             <button
//               type="button"
//               onClick={() => setPageIndex(pageIndex + 1)}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
//             >
//               Next ➡
//             </button>
//           ) : (
//             <button
//               type="submit"
//               className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition duration-300"
//             >
//               {submitLabel}
//             </button>
//           )}
//         </div>
//       </form>

//       {/* ✅ Success Modal */}
//       <AnimatePresence>
//         {showModal && (
//           <motion.div
//             className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="bg-white rounded-2xl shadow-2xl p-8 text-center w-96"
//               initial={{ scale: 0.8, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.8, opacity: 0 }}
//               transition={{ type: "spring", duration: 0.5 }}
//             >
//               <h2 className="text-2xl font-bold text-green-600 mb-2">
//                 🎉 Submitted Successfully!
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Thank you for your response. Your submission has been recorded.
//               </p>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
//               >
//                 Close
//               </button>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FormRenderer({
  form,
  onSubmit,
  submitLabel = "Submit",
}) {
  // ✅ Initialize default values for all fields
  const initialValues = {};
  (form.fields || []).forEach((f) => {
    if (f.type === "checkbox") initialValues[f.id] = [];
    else initialValues[f.id] = "";
  });

  const [values, setValues] = useState(initialValues);
  const [filePreviews, setFilePreviews] = useState({});
  const [showModal, setShowModal] = useState(false);

  // ✅ Handle text, radio, checkbox, select inputs
  const handleChange = (field, value, checked) => {
    if (field.type === "checkbox") {
      const prev = values[field.id] || [];
      const updated = checked
        ? [...prev, value]
        : prev.filter((v) => v !== value);
      setValues({ ...values, [field.id]: updated });
    } else {
      setValues({ ...values, [field.id]: value });
    }
  };

  // ✅ Handle file uploads
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

  // ✅ Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    (form.fields || []).forEach((f) => {
      const val = values[f.id];
      if ((f.type === "file" || f.type === "fileUpload") && val instanceof File) {
        formData.append(f.id, val, val.name); // ✅ field.id as key
      } else if (Array.isArray(val)) {
        formData.append(f.id, JSON.stringify(val));
      } else if (val !== undefined && val !== null) {
        formData.append(f.id, val);
      }
    });

    console.log("🚀 Submitting responseData:", Object.fromEntries(formData));

    try {
      if (onSubmit) await onSubmit(formData);
      setShowModal(true);
    } catch (err) {
      console.error("❌ Form submission failed:", err);
      alert("Failed to submit form. Please try again.");
    }
  };

  // ✅ Render each field type
  const renderField = (field) => {
    const common =
      "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none";

    switch (field.type) {
      case "header":
        const sizeClasses = {
          h1: "text-4xl font-bold",
          h2: "text-3xl font-bold",
          h3: "text-2xl font-semibold",
          h4: "text-xl font-semibold",
          h5: "text-lg font-medium",
          h6: "text-base font-medium",
        };
        const HeaderTag = field.subtype || "h3";
        return (
          <HeaderTag
            className={`${
              sizeClasses[field.subtype] || sizeClasses.h3
            } text-gray-800 mb-2`}
          >
            {field.label}
          </HeaderTag>
        );

      case "paragraph":
        return <p className="text-gray-600">{field.label}</p>;

      case "section":
        return <hr className="border-2 border-blue-200 my-4" />;

      case "text":
        return (
          <input
            type="text"
            name={field.id}
            id={field.id}
            className={common}
            value={values[field.id] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            required={!!field.required}
          />
        );

      case "textarea":
        return (
          <textarea
            name={field.id}
            id={field.id}
            rows="3"
            className={common}
            value={values[field.id] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            required={!!field.required}
          />
        );

      case "number":
        return (
          <input
            type="number"
            name={field.id}
            id={field.id}
            className={common}
            value={values[field.id] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            required={!!field.required}
          />
        );

      case "date":
        return (
          <input
            type="date"
            name={field.id}
            id={field.id}
            className={common}
            value={values[field.id] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            required={!!field.required}
          />
        );

      case "select":
        const selectOptions = (field.options || []).map((opt, i) => {
          const optStr =
            typeof opt === "object"
              ? opt.label || opt.value || opt.toString()
              : opt;
          return { key: optStr + i, value: optStr, label: optStr };
        });
        return (
          <select
            name={field.id}
            id={field.id}
            className={common}
            value={values[field.id] || ""}
            onChange={(e) => handleChange(field, e.target.value)}
            required={!!field.required}
          >
            <option value="">Select an option</option>
            {selectOptions.map((opt) => (
              <option key={opt.key} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        const radioOptions = (field.options || []).map((opt, i) => {
          const optStr =
            typeof opt === "object"
              ? opt.label || opt.value || opt.toString()
              : opt;
          return { key: optStr + i, value: optStr, label: optStr };
        });
        return (
          <div className="flex flex-wrap gap-3">
            {radioOptions.map((opt) => (
              <label key={opt.key} className="inline-flex items-center">
                <input
                  type="radio"
                  name={field.id}
                  id={`${field.id}-${opt.key}`}
                  value={opt.value}
                  checked={values[field.id] === opt.value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="mr-2 accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const checkboxOptions = (field.options || []).map((opt, i) => {
          const optStr =
            typeof opt === "object"
              ? opt.label || opt.value || opt.toString()
              : opt;
          return { key: optStr + i, value: optStr, label: optStr };
        });
        return (
          <div className="flex flex-wrap gap-3">
            {checkboxOptions.map((opt) => (
              <label key={opt.key} className="inline-flex items-center">
                <input
                  type="checkbox"
                  name={field.id}
                  id={`${field.id}-${opt.key}`}
                  value={opt.value}
                  checked={(values[field.id] || []).includes(opt.value)}
                  onChange={(e) =>
                    handleChange(field, opt.value, e.target.checked)
                  }
                  className="mr-2 accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "file":
      case "fileUpload":
        return (
          <div>
            <input
              type="file"
              name={field.id}
              id={field.id}
              className={common}
              onChange={(e) => handleFile(field, e)}
              required={!!field.required}
              multiple={!!field.multiple}
            />
            {filePreviews[field.id] && (
              <img
                src={filePreviews[field.id]}
                alt="Preview"
                className="mt-3 w-32 h-32 object-cover rounded-lg border shadow-sm"
              />
            )}
          </div>
        );

      case "autocomplete":
        return (
          <div>
            <input
              name={field.id}
              id={field.id}
              list={`list-${field.id}`}
              className={common}
              placeholder={field.placeholder || "Type or select an option"}
              value={values[field.id] || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              required={!!field.required}
            />
            <datalist id={`list-${field.id}`}>
              {(field.options || []).map((opt, i) => {
                const val =
                  typeof opt === "object"
                    ? opt.label || opt.value || opt.toString()
                    : opt;
                return <option key={i} value={val} />;
              })}
            </datalist>
          </div>
        );

      default:
        return (
          <p className="text-gray-400 italic">
            Unsupported field type ({field.type})
          </p>
        );
    }
  };

  return (
    <div className="relative w-full flex justify-center items-center py-10 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-gray-100 shadow-xl rounded-3xl px-8 py-10 sm:px-10 sm:py-12 transition-all duration-500 hover:shadow-2xl"
      >
        {/* ✅ Render all fields */}
        <div className="space-y-7">
          {(form.fields || []).map((field) => (
            <div
              key={field.id}
              className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100/70 transition"
            >
              {["header", "paragraph", "section"].includes(field.type) ? (
                renderField(field)
              ) : (
                <>
                  <label
                    htmlFor={field.id}
                    className="block text-lg font-medium text-gray-700 mb-2"
                  >
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                </>
              )}
            </div>
          ))}
        </div>

        {/* ✅ Submit */}
        <div className="flex justify-end mt-10">
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg py-3 px-8 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition duration-300"
          >
            {submitLabel}
          </button>
        </div>
      </form>

      {/* ✅ Success Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-8 text-center w-96"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
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
