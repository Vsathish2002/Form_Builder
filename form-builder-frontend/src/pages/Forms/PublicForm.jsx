import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFormBySlug, submitPublicResponse } from '../../api/forms';
import FormRenderer from '../../components/FormRenderer';
import { FiCheckCircle } from 'react-icons/fi';
import io from 'socket.io-client';
 
export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });

  // 🧩 Connect WebSocket on form load
  useEffect(() => {
    if (!form) return;

    const socket = io("http://localhost:4000", {
    // const socket = io("http://192.168.0.105:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("📡 PublicForm connected:", socket.id);
      socket.emit("formOpened", { formId: form.id });
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket error:", err.message);
    });

    return () => socket.disconnect();
  }, [form]);

  // 🧩 Load form details by slug
  useEffect(() => {
    (async () => {
      try {
        const data = await getFormBySlug(slug);
        if (data.status !== 'Active') {
          setStatus({
            loading: false,
            error: '⚠️ This form is inactive or no longer accepting responses.',
            success: false,
          });
          return;
        }

        // assign field IDs properly
        const fieldsWithId = (data.fields || []).map((f, i) => ({
          id: f.id || `field-${i}`,
          ...f,
        }));

        setForm({ ...data, fields: fieldsWithId });

        // Optional WebSocket notify form opened
        const socket = io('http://localhost:4000');
        // const socket = io('http://192.168.0.105:4000');
        socket.emit('formOpened', { formId: data.id });
        socket.disconnect();
      } catch {
        setStatus({
          loading: false,
          error: '❌ Form not found or unavailable.',
          success: false,
        });
      }
    })();
  }, [slug]);

  // 🧩 Handle submission (save to DB)
  const handleSubmit = async (formData) => {
    setStatus({ loading: true, error: null, success: false });

    try {
      const socket = io('http://localhost:4000');
      // const socket = io('http://192.168.0.105:4000');
      socket.emit('formSubmitting', { formId: form.id });
      socket.disconnect();

      await submitPublicResponse(slug, formData); // ✅ send directly to backend

      setStatus({ loading: false, success: true, error: null });
    } catch (err) {
      console.error("Submission error:", err);
      setStatus({
        loading: false,
        success: false,
        error: "⚠️ Failed to submit response. Please try again later.",
      });
    }
  };

  // 🧩 Success Message
  if (status.success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <FiCheckCircle className="text-green-500 mx-auto mb-4" size={60} />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Response Submitted</h2>
          <p className="text-gray-600 mb-6">
            Thank you! Your response has been recorded successfully.
          </p>
        </div> 
      </div>
    );
  }

  // 🧩 Error Message
  if (status.error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-rose-50 via-white to-red-50 p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <h2 className="text-2xl font-bold text-red-600 mb-2">{status.error}</h2>
        </div>
      </div>
    );
  }

  // 🧩 Main Form
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-50 via-white to-indigo-50 py-10">
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
