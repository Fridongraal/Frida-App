import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function ActivityHeatmap({ reviewHistory = [] }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Mapa de fechas a cantidad de repasos
  const reviewCountsByDate = useMemo(() => {
    const map = {};
    if (Array.isArray(reviewHistory)) {
      reviewHistory.forEach((entry) => {
        if (!entry || !entry.date) return;
        map[entry.date] = (map[entry.date] || 0) + 1;
      });
    }
    return map;
  }, [reviewHistory]);

  // Genera la grilla del mes seleccionado
  const { calendarDays, totalMonthReviews } = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Índice basado en Lunes (0 = Lunes, 6 = Domingo)
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Espacios vacíos de inicio de mes
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    let monthTotal = 0;

    // Días del mes (1..daysInMonth)
    for (let day = 1; day <= daysInMonth; day++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const count = reviewCountsByDate[dateKey] || 0;
      monthTotal += count;

      days.push({
        dayNumber: day,
        dateKey,
        count,
      });
    }

    return { calendarDays: days, totalMonthReviews: monthTotal };
  }, [year, month, reviewCountsByDate]);

  // Intensidad de color basada en la cantidad de repasos
  const getIntensityClass = (count) => {
    if (count === 0) {
      return 'bg-warmgray-100/60 dark:bg-dark-muted/30 border border-frida-primary/10 dark:border-dark-muted/40 text-warmgray-400 dark:text-warmgray-500';
    }
    if (count <= 5) {
      return 'bg-frida-secondary/35 dark:bg-frida-primary/30 border border-frida-primary/30 text-frida-primary dark:text-frida-secondary font-bold';
    }
    if (count <= 15) {
      return 'bg-frida-secondary/75 dark:bg-frida-primary/65 border border-frida-primary/40 text-light-text dark:text-white font-bold';
    }
    return 'bg-frida-primary text-light-text font-black border border-frida-primary shadow-xs';
  };

  return (
    <div className="bg-light-card dark:bg-dark-card border border-frida-primary/15 dark:border-dark-muted rounded-3xl p-5 shadow-sm flex flex-col gap-4 transition-colors duration-300 w-full">
      {/* CABECERA DEL WIDGET */}
      <div className="flex items-center justify-between gap-2 border-b border-frida-primary/10 dark:border-dark-muted/40 pb-3">
        <div className="flex items-center gap-2 text-light-text dark:text-dark-text">
          <span className="p-1.5 rounded-xl bg-frida-secondary/20 dark:bg-frida-primary/15 text-frida-primary">
            <Calendar size={18} />
          </span>
          <div className="flex flex-col">
            <h3 className="text-sm font-extrabold tracking-tight">Actividad</h3>
            <span className="text-[10px] text-warmgray-450 dark:text-warmgray-400 font-semibold">
              {totalMonthReviews} repaso{totalMonthReviews === 1 ? '' : 's'} este mes
            </span>
          </div>
        </div>

        {/* CONTROLES DE NAVEGACIÓN POR MES */}
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl text-warmgray-455 dark:text-warmgray-400 hover:bg-frida-secondary/20 dark:hover:bg-frida-primary/20 hover:text-frida-primary transition-all"
            title="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold text-light-text dark:text-dark-text min-w-[85px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl text-warmgray-455 dark:text-warmgray-400 hover:bg-frida-secondary/20 dark:hover:bg-frida-primary/20 hover:text-frida-primary transition-all"
            title="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* DÍAS DE LA SEMANA */}
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAY_LABELS.map((dayLabel, idx) => (
          <span key={idx} className="text-[11px] font-bold text-warmgray-450 dark:text-warmgray-400">
            {dayLabel}
          </span>
        ))}
      </div>

      {/* MATRIZ DE DÍAS (HEATMAP GRID) */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((item, idx) => {
          if (!item) {
            return <div key={`empty-${idx}`} className="w-full h-7 rounded-lg" />;
          }

          const { dayNumber, dateKey, count } = item;
          const tooltip = `${dayNumber} de ${MONTH_NAMES[month]}: ${count} repaso${count === 1 ? '' : 's'}`;

          return (
            <div
              key={dateKey}
              title={tooltip}
              className={`w-full h-7 rounded-lg flex items-center justify-center text-[10px] cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 ${getIntensityClass(
                count
              )}`}
            >
              {dayNumber}
            </div>
          );
        })}
      </div>

      {/* LEYENDA INFERIOR DE INTENSIDAD */}
      <div className="flex items-center justify-between text-[10px] font-semibold text-warmgray-450 dark:text-warmgray-400 pt-2 border-t border-frida-primary/10 dark:border-dark-muted/40">
        <span>Menos</span>
        <div className="flex items-center gap-1">
          <div
            className="w-3.5 h-3.5 rounded bg-warmgray-100/60 dark:bg-dark-muted/30 border border-frida-primary/10"
            title="0 repasos"
          />
          <div
            className="w-3.5 h-3.5 rounded bg-frida-secondary/35 dark:bg-frida-primary/30 border border-frida-primary/30"
            title="1-5 repasos"
          />
          <div
            className="w-3.5 h-3.5 rounded bg-frida-secondary/75 dark:bg-frida-primary/65 border border-frida-primary/40"
            title="6-15 repasos"
          />
          <div className="w-3.5 h-3.5 rounded bg-frida-primary shadow-xs" title="16+ repasos" />
        </div>
        <span>Más</span>
      </div>
    </div>
  );
}
