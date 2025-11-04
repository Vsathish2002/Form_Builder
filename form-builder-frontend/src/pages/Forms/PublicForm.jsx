import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFormBySlug, submitPublicResponse, saveFormDraft, loadFormDraft, deleteFormDraft } from '../../api/forms';
import FormRenderer from '../../components/FormRenderer';
import { FiCheckCircle } from 'react-icons/fi';
import io from 'socket.io-client';

export default function PublicForm() {

  const { slug } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [draftData, setDraftData] = useState(null);
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
   useEffect(() => {
    if (!form) return;

    // ✅ Connect to backend websocket
    const socket = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("📡 PublicForm connected:", socket.id);
      // 🔥 Tell backend that this form is now being filled
      socket.emit("formOpened", { formId: form.id });
      console.log("📩 formOpened emitted for", form.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ WebSocket error:", err.message);
    });

    return () => socket.disconnect();
  }, [form]);


  useEffect(() => {
    (async () => {
      try {
        const data = await getFormBySlug(slug);
        if (data.status !== 'Active') {
          setStatus({ loading: false, error: '⚠️ This form is inactive or no longer accepting responses.', success: false });
          return;
        }

        const fieldsWithId = (data.fields || []).map((f, i) => ({
          id: f.id || `field-${i}`,
          ...f,
        }));

        setForm({ ...data, fields: fieldsWithId });
        const draft = await loadFormDraft(slug, sessionId);
        if (draft) setDraftData(draft);

        // Emit form opened event to notify form owner
        const socket = io('http://localhost:4000');
        socket.emit('formOpened', { formId: data.id });
        socket.disconnect();
      } catch {
        setStatus({ loading: false, error: '❌ Form not found or unavailable.', success: false });
      }
    })();
  }, [slug, sessionId]);

  const handleSubmit = async (answers, files) => {
    setStatus({ loading: true, error: null, success: false });
    try {
      // Emit form submitting event
      const socket = io('http://localhost:4000');
      socket.emit('formSubmitting', { formId: form.id });
      socket.disconnect();

      const formData = new FormData();
      formData.append('answers', JSON.stringify(answers));
      if (files) Object.entries(files).forEach(([, file]) => formData.append('files', file));
      await submitPublicResponse(slug, formData);
      await deleteFormDraft(slug, sessionId);
      setStatus({ loading: false, success: true, error: null });
    } catch {
      setStatus({ loading: false, success: false, error: '⚠️ Failed to submit response. Please try again later.' });
    }
  };

  if (status.success) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <FiCheckCircle className="text-green-500 mx-auto mb-4" size={60} />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Response Submitted</h2>
          <p className="text-gray-600 mb-6">Thank you! Your response has been recorded successfully.</p>
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

  if (status.error) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-rose-50 via-white to-red-50 p-6">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 text-center animate-fadeIn">
          <h2 className="text-2xl font-bold text-red-600 mb-2">{status.error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-r from-blue-50 via-white to-indigo-50 py-10">
      {form && (
        <FormRenderer
          form={form}
          onSubmit={handleSubmit}
          initialValues={draftData}
          submitLabel={status.loading ? 'Submitting...' : 'Submit Response'}
        />
      )}
    </div>
  );
}
