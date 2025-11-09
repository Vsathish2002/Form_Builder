import axios from "axios";
const BASE_URL = "http://localhost:4000/users";

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
