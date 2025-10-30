import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFormBySlug, submitPublicResponse } from '../../api/forms';
import FormRenderer from '../../components/FormRenderer';

export default function PublicForm() {
  const { slug } = useParams();
  const [form, setForm] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  useEffect(() => {
    (async () => {
      try {
        const data = await getFormBySlug(slug);
        // Ensure fields have ids
        const fieldsWithId = (data.fields || []).map((f, index) => ({
          id: f.id || `field-${index}`,
          ...f,
        }));
        setForm({ ...data, fields: fieldsWithId });
      } catch (err) {
        setStatus({ loading: false, error: 'Form not found', success: null });
      }
    })();
  }, [slug]);

  const handleSubmit = async (answers) => {
    setStatus({ loading: true, error: null, success: null });
    try {
      const res = await submitPublicResponse(slug, answers);
      if (res?.responseId) {
        setStatus({ loading: false, success: 'Submitted successfully', error: null });
        setForm(null);
      } else {
        setStatus({ loading: false, error: res?.message || 'Submit failed', success: null });
      }
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Submit failed', success: null });
    }
  };

  if (!form) {
    return <div className="p-6">{status.loading ? 'Submitting...' : 'Loading...'}</div>;
  }

  return (
    <div className="p-6">
      {status.success && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{status.success}</div>}
      {status.error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{status.error}</div>}

      <FormRenderer
        form={form}
        onSubmit={handleSubmit}
        submitLabel={status.loading ? 'Submitting...' : 'Submit Response'}
      />
    </div>
  );
}
