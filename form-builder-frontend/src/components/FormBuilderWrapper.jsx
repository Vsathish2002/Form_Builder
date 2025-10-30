import React, { useEffect, useRef } from 'react';

export default function FormBuilderWrapper({ fieldsJson, onSave }) {
  const builderRef = useRef(null);
  const editorContainer = useRef(null);

  useEffect(() => {
    const $ = window.$;
    if (!$.fn.formBuilder) {
      console.error("formBuilder not loaded — check index.html");
      return;
    }

    // Destroy previous instance completely
    if (builderRef.current?.actions) {
      builderRef.current.actions.clearFields();
      builderRef.current = null;
      $(editorContainer.current).empty(); // remove old HTML
    }

    const options = {
      disableFields: [
        'autocomplete',
        'button',
        'file',
        'header',
        'paragraph',
        'hidden',
        'starRating',
        'date',
        'range',
      ],
      controlOrder: ['text', 'textarea', 'select', 'checkbox', 'radio'],
      showActionButtons: true,
      onSave: (evt, formData) => {
        try {
          const parsed = JSON.parse(formData);
          const parsedWithId = parsed.map((f, i) => {
            let type = f.type;

            // Map frontend type to backend enum
            if (type === 'radio-group') type = 'radio';
            if (type === 'checkbox-group') type = 'checkbox';

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

    return () => {
      if (builderRef.current?.actions) {
        builderRef.current.actions.clearFields();
        builderRef.current = null;
      }
      $(editorContainer.current).empty();
    };
  }, [fieldsJson.length, onSave]); // only depend on fields count to avoid remount

  return (
    <div className="my-8">
      <h3 className="text-2xl font-semibold mb-4">🧱 Drag & Drop Form Builder</h3>
      <div
        ref={editorContainer}
        id="fb-editor"
        className="border rounded-lg bg-white p-4 shadow-md"
      ></div>
    </div>
  );
}
