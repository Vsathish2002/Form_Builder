import axios from 'axios';

const BASE_URL = 'http://localhost:4000/auth'; // your NestJS backend URL
// const BASE_URL = ' http://192.168.0.105:4000/auth'; // your NestJS backend URL


export async function registerUser(name, email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/register`, { name, email, password });
    return res.data;
  } catch (err) {
    console.error('Registration error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during registration' };
  }
}

export async function loginUser(email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/login`, { email, password });
    return res.data;
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during login' };
  }
}
