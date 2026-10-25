import axios from 'axios';

// Base URL set karo
const api = axios.create({
  baseURL: '/api',
});

// Har request mein JWT token attach karo
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 aane pe automatically logout karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gymToken');
      localStorage.removeItem('gymUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;