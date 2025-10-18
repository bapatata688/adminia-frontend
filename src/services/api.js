/**
 * ============================================
 * API SERVICE - CORREGIDO
 * ============================================
 * FIX: Mejor manejo de errores y logging
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 segundos timeout
});

// ============================================
// INTERCEPTOR REQUEST
// ============================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.warn('⚠️ No hay token para:', config.url);
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR RESPONSE
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log del error
    if (error.response) {
      console.error(`❌ ${error.response.status} ${originalRequest.url}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ No response from server:', originalRequest.url);
    } else {
      console.error('❌ Request setup error:', error.message);
    }

    // Manejo de 401 - Token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log('🔄 Intentando refrescar token...');

          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          console.log('✅ Token refrescado exitosamente');

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error('❌ Error refrescando token:', refreshError);

          // Limpiar y redirigir
          localStorage.clear();
          window.location.href = '/';

          return Promise.reject(refreshError);
        }
      } else {
        console.warn('⚠️ No hay refresh token disponible');
        localStorage.clear();
        window.location.href = '/';
      }
    }

    // Construir mensaje de error legible
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error en la petición al servidor';

    console.error('❌ Error final:', errorMessage);

    return Promise.reject(new Error(errorMessage));
  }
);

// ============================================
// PRODUCTS API
// ============================================
export const productsAPI = {
  getAll: () => {
    console.log('📦 Obteniendo productos...');
    return api.get('/products');
  },

  getById: (id) => {
    console.log(`📦 Obteniendo producto ${id}...`);
    return api.get(`/products/${id}`);
  },

  create: (data) => {
    console.log('📦 Creando producto:', data);
    return api.post('/products', data);
  },

  update: (id, data) => {
    console.log(`📦 Actualizando producto ${id}:`, data);
    return api.put(`/products/${id}`, data);
  },

  delete: (id) => {
    console.log(`📦 Eliminando producto ${id}...`);
    return api.delete(`/products/${id}`);
  }
};

// ============================================
// ORDERS API
// ============================================
export const ordersAPI = {
  getByDate: (date) => {
    console.log(`📝 Obteniendo órdenes del ${date}...`);
    return api.get('/orders', { params: { date } });
  },

  getById: (id) => {
    console.log(`📝 Obteniendo orden ${id}...`);
    return api.get(`/orders/${id}`);
  },

  create: (data) => {
    console.log('📝 Creando orden:', data);
    return api.post('/orders', data);
  },

  update: (id, data) => {
    console.log(`📝 Actualizando orden ${id}:`, data);
    return api.put(`/orders/${id}`, data);
  },

  delete: (id) => {
    console.log(`📝 Eliminando orden ${id}...`);
    return api.delete(`/orders/${id}`);
  }
};

// ============================================
// REPORTS API
// ============================================
export const reportsAPI = {
  getDaily: (date) => {
    console.log(`📊 Obteniendo reporte del ${date}...`);
    return api.get(`/reports/daily/${date}`);
  },

  exportCSV: (date) => {
    console.log(`📊 Exportando CSV del ${date}...`);
    return api.get(`/reports/daily/${date}/export`, {
      responseType: 'blob'
    });
  },

  getSummary: (startDate, endDate) => {
    console.log(`📊 Obteniendo resumen ${startDate} a ${endDate}...`);
    return api.get('/reports/summary', {
      params: { start_date: startDate, end_date: endDate }
    });
  }
};

// ============================================
// OPEN DAYS API
// ============================================
export const openDaysAPI = {
  getAll: (startDate, endDate) => {
    console.log(`📅 Obteniendo días abiertos ${startDate} a ${endDate}...`);
    return api.get('/open-days', {
      params: { start_date: startDate, end_date: endDate }
    });
  },

  getByDate: (date) => {
    console.log(`📅 Obteniendo día ${date}...`);
    return api.get(`/open-days/${date}`);
  },

  update: (date, isOpen) => {
    console.log(`📅 Actualizando día ${date}: ${isOpen ? 'abierto' : 'cerrado'}`);
    return api.put(`/open-days/${date}`, { is_open: isOpen });
  },

  createMultiple: (dates) => {
    console.log(`📅 Creando múltiples días:`, dates);
    return api.post('/open-days', { dates });
  },

  delete: (date) => {
    console.log(`📅 Eliminando día ${date}...`);
    return api.delete(`/open-days/${date}`);
  }
};

// ============================================
// EXPORT
// ============================================
const apiServices = {
  productsAPI,
  ordersAPI,
  reportsAPI,
  openDaysAPI
};

export default apiServices;
