/**
 * ============================================
 * APLICACIÓN PRINCIPAL - Sistema Pupusería
 * ============================================
 * Componente raíz que maneja la navegación y estado global
 * Sistema mobile-first para control de ventas de pupusas
 * 
 * NUEVA FUNCIONALIDAD:
 * - Sistema de autenticación JWT
 * - Login/Register integrado
 * - Sesión persistente con Remember Me
 * - Auto-refresh de tokens
 * - Protección de rutas
 * 
 * PALETA DE COLORES:
 * - Azul primario: from-blue-600 to-cyan-600
 * - Verde esmeralda: para ventas y confirmaciones
 * - Índigo/Púrpura: para entregas y elementos secundarios
 * - Fondo: gradient from-slate-50 to-blue-50
 */

import { useState, useEffect } from 'react';
import { LogOut, User } from 'lucide-react';

import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard';
import NewOrder from './components/NewOrder';
import OrdersList from './components/OrdersList';
import Products from './components/Products';
import DailyReport from './components/DailyReport';
import OpenDays from './components/OpenDays';

import {
  isAuthenticated,
  logout,
  getUserFromStorage,
  getTrialDaysRemaining,
  setupAxiosInterceptors
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

  /**
   * Verificar autenticación al montar el componente
   */
  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const user = getUserFromStorage();
        setCurrentUser(user);
        setIsLoggedIn(true);
      }
    };

    checkAuth();

    // Configurar interceptores de axios para manejo de tokens
    setupAxiosInterceptors(() => {
      // Callback cuando el usuario no está autorizado
      handleLogout();
    });
  }, []);

  /**
   * Actualizar título de la página según la vista
   */
  useEffect(() => {
    const titles = {
      dashboard: 'Dashboard',
      newOrder: 'Nuevo Pedido',
      orders: 'Pedidos del Día',
      products: 'Productos',
      report: 'Reporte Diario',
      openDays: 'Días Abiertos'
    };

    const businessName = currentUser?.businessName || 'Negocios de mi linda';
    document.title = `${titles[currentView]} - ${businessName}`;
  }, [currentView, currentUser]);

  /**
   * Manejar login exitoso
   */
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  /**
   * Manejar logout
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setCurrentUser(null);
      setIsLoggedIn(false);
      setCurrentView('dashboard');
      setShowUserMenu(false);
    }
  };

  /**
   * Navegar entre vistas
   */
  const navigate = (view, options = {}) => {
    setCurrentView(view);
    if (options.editOrder) {
      setEditingOrder(options.editOrder);
    } else {
      setEditingOrder(null);
    }
    setShowUserMenu(false);
  };

  /**
   * Renderizar vista actual
   */
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

      case 'openDays':
        return <OpenDays onNavigate={navigate} />;

      default:
        return <Dashboard onNavigate={navigate} selectedDate={selectedDate} />;
    }
  };

  /**
   * Si no está autenticado, mostrar Login
   */
  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  /**
   * Calcular días restantes de trial
   */
  const trialDaysRemaining = getTrialDaysRemaining();
  const showTrialWarning = trialDaysRemaining <= 5 && trialDaysRemaining > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header con gradiente azul */}
      <header className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-500 text-white shadow-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo y nombre del negocio */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">♥</div>
              <div>
                <h1 className="text-xl font-bold">{currentUser?.businessName || 'Mi Negocio'}</h1>
                <p className="text-xs opacity-90">Sistema de Ventas</p>
              </div>
            </div>

            {/* Menú de usuario */}
            <div className="flex items-center gap-4">
              {/* Trial warning */}
              {showTrialWarning && (
                <div className="hidden md:block bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-lg text-xs">
                  {trialDaysRemaining} días restantes de prueba
                </div>
              )}

              {/* Botón de inicio */}
              <button
                onClick={() => navigate('dashboard')}
                className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Inicio
              </button>

              {/* Menú desplegable de usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-all duration-300"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline text-sm">{currentUser?.email}</span>
                </button>

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{currentUser?.businessName}</p>
                      <p className="text-xs text-gray-600">{currentUser?.email}</p>
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
          </div>
        </div>

        {/* Trial warning móvil */}
        {showTrialWarning && (
          <div className="md:hidden bg-yellow-500 bg-opacity-20 px-4 py-2 text-center text-xs">
            {trialDaysRemaining} días restantes de periodo de prueba
          </div>
        )}
      </header>

      {/* Cerrar menú al hacer click fuera */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      <main className="container mx-auto px-4 py-6">
        {renderView()}
      </main>

      <footer className="bg-white border-t border-blue-100 mt-8 py-4 shadow-sm">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p className="font-medium">Sistema de Ventas - {currentUser?.businessName}</p>
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

      {/* CSS para animaciones */}
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

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
