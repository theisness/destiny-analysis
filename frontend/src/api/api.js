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
  getCurrentUser: () => api.get('/auth/current'),

  // 更新个人信息
  updateProfile: (data) => api.patch('/auth/profile', data),

  // 重置密码（忘记密码）
  resetPassword: (email, code, newPassword) => api.post('/auth/resetpwd', { email, code, newPassword })
};

// 文件上传 API（使用 FormData）
export const uploadAPI = {
  uploadFiles: (files) => {
    const form = new FormData();
    for (const f of files) form.append('files', f);
    return api.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

// 用户相关 API
export const usersAPI = {
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/users/${id}`)
};

// 标签相关 API
export const labelsAPI = {
  list: (q = '') => api.get('/labels', { params: q ? { q } : {} }),
  create: (name) => api.post('/labels', { name }),
  delete: (id) => api.delete(`/labels/${id}`)
};

// 八字相关 API
export const baziAPI = {
  // 创建八字记录
  create: (baziData) => api.post('/bazi', baziData),
  
  // 编辑八字记录
  update: (id, data) => api.patch(`/bazi/${id}` , data),
  
  // 获取当前用户的所有八字记录
  getAll: () => api.get('/bazi'),
  
  // 获取指定八字记录详情
  getById: (id) => api.get(`/bazi/${id}`),
  
  // 获取社区八字记录（支持筛选参数对象）
  getCommunity: (params = {}) => api.get('/bazi/community/list', { params }),
  
  // 删除八字记录
  delete: (id) => api.delete(`/bazi/${id}`),
  
  // 获取当前农历信息
  getCurrentLunar: () => api.get('/bazi/current-lunar')
};

// 评论相关 API
export const commentsAPI = {
  list: (baziId) => api.get(`/comments/${baziId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.patch(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`)
};

// 验证码相关 API
export const captchaAPI = {
  send: (email) => api.post('/captcha/send', { email }),
  verify: (email, code) => api.post('/captcha/verify', { email, code })
};

// 管理员相关 API
export const adminAPI = {
  listUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  banUser: (id, isBanned) => api.patch(`/admin/users/${id}/ban`, { isBanned }),
  setAdmin: (id, makeAdmin) => api.patch(`/admin/users/${id}/admin`, { admin: makeAdmin ? 1 : 0 })
};

export default api;

