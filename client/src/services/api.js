import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateBudget: (monthlyBudget) => api.put('/auth/budget', { monthlyBudget }),
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getDashboard: () => api.get('/expenses/dashboard'),
};

export const filterOptionAPI = {
  getAll: () => api.get('/filter-options'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUserDashboard: (id) => api.get(`/admin/users/${id}/dashboard`),
  getUserExpenses: (id) => api.get(`/admin/users/${id}/expenses`),
  addFilterOption: (type, label) => api.post('/admin/filter-options', { type, label }),
  deleteFilterOption: (id) => api.delete(`/admin/filter-options/${id}`),
};

export default api;
