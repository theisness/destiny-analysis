import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化 - 检查本地存储的token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // 验证 token 是否有效
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (err) {
          console.error('Token验证失败:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // 注册
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || '注册失败';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 登录
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || '登录失败';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/auth';
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

