import React, { useEffect, useRef } from "react";

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
        .querySelectorAll(
          'link[href="/libs/bootstrap.min.css"], script[src="/libs/bootstrap.bundle.min.js"]'
        )
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

        /** 📎 File Upload Field (Fixed) */
        fileUpload: {
          label: "File Upload",
          icon: "📎",
          fields: [
            { label: "Label", name: "label", type: "text" },
            {
              label: "Allow Multiple Files",
              name: "multiple",
              type: "checkbox",
            },
            {
              label: "Accepted Types (e.g. image/*, .pdf)",
              name: "accept",
              type: "text",
            },
          ],
          onRender: (field) => {
            const multiple = field.multiple ? "multiple" : "";
            const accept = field.accept ? `accept="${field.accept}"` : "";
            const fieldName = field.name || `file-${Date.now()}`;
            return `
              <div class="mb-3">
                <label class="form-label">${
                  field.label || "Upload File"
                }</label>
                <input 
                  type="file" 
                  name="${fieldName}" 
                  id="${fieldName}" 
                  class="form-control" 
                  ${multiple} ${accept}
                />
              </div>`;
          },
        },

        page: {
          label: "Page Break",
          icon: "📑",
          onRender: () =>
            `<div class="text-center text-primary my-3">--- Page Break ---</div>`,
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
        disableFields: ["button", "hidden", "autocomplete"],
        controlOrder: [
          "header",
          "paragraph",
          "section",
          "page",
          "text",
          "textarea",
          "number",
          "select",
          "radio-group",
          "checkbox-group",
          "date",
          "fileUpload",
        ],
        controlConfig: controlPlugins,

        /** ✅ When user clicks SAVE */
        onSave: (evt, formData) => {
          try {
            const fb = builderRef.current;
            const liveData = fb?.actions?.getData("json");
            const parsed = JSON.parse(liveData);

            // ✅ Preserve IDs and names from existing fieldsJson
            const parsedWithId = parsed.map((f, i) => {
              let options = [];

              if (
                ["select", "radio-group", "checkbox-group"].includes(f.type)
              ) {
                options = (f.values || [])
                  .map((opt) => {
                    const label = (opt.label || "").trim();
                    const value =
                      opt.value && opt.value.startsWith("option-")
                        ? label
                        : (opt.value || label).trim();
                    return label ? { label, value } : null;
                  })
                  .filter(Boolean);
              }

              const existingField = fieldsJson.find(
                (old) =>
                  old.label === f.label &&
                  old.type === f.type
              );

              return {
                id: existingField
                  ? existingField.id
                  : f.id || f.name || `field-${i}-${Date.now()}`,
                name: f.name || f.id || `field-${i}-${Date.now()}`,
                label: f.label,
                type: f.type,
                required: !!f.required,
                options,
                order: i,
                validation: f.validation || null,
                subtype: f.subtype || (f.type === "header" ? "h3" : undefined),
              };
            });

            console.log(
              "✅ Final Saved Fields (with stable IDs):",
              parsedWithId
            );
            onSave(parsedWithId);

            // ✅ Refresh builder UI
            fb.promise.then(() => {
              fb.actions.clearFields();
              fb.actions.setData(
                parsedWithId.map((f) => ({
                  ...f,
                  values: f.options || [],
                }))
              );
              console.log("🔄 UI refreshed with updated values");
            });
          } catch (err) {
            console.error("❌ Error parsing saved form data:", err);
          }
        },
      };

      /** ✅ Initialize plugin */
      const fbEditor = $(editorContainer.current).formBuilder(options);
      builderRef.current = fbEditor;
      window._formBuilderInstance = fbEditor;
      $(editorContainer.current).data("formBuilder", fbEditor);

      /** ✅ Proper Rehydration after initialization */
      fbEditor.promise.then(() => {
        if (fieldsJson.length > 0) {
          try {
            console.log("Rehydrating saved fields...");
            const transformed = fieldsJson.map((f) => {
              const newField = { ...f };

              // ✅ Keep ID & Name consistent for stable submissions
              newField.name = f.id;
              newField.id = f.id;

              if (
                ["select", "radio-group", "checkbox-group"].includes(f.type)
              ) {
                newField.values = (f.options || []).map((opt) =>
                  typeof opt === "object"
                    ? { label: opt.label, value: opt.value }
                    : { label: opt, value: opt }
                );
              }

              if (f.type === "header" && !f.subtype) newField.subtype = "h3";
              return newField;
            });

            fbEditor.actions.setData(transformed);
          } catch (e) {
            console.warn("Rehydrate failed:", e);
          }
        }
      });
    }

    return () => clearInterval(checkInterval);
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
        Drag & Drop Form Builder
      </h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md"
      ></div>
    </div>
  );
}
