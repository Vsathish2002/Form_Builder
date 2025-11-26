import React, { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function FormBuilderWrapper({ fieldsJson, onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    const $ = window.$;

    if (!$.fn.formBuilder) {
      console.error("formBuilder not loaded — check index.html");
      toast.error("⚠️ Form builder plugin not loaded. Please check setup!");
      return;
    }

    if (builderRef.current) return;

    const options = {
      disableFields: [
        "autocomplete",
        "button",
        "file",
        "header",
        "paragraph",
        "hidden",
        "starRating",
        "date",
        "range",
      ],
      controlOrder: ["text", "textarea", "select", "checkbox", "radio"],
      showActionButtons: true,

      onSave: (evt, formData) => {
        try {
          const parsed = JSON.parse(formData);
          const parsedWithId = parsed.map((f, i) => ({
            id: f.id || `field-${i}`,
            ...f,
            type:
              f.type === "radio-group"
                ? "radio"
                : f.type === "checkbox-group"
                ? "checkbox"
                : f.type,
          }));

          onSave(parsedWithId);
          toast.success("💾 Form fields saved successfully!");
        } catch (err) {
          console.error("Error parsing form data:", err);
          toast.error("❌ Error parsing form data. Please try again.");
        }
      },
    };

    const fbEditor = $(editorContainer.current).formBuilder(options);
    builderRef.current = fbEditor;

    fbEditor.promise.then(() => {
      if (fieldsJson?.length > 0) {
        fbEditor.actions.setData(JSON.stringify(fieldsJson));
        toast.success("✅ Loaded saved form fields!");
      } else {
        toast("🧱 Form builder ready! Start adding fields.", {
          icon: "✨",
        });
      }
    });

    return () => {
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        builderRef.current = null;
      }
      $(editorContainer.current).empty();
    };
  }, []);

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4 text-center">
        🧱 Drag & Drop Form Builder
      </h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md"
      ></div>
    </div>
  );
}
