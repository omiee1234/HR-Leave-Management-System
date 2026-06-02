import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session credentials on initial app mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Register global API Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Connect to Django JWT Login View
      const response = await axios.post('https://hr-leave-management-system-2.onrender.com/api/auth/login/', { email, password });
      const { access, user: userProfile } = response.data;

      setToken(access);
      setUser(userProfile);

      localStorage.setItem('token', access);
      localStorage.setItem('user', JSON.stringify(userProfile));

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      return { success: true, role: userProfile.role };
    } catch (error) {
      console.error("Login attempt failed:", error);
      const message = error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Invalid email or password.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const register = async (name, email, password, role) => {
    try {
      await axios.post('http://localhost:8000/api/auth/register/', { name, email, password, role });
      return { success: true };
    } catch (error) {
      console.error("Registration attempt failed:", error);
      const errors = error.response?.data || { non_field_errors: ["Registration failed."] };
      return { success: false, errors };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
