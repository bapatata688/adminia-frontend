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

import React from 'react';
import { useState, useEffect } from 'react';
import { ordersAPI, reportsAPI } from '../services/api';
import {
  DollarSign,
  ShoppingBag,
  Truck,
  Plus,
  ClipboardList,
  Cookie,
  BarChart3,
  Calendar,
  RefreshCw,
  Package
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

  useEffect(() => {
    loadDashboardData();
  }, [selectedDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener reporte del día
      const reportData = await reportsAPI.getDaily(selectedDate);

      setSummary({
        totalSales: reportData.data.totals.sales,
        orderCount: reportData.data.totals.orders,
        deliveryCount: reportData.data.totals.delivery_orders,
        products: reportData.data.products || []
      });
    } catch (err) {
      setError(err.message);
      console.error('Error cargando dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Título y Fecha */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-6 transform transition-all duration-300 hover:shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard de mi linda</h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-SV', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-slideDown">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total de Ventas */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Total de Ventas</p>
              <p className="text-3xl font-bold mt-2">
                ${summary.totalSales.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Número de Pedidos */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Pedidos</p>
              <p className="text-3xl font-bold mt-2">{summary.orderCount}</p>
            </div>
            <ShoppingBag className="w-12 h-12 opacity-80" />
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 font-medium">Entregas</p>
              <p className="text-3xl font-bold mt-2">{summary.deliveryCount}</p>
            </div>
            <Truck className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('newOrder')}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <Plus className="w-6 h-6 mx-auto mb-1" />
          <div>Nuevo Pedido</div>
        </button>

        <button
          onClick={() => onNavigate('orders')}
          className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <ClipboardList className="w-6 h-6 mx-auto mb-1" />
          <div>Ver Pedidos</div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <Cookie className="w-6 h-6 mx-auto mb-1" />
          <div>Productos</div>
        </button>

        <button
          onClick={() => onNavigate('report')}
          className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <BarChart3 className="w-6 h-6 mx-auto mb-1" />
          <div>Reporte</div>
        </button>

        <button
          onClick={() => onNavigate('openDays')}
          className="bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <Calendar className="w-6 h-6 mx-auto mb-1" />
          <div>Días Abiertos</div>
        </button>

        <button
          onClick={loadDashboardData}
          className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          <RefreshCw className="w-6 h-6 mx-auto mb-1" />
          <div>Actualizar</div>
        </button>
      </div>

      {/* Resumen por Producto */}
      {summary.products.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-50 overflow-hidden animate-slideUp">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Package className="w-5 h-5 mr-2" />
              Ventas por Producto
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Masa
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.products.map((product, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.name}
                      {product.is_small && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          3x1$
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                      {product.masa}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 text-right font-semibold">
                      ${product.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sin datos */}
      {summary.orderCount === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-8 text-center animate-fadeIn">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No hay pedidos aún, a chambear mi bonita
          </h3>
          <p className="text-gray-600 mb-4">
            Comienza agregando tu primer pedido del día amor
          </p>
          <button
            onClick={() => onNavigate('newOrder')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Crear Primer Pedido
          </button>
        </div>
      )}

      {/* Animaciones CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.5s ease-out; }
      `}</style>
    </div>
  );
}

export default Dashboard;
