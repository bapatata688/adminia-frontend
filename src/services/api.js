/**
 * ============================================
 * API SERVICE - Comunicación con Backend
 * ============================================
 * Archivo: src/services/api.js
 * Propósito: Centralizar todas las llamadas HTTP al backend
 * 
 * CORREGIDO: Incluye interceptor para agregar token automáticamente
 */

import axios from 'axios';

// Configurar URL base según ambiente
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API URL configurada:', API_URL);

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============================================
// INTERCEPTOR: Agregar token a todas las peticiones
// ============================================
api.interceptors.request.use(
  (config) => {
    // Obtener token de localStorage
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token agregado a request:', config.url);
    } else {
      console.warn('No hay token disponible para:', config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR: Manejar respuestas y errores
// ============================================
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si es error 401 y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Intentar refrescar token
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log('Intentando refrescar token...');

          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data;

          // Guardar nuevo token
          localStorage.setItem('accessToken', accessToken);

          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error('Error refrescando token:', refreshError);

          // Limpiar localStorage y redirigir a login
          localStorage.clear();
          window.location.href = '/';

          return Promise.reject(refreshError);
        }
      } else {
        console.warn('No hay refresh token, redirigiendo a login');
        localStorage.clear();
        window.location.href = '/';
      }
    }

    // Manejar otros errores
    const errorMessage = error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error en la petición';

    console.error('API Error:', errorMessage);

    return Promise.reject(new Error(errorMessage));
  }
);

// ============================================
// PRODUCTS API
// ============================================
export const productsAPI = {
  getAll: () => api.get('/products'),

  getById: (id) => api.get(`/products/${id}`),

  create: (data) => api.post('/products', data),

  update: (id, data) => api.put(`/products/${id}`, data),

  delete: (id) => api.delete(`/products/${id}`)
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  getByDate: (date) => api.get('/orders', { params: { date } }),

  getById: (id) => api.get(`/orders/${id}`),

  create: (data) => api.post('/orders', data),

  update: (id, data) => api.put(`/orders/${id}`, data),

  delete: (id) => api.delete(`/orders/${id}`)
};

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
  getDaily: (date) => api.get(`/reports/daily/${date}`),

  exportCSV: (date) => api.get(`/reports/daily/${date}/export`, {
    responseType: 'blob'
  }),

  getSummary: (startDate, endDate) => api.get('/reports/summary', {
    params: { start_date: startDate, end_date: endDate }
  })
};

// ============================================
// OPEN DAYS API
// ============================================
export const openDaysAPI = {
  getAll: (startDate, endDate) => api.get('/open-days', {
    params: { start_date: startDate, end_date: endDate }
  }),

  getByDate: (date) => api.get(`/open-days/${date}`),

  update: (date, isOpen) => api.put(`/open-days/${date}`, { is_open: isOpen }),

  createMultiple: (dates) => api.post('/open-days', { dates }),

  delete: (date) => api.delete(`/open-days/${date}`)
};

// ============================================
// EXPORT DEFAULT
// ============================================
const apiServices = {
  productsAPI,
  ordersAPI,
  reportsAPI,
  openDaysAPI
};

export default apiServices;
