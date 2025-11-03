import axios from 'axios';

const API_URL = 'http://localhost:4000';
// const API_URL = ' http://192.168.0.105:4000';


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

// Generate QR code for form
export const generateFormQrCode = async (token, id) => {
  const res = await axios.get(`${API_URL}/forms/${id}/qrcode`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Delete response
export const deleteResponse = async (token, responseId) => {
  const res = await axios.delete(`${API_URL}/forms/responses/${responseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};


// Submit public response
export const submitPublicResponse = async (slug, formData) => {
  const res = await axios.post(`${API_URL}/forms/public/${slug}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Draft-related API functions for auto-save functionality
export const saveFormDraft = async (formSlug, draftData, sessionId) => {
  // Save draft data to backend for persistence across sessions
  const response = await axios.post(`${API_URL}/forms/public/${formSlug}/draft`, {
    draftData,
    sessionId,
  });
  return response.data;
};

export const loadFormDraft = async (formSlug, sessionId) => {
  // Load previously saved draft data
  try {
    const response = await axios.get(`${API_URL}/forms/public/${formSlug}/draft`, {
      params: { sessionId },
    });
    return response.data;
  } catch (error) {
    // Return null if no draft exists
    return null;
  }
};

export const deleteFormDraft = async (formSlug, sessionId) => {
  // Delete draft after successful form submission
  const response = await axios.delete(`${API_URL}/forms/public/${formSlug}/draft`, {
    data: { sessionId },
  });
  return response.data;
};

