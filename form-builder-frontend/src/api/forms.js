import axios from 'axios';

const API_URL = 'http://localhost:4000';

// Get all forms
export const getForms = async (token) => {
  const res = await axios.get(`${API_URL}/forms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// Get form by ID
export const getFormById = async (token, id) => {
  const res = await axios.get(`${API_URL}/forms/id/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get form by slug
export const getFormBySlug = async (slug) => {
  const res = await axios.get(`${API_URL}/forms/slug/${slug}`);
  return res.data;
};

// Create form
export const createForm = async (token, form) => {
  const res = await axios.post(`${API_URL}/forms`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Update form
export const updateForm = async (token, id, form) => {
  const res = await axios.put(`${API_URL}/forms/${id}`, form, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete form
export const deleteForm = async (token, id) => {
  const res = await axios.delete(`${API_URL}/forms/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get form responses
export const getFormResponses = async (token, id) => {
  const res = await axios.get(`${API_URL}/forms/${id}/responses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get user's forms
export const getUserForms = async (token) => {
  const res = await axios.get(`${API_URL}/forms/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
// old export const getUserForms = async (token) => {
//   const res = await axios.get(`${API_URL}/forms/user/me`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   return res.data;
// };

// Generate QR code for form
export const generateFormQrCode = async (token, id) => {
  const res = await axios.get(`${API_URL}/forms/${id}/qrcode`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Submit public response

// Submit public response
export const submitPublicResponse = async (slug, answers) => {
  const res = await axios.post(`${API_URL}/forms/public/${slug}/submit`, { answers });
  return res.data;
};

// old export const submitPublicResponse = async (slug, answers) => {
//   const res = await axios.post(`${API_URL}/forms/public/${slug}/submit`, answers);
//   return res.data;
// };
