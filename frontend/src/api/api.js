import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 添加 JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// 认证相关 API
export const authAPI = {
  // 用户注册
  register: (userData) => api.post('/auth/register', userData),
  
  // 用户登录
  login: (credentials) => api.post('/auth/login', credentials),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/current')
};

// 八字相关 API
export const baziAPI = {
  // 创建八字记录
  create: (baziData) => api.post('/bazi', baziData),
  
  // 获取当前用户的所有八字记录
  getAll: () => api.get('/bazi'),
  
  // 获取指定八字记录详情
  getById: (id) => api.get(`/bazi/${id}`),
  
  // 获取社区八字记录
  getCommunity: (search = '') => api.get(`/bazi/community/list?search=${search}`),
  
  // 删除八字记录
  delete: (id) => api.delete(`/bazi/${id}`)
};

export default api;

