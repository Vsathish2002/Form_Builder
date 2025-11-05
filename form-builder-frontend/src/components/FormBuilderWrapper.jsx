import React, { useEffect, useRef } from "react";

/**
 * ✅ FormBuilderWrapper
 * Handles the formBuilder plugin lifecycle correctly:
 * - Loads once
 * - Persists builder instance
 * - Properly loads data (no race conditions)
 * - Triggers onSave manually only when user clicks "Save"
 */
export default function FormBuilderWrapper({ fieldsJson = [], onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  /** ✅ Load Bootstrap dynamically (once) */
  useEffect(() => {
    const bootstrapCSS = document.createElement("link");
    bootstrapCSS.rel = "stylesheet";
    bootstrapCSS.href = "/libs/bootstrap.min.css";
    document.head.appendChild(bootstrapCSS);

    const bootstrapJS = document.createElement("script");
    bootstrapJS.src = "/libs/bootstrap.bundle.min.js";
    document.body.appendChild(bootstrapJS);

    return () => {
      document
        .querySelectorAll('link[href="/libs/bootstrap.min.css"], script[src="/libs/bootstrap.bundle.min.js"]')
        .forEach((el) => el.remove());
    };
  }, []);

  /** ✅ Initialize formBuilder */
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const $ = window.$;
      if ($ && $.fn.formBuilder && editorContainer.current) {
        clearInterval(checkInterval);
        initFormBuilder($);
      }
    }, 200);

    /** ------------------- MAIN INITIALIZATION ------------------- */
    function initFormBuilder($) {
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        $(editorContainer.current).empty();
        builderRef.current = null;
      }

      /** 🔹 Custom Controls */
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
              defaultValue: "h3",
            },
          ],
          onRender: (field) => {
            const subtype = field.subtype || "h3";
            return `<${subtype} class="fw-bold mt-3 mb-2">${field.label}</${subtype}>`;
          },
        },

        paragraph: {
          label: "Paragraph",
          icon: "📝",
          fields: [{ label: "Text", name: "label", type: "textarea" }],
          onRender: (field) => `<p class="text-muted my-3">${field.label}</p>`,
        },

        section: {
          label: "Section Break",
          icon: "📄",
          onRender: () => `<hr class="my-4 border border-2 border-primary" />`,
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

        page: {
          label: "Page Break",
          icon: "📑",
          onRender: () => `<div class="text-center text-primary my-3">--- Page Break ---</div>`,
        },

        autocomplete: {
          label: "Autocomplete",
          icon: "🔍",
          fields: [
            { label: "Label", name: "label", type: "text" },
            { label: "Options (comma separated)", name: "options", type: "text" },
          ],
          onRender: (field) => `
            <div class="mb-3">
              <label class="form-label">${field.label}</label>
              <input list="opt-${field.name}" class="form-control" />
              <datalist id="opt-${field.name}">
                ${(field.options || "")
                  .split(",")
                  .map((o) => `<option value="${o.trim()}"/>`)
                  .join("")}
              </datalist>
            </div>`,
        },
      };

      /** ✅ Register custom controls */
      Object.entries(controlPlugins).forEach(([key, plugin]) => {
        try {
          $.fn.formBuilder.controls.register(key, plugin);
        } catch (err) {
          console.warn(`⚠️ Could not register ${key}:`, err);
        }
      });

      /** ✅ Options setup */
      const options = {
        disableFields: ["button", "hidden"],
        controlOrder: [
          "header",
          "paragraph",
          "section",
          "page",
          "text",
          "textarea",
          "number",
          "select",
          "radio",
          "checkbox",
          "date",
          "file",
          "autocomplete",
        ],
        controlConfig: controlPlugins,

        /** ✅ Called when user clicks SAVE in formBuilder */
        onSave: (evt, formData) => {
          try {
            const parsed = JSON.parse(formData);
            const parsedWithId = parsed.map((f, i) => {
              let options;
              if (f.type === "autocomplete") {
                options = f.options ? f.options.split(",").map((o) => o.trim()) : [];
              } else {
                options = (f.values || f.options || [])
                  .map((opt) =>
                    typeof opt === "object"
                      ? opt.label || opt.value || opt.toString()
                      : opt
                  )
                  .filter(Boolean);
              }

              return {
                id: f.id || `field-${i}`,
                label: f.label,
                type: f.type,
                required: f.required || false,
                options,
                order: f.order || i,
                validation: f.validation || null,
                extraValue: f.extraValue || undefined,
                subtype: f.subtype || (f.type === "header" ? "h3" : undefined),
              };
            });

            console.log("✅ Saved fields:", parsedWithId);
            onSave(parsedWithId);
          } catch (err) {
            console.error("Error parsing saved form data:", err);
          }
        },
      };

      /** ✅ Initialize plugin */
      const fbEditor = $(editorContainer.current).formBuilder(options);
      builderRef.current = fbEditor;

      // 🔹 Store builder globally for EditForm save reference
      window._formBuilderInstance = fbEditor;
      try {
        $(editorContainer.current).data("formBuilder", fbEditor);
      } catch (e) {
        console.warn("Couldn't attach builder data:", e);
      }

      // 🔹 Safety: reload previous fields if already passed
      if (fieldsJson.length > 0) {
        setTimeout(() => {
          try {
            console.log("Rehydrating builder...");
            fbEditor.actions.setData(fieldsJson);
          } catch (e) {
            console.warn("Rehydrate failed:", e);
          }
        }, 800);
      }
    }

    return () => clearInterval(checkInterval);
  }, []);

  /** ✅ Load data when fieldsJson changes */
  useEffect(() => {
    if (!builderRef.current || fieldsJson.length === 0) return;

    const loadData = () => {
      const transformed = fieldsJson.map((f) => {
        const newField = { ...f };
        if (["select", "radio", "checkbox"].includes(f.type)) {
          newField.values = f.options || [];
        } else if (f.type === "autocomplete") {
          newField.options = (f.options || []).join(", ");
        }
        if (f.type === "header" && !f.subtype) newField.subtype = "h3";
        return newField;
      });

      try {
        builderRef.current.actions.setData(transformed);
      } catch (err) {
        console.warn("setData() failed, trying stringified:", err);
        try {
          builderRef.current.actions.setData(JSON.stringify(transformed));
        } catch (err2) {
          console.error("Fallback failed:", err2);
        }
      }
    };

    if (builderRef.current.promise) builderRef.current.promise.then(loadData);
    else setTimeout(loadData, 500);
  }, [fieldsJson]);

  /** ✅ Cleanup */
  useEffect(() => {
    return () => {
      if (builderRef.current?.actions) builderRef.current.actions.clearFields();
      builderRef.current = null;
      if (editorContainer.current) editorContainer.current.innerHTML = "";
    };
  }, []);

  /** ✅ UI */
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
