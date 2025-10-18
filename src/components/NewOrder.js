/**
 * ============================================
 * NUEVO PEDIDO - Formulario de Registro
 * ============================================
 * Mejoras de diseño:
 * - Inputs con focus ring azul
 * - Tabla con hover effects
 * - Gradientes en botones principales
 * - Animaciones de entrada
 */

/**
 * ============================================
 * NUEVO PEDIDO - Formulario de Registro
 * ============================================
 * Migrado a iconos de lucide-react
 */

/**
 * ============================================
 * NUEVO PEDIDO - Formulario RESPONSIVE
 * ============================================
 * Optimizado para: móviles, tablets, laptops
 * Mejoras: Validaciones visuales, mejor UX
 */

import { useState, useEffect, useCallback } from 'react';
import { productsAPI, ordersAPI } from '../services/api';
import {
  Plus,
  X,
  Trash2,
  ShoppingCart,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Truck,
  DollarSign,
  Save
} from 'lucide-react';

function NewOrder({ onNavigate, editingOrder, selectedDate }) {
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [isDelivery, setIsDelivery] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newItem, setNewItem] = useState({
    product_id: '',
    masa: 'maíz',
    quantity: 1
  });

  useEffect(() => {
    loadProducts();
    if (editingOrder) {
      loadOrderForEdit();
    }
  }, [editingOrder]);

  const loadProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const response = await productsAPI.getAll();
      console.log('📦 Productos cargados:', response.data);

      const productsList = response.data?.data?.data || response.data?.data || [];
      setProducts(productsList);

      if (productsList.length === 0) {
        setError('No hay productos disponibles. Crea productos primero.');
      }
    } catch (err) {
      setError('Error cargando productos: ' + err.message);
      console.error('❌ Error:', err);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadOrderForEdit = useCallback(async () => {
    try {
      const response = await ordersAPI.getById(editingOrder.id);
      const order = response.data.data;

      setItems(order.items.map(item => ({
        product_id: item.product_id,
        masa: item.masa,
        quantity: item.quantity
      })));

      setIsDelivery(order.is_delivery);
      setDeliveryCost(order.delivery_cost > 0 ? order.delivery_cost.toString() : '');
    } catch (err) {
      setError('Error cargando pedido: ' + err.message);
    }
  }, [editingOrder]);

  const calculateItemSubtotal = (item) => {
    const product = products.find(p => p.id === parseInt(item.product_id));
    if (!product) return 0;

    const quantity = parseInt(item.quantity) || 0;
    const price = parseFloat(product.price);

    if (product.is_small) {
      const completeGroups = Math.floor(quantity / 3);
      const remaining = quantity % 3;
      return completeGroups * 1.00 + remaining * price;
    }

    return quantity * price;
  };

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    const delivery = isDelivery ? (parseFloat(deliveryCost) || 0) : 0;
    return itemsTotal + delivery;
  };

  const addItem = () => {
    if (!newItem.product_id) {
      setError('Selecciona un producto');
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (newItem.quantity <= 0) {
      setError('La cantidad debe ser mayor a cero');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setItems([...items, { ...newItem }]);
    setNewItem({ product_id: '', masa: 'maíz', quantity: 1 });
    setError(null);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    if (isDelivery && (!deliveryCost || parseFloat(deliveryCost) < 0)) {
      setError('Ingresa un costo de envío válido');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const orderData = {
        items,
        is_delivery: isDelivery,
        delivery_cost: isDelivery ? parseFloat(deliveryCost) : 0,
        business_day: selectedDate
      };

      if (editingOrder) {
        await ordersAPI.update(editingOrder.id, orderData);
        setSuccess('Pedido actualizado exitosamente');
      } else {
        await ordersAPI.create(orderData);
        setSuccess('Pedido creado exitosamente');
      }

      setTimeout(() => onNavigate('orders'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
            {editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
          </h2>
          <button
            onClick={() => onNavigate('orders')}
            className="text-gray-500 hover:text-gray-700 transition-colors flex items-center text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      </div>

      {/* Mensajes - Responsive */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-slideDown">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-slideDown">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-700 flex-1">{success}</p>
          </div>
        </div>
      )}

      {/* Formulario Agregar Ítem - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Package className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
          Agregar Producto
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          {/* Producto */}
          <div className="md:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Producto *
            </label>
            <select
              value={newItem.product_id}
              onChange={(e) => setNewItem({ ...newItem, product_id: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Seleccionar...</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${parseFloat(product.price).toFixed(2)}
                  {product.is_small ? ' (3x1$)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Masa */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Masa
            </label>
            <select
              value={newItem.masa}
              onChange={(e) => setNewItem({ ...newItem, masa: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="maíz">🌽 Maíz</option>
              <option value="arroz">🍚 Arroz</option>
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              min="1"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        <button
          onClick={addItem}
          className="mt-4 w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          <span>Agregar al Pedido</span>
        </button>
      </div>

      {/* Lista de Ítems */}
      {items.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-50 overflow-hidden animate-slideUp">
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 flex items-center">
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Productos del Pedido ({items.length})
            </h3>
          </div>

          {/* Vista móvil - Cards */}
          <div className="block md:hidden divide-y divide-gray-200">
            {items.map((item, index) => {
              const product = products.find(p => p.id === parseInt(item.product_id));
              const subtotal = calculateItemSubtotal(item);

              return (
                <div key={index} className="p-4 hover:bg-blue-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {product?.name || 'Producto'}
                        </span>
                        {product?.is_small && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                            3x1$
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 capitalize">
                        {item.masa} • {item.quantity} unidades
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-600">Subtotal:</span>
                    <span className="text-sm font-bold text-blue-600">${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Producto
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Masa
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Cantidad
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Subtotal
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => {
                  const product = products.find(p => p.id === parseInt(item.product_id));
                  const subtotal = calculateItemSubtotal(item);

                  return (
                    <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-900">
                        <div className="flex items-center space-x-2">
                          <span>{product?.name || 'Producto'}</span>
                          {product?.is_small && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                              3x1$
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-600 capitalize">
                        {item.masa}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-900 text-center font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-blue-600 text-right font-semibold">
                        ${subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors mx-auto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opciones de Entrega - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-4">
          <input
            type="checkbox"
            id="delivery"
            checked={isDelivery}
            onChange={(e) => setIsDelivery(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="delivery" className="text-sm md:text-base font-medium text-gray-700 flex items-center">
            <Truck className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-600" />
            ¿Entrega a domicilio?
          </label>
        </div>

        {isDelivery && (
          <div className="pl-8 animate-slideDown">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Costo de envío ($) *
            </label>
            <div className="flex items-center space-x-2 max-w-xs">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Total y Guardar - Responsive */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-sm border border-blue-100 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <span className="text-xl md:text-2xl font-bold text-gray-800">Total del Pedido:</span>
          <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('orders')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || items.length === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-lg text-sm md:text-base"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 md:w-5 md:h-5" />
                <span>{editingOrder ? 'Actualizar' : 'Guardar'} Pedido</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animaciones CSS */}
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

export default NewOrder;
