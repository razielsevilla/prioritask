// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("/user")
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        })
        .finally(() => setLoading(false)); // ✅ only stop loading AFTER check
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access_token}`;
    const userRes = await api.get("/user");
    setUser(userRes.data);
  };

  const register = async (name, email, password, password_confirmation) => {
    await api.post("/register", {
      name,
      email,
      password,
      password_confirmation,
    });
    // ✅ no auto-login
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch {}
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  // ✅ While loading, render a blank screen or spinner
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-light">
        <div>
          <div className="spinner-border text-primary mb-3" role="status"></div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
