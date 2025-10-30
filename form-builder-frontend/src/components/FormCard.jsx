import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateFormQrCode } from '../api/forms';
import { useAuth } from '../context/AuthContext';

export default function FormCard({ form, onDelete }) {
  const [qrCode, setQrCode] = useState(null);
  const { token } = useAuth();

  const handleGenerateQr = async () => {
    try {
      const qr = await generateFormQrCode(token, form.id);
      setQrCode(qr);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-xl font-bold">{form.title}</h3>
      <p className="text-gray-500">{form.description}</p>
      <div className="flex gap-3 mt-3 flex-wrap">
        <Link to={`/forms/${form.id}/responses`} className="text-blue-600">View Responses</Link>
        <Link to={`/edit/${form.id}`} className="text-green-600">Edit</Link>
        <button onClick={() => onDelete(form.id)} className="text-red-600">Delete</button>
        <button onClick={handleGenerateQr} className="text-purple-600">Generate QR</button>
        <Link to={`/public/${form.slug}`} className="text-indigo-600">Share Link</Link>
      </div>
      {qrCode && (
        <div className="mt-3">
          <img src={qrCode} alt="QR Code" className="w-32 h-32" />
        </div>
      )}
    </div>
  );
}
