/**
 * ============================================
 * SERVICIO DE AUTENTICACIÓN - Frontend
 * ============================================
 * Archivo: src/services/auth.js
 * Propósito: Manejo de autenticación y tokens en el cliente
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AUTH_ENDPOINTS = {
  LOGIN: `${API_URL}/auth/login`,
  REGISTER: `${API_URL}/auth/register`,
  LOGOUT: `${API_URL}/auth/logout`,
  REFRESH: `${API_URL}/auth/refresh`,
  ME: `${API_URL}/auth/me`,
  UPDATE_PROFILE: `${API_URL}/auth/update-profile`,
  FORGOT_PASSWORD: `${API_URL}/auth/forgot-password`,
  RESET_PASSWORD: `${API_URL}/auth/reset-password`,
  LOGIN_WITH_REMEMBER: `${API_URL}/auth/login-with-remember`
};

/**
 * Gestión de tokens en localStorage
 */
export const TokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),

  setAccessToken: (token) => {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  },

  getRefreshToken: () => localStorage.getItem('refreshToken'),

  setRefreshToken: (token) => {
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  },

  getRememberToken: () => localStorage.getItem('rememberToken'),

  setRememberToken: (token) => {
    if (token) {
      localStorage.setItem('rememberToken', token);
    } else {
      localStorage.removeItem('rememberToken');
    }
  },

  getUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  clearAll: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('rememberToken');
    localStorage.removeItem('user');
  },

  hasValidSession: () => {
    return !!TokenManager.getAccessToken() || !!TokenManager.getRememberToken();
  }
};

/**
 * Configurar interceptor de axios para incluir token automáticamente
 */
export const setupAxiosInterceptors = (onUnauthorized) => {
  axios.interceptors.request.use(
    (config) => {
      const token = TokenManager.getAccessToken();
      if (token && config.url !== AUTH_ENDPOINTS.REFRESH) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const refreshToken = TokenManager.getRefreshToken();

        if (refreshToken) {
          try {
            const response = await axios.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
            const { accessToken } = response.data;

            TokenManager.setAccessToken(accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            TokenManager.clearAll();
            if (onUnauthorized) {
              onUnauthorized();
            }
            return Promise.reject(refreshError);
          }
        } else {
          TokenManager.clearAll();
          if (onUnauthorized) {
            onUnauthorized();
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

/**
 * Iniciar sesión
 */
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.LOGIN, {
      email,
      password,
      rememberMe
    });

    const { user, tokens } = response.data;

    TokenManager.setAccessToken(tokens.accessToken);
    TokenManager.setRefreshToken(tokens.refreshToken);

    if (tokens.rememberToken) {
      TokenManager.setRememberToken(tokens.rememberToken);
    }

    TokenManager.setUser(user);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Registrar nuevo usuario
 */
export const register = async (email, password, businessName, rememberMe = false) => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.REGISTER, {
      email,
      password,
      businessName,
      rememberMe
    });

    const { user, tokens } = response.data;

    TokenManager.setAccessToken(tokens.accessToken);
    TokenManager.setRefreshToken(tokens.refreshToken);

    if (tokens.rememberToken) {
      TokenManager.setRememberToken(tokens.rememberToken);
    }

    TokenManager.setUser(user);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cerrar sesión
 */
export const logout = async () => {
  try {
    const token = TokenManager.getAccessToken();

    if (token) {
      await axios.post(AUTH_ENDPOINTS.LOGOUT);
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    TokenManager.clearAll();
  }
};

/**
 * Refrescar access token
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = TokenManager.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(AUTH_ENDPOINTS.REFRESH, { refreshToken });
    const { accessToken } = response.data;

    TokenManager.setAccessToken(accessToken);

    return accessToken;
  } catch (error) {
    TokenManager.clearAll();
    throw error;
  }
};

/**
 * Login con remember token
 */
export const loginWithRemember = async (rememberToken) => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.LOGIN_WITH_REMEMBER, {
      rememberToken
    });

    const { user, tokens } = response.data;

    TokenManager.setAccessToken(tokens.accessToken);
    TokenManager.setRefreshToken(tokens.refreshToken);
    TokenManager.setRememberToken(tokens.rememberToken);
    TokenManager.setUser(user);

    return response.data;
  } catch (error) {
    TokenManager.setRememberToken(null);
    throw error;
  }
};

/**
 * Obtener usuario actual
 */
export const getCurrentUser = async () => {
  try {
    const cachedUser = TokenManager.getUser();

    if (cachedUser) {
      return cachedUser;
    }

    const response = await axios.get(AUTH_ENDPOINTS.ME);
    const { user } = response.data;

    TokenManager.setUser(user);

    return user;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateProfile = async (updates) => {
  try {
    const response = await axios.put(AUTH_ENDPOINTS.UPDATE_PROFILE, updates);
    const { user } = response.data;

    TokenManager.setUser(user);

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Solicitar reset de contraseña
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Resetear contraseña con token
 */
export const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
      token,
      newPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  return TokenManager.hasValidSession();
};

/**
 * Obtener información del usuario desde localStorage
 */
export const getUserFromStorage = () => {
  return TokenManager.getUser();
};

/**
 * Verificar si el trial ha expirado
 */
export const isTrialExpired = () => {
  const user = TokenManager.getUser();

  if (!user || !user.trialEndsAt) {
    return false;
  }

  const trialEnd = new Date(user.trialEndsAt);
  const now = new Date();

  return now > trialEnd;
};

/**
 * Obtener días restantes de trial
 */
export const getTrialDaysRemaining = () => {
  const user = TokenManager.getUser();

  if (!user || !user.trialEndsAt) {
    return 0;
  }

  const trialEnd = new Date(user.trialEndsAt);
  const now = new Date();
  const diffTime = trialEnd - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

const authService = {
  login,
  register,
  logout,
  refreshAccessToken,
  loginWithRemember,
  getCurrentUser,
  updateProfile,
  forgotPassword,
  resetPassword,
  isAuthenticated,
  getUserFromStorage,
  isTrialExpired,
  getTrialDaysRemaining,
  TokenManager,
  setupAxiosInterceptors
};

export default authService;
