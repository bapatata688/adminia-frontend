/**
 * ============================================
 * DÍAS ABIERTOS - Gestión de Calendario
 * ============================================
 * Actualizado con iconos Lucide React
 */

/**
 * ============================================
 * DÍAS ABIERTOS - Calendario Visual RESPONSIVE
 * ============================================
 * Nuevo diseño con calendario mensual interactivo
 */

import { useState, useEffect, useCallback } from 'react';
import { openDaysAPI } from '../services/api';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

function OpenDays({ onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [openDays, setOpenDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    loadOpenDays();
  }, [currentDate]);

  const loadOpenDays = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      console.log('📅 Cargando días:', startDate, 'a', endDate);

      const response = await openDaysAPI.getAll(startDate, endDate);
      console.log('✅ Días cargados:', response.data);

      const daysList = response.data?.data || [];
      setOpenDays(daysList);

    } catch (err) {
      setError(err.message);
      console.error('❌ Error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  const handleToggleDay = async (dateStr) => {
    try {
      const existing = openDays.find(d => d.date === dateStr);
      const newStatus = existing ? !existing.is_open : false;

      await openDaysAPI.update(dateStr, newStatus);
      await loadOpenDays();

    } catch (err) {
      alert('Error actualizando día: ' + err.message);
    }
  };

  const getDayStatus = (dateStr) => {
    const day = openDays.find(d => d.date === dateStr);
    if (!day) return 'open'; // Por defecto abierto
    return day.is_open ? 'open' : 'closed';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Días del mes anterior (espacios vacíos)
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const status = getDayStatus(dateStr);
      const isToday = dateStr === new Date().toISOString().split('T')[0];

      days.push({
        day,
        date: dateStr,
        status,
        isToday
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentDate.toLocaleDateString('es-SV', { month: 'long', year: 'numeric' });

  const stats = {
    open: openDays.filter(d => d.is_open).length,
    closed: openDays.filter(d => !d.is_open).length,
    total: openDays.length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm">Cargando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-fadeIn px-2 md:px-0">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-2 text-blue-600" />
            Días Abiertos
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

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl shadow-lg p-4 md:p-5 text-center">
          <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.open}</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Días Abiertos</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg p-4 md:p-5 text-center">
          <XCircle className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.closed}</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Días Cerrados</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl shadow-lg p-4 md:p-5 text-center">
          <Clock className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 opacity-80" />
          <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
          <p className="text-xs md:text-sm opacity-90 mt-1">Configurados</p>
        </div>
      </div>

      {/* Controles del Calendario */}
      <div className="bg-white rounded-xl shadow-sm border border-blue-50 p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>

          <div className="text-center">
            <h3 className="text-lg md:text-xl font-bold text-gray-800 capitalize">{monthName}</h3>
            <button
              onClick={goToToday}
              className="text-xs md:text-sm text-blue-600 hover:text-blue-800 mt-1"
            >
              Ir a hoy
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
          </button>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-6 text-xs md:text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span className="text-gray-700">Abierto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-700">Cerrado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-700">Hoy</span>
          </div>
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* Encabezados de días */}
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => (
            <div
              key={idx}
              className="text-center py-2 text-xs md:text-sm font-bold text-gray-600"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day[0]}</span>
            </div>
          ))}

          {/* Días del mes */}
          {calendarDays.map((dayInfo, idx) => {
            if (!dayInfo) {
              return <div key={`empty-${idx}`} className="aspect-square"></div>;
            }

            const { day, date, status, isToday } = dayInfo;

            return (
              <button
                key={date}
                onClick={() => handleToggleDay(date)}
                className={`
                  aspect-square rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 relative
                  flex flex-col items-center justify-center
                  ${isToday
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white ring-2 ring-blue-300 ring-offset-2'
                    : status === 'closed'
                      ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700'
                      : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                  }
                  shadow-md hover:shadow-lg
                `}
              >
                <span className="text-sm md:text-base font-bold">{day}</span>
                <div className="absolute bottom-1 right-1">
                  {status === 'closed' ? (
                    <X className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
                  ) : (
                    <Check className="w-3 h-3 md:w-4 md:h-4 opacity-70" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs md:text-sm text-blue-800">
            <strong>Instrucciones:</strong> Haz clic en cualquier día para marcarlo como abierto o cerrado.
            Los días marcados como cerrados no permitirán registrar ventas.
          </p>
        </div>
      </div>

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

export default OpenDays;
