  import axios from 'axios';

  const API_URL = 'http://localhost:4000';
  // const API_URL = ' http://192.168.0.105:4000';



  export const getForms = async (token) => {
    const res = await axios.get(`${API_URL}/forms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };



  export const getFormById = async (token, id) => {
    const res = await axios.get(`${API_URL}/forms/id/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };


  export const getFormBySlug = async (slug) => {
    const res = await axios.get(`${API_URL}/forms/slug/${slug}`);
    return res.data;
  };


  export const createForm = async (token, form) => {
    const res = await axios.post(`${API_URL}/forms`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };


  export const updateForm = async (token, id, form) => {
    const res = await axios.put(`${API_URL}/forms/${id}`, form, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };


  export const deleteForm = async (token, id) => {
    const res = await axios.delete(`${API_URL}/forms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };  


  export const getFormResponses = async (token, id) => {
    const res = await axios.get(`${API_URL}/forms/${id}/responses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };


  export const getUserForms = async (token) => {
    const res = await axios.get(`${API_URL}/forms/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };

  export const generateFormQrCode = async (token, id) => {
    const res = await axios.get(`${API_URL}/forms/${id}/qrcode`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  };


  export const deleteResponse = async (token, responseId) => {
    const res = await axios.delete(`${API_URL}/forms/responses/${responseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }); 
    return res.data;
  };


  export const submitPublicResponse = async (slug, formData) => {
    const res = await axios.post(`${API_URL}/forms/public/${slug}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  };

  