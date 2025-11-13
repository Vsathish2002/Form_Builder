import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "jquery-ui-dist/jquery-ui.min.css"; // jQuery UI visuals for drag/drop

// Make jQuery global for libraries expecting window.jQuery
window.$ = window.jQuery = $;

/**
 * Utility: stable UUID (uses crypto.randomUUID if available, otherwise fallback)
 */
function generateUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // fallback: simple RFC4122 v4-like generator (sufficient for client-side unique ids)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function FormBuilderWrapper({ fieldsJson = [], onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    // Inject Bootstrap CSS dynamically (only on this page)
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "/libs/bootstrap.min.css"; // ensure this file exists in public/libs
    document.head.appendChild(bootstrapLink);

    // Dynamically import dependencies
    Promise.all([
      import("jquery-ui-dist/jquery-ui"),
      import("formBuilder/dist/form-builder.min.js"),
      import("formBuilder/dist/form-render.min.js"),
    ])
      .then(() => {
        console.log("✅ FormBuilder libraries loaded");
        initFormBuilder($);
      })
      .catch((err) => {
        console.error("❌ Failed to load FormBuilder libs:", err);
      });

    return () => {
      // cleanup
      try {
        if (builderRef.current?.actions) {
          try {
            builderRef.current.actions.clearFields();
          } catch (e) {
            // ignore
          }
        }
        builderRef.current = null;
        if (editorContainer.current) editorContainer.current.innerHTML = "";
      } catch (e) {
        console.warn("Cleanup error:", e);
      }
      bootstrapLink.remove();
      console.log("🧹 Removed bootstrap link and cleaned up form builder");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsJson]); // re-init when fieldsJson changes (rehydration will run inside init)

  function initFormBuilder($) {
    // If there's already an instance, clear it first
    if (builderRef.current?.actions) {
      try {
        builderRef.current.actions.clearFields();
        $(editorContainer.current).empty();
      } catch (e) {
        console.warn("Could not clear previous builder instance", e);
      }
      builderRef.current = null;
    }

    /* -------------------------
       Custom Controls / Plugins
       ------------------------- */
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
          return `<${subtype} class="fw-bold mt-3 mb-2">${field.label || ""}</${subtype}>`;
        },
      },

      paragraph: {
        label: "Paragraph",
        icon: "📝",
        fields: [{ label: "Text", name: "label", type: "textarea" }],
        onRender: (field) => `<p class="text-muted my-3">${field.label || ""}</p>`,
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
          const label = field.label || "";
          return `
            <div class="mb-3">
              <label class="form-label">${label}</label>
              <input type="date" class="form-control" />
            </div>`;
        },
      },

      fileUpload: {
        label: "File Upload",
        icon: "📎",
        fields: [
          { label: "Label", name: "label", type: "text" },
          { label: "Allow Multiple Files", name: "multiple", type: "checkbox" },
          { label: "Accepted Types (e.g. image/*, .pdf)", name: "accept", type: "text" },
        ],
        onRender: (field) => {
          const multiple = field.multiple ? "multiple" : "";
          const accept = field.accept ? `accept="${field.accept}"` : "";
          const fieldName = field.name || `file-${generateUUID()}`;
          return `
            <div class="mb-3">
              <label class="form-label">${field.label || "Upload File"}</label>
              <input type="file" name="${fieldName}" id="${fieldName}" class="form-control" ${multiple} ${accept} />
            </div>`;
        },
      },

      page: {
        label: "Page Break",
        icon: "📑",
        onRender: () => `<div class="text-center text-primary my-3">--- Page Break ---</div>`,
      },
    };

    // Register custom controls safely
    Object.entries(controlPlugins).forEach(([key, plugin]) => {
      try {
        $.fn.formBuilder.controls.register(key, plugin);
      } catch (err) {
        console.warn(`Could not register control ${key}:`, err);
      }
    });

    /* -------------------------
       Builder Options
       ------------------------- */
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

      // Stable onSave implementation
      onSave: (evt, formData) => {
        try {
          const fb = builderRef.current;
          const raw = fb?.actions?.getData("json") || formData || "[]";
          const parsed = JSON.parse(raw);

          // Build final fields with stable IDs
          const finalFields = parsed.map((f, i) => {
            // Try to find matching old field by id (prefer this)
            const old = fieldsJson.find((x) => x.id === f.id);

            // stable id: reuse old.id if exists, else use f.id if provided, else create uuid
            const stableId = old?.id || f.id || generateUUID();

            // Normalize options (values) for select/radio/checkbox
            let options = [];
            if (["select", "radio-group", "checkbox-group"].includes(f.type)) {
              options = (f.values || [])
                .map((opt) => {
                  const label = (opt.label || "").trim();
                  // If value is missing or auto-generated like "option-1", use label
                  const value =
                    opt.value && String(opt.value).startsWith("option-")
                      ? label
                      : (opt.value || label).trim();
                  return label ? { label, value } : null;
                })
                .filter(Boolean);
            }

            return {
              id: stableId,
              name: f.name || stableId,
              label: f.label || "",
              type: f.type,
              required: !!f.required,
              options,
              order: i,
              validation: f.validation || null,
              subtype: f.subtype || (f.type === "header" ? "h3" : undefined),
            };
          });

          console.log("✅ onSave final fields:", finalFields);
          onSave(finalFields);

          // rehydrate builder with stable finalFields
          fb.promise.then(() => {
            try {
              fb.actions.clearFields();
              fb.actions.setData(
                finalFields.map((fld) => ({
                  ...fld,
                  // formBuilder expects 'values' for option fields
                  values: fld.options || [],
                }))
              );
            } catch (e) {
              console.warn("Error re-setting data after save:", e);
            }
          });
        } catch (err) {
          console.error("❌ Error during onSave:", err);
        }
      },
    };

    /* -------------------------
       Initialize builder
       ------------------------- */
    const fbEditor = $(editorContainer.current).formBuilder(options);
    builderRef.current = fbEditor;
    window._formBuilderInstance = fbEditor;

    /* -------------------------
       Rehydrate saved fields (stable)
       ------------------------- */
    fbEditor.promise.then((fbInstance) => {
      try {
        const actions = fbInstance?.actions || fbEditor.actions;
        if (!actions || typeof actions.setData !== "function") {
          console.warn("⚠️ FormBuilder actions.setData not available");
          return;
        }

        if (fieldsJson.length > 0) {
          // transform saved fields into formBuilder format
          const transformed = fieldsJson.map((f) => {
            const field = { ...f };
            field.id = f.id;
            field.name = f.name || f.id;

            if (["select", "radio-group", "checkbox-group"].includes(f.type)) {
              field.values = (f.options || []).map((opt) =>
                typeof opt === "object" ? { label: opt.label, value: opt.value } : { label: opt, value: opt }
              );
            }

            if (f.type === "header" && !f.subtype) field.subtype = "h3";
            return field;
          });

          actions.setData(transformed);
          console.log("✅ Rehydration completed: fields loaded into builder");
        }
      } catch (e) {
        console.warn("Rehydrate failed:", e);
      }
    });
  }

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Drag & Drop Form Builder</h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md min-h-[220px]"
      />
    </div>
  );
}
