import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ Create context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ✅ Initialize user and token from localStorage safely
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // ✅ Attach token automatically to every axios request (once)
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    // cleanup to avoid multiple interceptors when hot-reloading
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  // ✅ Called after successful login / registration / OTP verification
  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
  };

  // ✅ Logout clears all
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Restore session automatically after page reload
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook to access AuthContext easily
export const useAuth = () => useContext(AuthContext);
