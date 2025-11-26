import React, { useState, useEffect } from "react";

export default function OtpModal({ email, open, onClose, onVerify, onResend }) {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(600); // 10 min

  useEffect(() => {
    if (!open) return;
    setOtp("");
    setTimer(600);
    const interval = setInterval(
      () => setTimer((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(interval);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-xl">
        <h2 className="text-xl font-bold text-blue-600 mb-2">Verify Email</h2>
        <p className="text-gray-500 text-sm mb-4">
          Enter the 6-digit OTP sent to <b>{email}</b>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength="6"
          placeholder="Enter OTP"
          className="border p-3 w-full rounded-md text-center tracking-widest mb-3"
        />

        <p className="text-xs text-gray-400 mb-3">
          Time left: {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")}
        </p>

        <div className="flex justify-between mb-2">
          <button
            onClick={onResend}
            className="text-sm text-blue-600 hover:underline"
          >
            Resend OTP
          </button>
          <button
            onClick={() => onVerify(otp)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Verify
          </button>
        </div>

        <button
          onClick={onClose}
          className="text-gray-500 text-xs hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
