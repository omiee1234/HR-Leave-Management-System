import axios from 'axios';

// Create central Axios instance pointing to our Django backend API
const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Intercept requests to dynamically attach JWT token from localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoint services (used in context or pages)
export const authAPI = {
  login: (email, password) => API.post('/auth/login/', { email, password }),
  register: (name, email, password, role) => API.post('/auth/register/', { name, email, password, role }),
};

// Employee REST Actions
export const employeeAPI = {
  getBalance: () => API.get('/employee/balance/'),
  applyLeave: (leaveData) => API.post('/employee/apply-leave/', leaveData),
  getLeaves: () => API.get('/employee/leaves/'),
  cancelLeave: (id) => API.put(`/employee/cancel/${id}/`),
};

// Manager REST Actions
export const managerAPI = {
  getLeaves: () => API.get('/manager/leaves/'),
  approveLeave: (id) => API.put(`/manager/approve/${id}/`),
  rejectLeave: (id, reason) => API.put(`/manager/reject/${id}/`, { rejection_reason: reason }),
  getBalances: () => API.get('/manager/balances/'),
};

export default API;
