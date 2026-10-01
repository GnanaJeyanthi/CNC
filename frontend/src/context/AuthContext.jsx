import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Login failed';
    }
  };

  const googleLogin = async (credential) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/google', { credential });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Google login failed';
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', userData);
      return data;
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Registration failed';
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updatedUser = { ...prev, ...userData };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser, login, googleLogin, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

