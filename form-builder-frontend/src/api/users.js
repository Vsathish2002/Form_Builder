import axios from "axios";
const BASE_URL = "http://localhost:4000/users";
//  const BASE_URL = ' http://192.168.0.105:4000/users';

export async function getUsers(token) {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("Error fetching users:", err.response?.data || err.message);
    return [];
  }
} 

export async function requestEmailOtp(userId, newEmail, token) {
  const res = await axios.post(
    `${BASE_URL}/request-email-otp/${userId}`,
    { newEmail },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function verifyEmailOtp(userId, newEmail, otp, token) {
  const res = await axios.post(
    `${BASE_URL}/verify-email-otp/${userId}`,
    { newEmail, otp },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
