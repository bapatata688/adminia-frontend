/**
 * ============================================
 * DASHBOARD - Vista Principal
 * ============================================
 * Diseño mejorado con:
 * - Iconos de lucide-react
 * - Gradientes azules y tonos complementarios
 * - Animaciones suaves de entrada
 * - Cards con efectos hover
 * - Bordes y sombras sutiles
 */

/**
 * ============================================
 * DASHBOARD - Vista Principal RESPONSIVE
 * ============================================
 * Optimizado para: móviles, tablets, laptops
 * Paleta: Azul-Cyan, Emerald-Teal
 * Iconos: lucide-react
 */

import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Truck,
  Plus,
  ClipboardList,
  Package,
  BarChart3,
  Calendar,
  TrendingUp,
  AlertCircle,
  Store
} from 'lucide-react';

function Dashboard({ onNavigate, selectedDate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({
    totalSales: 0,
    orderCount: 0,
    deliveryCount: 0,
    products: []
  });

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Cargando dashboard para:', selectedDate);

      const response = await reportsAPI.getDaily(selectedDate);
      const reportData = response.data;

      console.log('✅ Datos recibidos:', reportData);

      if (!reportData || !reportData.data || !reportData.data.totals) {
        throw new Error('Estructura de respuesta inválida');
      }

      setSummary({
        totalSales: reportData.data.totals.sales || 0,
        orderCount: reportData.data.totals.orders || 0,
        deliveryCount: reportData.data.totals.delivery_orders || 0,
        products: reportData.data.products || []
      });

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Error desconocido';
      setError(errorMessage);
      console.error('❌ Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 md:py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm md:text-base">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const avgOrderValue = summary.orderCount > 0
    ? (summary.totalSales / summary.orderCount).toFixed(2)
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn">
      {/* Header - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6 transform transition-all duration-300 hover:shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
              {/* <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" /> */}
              Dashboard
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-SV', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {/* <button */}
          {/* onClick={loadDashboardData} */}
          {/* className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 text-sm md:text-base" */}
          {/* > */}
          {/* <RefreshCw className="w-4 h-4" /> */}
          {/* <span className="hidden sm:inline">Actualizar</span> */}
          {/* </button> */}
          {/* <button */}
          {/*   onClick={() => onNavigate('charts')} */}
          {/*   className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 md:py-4 px-3 md:px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex flex-col items-center justify-center space-y-1" */}
          {/* > */}
          {/*   <BarChart3 className="w-5 h-5 md:w-6 md:h-6" /> */}
          {/*   <span className="text-xs md:text-sm">Gráficos</span> */}
          {/* </button> */}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slideDown">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Error</p>
              <p className="text-xs md:text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadDashboardData}
                className="text-xs text-red-600 hover:text-red-800 underline mt-2"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Resumen - Grid Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total de Ventas */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Total Ventas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">
                ${summary.totalSales.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="flex items-center text-xs opacity-80 mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Ingresos del día</span>
          </div>
        </div>

        {/* Número de Pedidos */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Pedidos</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{summary.orderCount}</p>
            </div>
            <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            Promedio: ${avgOrderValue}
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Entregas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{summary.deliveryCount}</p>
            </div>
            <Truck className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            {summary.orderCount > 0
              ? `${Math.round((summary.deliveryCount / summary.orderCount) * 100)}% del total`
              : 'Sin pedidos'}
          </div>
        </div>

        {/* Productos Vendidos */}
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Productos</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{summary.products.length}</p>
            </div>
            <Package className="w-10 h-10 md:w-12 md:h-12 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            Tipos diferentes
          </div>
        </div>
      </div>

      {/* Botones de Acción - Grid Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-6">
        {[
          {
            icon: <Plus className="w-7 h-7 md:w-8 md:h-8" />,
            label: "Nuevo Pedido",
            color: "from-blue-600 to-cyan-600",
            action: () => onNavigate("newOrder"),
          },
          {
            icon: <ClipboardList className="w-7 h-7 md:w-8 md:h-8" />,
            label: "Ver Pedidos",
            color: "from-sky-500 to-blue-500",
            action: () => onNavigate("orders"),
          },
          {
            icon: <Store className="w-7 h-7 md:w-8 md:h-8" />,
            label: "Productos",
            color: "from-indigo-500 to-purple-500",
            action: () => onNavigate("products"),
          },
          {
            icon: <BarChart3 className="w-7 h-7 md:w-8 md:h-8" />,
            label: "Reportes",
            color: "from-teal-500 to-emerald-500",
            action: () => onNavigate("report"),
          },
          {
            icon: <Calendar className="w-7 h-7 md:w-8 md:h-8" />,
            label: "Días Abiertos",
            color: "from-violet-500 to-indigo-500",
            action: () => onNavigate("openDays"),
          },
        ].map((btn, i) => (
          <button
            key={i}
            onClick={btn.action}
            className={`
        flex flex-col items-center justify-center
        bg-gradient-to-br ${btn.color}
        text-white font-semibold py-4 md:py-5 px-4 md:px-6
        rounded-2xl shadow-lg backdrop-blur-md bg-opacity-80
        transition-all duration-300 transform
        hover:scale-105 hover:shadow-xl hover:brightness-110
        focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
      `}
          >
            {btn.icon}
            <span className="text-xs md:text-sm mt-2">{btn.label}</span>
          </button>
        ))}
      </div>      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out; 
        }
        .animate-slideDown { 
          animation: slideDown 0.3s ease-out; 
        }
        .animate-slideUp { 
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
