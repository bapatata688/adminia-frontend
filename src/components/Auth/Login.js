/**
 * ============================================
 * COMPONENTE DE LOGIN/REGISTER
 * ============================================
 * Archivo: components/Auth/Login.jsx
 * Propósito: Interfaz de autenticación con animaciones
 * 
 * Características:
 * - Login y Register en el mismo componente
 * - Transiciones suaves entre vistas
 * - Validación en tiempo real
 * - Remember Me functionality
 * - Forgot Password flow
 * - Diseño responsive y accesible
 * 
 * Props:
 * - onLoginSuccess: function - Callback después de login exitoso
 */

import { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Heart,
  Store
} from 'lucide-react';
import { login, register, forgotPassword, resetPassword, loginWithRemember } from '../../services/auth';

const Login = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    confirmPassword: '',
    rememberMe: false
  });
  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Intentar login automático con remember token al montar
  useEffect(() => {
    const attemptAutoLogin = async () => {
      const rememberToken = localStorage.getItem('rememberToken');
      if (rememberToken) {
        try {
          const response = await loginWithRemember(rememberToken);
          onLoginSuccess(response.user);
        } catch (error) {
          // Si falla, limpiar token inválido
          localStorage.removeItem('rememberToken');
        }
      }
    };

    attemptAutoLogin();
  }, [onLoginSuccess]);

  /**
   * Validaciones en tiempo real
   */
  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case 'email':
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Email inválido';
        } else {
          delete errors.email;
        }
        break;

      case 'password':
        if (value.length < 8) {
          errors.password = 'Mínimo 8 caracteres';
        } else {
          delete errors.password;
        }
        break;

      case 'confirmPassword':
        if (mode === 'register' && value !== formData.password) {
          errors.confirmPassword = 'Las contraseñas no coinciden';
        } else {
          delete errors.confirmPassword;
        }
        break;

      case 'businessName':
        if (value.trim().length < 2) {
          errors.businessName = 'Mínimo 2 caracteres';
        } else {
          delete errors.businessName;
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
  };

  /**
   * Manejar cambios en inputs
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Limpiar errores al escribir
    if (error) setError('');
    if (success) setSuccess('');

    // Validar campo
    if (type !== 'checkbox') {
      validateField(name, newValue);
    }
  };

  /**
   * Manejar submit de login
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      setSuccess('Inicio de sesión exitoso');

      // Pequeño delay para mostrar animación de éxito
      setTimeout(() => {
        onLoginSuccess(response.user);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');

      // Shake animation en error
      const form = document.getElementById('auth-form');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);

    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar submit de registro
   */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Verificar que no haya errores de validación
    if (Object.keys(validationErrors).length > 0) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);

    try {
      const response = await register(
        formData.email,
        formData.password,
        formData.businessName,
        formData.rememberMe
      );

      setSuccess('Registro exitoso. Bienvenido!');

      setTimeout(() => {
        onLoginSuccess(response.user);
      }, 500);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');

      const form = document.getElementById('auth-form');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);

    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar solicitud de reset de contraseña
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await forgotPassword(resetData.email);
      setSuccess('Si el email existe, recibirás instrucciones para resetear tu contraseña');

      // En desarrollo, mostrar el token
      if (process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          setMode('reset');
        }, 2000);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar solicitud');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Manejar reset de contraseña con token
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (resetData.newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetData.token, resetData.newPassword);
      setSuccess('Contraseña actualizada exitosamente');

      setTimeout(() => {
        setMode('login');
        setResetData({ email: '', token: '', newPassword: '', confirmPassword: '' });
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambiar entre modos
   */
  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setValidationErrors({});
    setFormData({
      email: '',
      password: '',
      businessName: '',
      confirmPassword: '',
      rememberMe: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Floating hearts decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Heart className="absolute top-10 left-10 text-pink-200 w-6 h-6 animate-float" style={{ animationDelay: '0s' }} />
        <Heart className="absolute top-20 right-20 text-pink-300 w-8 h-8 animate-float" style={{ animationDelay: '2s' }} />
        <Heart className="absolute bottom-20 left-1/4 text-pink-200 w-5 h-5 animate-float" style={{ animationDelay: '4s' }} />
        <Heart className="absolute bottom-32 right-1/3 text-pink-300 w-7 h-7 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-4 shadow-xl transform hover:scale-110 transition-transform duration-300">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Negocios de mi linda
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Inicia sesión para continuar'}
            {mode === 'register' && 'Crea tu cuenta gratis'}
            {mode === 'forgot' && 'Recupera tu contraseña'}
            {mode === 'reset' && 'Establece tu nueva contraseña'}
          </p>
        </div>

        {/* Card principal */}
        <div
          id="auth-form"
          className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm bg-opacity-95 transform transition-all duration-300 hover:shadow-3xl"
        >
          {/* Mensajes de error/éxito */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 animate-slide-in">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="ml-2 text-gray-700 group-hover:text-gray-900 transition-colors">
                    Recordarme
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>

              {/* Switch to Register */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Regístrate gratis
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Business Name */}
              <div className="space-y-2">
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Nombre de tu negocio
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border ${validationErrors.businessName ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                    placeholder="Mi Pupusería"
                  />
                </div>
                {validationErrors.businessName && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.businessName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                    placeholder="tu@email.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3 border ${validationErrors.password ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3 border ${validationErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none`}
                    placeholder="Confirma tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    Mantener sesión iniciada
                  </span>
                </label>
              </div>

              {/* Trial Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">15 días gratis</span> para probar todas las funciones
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || Object.keys(validationErrors).length > 0}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <span>Crear Cuenta Gratis</span>
                )}
              </button>

              {/* Switch to Login */}
              <div className="text-center mt-6">
                <p className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Ingresa tu email y te enviaremos instrucciones para recuperar tu contraseña
                </p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    required
                    value={resetData.email}
                    onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Recuperar Contraseña</span>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}

          {/* RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Ingresa el código que recibiste y tu nueva contraseña
                </p>
              </div>

              {/* Token */}
              <div className="space-y-2">
                <label htmlFor="reset-token" className="block text-sm font-medium text-gray-700">
                  Código de recuperación
                </label>
                <input
                  id="reset-token"
                  name="token"
                  type="text"
                  required
                  value={resetData.token}
                  onChange={(e) => setResetData({ ...resetData, token: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Código de 64 caracteres"
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="reset-new-password" className="block text-sm font-medium text-gray-700">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="reset-new-password"
                    name="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={resetData.newPassword}
                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={resetData.confirmPassword}
                    onChange={(e) => setResetData({ ...resetData, confirmPassword: e.target.value })}
                    className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                    placeholder="Confirma tu nueva contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <span>Actualizar Contraseña</span>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Sistema de Ventas para Microempresas
        </p>
      </div>

      {/* CSS personalizado para animaciones */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.6;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default Login;
