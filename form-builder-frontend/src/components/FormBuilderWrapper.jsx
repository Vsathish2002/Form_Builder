import React, { useEffect, useRef } from "react";
import $ from "jquery";
import "jquery-ui-dist/jquery-ui.min.css";

window.$ = window.jQuery = $;

export default function FormBuilderWrapper({ fieldsJson = [], onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    const bootstrapLink = document.createElement("link");
    bootstrapLink.rel = "stylesheet";
    bootstrapLink.href = "/libs/bootstrap.min.css";
    document.head.appendChild(bootstrapLink);

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
      try {
        if (builderRef.current?.actions) {
          try {
            builderRef.current.actions.clearFields();
          } catch {
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
  }, [fieldsJson]);

  function initFormBuilder($) {
    if (builderRef.current?.actions) {
      try {
        builderRef.current.actions.clearFields();
        $(editorContainer.current).empty();
      } catch {
        console.warn("Could not clear previous builder instance");
      }
      builderRef.current = null;
    }

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
          return `<${subtype} class="fw-bold mt-3 mb-2">${
            field.label || ""
          }</${subtype}>`;
        },
      },

      paragraph: {
        label: "Paragraph",
        icon: "📝",
        fields: [{ label: "Text", name: "label", type: "textarea" }],
        onRender: (field) =>
          `<p class="text-muted my-3">${field.label || ""}</p>`,
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
          {
            label: "Accepted Types (e.g. image/*, .pdf)",
            name: "accept",
            type: "text",
          },
        ],
        onRender: (field) => {
          const multiple = field.multiple ? "multiple" : "";
          const accept = field.accept ? `accept="${field.accept}"` : "";
          const fieldName = field.name;
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
        onRender: () =>
          `<div class="text-center text-primary my-3">--- Page Break ---</div>`,
      },
    };

    Object.entries(controlPlugins).forEach(([key, plugin]) => {
      try {
        $.fn.formBuilder.controls.register(key, plugin);
      } catch (err) {
        console.warn(`Could not register control ${key}:`, err);
      }
    });

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

      onSave: (evt, formData) => {
        try {
          const fb = builderRef.current;
          const raw = fb?.actions?.getData("json") || formData || "[]";
          const parsed = JSON.parse(raw);

          const finalFields = parsed.map((f, i) => {
            const old = fieldsJson.find((x) => x.id === f.id);

            const stableId = old?.id || f.id;

            let options = [];
            if (["select", "radio-group", "checkbox-group"].includes(f.type)) {
              options = (f.values || [])
                .map((opt) => {
                  const label = (opt.label || "").trim();

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

          fb.promise.then(() => {
            try {
              fb.actions.clearFields();
              fb.actions.setData(
                finalFields.map((fld) => ({
                  ...fld,

                  values: fld.options || [],
                }))
              );
            } catch (e) {
              console.warn("Error re-setting data after save");
            }
          });
        } catch (err) {
          console.error("❌ Error during onSave:", err);
        }
      },
    };

    const fbEditor = $(editorContainer.current).formBuilder(options);
    builderRef.current = fbEditor;
    window._formBuilderInstance = fbEditor;

    fbEditor.promise.then((fbInstance) => {
      try {
        const actions = fbInstance?.actions || fbEditor.actions;
        if (!actions || typeof actions.setData !== "function") {
          console.warn("⚠️ FormBuilder actions.setData not available");
          return;
        }

        if (fieldsJson.length > 0) {
          const transformed = fieldsJson.map((f) => {
            const field = { ...f };
            field.id = f.id;
            field.name = f.name || f.id;

            if (["select", "radio-group", "checkbox-group"].includes(f.type)) {
              field.values = (f.options || []).map((opt) =>
                typeof opt === "object"
                  ? { label: opt.label, value: opt.value }
                  : { label: opt, value: opt }
              );
            }

            if (f.type === "header" && !f.subtype) field.subtype = "h3";
            return field;
          });

          actions.setData(transformed);
          console.log("✅ Rehydration completed: fields loaded into builder");
        }
      } catch {
        console.warn("Rehydrate failed");
      }
    });
  }

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">
        Drag & Drop Form Builder
      </h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md min-h-[220px]"
      />
    </div>
  );
}
