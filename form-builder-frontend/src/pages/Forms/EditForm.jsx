import React, { useEffect, useState } from "react";
import { getFormById, updateForm } from "../../api/forms";
import { useNavigate, useParams } from "react-router-dom";
import FormBuilderWrapper from "../../components/FormBuilderWrapper";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

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

  /** ✅ Load form data */
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(token, id);

        const fieldsWithId = (data.fields || []).map((f, i) => {
          // ✅ Parse JSON from DB if needed
          let parsedOptions = f.options;
          if (typeof parsedOptions === "string") {
            try {
              parsedOptions = JSON.parse(parsedOptions);
            } catch {
              parsedOptions = [];
            }
          }

          const values = Array.isArray(parsedOptions)
            ? parsedOptions.map((opt) => ({
                label: opt.label || "",
                value: opt.value || "",
              }))
            : [];

          return {
            id: f.id || `field-${i}`,
            label: f.label,
            type:
              f.type === "checkbox"
                ? "checkbox-group"
                : f.type === "radio"
                ? "radio-group"
                : f.type,
            required: !!f.required,
            options: values,
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
        console.error("Failed to load form:", err);
        toast.error("Error loading form. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, token]);

  /** ✅ Handle builder field updates */
  const handleFieldsUpdate = (newFields) => {
    const fieldsWithId = newFields.map((f, i) => ({
      id: f.id || `field-${i}`,
      ...f,
    }));
    setForm((prev) => ({ ...prev, fields: fieldsWithId }));
  };

  /** ✅ Save changes */
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
        toast.error("Form builder not loaded. Please try again.");
        return;
      }

      const liveData = fb.actions.getData("json");
      const parsed = JSON.parse(liveData);

      const payload = {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        fields: parsed.map((f, i) => ({
          id: f.id || `field-${i}`,
          label: f.label,
          type: f.type,
          required: !!f.required,
          order: i,
          options:
            ["select", "radio-group", "checkbox-group"].includes(f.type)
              ? (f.values || []).map((opt) => ({
                  label: (opt.label || "").trim(),
                  value: (opt.value || "").trim(),
                }))
              : null,
          validation: f.validation || null,
          className: f.className || "",
        })),
      };

      console.log("🚀 Final payload to update:", payload);
      await updateForm(token, form.id, payload);

      toast.success("✅ Form updated successfully!");
      setTimeout(() => navigate("/my-forms"), 1200);
    } catch (err) {
      console.error("Failed to update form:", err);
      toast.error("Failed to update form. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-10 text-gray-600">
        Loading form editor...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast Container */}
      <Toaster position="top-right" reverseOrder={false} />

      <h2 className="text-3xl font-bold mb-6 text-center">Edit Form</h2>

      <div className="bg-white p-8 rounded-lg shadow-lg">
        {/* Title Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Form Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full border p-2 rounded-md"
            placeholder="Enter form title"
          />
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border p-2 rounded-md"
            placeholder="Enter description"
          ></textarea>
        </div>

        {/* Form Builder Wrapper */}
        <FormBuilderWrapper
          fieldsJson={form.fields || []}
          onSave={handleFieldsUpdate}
        />

        {/* Save Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:bg-blue-300"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
