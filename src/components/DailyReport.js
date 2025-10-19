/**
 * ============================================
 * REPORTE DIARIO - Exportación y Análisis
 * ============================================
 * Migrado a iconos de lucide-react
 */

/**
 * ============================================
 * REPORTE DIARIO - RESPONSIVE
 * ============================================
 * Visualización mejorada con gráficos y animaciones
 */

import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';
import {
  ShoppingBag,
  DollarSign,
  Truck,
  Download,
  BarChart3,
  TrendingUp,
  Package,
  Trophy,
  Medal,
  Award,
  ArrowLeft,
  Calendar,
  AlertCircle,
  FileText,
  Percent
} from 'lucide-react';

function DailyReport({ onNavigate, selectedDate, onDateChange }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [selectedDate]);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Cargando reporte para:', selectedDate);

      const response = await reportsAPI.getDaily(selectedDate);
      console.log('✅ Reporte recibido:', response.data);

      setReport(response.data.data);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await reportsAPI.exportCSV(selectedDate);

      // Crear blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ventas_${selectedDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      alert('Error exportando CSV: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  const avgOrderValue = report?.totals.orders > 0
    ? (report.totals.sales / report.totals.orders).toFixed(2)
    : 0;

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
            Reporte Diario
          </h2>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Selector de Fecha - Responsive */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <label className="block text-sm md:text-base font-medium text-gray-700 mb-3 flex items-center">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
          Selecciona una fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full md:w-auto px-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={loadReport}
                className="text-xs text-red-600 hover:text-red-800 underline mt-2"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards de Métricas - Grid Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Pedidos */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg p-4 md:p-5 transform transition-all duration-300 hover:scale-105 animate-slideUp">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium opacity-90">Pedidos</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{report?.totals.orders || 0}</p>
            </div>
            <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="mt-2 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div className="h-full bg-white bg-opacity-40 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* Ventas */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-4 md:p-5 transform transition-all duration-300 hover:scale-105 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium opacity-90">Ventas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">${(report?.totals.sales || 0).toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="flex items-center text-xs opacity-80 mt-2">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Total del día</span>
          </div>
        </div>

        {/* Entregas */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-4 md:p-5 transform transition-all duration-300 hover:scale-105 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium opacity-90">Entregas</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">{report?.totals.delivery_orders || 0}</p>
            </div>
            <Truck className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            {report?.totals.orders > 0 && (
              <span className="flex items-center">
                <Percent className="w-3 h-3 mr-1" />
                {Math.round((report.totals.delivery_orders / report.totals.orders) * 100)}% del total
              </span>
            )}
          </div>
        </div>

        {/* Promedio */}
        <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl shadow-lg p-4 md:p-5 transform transition-all duration-300 hover:scale-105 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <p className="text-xs md:text-sm font-medium opacity-90">Promedio</p>
              <p className="text-2xl md:text-3xl font-bold mt-1">${avgOrderValue}</p>
            </div>
            <BarChart3 className="w-8 h-8 md:w-10 md:h-10 opacity-80" />
          </div>
          <div className="text-xs opacity-80 mt-2">
            Por pedido
          </div>
        </div>
      </div>

      {/* Botón Exportar - Responsive */}
      <button
        onClick={handleExport}
        disabled={exporting || !report?.totals.orders}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 md:py-4 px-6 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center space-x-2 group text-sm md:text-base"
      >
        {exporting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            <span>Exportar a CSV</span>
          </>
        )}
      </button>

      {/* Tabla de Productos - Responsive */}
      {report?.products && report.products.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 animate-slideUp" style={{ animationDelay: '0.4s' }}>
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
            <h3 className="font-bold text-base md:text-lg text-blue-900 flex items-center">
              <Package className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Detalle de Ventas por Producto
            </h3>
          </div>

          {/* Vista móvil - Cards */}
          <div className="block md:hidden divide-y divide-gray-200">
            {report.products.map((product, idx) => (
              <div key={idx} className="p-4 hover:bg-blue-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{product.name}</span>
                      {product.is_small && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                          3x1$
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 capitalize">{product.masa}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">{product.quantity} uds</p>
                    <p className="text-xs text-teal-600 font-semibold">${product.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-blue-100">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Masa
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 bg-white">
                {report.products.map((product, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                        {product.is_small && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                            3x1$
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 capitalize font-medium">{product.masa}</span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold text-blue-700 bg-blue-100">
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-bold text-teal-600">
                        ${product.total.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <tr>
                  <td colSpan="3" className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm font-bold text-blue-900">
                    TOTAL GENERAL:
                  </td>
                  <td className="px-4 lg:px-6 py-3 lg:py-4 text-right text-lg font-bold text-blue-700">
                    ${(report?.totals.sales || 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Total móvil */}
          <div className="md:hidden bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-t border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-blue-900">TOTAL GENERAL:</span>
              <span className="text-lg font-bold text-blue-700">
                ${(report?.totals.sales || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 md:p-12 text-center border-2 border-dashed border-blue-200">
          <Package className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-blue-300 animate-bounce" />
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">No hay datos para este día</h3>
          <p className="text-sm md:text-base text-blue-600">Selecciona una fecha diferente o crea pedidos</p>
        </div>
      )}

      {/* Top 5 Productos - Responsive */}
      {report?.top_products && report.top_products.length > 0 && (
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-lg p-4 md:p-6 border border-blue-100 animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <h3 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-blue-900 flex items-center">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 mr-2" />
            Top 5 Productos Más Vendidos
          </h3>
          <div className="space-y-3 md:space-y-4">
            {report.top_products.map((product, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 md:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-blue-100 hover:border-blue-300 transform hover:scale-[1.02]"
              >
                <div className="flex items-center space-x-3 md:space-x-4 flex-1">
                  <div className={`
                    flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-bold text-lg md:text-xl flex-shrink-0
                    ${idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white shadow-lg' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-md' :
                          'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'}
                  `}>
                    {idx === 0 ? <Trophy className="w-5 h-5 md:w-6 md:h-6" /> :
                      idx === 1 ? <Medal className="w-5 h-5 md:w-6 md:h-6" /> :
                        idx === 2 ? <Award className="w-5 h-5 md:w-6 md:h-6" /> :
                          idx + 1}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm md:text-lg">{product.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-700 text-base md:text-lg">{product.quantity} uds</div>
                  <div className="text-xs md:text-sm text-teal-600 font-semibold">${product.total.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          animation: slideUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

export default DailyReport;
