import React, { useEffect, useState } from "react";
import { getFormById, updateForm } from "../../api/forms";
import { useNavigate, useParams } from "react-router-dom";
import FormBuilderWrapper from "../../components/FormBuilderWrapper";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import editPageBg from "../../assets/editpagebg.jpg";

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

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const data = await getFormById(token, id);

        const fieldsWithId = (data.fields?.[0]?.fields || []).map((f, i) => {
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

  const handleFieldsUpdate = (newFields) => {
    const updated = newFields.map((f, i) => ({
      id: f.id || `field-${i}`,
      ...f,
    }));

    setForm((prev) => ({ ...prev, fields: updated }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error("Form title is required!");
      return;
    }

    setSaving(true);
    try {
      // Get current form data from FormBuilder
      const fb = window.jQuery("#fb-editor").data("formBuilder");
      let currentFields = form.fields || [];
      
      if (fb) {
        try {
          const liveData = fb.actions.getData("json");
          const parsed = JSON.parse(liveData);
          
          // Convert FormBuilder format to our format
          currentFields = parsed.map((f, i) => {
            let options = [];
            if (["select", "radio-group", "checkbox-group"].includes(f.type)) {
              options = (f.values || [])
                .map((opt) => {
                  const label = (opt.label || "").trim();
                  const value = opt.value && String(opt.value).startsWith("option-")
                    ? label
                    : (opt.value || label).trim();
                  return label ? { label, value } : null;
                })
                .filter(Boolean);
            }

            return {
              id: f.id || `field-${i}`,
              name: f.name || f.id || `field-${i}`,
              label: f.label || "",
              type: f.type,
              required: !!f.required,
              options,
              order: i,
              validation: f.validation || null,
              subtype: f.subtype || (f.type === "header" ? "h3" : undefined),
            };
          });
        } catch (err) {
          console.warn("Could not get live FormBuilder data, using stored fields:", err);
        }
      }

      const payload = {
        title: form.title,
        description: form.description,
        isPublic: form.isPublic,
        fields: currentFields,
      };

      await updateForm(token, form.id, payload);
      toast.success("Form updated successfully!");
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
        relative
      "
      style={{
        backgroundImage: `url("${editPageBg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Background image opacity overlay */}
      <div className="absolute inset-0 bg-black/85"></div>

      <div className="relative z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            className="!flex !items-center !px-3 !py-2 sm:!px-6 sm:!py-3 !bg-gradient-to-r !from-yellow-400 !to-yellow-500 !shadow-xl !rounded-full !border-2 !border-yellow-300 hover:!from-yellow-500 hover:!to-yellow-600 hover:!shadow-2xl !transition-all !duration-300 !no-underline"
          >
            <ArrowLeftIcon className="!w-4 !h-4 sm:!w-6 sm:!h-6 !mr-1 sm:!mr-2 !text-white !drop-shadow-lg" />
            <span className="!text-white !font-bold !text-xs sm:!text-lg !drop-shadow-lg">
              Back
            </span>
          </motion.button>

          <h2
            className="text-3xl sm:text-5xl font-black text-white drop-shadow-2xl bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent shadow-2xl text-center flex-1 inline-block tracking-widest"
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              textShadow:
                "0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4)",
              filter: "drop-shadow(0 0 10px rgba(251, 191, 36, 0.3))",
            }}
          >
            EDIT FORM
          </h2>

          <div></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="
          max-w-5xl mx-auto p-10 rounded-3xl shadow-2xl 
          bg-gradient-to-br from-yellow-50/90 via-white/90 to-yellow-50/90 backdrop-blur-xl border-2 border-yellow-300/50
        "
        >
          <div className="!mb-8">
            <label className="!block !text-lg !font-bold !mb-2 !text-yellow-700 !drop-shadow-sm">
              Form Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="!w-full !border-2 !border-yellow-300/50 !p-3 !rounded-xl !shadow-lg focus:!ring-2 focus:!ring-yellow-400 focus:!border-yellow-400 !bg-white/80 !backdrop-blur-sm"
              placeholder="Enter form title"
            />
          </div>

          <div className="!mb-10">
            <label className="!block !text-lg !font-bold !mb-2 !text-yellow-700 !drop-shadow-sm">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows="4"
              className="!w-full !border-2 !border-yellow-300/50 !p-3 !rounded-xl !shadow-lg focus:!ring-2 focus:!ring-yellow-400 focus:!border-yellow-400 !bg-white/80 !backdrop-blur-sm"
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
            !w-full !mt-10 !py-4 !text-white !font-bold !text-xl !rounded-xl 
            !bg-gradient-to-r !from-amber-600 !to-orange-600 
            !shadow-lg hover:!shadow-xl !transition-all !duration-300 !border !border-amber-500
            disabled:!from-gray-400 disabled:!to-gray-500 disabled:!border-gray-400 !no-underline
          "
          >
            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
