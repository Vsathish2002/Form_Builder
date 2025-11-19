import React, { useEffect, useState } from "react";
import { getFormById, updateForm } from "../../api/forms";
import { useNavigate, useParams } from "react-router-dom";
import FormBuilderWrapper from "../../components/FormBuilderWrapper";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function EditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    title: "",
    description: "",
    isPublic: false,
    fields: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { token } = useAuth();

  /** ===================== LOAD FORM ===================== */
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(token, id);

        const fieldsWithId = (data.fields || []).map((f, i) => {
          let parsedOptions = f.options;
          if (typeof parsedOptions === "string") {
            try {
              parsedOptions = JSON.parse(parsedOptions);
            } catch {
              parsedOptions = [];
            }
          }

          return {
            id: f.id || `field-${i}`,
            label: f.label,
            /** 🔥 Convert DB → Builder format */
            type:
              f.type === "radio"
                ? "radio-group"
                : f.type === "checkbox"
                ? "checkbox-group"
                : f.type,
            required: !!f.required,
            options: Array.isArray(parsedOptions)
              ? parsedOptions.map((opt) => ({
                  label: opt.label || "",
                  value: opt.value || "",
                }))
              : [],
            order: f.order || i,
            validation: f.validation || null,
            subtype: f.subtype || undefined,
          };
        });

        setForm({
          id: data.id,
          title: data.title,
          description: data.description,
          isPublic: data.isPublic,
          fields: fieldsWithId,
        });
      } catch (err) {
        toast.error("Error loading form.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, token]);

  /** ================== HANDLE FIELDS UPDATE ================== */
  const handleFieldsUpdate = (newFields) => {
    const updated = newFields.map((f, i) => ({
      id: f.id || `field-${i}`,
      ...f,
    }));

    setForm((prev) => ({ ...prev, fields: updated }));
  };

  /** ================== SAVE FORM ================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Form title is required!");
      return;
    }

    setSaving(true);

    try {
      const fb = window.jQuery("#fb-editor").data("formBuilder");
      if (!fb) {
        toast.error("Form builder not loaded.");
        return;
      }

      const liveData = fb.actions.getData("json");
      const parsed = JSON.parse(liveData);

      const idMap = form.fields.reduce((acc, f) => {
        acc[f.label] = f.id;
        return acc;
      }, {});

      const payload = {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        fields: parsed.map((f, i) => ({
          id: idMap[f.label] || f.id || `field-${i}`,
          label: f.label,
          /** 🔥 Convert Builder → DB format */
          type:
            f.type === "radio-group"
              ? "radio"
              : f.type === "checkbox-group"
              ? "checkbox"
              : f.type,
          required: !!f.required,
          order: i,
          options:
            ["select", "radio-group", "checkbox-group"].includes(f.type)
              ? (f.values || []).map((opt) => ({
                  label: opt.label?.trim() || "",
                  value: opt.value?.trim() || "",
                }))
              : null,
          validation: f.validation || null,
          className: f.className || "",
        })),
      };

      await updateForm(token, form.id, payload);

      // toast.success("Form updated successfully!");
      setTimeout(() => navigate("/my-forms"), 1200);
    } catch (err) {
      toast.error("Could not save form.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-16 text-lg text-gray-600">
        Loading form editor...
      </div>
    );

  return (
    <div
      className="
        min-h-screen 
        pt-28 pb-12 px-4 
        bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50
      "
    >

      <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
        <motion.button
          onClick={() => navigate(-1)}
          whileHover={{ scale: 1.05 }}
          className="flex items-center px-4 py-2 bg-white/70 backdrop-blur-md shadow-md rounded-lg border border-gray-200 hover:bg-white transition"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2 text-indigo-600" />
          Back
        </motion.button>

        <h2 className="text-4xl font-bold text-gray-800 drop-shadow-sm">
          Edit Form
        </h2>

        <div></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          max-w-5xl mx-auto p-10 rounded-2xl shadow-2xl 
          bg-white/80 backdrop-blur-xl border border-gray-200
        "
      >
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Form Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter form title"
          />
        </div>

        <div className="mb-10">
          <label className="block text-lg font-semibold mb-2 text-gray-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            rows="4"
            className="w-full border p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the purpose of this form..."
          ></textarea>
        </div>

        <div className="border-t pt-8">
          <FormBuilderWrapper
            fieldsJson={form.fields || []}
            onSave={handleFieldsUpdate}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={saving}
          onClick={handleSubmit}
          className="
            w-full mt-10 py-3 text-white font-semibold rounded-xl 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            shadow-lg hover:shadow-2xl transition
            disabled:from-gray-400 disabled:to-gray-400
          "
        >
          {saving ? "Saving..." : "Save Changes"}
        </motion.button>
      </motion.div>
    </div>
  );
}
