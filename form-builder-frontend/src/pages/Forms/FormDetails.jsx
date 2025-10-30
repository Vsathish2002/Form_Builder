import React, { useEffect, useState } from 'react';
import { getFormById, getFormResponses } from '../../api/forms';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';

const SOCKET_URL = 'http://localhost:4000'; // backend URL where you run Socket.IO

export default function FormDetails() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    (async () => {
      const f = await getFormById(id);
      setForm(f);

      const res = await getFormResponses(token, id);
      setResponses(res || []);

      // connect to socket for live updates
      const socket = io(SOCKET_URL, { transports: ['websocket'] });

      socket.on('connect', () => console.log('🟢 Connected to WebSocket'));

      // when new response received from backend
      socket.on('new_response', (newResponse) => {
        if (newResponse.formId === f.id) {
          setResponses((prev) => [newResponse, ...prev]);
        }
      });

      return () => socket.disconnect();
    })();
  }, [id, token]);

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Responses — {form.title}</h1>

      {responses.length === 0 && <p>No responses yet.</p>}

      <div className="space-y-4">
        {responses.map((r) => (
          <div key={r.id} className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500 mb-2">
              Submitted: {new Date(r.createdAt).toLocaleString()}
            </div>
            <div className="grid gap-2">
              {r.items.map((item) => {
                let val = item.value;
                try {
                  const parsed = JSON.parse(item.value);
                  if (Array.isArray(parsed)) val = parsed.join(', ');
                } catch (e) {}
                return (
                  <div key={item.id} className="flex">
                    <div className="w-1/3 font-medium">{item.field.label}</div>
                    <div className="w-2/3">{val}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
