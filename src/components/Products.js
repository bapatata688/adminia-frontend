/**
 * ============================================
 * PRODUCTOS - Gestión Responsive
 * ============================================
 * FIX: Manejo correcto de respuestas API
 * MEJORA: Diseño responsive para móviles, tablets y laptops
 */

import { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../services/api';
import {
  Plus,
  X,
  Edit2,
  Trash2,
  Save,
  ArrowLeft,
  Package,
  DollarSign,
  Tag,
  AlertCircle
} from 'lucide-react';

function Products({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    masa: 'maíz',
    price: '',
    is_small: false
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const response = await productsAPI.getAll();

      console.log('📦 Respuesta de productos:', response.data);

      // FIX: Manejar la estructura correcta de respuesta
      const productsList = response.data?.data?.data || response.data?.data || [];

      setProducts(productsList);
      console.log(`✅ ${productsList.length} productos cargados`);
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError('Error al cargar productos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      console.log('📝 Enviando producto:', formData);

      if (editing) {
        const response = await productsAPI.update(editing.id, formData);
        console.log('✅ Producto actualizado:', response.data);
      } else {
        const response = await productsAPI.create(formData);
        console.log('✅ Producto creado:', response.data);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error('❌ Error guardando producto:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      masa: product.masa || '',
      price: product.price,
      is_small: product.is_small
    });
    setShowForm(true);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;

    try {
      setError(null);
      await productsAPI.delete(id);
      console.log('✅ Producto eliminado');
      await loadProducts();
    } catch (err) {
      console.error('❌ Error eliminando producto:', err);
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', masa: 'maíz', price: '', is_small: false });
    setEditing(null);
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header - Responsive */}
      <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-sm border border-blue-100 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Productos</h2>
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

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-slideDown">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 hover:text-red-800 mt-1"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Botón Agregar - Responsive */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg"
      >
        {showForm ? (
          <>
            <X className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Cancelar</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Agregar Producto</span>
          </>
        )}
      </button>

      {/* Formulario - Responsive */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-blue-100 p-4 md:p-6 space-y-4 animate-slideDown">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Tag className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            <span>{editing ? 'Editar Producto' : 'Nuevo Producto'}</span>
          </h3>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Revueltas, Queso, etc."
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
              Tipo de Masa
            </label>
            <select
              value={formData.masa || ''}
              onChange={(e) => setFormData({ ...formData, masa: e.target.value })}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              disabled={submitting}
            >
              <option value="">Sin masa (otros productos)</option>
              <option value="maíz">Maíz 🌽</option>
              <option value="arroz">Arroz 🍚</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <DollarSign className="w-3 h-3 md:w-4 md:h-4" />
              <span>Precio *</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              className="w-full px-3 md:px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              required
              disabled={submitting}
            />
          </div>

          <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg border border-green-200">
            <input
              type="checkbox"
              id="is_small"
              checked={formData.is_small}
              onChange={(e) => setFormData({ ...formData, is_small: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              disabled={submitting}
            />
            <label htmlFor="is_small" className="text-xs md:text-sm font-medium text-green-800">
              Aplica promoción 3x1$ (Pupusas pequeñas)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 py-2.5 rounded-lg transition-all flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <X className="w-4 h-4" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-2.5 rounded-lg transition-all transform hover:scale-105 disabled:transform-none flex items-center justify-center space-x-2 shadow-md text-sm md:text-base"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{editing ? 'Actualizar' : 'Guardar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tabla de Productos - Responsive */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        {/* Vista móvil (cards) */}
        <div className="block md:hidden divide-y divide-gray-200">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="p-4 hover:bg-blue-50 transition-colors animate-fadeIn"
              style={{ animationDelay: `${idx * 0.03}s` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-900">{product.name}</span>
                  </div>
                  {product.masa && (
                    <p className="text-sm text-gray-600 ml-6 capitalize">{product.masa}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-100 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-blue-700 bg-blue-100">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                {product.is_small && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                    3x1$
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop/tablet (tabla) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Masa
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((product, idx) => (
                <tr
                  key={product.id}
                  className="hover:bg-blue-50 transition-colors duration-150 animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-900 text-sm lg:text-base">{product.name}</span>
                      {product.is_small && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm">
                          3x1$
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700 capitalize font-medium">
                      {product.masa || '-'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right">
                    <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-lg text-sm font-bold text-blue-700 bg-blue-100">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2 lg:space-x-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-100 rounded"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-100 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 md:px-6 py-3 border-t border-blue-100">
            <p className="text-xs md:text-sm text-gray-600">
              Total de productos: <span className="font-bold text-blue-700">{products.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* Estado vacío */}
      {products.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 md:p-12 text-center border-2 border-dashed border-blue-200">
          <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto text-blue-300 mb-4" />
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">No hay productos registrados</h3>
          <p className="text-sm md:text-base text-blue-600 mb-4">Comienza agregando tu primer producto</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-4 md:px-6 rounded-lg transition-all inline-flex items-center space-x-2 text-sm md:text-base"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Producto</span>
          </button>
        </div>
      )}

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}

export default Products;
