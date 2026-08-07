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
};

export const budgetAPI = {
  getMyRequest: () => api.get('/budget'),
  requestChange: (requestedAmount) => api.post('/budget', { requestedAmount }),
  cancelRequest: () => api.delete('/budget'),
};

export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getOne: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getDashboard: () => api.get('/expenses/dashboard'),
  getInsights: () => api.get('/expenses/insights'),
};

export const filterOptionAPI = {
  getAll: () => api.get('/filter-options'),
};

export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  contribute: (id, amount) => api.post(`/goals/${id}/contribute`, { amount }),
};

export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: () => api.get('/admin/users'),
  getUserDashboard: (id) => api.get(`/admin/users/${id}/dashboard`),
  getUserExpenses: (id) => api.get(`/admin/users/${id}/expenses`),
  getBudgetRequests: () => api.get('/admin/budget-requests'),
  reviewBudgetRequest: (id, status, note) => api.put(`/admin/budget-requests/${id}/review`, { status, note }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  addFilterOption: (type, label) => api.post('/admin/filter-options', { type, label }),
  deleteFilterOption: (id) => api.delete(`/admin/filter-options/${id}`),
};

export default api;
