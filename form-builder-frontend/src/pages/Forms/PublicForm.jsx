import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getFormBySlug, submitPublicResponse } from "../../api/forms";
import FormRenderer from "../../components/FormRenderer";
import { FiCheckCircle } from "react-icons/fi";
import io from "socket.io-client";

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    success: false,
  });
  const [savedData, setSavedData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showResponseData, setShowResponseData] = useState(false);

  /** 🧩 Load Form */
  useEffect(() => {
    (async () => {
      try {
        const data = await getFormBySlug(slug);

        if (!data || data.status !== "Active") {
          setStatus({
            loading: false,
            error: "⚠️ This form is inactive or closed.",
            success: false,
          });
          return;
        }

        const fieldsWithId = (data.fields || []).map((f, i) => ({
          id: f.id || `field-${i}`,
          ...f,
        }));

        setForm({ ...data, fields: fieldsWithId });
        setStatus({ loading: false, error: null, success: false });
      } catch {
        setStatus({
          loading: false,
          error: "❌ Form not found or unavailable.",
          success: false,
        });
      }
    })();
  }, [slug]);

  /** 📡 WebSocket setup */
  useEffect(() => {
    if (!form) return;
    const socket = io("http://localhost:4000", { transports: ["websocket"] });
    socket.emit("formOpened", { formId: form.id });
    return () => socket.disconnect();
  }, [form]);

  /** 📨 Submit Handler */
  const handleSubmit = async (formData) => {
    setStatus({ loading: true, error: null, success: false });

    try {
      const socket = io("http://localhost:4000");
      socket.emit("formSubmitting", { formId: form.id });
      socket.disconnect();

      await submitPublicResponse(slug, formData);

      const responseData = {};
      for (let [key, value] of formData.entries()) {
        responseData[key] = value instanceof File ? value.name : value;
      }

      setSavedData(responseData);
      setStatus({ loading: false, success: true, error: null });
      setShowSummary(true);
      setShowResponseData(false);
    } catch (err) {
      console.error("Submit error:", err);
      setStatus({
        loading: false,
        success: false,
        error: "⚠️ Submission failed. Try again later.",
      });
    }
  };

  /** 🔄 Submit Another */
  const handleSubmitAnother = () => {
    setShowSummary(false);
    setSavedData(null);
    setShowResponseData(false);
    setStatus({ loading: false, error: null, success: false });
  };

  /** 👁 Toggle Response */
  const toggleViewResponse = () => {
    setShowResponseData(!showResponseData);
  };

  /* ------------------------------------------- */
  /*  UI SECTIONS BELOW — FULL DARK GLASS DESIGN */
  /* ------------------------------------------- */

  /** 🧩 Loading UI */
  if (status.loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center 
                      bg-gradient-to-br from-[#0a0a1a] via-[#0f1025] to-[#151632] text-white">
        <div className="w-14 h-14 border-4 border-indigo-400/30 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
        <p className="text-gray-300 font-medium text-lg animate-pulse">
          Loading form...
        </p>
      </div>
    );
  }

  /** ❌ Error UI */
  if (status.error) {
    return (
      <div className="min-h-screen flex items-center justify-center 
                      bg-gradient-to-br from-[#0a0a1a] via-[#0f1025] to-[#151632] px-6">
        <div className="bg-[rgba(255,255,255,0.05)] backdrop-blur-xl border border-white/10 
                        p-10 rounded-3xl max-w-md text-center shadow-[0_0_25px_rgba(255,0,0,0.3)]">
          <h2 className="text-3xl font-bold text-red-400 mb-3">Oops!</h2>
          <p className="text-gray-300">{status.error}</p>
        </div>
      </div>
    );
  }

  /** 🟢 Success Summary Page */
  if (showSummary && savedData) {
    return (
      <div className="min-h-screen flex flex-col items-center 
                      bg-gradient-to-br from-[#0a0a1a] via-[#0f1025] to-[#151632] 
                      text-white py-10 px-4">

        <div className="w-full max-w-4xl bg-[rgba(255,255,255,0.06)] border border-white/10 
                        backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_30px_rgba(99,102,241,0.2)]">

          <div className="text-center mb-8">
            <FiCheckCircle size={52} className="text-green-400 mx-auto mb-3" />
            <h2 className="text-3xl font-bold">Response Submitted 🎉</h2>
            <p className="text-gray-300">Here’s what you submitted:</p>
          </div>

          {showResponseData && (
            <div className="space-y-5">
              {form.fields
                .filter((f) => !["header", "paragraph"].includes(f.type))
                .map((field, idx) => (
                  <div key={idx} 
                       className="p-4 bg-[rgba(255,255,255,0.05)] border border-white/10 
                                  rounded-xl shadow hover:shadow-lg transition">
                    <p className="text-gray-300 text-sm">{field.label}</p>
                    <p className="text-white font-semibold mt-1">
                      {savedData[field.id] || "—"}
                    </p>
                  </div>
                ))}
            </div>
          )}

        <div className="flex flex-col sm:flex-row justify-center w-full gap-4 mt-10">
  <button
    onClick={toggleViewResponse}
    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg text-center"
  >
    {showResponseData ? "Hide Response" : "View Response"}
  </button>

  <button
    onClick={handleSubmitAnother}
    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 shadow-lg text-center"
  >
    Submit Another Response
  </button>
</div>

        </div>

        <footer className="mt-10 text-gray-400 text-sm text-center">
          © {new Date().getFullYear()} Formify • Built with ❤️ by Sathish
        </footer>
      </div>
    );
  }

  /** 📄 Public Form (Default) */
  return (
    <div className="min-h-screen flex flex-col items-center 
                    bg-gradient-to-br from-[#0a0a1a] via-[#0f1025] to-[#151632] 
                    text-white py-10 px-4 relative overflow-hidden">

      {/* Glow accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.15),transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.15),transparent_70%)]"></div>

      {/* Main Form */}
      <div className="relative w-full max-w-4xl">
        {form && (
          <FormRenderer
            form={form}
            onSubmit={handleSubmit}
            submitLabel={status.loading ? "Submitting..." : "Submit Response"}
          />
        )}
      </div>

      <footer className="mt-10 text-gray-400 text-sm text-center">
        © {new Date().getFullYear()} Formify • Built with ❤️ by Sathish
      </footer>
    </div>
  );
}
