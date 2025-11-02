import React, { useEffect, useState } from "react";
import { getFormById, updateForm } from "../../api/forms";
import { useNavigate, useParams } from "react-router-dom";
import FormBuilderWrapper from "../../components/FormBuilderWrapper";
import { useAuth } from "../../context/AuthContext";

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
  const { token, user } = useAuth();

  // Load form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(token, id);
        const fieldsWithId = (data.fields || []).map((f, i) => ({
          id: f.id || `field-${i}`,
          ...f,
        }));

        setForm({
          id: data.id,
          title: data.title,
          description: data.description,
          isPublic: data.isPublic,
          fields: fieldsWithId,
        });
      } catch (err) {
        console.error("Failed to load form:", err);
        alert("Error loading form. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id, token]);

  // Handle field updates from builder
  const handleFieldsUpdate = (newFields) => {
    const fieldsWithId = newFields.map((f, i) => ({
      id: f.id || `field-${i}`,
      ...f,
    }));
    setForm((prev) => ({ ...prev, fields: fieldsWithId }));
  };

  // Save form updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return alert("Form title is required.");
    setSaving(true);

    try {
      // trigger save on builder to ensure latest fieldsJson
      const fb = window.jQuery("#fb-editor").data("formBuilder");
      if (fb) fb.actions.save(); // triggers onSave in builder

      const payload = {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        fields: form.fields.map((f, i) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          required: f.required || false,
          options: f.options || [],
          order: i,
          validation: f.validation || null,
          className: f.className || "",
        })),
      };

      await updateForm(token, form.id, payload);
      alert("Form updated successfully!");

      navigate(user.role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      console.error("Failed to update form:", err);
      alert("Failed to update form. Please try again.");
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
      <h2 className="text-3xl font-bold mb-6 text-center">Edit Form</h2>

      {/* ⚠️ NOT a <form> tag — keeps FormBuilder working */}
      <div className="bg-white p-8 rounded-lg shadow-lg">
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

        <div className="mb-6">
          <label className="block text-lg font-semibold mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded-md"
            placeholder="Enter description"
          ></textarea>
        </div>

        <FormBuilderWrapper
          fieldsJson={form.fields || []}
          onSave={handleFieldsUpdate}
        />

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
