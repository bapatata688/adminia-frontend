/**
 * ============================================
 * APP PRINCIPAL - RESPONSIVE CON CHARTS
 * ============================================
 * Optimizado para móviles, tablets y desktops
 * NUEVO: Integración de MonthlyCharts
 */

import { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Menu,
  X as CloseIcon,
  Store,
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  ClipboardList,
  FileText,
  Calendar
} from 'lucide-react';

import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import OrdersList from './components/OrdersList';
import Products from './components/Products';
import DailyReport from './components/DailyReport';
import OpenDays from './components/OpenDays';
import MonthlyCharts from './components/MonthlyCharts';

import {
  isAuthenticated,
  logout,
  getUserFromStorage,
  loginWithRemember
} from './services/auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingOrder, setEditingOrder] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  /**
   * Verificar autenticación al montar
   */
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔐 Verificando autenticación...');

      try {
        if (isAuthenticated()) {
          const user = getUserFromStorage();
          console.log('✅ Usuario encontrado:', user);
          setCurrentUser(user);
          setIsLoggedIn(true);
        } else {
          const rememberToken = localStorage.getItem('rememberToken');

          if (rememberToken) {
            console.log('🔄 Intentando login automático...');
            try {
              const response = await loginWithRemember(rememberToken);
              console.log('✅ Login automático exitoso');
              setCurrentUser(response.user);
              setIsLoggedIn(true);
            } catch (error) {
              console.error('❌ Error en login automático:', error);
              localStorage.removeItem('rememberToken');
            }
          }
        }
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Actualizar título según vista
   */
  useEffect(() => {
    const titles = {
      dashboard: 'Dashboard',
      newOrder: 'Nuevo Pedido',
      orders: 'Pedidos del Día',
      products: 'Productos',
      report: 'Reporte Diario',
      openDays: 'Días Abiertos',
      charts: 'Gráficos Mensuales'
    };

    const businessName = currentUser?.businessName || 'Sistema de Ventas';
    document.title = `${titles[currentView]} - ${businessName}`;
  }, [currentView, currentUser]);

  /**
   * Cerrar menús al cambiar de vista
   */
  useEffect(() => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
  }, [currentView]);

  const handleLoginSuccess = (user) => {
    console.log('✅ Login exitoso:', user);
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      await logout();
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    } finally {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setCurrentView('dashboard');
      setShowUserMenu(false);
      setShowMobileMenu(false);
    }
  };

  const navigate = (view, options = {}) => {
    setCurrentView(view);
    if (options.editOrder) {
      setEditingOrder(options.editOrder);
    } else {
      setEditingOrder(null);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigate} selectedDate={selectedDate} />;
      case 'newOrder':
        return (
          <NewOrder
            onNavigate={navigate}
            editingOrder={editingOrder}
            selectedDate={selectedDate}
          />
        );
      case 'orders':
        return (
          <OrdersList
            onNavigate={navigate}
            selectedDate={selectedDate}
          />
        );
      case 'products':
        return <Products onNavigate={navigate} />;
      case 'report':
        return (
          <DailyReport
            onNavigate={navigate}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        );
      case 'charts':
        return <MonthlyCharts onNavigate={navigate} />;
      case 'openDays':
        return <OpenDays onNavigate={navigate} />;
      default:
        return <Dashboard onNavigate={navigate} selectedDate={selectedDate} />;
    }
  };

  const getTrialDaysRemaining = () => {
    if (!currentUser || !currentUser.trialEndsAt) return 0;

    const trialEnd = new Date(currentUser.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const trialDaysRemaining = getTrialDaysRemaining();
  const showTrialWarning = trialDaysRemaining <= 5 && trialDaysRemaining > 0;

  // Estado actual para resaltar botón activo
  const isActiveView = (view) => currentView === view;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Responsive */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            {/* Logo y nombre */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <Store className="w-6 h-6 md:w-7 md:h-7" />
              <div>
                <h1 className="text-base md:text-xl font-bold truncate max-w-[150px] sm:max-w-none">
                  {currentUser?.businessName || 'Mi Negocio'}
                </h1>
                <p className="text-xs opacity-90 hidden sm:block">Sistema de Ventas</p>
              </div>
            </div>

            {/* Botones de navegación - Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {showTrialWarning && (
                <div className="bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-lg text-xs">
                  {trialDaysRemaining} días restantes
                </div>
              )}

              <button
                onClick={() => navigate('dashboard')}
                className={`text-sm px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${isActiveView('dashboard')
                    ? 'bg-white bg-opacity-30 font-semibold'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <Home className="w-4 h-4" />
                <span>Inicio</span>
              </button>

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-all"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm max-w-[120px] truncate">{currentUser?.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentUser?.businessName}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{currentUser?.email}</p>
                      {trialDaysRemaining > 0 && (
                        <p className="text-xs text-blue-600 mt-1">
                          Trial: {trialDaysRemaining} días restantes
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Menú hamburguesa - Mobile & Tablet */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
            >
              {showMobileMenu ? (
                <CloseIcon className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Trial warning móvil */}
          {showTrialWarning && (
            <div className="lg:hidden mt-2 bg-yellow-500 bg-opacity-20 px-3 py-2 rounded-lg text-center text-xs">
              {trialDaysRemaining} días restantes de prueba
            </div>
          )}
        </div>

        {/* Menú móvil desplegable */}
        {showMobileMenu && (
          <div className="lg:hidden bg-blue-700 border-t border-blue-500 animate-slide-down">
            <div className="container mx-auto px-4 py-4 space-y-2">
              {/* Dashboard */}
              <button
                onClick={() => navigate('dashboard')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('dashboard')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </button>

              {/* Productos */}
              <button
                onClick={() => navigate('products')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('products')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <Package className="w-5 h-5" />
                <span>Productos</span>
              </button>

              {/* Nuevo Pedido */}
              <button
                onClick={() => navigate('newOrder')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('newOrder')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Nuevo Pedido</span>
              </button>

              {/* Pedidos del Día */}
              <button
                onClick={() => navigate('orders')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('orders')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <ClipboardList className="w-5 h-5" />
                <span>Pedidos del Día</span>
              </button>

              {/* Reportes */}
              <button
                onClick={() => navigate('report')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('report')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <FileText className="w-5 h-5" />
                <span>Reportes</span>
              </button>

              {/* Gráficos - NUEVO */}
              <button
                onClick={() => navigate('charts')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('charts')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Gráficos Mensuales</span>
              </button>

              {/* Días Abiertos */}
              <button
                onClick={() => navigate('openDays')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm font-medium flex items-center space-x-3 ${isActiveView('openDays')
                    ? 'bg-white bg-opacity-30'
                    : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Días Abiertos</span>
              </button>

              {/* Separador */}
              <div className="border-t border-blue-500 pt-2 mt-2">
                <div className="px-4 py-2 text-xs text-blue-100">
                  <p className="font-medium truncate">{currentUser?.email}</p>
                  {trialDaysRemaining > 0 && (
                    <p className="mt-1">Trial: {trialDaysRemaining} días</p>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 bg-red-500 bg-opacity-80 hover:bg-opacity-100 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Overlay para cerrar menús */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-20"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}

      {/* Contenido principal */}
      <main className="container mx-auto px-2 sm:px-4 py-4 md:py-6 max-w-7xl">
        {renderView()}
      </main>

      {/* Footer Responsive */}
      <footer className="bg-white border-t border-blue-100 mt-8 py-4 shadow-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs md:text-sm font-medium text-gray-600">
            Sistema de Ventas - {currentUser?.businessName}
          </p>
          <p className="text-xs mt-1 text-gray-500">
            {new Date().toLocaleDateString('es-SV', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </footer>

      {/* Estilos de animaciones */}
      <style>{`
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

        @keyframes slide-down {
          from {
            max-height: 0;
            opacity: 0;
          }
          to {
            max-height: 600px;
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        /* Mejoras de scroll en móviles */
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
