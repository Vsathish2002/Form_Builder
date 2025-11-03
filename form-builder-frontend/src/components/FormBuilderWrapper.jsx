import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const FormBuilderWrapper = forwardRef(({ fieldsJson, onSave }, ref) => {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    // ✅ Dynamically load Bootstrap
    const bootstrapCSS = document.createElement("link");
    bootstrapCSS.rel = "stylesheet";
    bootstrapCSS.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css";
    document.head.appendChild(bootstrapCSS);

    const bootstrapJS = document.createElement("script");
    bootstrapJS.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js";
    document.body.appendChild(bootstrapJS);

    const $ = window.$;
    if (!$.fn.formBuilder) {
      console.error("formBuilder not loaded — check index.html");
      return;
    }

    if (builderRef.current?.actions) {
      builderRef.current.actions.clearFields();
      builderRef.current = null;
      $(editorContainer.current).empty();
    }

    // ✅ Register custom field types
    const controlPlugins = {
      header: {
        label: "Header",
        icon: "🌟",
        fields: [
          { label: "Text", name: "label", type: "text" },
          { label: "Header Level", name: "subtype", type: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
        ],
        onRender: (field) => {
          const subtype = field.subtype || "h3";
          return `<${subtype} class="fw-bold mt-3 mb-2">${field.label}</${subtype}>`;
        },
      },
      section: {
        label: "Section Break",
        icon: "📄",
        onRender: () => `<hr class="my-4 border border-2 border-primary" />`,
      },
      date: {
        label: "Date Picker",
        icon: "📅",
        onRender: (field) => {
          return `
            <div class="mb-3">
              <label class="form-label">${field.label}</label>
              <input type="date" class="form-control" />
            </div>`;
        },
      },
      file: {
        label: "File Upload",
        icon: "📎",
        onRender: (field) => {
          return `
            <div class="mb-3">
              <label class="form-label">${field.label}</label>
              <input type="file" class="form-control" />
            </div>`;
        },
      },
    };

    // ✅ Initialize FormBuilder
    const options = {
      disableFields: ["autocomplete", "button", "paragraph", "hidden", "starRating", "range"],
      controlOrder: ["header", "section", "text", "textarea", "select", "checkbox", "radio", "date", "file"],
      typeUserEvents: {
        header: controlPlugins.header,
        section: controlPlugins.section,
        date: controlPlugins.date,
        file: controlPlugins.file,
      },
      onSave: (evt, formData) => {
        try {
          if (!formData || formData === "undefined") {
            console.warn("Invalid formData received:", formData);
            return;
          }
          const parsed = JSON.parse(formData);
          const parsedWithId = parsed.map((f, i) => {
            let type = f.type;
            if (type === "radio-group") type = "radio";
            if (type === "checkbox-group") type = "checkbox";
            return { id: f.id || `field-${i}`, ...f, type };
          });
          onSave(parsedWithId);
        } catch (err) {
          console.error("Error parsing form data:", err);
        }
      },
    };

    const fbEditor = $(editorContainer.current).formBuilder(options);
    builderRef.current = fbEditor;

    if (fieldsJson?.length > 0) {
      const jsonData = JSON.stringify(fieldsJson);
      fbEditor.promise.then(() => fbEditor.actions.setData(jsonData));
    }

    // ✅ Cleanup
    return () => {
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        builderRef.current = null;
      }
      $(editorContainer.current).empty();
      document.head.removeChild(bootstrapCSS);
      document.body.removeChild(bootstrapJS);
    };
  }, [fieldsJson.length, onSave]);

  useImperativeHandle(ref, () => ({
    getData: async () => {
      if (builderRef.current?.promise) {
        await builderRef.current.promise;
        return builderRef.current.actions.getData();
      }
      return null;
    },
    save: async () => {
      if (builderRef.current?.promise) {
        await builderRef.current.promise;
        builderRef.current.actions.save();
      }
    },
  }));

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4">
        🧱 Advanced Drag & Drop Form Builder
      </h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md"
      ></div>
    </div>
  );
});

FormBuilderWrapper.displayName = 'FormBuilderWrapper';

export default FormBuilderWrapper;
