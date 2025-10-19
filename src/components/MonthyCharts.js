/**
 * ============================================
 * GRÁFICOS MENSUALES - NUEVO COMPONENTE
 * ============================================
 * Visualización de datos con gráficos interactivos
 * 
 * INSTALACIÓN NECESARIA:
 * npm install recharts
 */

import { useState, useEffect, useCallback } from 'react';
import { reportsAPI } from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowLeft,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  Download
} from 'lucide-react';

function MonthlyCharts({ onNavigate }) {
  const [chartType, setChartType] = useState('ingresos'); // 'ingresos', 'productos', 'top5'
  const [viewType, setViewType] = useState('bar'); // 'bar', 'line', 'pie'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadMonthlyData();
  }, [selectedMonth]);

  const loadMonthlyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      console.log('📊 Cargando datos mensuales:', startDate, 'a', endDate);

      const response = await reportsAPI.getSummary(startDate, endDate);
      console.log('✅ Datos recibidos:', response.data);

      setData(response.data.data);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  const goToPreviousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1));
  };

  // Preparar datos según el tipo de gráfico
  const prepareChartData = () => {
    if (!data || !data.daily_sales) return [];

    if (chartType === 'ingresos') {
      return data.daily_sales.map(day => ({
        fecha: new Date(day.business_day).getDate(),
        ventas: parseFloat(day.sales),
        pedidos: parseInt(day.orders)
      }));
    }

    // Para top 5 productos, necesitarías hacer queries adicionales
    // Por ahora retornamos datos de ejemplo
    return [];
  };

  const chartData = prepareChartData();

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const monthName = selectedMonth.toLocaleDateString('es-SV', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando gráficos...</p>
        </div>
      </div>
    );
  }

  const totalSales = data?.totals?.total_sales || 0;
  const totalOrders = data?.totals?.total_orders || 0;
  const avgOrder = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

  return (
    <div className="space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
            Gráficos Mensuales
          </h2>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors text-sm md:text-base"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        {/* Selector de Mes */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>

          <h3 className="text-lg md:text-xl font-bold text-gray-800 capitalize">
            {monthName}
          </h3>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Calendar className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tipo de Datos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Datos:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <button
              onClick={() => setChartType('ingresos')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${chartType === 'ingresos'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <DollarSign className="w-4 h-4" />
              <span className="text-sm">Ingresos</span>
            </button>

            <button
              onClick={() => setChartType('productos')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${chartType === 'productos'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Package className="w-4 h-4" />
              <span className="text-sm">Productos</span>
            </button>

            <button
              onClick={() => setChartType('top5')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 col-span-2 md:col-span-1 ${chartType === 'top5'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Top 5</span>
            </button>
          </div>
        </div>

        {/* Tipo de Visualización */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Gráfico:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setViewType('bar')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${viewType === 'bar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Barras</span>
            </button>

            <button
              onClick={() => setViewType('line')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${viewType === 'line'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Líneas</span>
            </button>

            <button
              onClick={() => setViewType('pie')}
              className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${viewType === 'pie'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <PieChartIcon className="w-4 h-4" />
              <span className="text-sm">Circular</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-4 text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">${parseFloat(totalSales).toFixed(2)}</p>
          <p className="text-xs opacity-90 mt-1">Total Ventas</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg p-4 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">{totalOrders}</p>
          <p className="text-xs opacity-90 mt-1">Pedidos</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
          <p className="text-2xl font-bold">${avgOrder}</p>
          <p className="text-xs opacity-90 mt-1">Promedio</p>
        </div>
      </div>

      {/* Gráfico */}
      {chartData.length > 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-4 md:p-6">
          <div className="h-64 md:h-96">
            <ResponsiveContainer width="100%" height="100%">
              {viewType === 'bar' && (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ventas" fill="#3b82f6" name="Ventas ($)" />
                  <Bar dataKey="pedidos" fill="#10b981" name="Pedidos" />
                </BarChart>
              )}

              {viewType === 'line' && (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="fecha"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ventas"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Ventas ($)"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pedidos"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Pedidos"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              )}

              {viewType === 'pie' && (
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ fecha, ventas }) => `Día ${fecha}: ${ventas}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="ventas"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-8 md:p-12 text-center border-2 border-dashed border-blue-200">
          <BarChart3 className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-blue-300" />
          <h3 className="text-lg md:text-xl font-bold text-blue-900 mb-2">
            No hay datos para este mes
          </h3>
          <p className="text-sm md:text-base text-blue-600">
            Selecciona un mes diferente o registra ventas
          </p>
        </div>
      )}

      {/* Botón Exportar */}
      <button
        onClick={() => alert('Función de exportar en desarrollo')}
        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center space-x-2"
      >
        <Download className="w-5 h-5" />
        <span>Exportar Gráfico</span>
      </button>

      {/* Animaciones CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { 
          animation: fadeIn 0.5s ease-out; 
        }
      `}</style>
    </div>
  );
}

export default MonthlyCharts;
