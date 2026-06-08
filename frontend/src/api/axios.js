// ─────────────────────────────────────────────────────────────
// FILE: frontend/src/api/axios.js
// PRODUCTION-READY — Includes:
//   ✅ VITE_API_URL env variable (correct prefix for Vite)
//   ✅ Retry logic for Render cold-start (retries once after 3s)
//   ✅ 401 → auto logout and redirect to login
//   ✅ Request timeout (10s) so UI doesn't hang indefinitely
// ─────────────────────────────────────────────────────────────

import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ FIX: Must use VITE_ prefix — plain process.env vars
//         are NOT exposed to the browser by Vite
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000  // ✅ 10s timeout — prevents infinite loading on cold start
});

// ─────────────────────────────────────────────
// REQUEST INTERCEPTOR
// Attach JWT token to every request
// ─────────────────────────────────────────────
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ─────────────────────────────────────────────
// RESPONSE INTERCEPTOR
// ✅ FIX: Retry once on timeout (handles Render cold start)
//         Wait 3s then retry — cold start completes in ~30s
//         so we show a toast warning the user
// ─────────────────────────────────────────────
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // ✅ Handle Render cold-start timeout — retry once
    if (
      (error.code === 'ECONNABORTED' || error.response?.status === 503) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      toast.loading('Server is waking up, please wait...', { id: 'cold-start', duration: 5000 });

      // Wait 5 seconds then retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      toast.dismiss('cold-start');
      return api(originalRequest);
    }

    // ✅ Handle expired / invalid token — auto logout
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;