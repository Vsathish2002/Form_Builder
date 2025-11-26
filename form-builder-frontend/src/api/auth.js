import axios from 'axios';

const BASE_URL = 'http://localhost:4000/auth'; // your NestJS backend URL
// const BASE_URL = ' http://192.168.0.105:4000/auth'; 

export async function loginUser(email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/login`, { email, password });
    return res.data;
  } catch (err) {
    console.error('Login error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during login' };
  }
}

export async function forgotPassword(email) {
  try {
    const res = await axios.post(`${BASE_URL}/forgot-password`, { email });
    return res.data;
  } catch (err) {
    console.error('Forgot password error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during forgot password' };
  }
}

export async function verifyOtp(email, otp) {
  try {
    const res = await axios.post(`${BASE_URL}/verify-otp`, { email, otp });
    return res.data;
  } catch (err) {
    console.error('Verify OTP error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during OTP verification' };
  }
}


export async function resetPassword(email, otp, newPassword) {
  try {
    const res = await axios.post(`${BASE_URL}/reset-password`, { email, otp, newPassword });
    return res.data;
  } catch (err) {
    console.error('Reset password error:', err.response?.data || err.message);
    return err.response?.data || { message: 'Network error during password reset' };
  }
}

export async function requestRegisterOtp(name, email, password) {
  try {
    const res = await axios.post(`${BASE_URL}/register-request-otp`, {
      name,
      email,
      password,
    });
    return res.data;
  } catch (err) {
    console.error("Request OTP error:", err.response?.data || err.message);
    throw err.response?.data || { message: "Failed to send OTP" };
  }
}

export async function verifyRegisterOtp(name, email, password, otp) {
  try {
    const res = await axios.post(`${BASE_URL}/register-verify-otp`, {
      name,
      email,
      password,
      otp,
    });
    return res.data;
  } catch (err) {
    console.error("Verify Register OTP error:", err.response?.data || err.message);
    throw err.response?.data || { message: "Failed to verify OTP" };
  }
}


