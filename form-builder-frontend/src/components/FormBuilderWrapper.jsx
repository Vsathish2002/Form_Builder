import React, { useEffect, useRef } from "react";

export default function FormBuilderWrapper({ fieldsJson = [], onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    // ✅ 1. Dynamically load Bootstrap only once
    const bootstrapCSS = document.createElement("link");
    bootstrapCSS.rel = "stylesheet";
    bootstrapCSS.href =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css";
    document.head.appendChild(bootstrapCSS);

    const bootstrapJS = document.createElement("script");
    bootstrapJS.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js";
    document.body.appendChild(bootstrapJS);

    // ✅ 2. Ensure formBuilder is available
    const checkInterval = setInterval(() => {
      const $ = window.$;
      if ($ && $.fn.formBuilder) {
        clearInterval(checkInterval);
        initFormBuilder($);
      }
    }, 200);

    // ✅ 3. Init function (safe)
    function initFormBuilder($) {
      // Clear any old instance
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        $(editorContainer.current).empty();
        builderRef.current = null;
      }

      // ✅ Custom field definitions
      const controlPlugins = {
        header: {
          label: "Header",
          icon: "🌟",
          fields: [
            { label: "Text", name: "label", type: "text" },
            {
              label: "Header Level",
              name: "subtype",
              type: "select",
              options: ["h1", "h2", "h3", "h4", "h5", "h6"],
            },
          ],
          onRender: (field) => {
            const subtype = field.subtype || "h3";
            return `<${subtype} class="fw-bold mt-3 mb-2">${field.label}</${subtype}>`;
          },
        },
        section: {
          label: "Section Break",
          icon: "📄",
          onRender: () =>
            `<hr class="my-4 border border-2 border-primary" />`,
        },
        date: {
          label: "Date Picker",
          icon: "📅",
          onRender: (field) => `
            <div class="mb-3">
              <label class="form-label">${field.label}</label>
              <input type="date" class="form-control" />
            </div>`,
        },
        file: {
          label: "File Upload",
          icon: "📎",
          onRender: (field) => `
            <div class="mb-3">
              <label class="form-label">${field.label}</label>
              <input type="file" class="form-control" />
            </div>`,
        },
      };

      // ✅ Options config
      const options = {
        disableFields: [
          "autocomplete",
          "button",
          "paragraph",
          "hidden",
          "starRating",
          "range",
        ],
        controlOrder: [
          "header",
          "section",
          "text",
          "textarea",
          "select",
          "checkbox",
          "radio",
          "date",
          "file",
        ],
        typeUserEvents: controlPlugins,
        onSave: (evt, formData) => {
          try {
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

      // ✅ Initialize formBuilder
      const fbEditor = $(editorContainer.current).formBuilder(options);
      builderRef.current = fbEditor;

      // ✅ Wait until it's ready to set data
      fbEditor.promise.then(() => {
        if (fieldsJson.length > 0) {
          const jsonData = JSON.stringify(fieldsJson);
          setTimeout(() => fbEditor.actions.setData(jsonData), 200);
        }
      });
    }

    // ✅ 4. Cleanup
    return () => {
      clearInterval(checkInterval);
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        builderRef.current = null;
      }
      if (editorContainer.current) {
        editorContainer.current.innerHTML = "";
      }
      if (bootstrapCSS.parentNode) document.head.removeChild(bootstrapCSS);
      if (bootstrapJS.parentNode) document.body.removeChild(bootstrapJS);
    };
  }, [fieldsJson, onSave]);

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4">
        Advanced Drag & Drop Form Builder
      </h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md"
      ></div>
    </div>
  );
}
