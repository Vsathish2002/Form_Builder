// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getFormBySlug, submitPublicResponse } from '../../api/forms';
// import FormRenderer from '../../components/FormRenderer';
// import { FiX, FiCheckCircle } from 'react-icons/fi';

// export default function PublicForm() {
//   const { slug } = useParams();
//   const navigate = useNavigate();
//   const [form, setForm] = useState(null);
//   const [status, setStatus] = useState({ loading: false, error: null, success: false });

//   // ✅ Fetch form
//   useEffect(() => {
//     (async () => {
//       try {
//         const data = await getFormBySlug(slug);
//         const fieldsWithId = (data.fields || []).map((f, index) => ({
//           id: f.id || `field-${index}`,
//           ...f,
//         }));
//         setForm({ ...data, fields: fieldsWithId });
//       } catch (err) {
//         setStatus({ loading: false, error: 'Form not found', success: false });
//       }
//     })();
//   }, [slug]);

//   // ✅ Submit handler supporting files, dates, etc.
//   const handleSubmit = async (answers, files) => {
//     setStatus({ loading: true, error: null, success: false });

//     try {
//       const formData = new FormData();

//       // Normal fields
//       Object.entries(answers).forEach(([key, value]) => {
//         formData.append(key, value);
//       });

//       // Files
//       if (files) {
//         Object.entries(files).forEach(([key, file]) => {
//           formData.append(key, file);
//         });
//       }

//       await submitPublicResponse(slug, formData, true); // send FormData

//       // ✅ On success
//       setStatus({ loading: false, error: null, success: true });
//     } catch (err) {
//       console.error(err);
//       setStatus({ loading: false, error: 'Failed to submit response. Try again.', success: false });
//     }
//   };

//   // ✅ Success page
//   if (status.success) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4">
//         <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
//           <FiCheckCircle className="text-green-500 mx-auto mb-4" size={60} />
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">Response Submitted</h2>
//           <p className="text-gray-600 mb-6">
//             Thank you! Your response has been recorded successfully.
//           </p>
//           <button
//             onClick={() => navigate('/')}
//             className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
//           >
//             Go Back to Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // ✅ Loading / form display
//   return (
//     <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4">
//       <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 relative animate-fadeIn">
//         {/* Cancel Button */}
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-5 right-5 text-gray-500 hover:text-gray-700 transition"
//           title="Cancel"
//         >
//           <FiX size={24} />
//         </button>

//         {/* Error */}
//         {status.error && (
//           <div className="bg-red-100 text-red-800 p-4 rounded mb-6 text-center font-semibold">
//             {status.error}
//           </div>
//         )}

//         {/* Form Renderer */}
//         {form && (
//           <FormRenderer
//             form={form}
//             onSubmit={handleSubmit}
//             submitLabel={status.loading ? 'Submitting...' : 'Submit Response'}
//             className="space-y-4"
//           />
//         )}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormBySlug, submitPublicResponse } from '../../api/forms';
import FormRenderer from '../../components/FormRenderer';
import { FiX, FiCheckCircle } from 'react-icons/fi';

export default function PublicForm() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    (async () => {
      try {
        const data = await getFormBySlug(slug);

        // ✅ Check if form is inactive
        if (data.status !== 'Active') {
          setStatus({ loading: false, error: 'Form is inactive or not available', success: false });
          return;
        }

        // Add IDs to fields
        const fieldsWithId = (data.fields || []).map((f, index) => ({
          id: f.id || `field-${index}`,
          ...f,
        }));
        setForm({ ...data, fields: fieldsWithId });
      } catch (err) {
        setStatus({ loading: false, error: 'Form not found', success: false });
      }
    })();
  }, [slug]);

  const handleSubmit = async (answers, files) => {
    setStatus({ loading: true, error: null, success: false });
    try {
      const formData = new FormData();
      Object.entries(answers).forEach(([key, value]) => formData.append(key, value));
      if (files) Object.entries(files).forEach(([key, file]) => formData.append(key, file));

      await submitPublicResponse(slug, formData, true);
      setStatus({ loading: false, error: null, success: true });
    } catch (err) {
      console.error(err);
      setStatus({ loading: false, error: 'Failed to submit response. Try again.', success: false });
    }
  };

  if (status.success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <FiCheckCircle className="text-green-500 mx-auto mb-4" size={60} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Response Submitted</h2>
          <p className="text-gray-600 mb-6">Thank you! Your response has been recorded successfully.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <h2 className="text-2xl font-bold text-red-600 mb-2">⚠️ {status.error}</h2>
          {/* <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Go Back to Home
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-purple-50 via-white to-indigo-50 p-4">
      {form && (
        <FormRenderer
          form={form}
          onSubmit={handleSubmit}
          submitLabel={status.loading ? 'Submitting...' : 'Submit Response'}
        />
      )}
    </div>
  );
}
