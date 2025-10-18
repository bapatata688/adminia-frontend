/**
 * ============================================
 * LISTA DE PEDIDOS - RESPONSIVE
 * ============================================
 * Vista móvil: Cards expandibles
 * Vista desktop: Tabla tradicional
 */

import { useState, useEffect, useCallback } from 'react';
import { ordersAPI } from '../services/api';
import {
  ShoppingBag,
  DollarSign,
  Edit2,
  Trash2,
  Truck,
  Plus,
  Package,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar
} from 'lucide-react';

function OrdersList({ onNavigate, selectedDate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [selectedDate]);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 Cargando órdenes para:', selectedDate);

      const response = await ordersAPI.getByDate(selectedDate);
      console.log('✅ Respuesta:', response.data);

      const ordersList = response.data?.data || [];
      setOrders(ordersList);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás segura de eliminar este pedido?')) return;

    try {
      setDeletingId(id);
      await ordersAPI.delete(id);
      await loadOrders();
    } catch (err) {
      alert('Error eliminando pedido: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (order) => {
    onNavigate('newOrder', { editOrder: order });
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
              Pedidos del Día
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1 flex items-center">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-SV', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Resumen - Responsive */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Total Pedidos</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">{orders.length}</p>
            </div>
            <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            Registrados hoy
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-4 md:p-6 transform transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm opacity-90 font-medium">Total Ventas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 md:mt-2">${totalSales.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            Ingresos del día
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      {orders.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 md:p-12 text-center border-2 border-dashed border-blue-200">
          <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-blue-300" />
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
            No hay pedidos para este día
          </h3>
          <p className="text-sm md:text-base text-blue-600 mb-4">
            Crea tu primer pedido del día
          </p>
          <button
            onClick={() => onNavigate('newOrder')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span>Crear Pedido</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-blue-50 overflow-hidden transform transition-all duration-300 hover:shadow-md animate-slideUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              {/* Header del pedido - Siempre visible */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 md:px-6 py-3 md:py-4 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  {/* Info principal */}
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-base md:text-lg font-bold text-gray-800">
                      Pedido #{order.id}
                    </span>
                    {order.is_delivery && (
                      <span className="inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        <Truck className="w-3 h-3 mr-1" />
                        Entrega
                      </span>
                    )}
                  </div>

                  {/* Acciones - Desktop */}
                  <div className="hidden md:flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors flex items-center px-3 py-1.5 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="text-red-500 hover:text-red-700 font-semibold text-sm disabled:opacity-50 transition-colors flex items-center px-3 py-1.5 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>

                  {/* Botón expandir - Móvil */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="md:hidden text-gray-500 hover:text-gray-700 p-2"
                  >
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Total visible en header - Móvil */}
                <div className="md:hidden mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    ${parseFloat(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Contenido del pedido */}
              <div className={`${expandedOrder === order.id || window.innerWidth >= 768 ? 'block' : 'hidden'}`}>
                {/* Vista móvil - Cards */}
                <div className="md:hidden divide-y divide-gray-200">
                  {order.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="p-4 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">
                              {item.product_name}
                            </span>
                            {item.is_small && (
                              <span className="text-xs text-emerald-600">(3x1$)</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 capitalize">
                            {item.masa} • {item.quantity} unidades
                          </p>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          ${parseFloat(item.line_total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {order.is_delivery && order.delivery_cost > 0 && (
                    <div className="p-4 bg-indigo-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Costo de envío</span>
                        <span className="text-sm font-bold text-indigo-600">
                          ${parseFloat(order.delivery_cost).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Acciones - Móvil */}
                  <div className="p-4 bg-gray-50 flex gap-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Vista desktop - Tabla */}
                <div className="hidden md:block p-6">
                  <table className="w-full text-sm">
                    <thead className="text-xs text-gray-500 uppercase border-b">
                      <tr>
                        <th className="text-left pb-3">Producto</th>
                        <th className="text-left pb-3">Masa</th>
                        <th className="text-center pb-3">Cantidad</th>
                        <th className="text-right pb-3">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <span>{item.product_name}</span>
                              {item.is_small && (
                                <span className="text-xs text-emerald-600">(3x1$)</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 capitalize">{item.masa}</td>
                          <td className="py-3 text-center font-medium">{item.quantity}</td>
                          <td className="py-3 text-right font-semibold text-blue-600">
                            ${parseFloat(item.line_total).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {order.is_delivery && order.delivery_cost > 0 && (
                        <tr className="bg-indigo-50">
                          <td className="py-3" colSpan="3">
                            <div className="flex items-center space-x-2">
                              <Truck className="w-4 h-4 text-indigo-600" />
                              <span>Costo de envío</span>
                            </div>
                          </td>
                          <td className="py-3 text-right font-semibold text-indigo-600">
                            ${parseFloat(order.delivery_cost).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Total - Desktop */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">Total del Pedido:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      ${parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Botón flotante para nuevo pedido */}
      <button
        onClick={() => onNavigate('newOrder')}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-full w-14 h-14 md:w-16 md:h-16 shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50"
      >
        <Plus className="w-6 h-6 md:w-7 md:h-7" />
      </button>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out; 
        }
        .animate-slideUp { 
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default OrdersList;
