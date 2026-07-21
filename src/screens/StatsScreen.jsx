import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Award, Calendar, BookOpen, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatsScreen({ decks, reviewHistory, onBack }) {
  const [hoveredBar, setHoveredBar] = useState(null);

  // 1. Get current date in local YYYY-MM-DD
  const localDate = new Date();
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // 2. Global statistics from decks
  let totalLearned = 0;
  let totalNew = 0;
  
  decks.forEach(deck => {
    deck.cards?.forEach(card => {
      const repetitions = card.repetitions ?? card.algorithm?.repetitions ?? 0;
      if (repetitions > 0) {
        totalLearned++;
      } else {
        totalNew++;
      }
    });
  });

  const totalStudiedToday = reviewHistory.filter(h => h.date === todayStr).length;

  // 3. Last 7 days statistics for the bar chart
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dayStr}`;
    
    // Day label (e.g. "lun", "mar")
    const label = d.toLocaleDateString('es-ES', { weekday: 'short' });
    
    last7Days.push({ dateStr, label });
  }

  const barData = last7Days.map(({ dateStr, label }) => {
    const count = reviewHistory.filter(h => h.date === dateStr).length;
    return { label, count, dateStr };
  });

  const maxReviews = Math.max(...barData.map(d => d.count), 0);
  const maxForScale = maxReviews === 0 ? 1 : maxReviews;

  // 4. Performance / Donut chart calculations
  const totalReviews = reviewHistory.length;
  const correctReviews = reviewHistory.filter(h => h.rating === 2 || h.rating === 3).length;
  const wrongReviews = reviewHistory.filter(h => h.rating === 1).length;
  const effectiveness = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  // SVG parameters for donut chart (Radius = 50, Circumference = 314.16)
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const strokeOffset = circ - (circ * effectiveness) / 100;

  return (
    <div 
      className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)'
      }}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-3 border rounded-2xl transition-all duration-200 hover:opacity-80"
            style={{
              color: 'var(--color-text)',
              borderColor: 'var(--color-secondary)',
              backgroundColor: 'var(--color-card)'
            }}
            title="Volver"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <TrendingUp style={{ color: 'var(--color-accent)' }} />
              <span>Estadísticas de Frida</span>
            </h1>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Visualiza tu rendimiento y el estado de tu progreso de estudio.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Global Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Learned Cards */}
        <div 
          className="rounded-3xl border p-6 shadow-xl flex items-center gap-4 transition-all hover:border-[var(--color-accent)] duration-300"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}
        >
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
              color: 'var(--color-accent)'
            }}
          >
            <Award size={24} />
          </div>
          <div>
            <span 
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Tarjetas Aprendidas
            </span>
            <span 
              className="text-3xl font-extrabold mt-1 block"
              style={{ color: 'var(--color-accent)' }}
            >
              {totalLearned}
            </span>
          </div>
        </div>

        {/* Card 2: New Cards */}
        <div 
          className="rounded-3xl border p-6 shadow-xl flex items-center gap-4 transition-all hover:border-[var(--color-accent)] duration-300"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}
        >
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--color-text) 15%, transparent)',
              color: 'var(--color-text)'
            }}
          >
            <BookOpen size={24} />
          </div>
          <div>
            <span 
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Tarjetas Nuevas
            </span>
            <span 
              className="text-3xl font-extrabold mt-1 block"
              style={{ color: 'var(--color-text)' }}
            >
              {totalNew}
            </span>
          </div>
        </div>

        {/* Card 3: Studied Today */}
        <div 
          className="rounded-3xl border p-6 shadow-xl flex items-center gap-4 transition-all hover:border-[var(--color-accent)] duration-300"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}
        >
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--color-secondary) 15%, transparent)',
              color: 'var(--color-secondary)'
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <span 
              className="text-xs font-semibold uppercase tracking-wider block"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Repasados Hoy
            </span>
            <span 
              className="text-3xl font-extrabold mt-1 block"
              style={{ color: 'var(--color-secondary)' }}
            >
              {totalStudiedToday}
            </span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Section A: Bar Chart - Cards Reviewed Per Day */}
        <div 
          className="rounded-3xl border p-6 shadow-xl flex flex-col justify-between min-h-[350px] transition-all hover:border-[var(--color-accent)] duration-300"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}
        >
          <div>
            <h3 
              className="text-lg font-bold mb-1 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Calendar size={18} style={{ color: 'var(--color-accent)' }} />
              <span>Actividad de los últimos 7 días</span>
            </h3>
            <p 
              className="text-xs"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Número de tarjetas repasadas diariamente en la última semana.
            </p>
          </div>

          <div 
            className="flex-1 flex items-end justify-between gap-3 px-4 pt-8 pb-4 h-48 border-b relative"
            style={{ borderColor: 'color-mix(in srgb, var(--color-secondary) 40%, transparent)' }}
          >
            {barData.map((data, index) => {
              const heightPercent = (data.count / maxForScale) * 85 + 5; // offset for layout
              const isHovered = hoveredBar === index;
              
              return (
                <div 
                  key={index} 
                  className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Bar */}
                  <div 
                    className="w-full rounded-t-lg transition-all duration-300 relative"
                    style={{ 
                      height: `${heightPercent}%`, 
                      backgroundColor: isHovered ? 'var(--color-secondary)' : 'var(--color-accent)',
                      boxShadow: isHovered ? '0 0 12px color-mix(in srgb, var(--color-accent) 40%, transparent)' : 'none'
                    }}
                  />
                  
                  {/* Tooltip */}
                  {isHovered && (
                    <div 
                      className="absolute bottom-full mb-2 border px-2.5 py-1.5 rounded-xl shadow-lg text-[10px] font-bold text-center z-10 whitespace-nowrap animate-fade-in"
                      style={{
                        backgroundColor: 'var(--color-card)',
                        borderColor: 'var(--color-secondary)',
                        color: 'var(--color-text)'
                      }}
                    >
                      <div>{data.count} tarjeta(s)</div>
                      <div 
                        className="text-[8px] mt-0.5"
                        style={{ color: 'var(--color-text)', opacity: 0.6 }}
                      >
                        {data.dateStr}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bar Chart Labels */}
          <div className="flex justify-between gap-3 px-4 pt-2">
            {barData.map((data, index) => (
              <span 
                key={index} 
                className="flex-1 text-center text-xs font-bold uppercase"
                style={{ color: 'var(--color-text)', opacity: 0.8 }}
              >
                {data.label}
              </span>
            ))}
          </div>
        </div>

        {/* Section B: Donut Chart - Performance and Effectiveness */}
        <div 
          className="rounded-3xl border p-6 shadow-xl flex flex-col justify-between min-h-[350px] transition-all hover:border-[var(--color-accent)] duration-300"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-secondary)' }}
        >
          <div>
            <h3 
              className="text-lg font-bold mb-1 flex items-center gap-2"
              style={{ color: 'var(--color-text)' }}
            >
              <Sparkles size={18} style={{ color: 'var(--color-accent)' }} />
              <span>Rendimiento y Efectividad</span>
            </h3>
            <p 
              className="text-xs"
              style={{ color: 'var(--color-text)', opacity: 0.7 }}
            >
              Proporción de respuestas correctas vs fallidas.
            </p>
          </div>

          {totalReviews === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div 
                className="w-16 h-16 rounded-2xl border flex items-center justify-center mb-4 animate-pulse"
                style={{ 
                  backgroundColor: 'color-mix(in srgb, var(--color-text) 5%, transparent)',
                  borderColor: 'color-mix(in srgb, var(--color-secondary) 40%, transparent)',
                  color: 'var(--color-text)'
                }}
              >
                <AlertCircle size={28} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                Sin datos de estudio disponibles
              </p>
              <p 
                className="text-xs mt-1 max-w-[250px]"
                style={{ color: 'var(--color-text)', opacity: 0.6 }}
              >
                Comienza a estudiar tus mazos para generar estadísticas de rendimiento.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
              {/* SVG Circular Donut Chart */}
              <div className="relative w-36 h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Background track (Failure / Secondary color with opacity) */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    style={{ stroke: 'var(--color-secondary)' }}
                    strokeOpacity={0.25}
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Foreground indicator (Success / Accent color) */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    style={{ stroke: 'var(--color-accent)' }}
                    className="transition-all duration-1000 ease-out"
                    strokeWidth="10.5"
                    fill="transparent"
                    strokeDasharray={circ}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text inside the ring */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span 
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {effectiveness}%
                  </span>
                  <span 
                    className="text-[9px] font-bold uppercase tracking-wider mt-0.5"
                    style={{ color: 'var(--color-text)', opacity: 0.7 }}
                  >
                    Aciertos
                  </span>
                </div>
              </div>

              {/* Statistics Legend */}
              <div className="flex flex-col gap-3 justify-center">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  />
                  <div>
                    <span 
                      className="text-xs block font-semibold"
                      style={{ color: 'var(--color-text)', opacity: 0.8 }}
                    >
                      Correctos (Bien + Fácil)
                    </span>
                    <span 
                      className="text-sm font-extrabold"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      {correctReviews} repasos
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: 'var(--color-secondary)', opacity: 0.6 }}
                  />
                  <div>
                    <span 
                      className="text-xs block font-semibold"
                      style={{ color: 'var(--color-text)', opacity: 0.8 }}
                    >
                      Fallos (Otra vez)
                    </span>
                    <span 
                      className="text-sm font-extrabold"
                      style={{ color: 'var(--color-secondary)' }}
                    >
                      {wrongReviews} repasos
                    </span>
                  </div>
                </div>
                <div 
                  className="border-t pt-2 mt-1"
                  style={{ borderColor: 'color-mix(in srgb, var(--color-secondary) 40%, transparent)' }}
                >
                  <span 
                    className="text-[10px] font-bold uppercase"
                    style={{ color: 'var(--color-text)', opacity: 0.6 }}
                  >
                    Repasos Totales: {totalReviews}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helpful Tip */}
      <div 
        className="rounded-2xl border p-4 flex items-start gap-3"
        style={{ 
          backgroundColor: 'color-mix(in srgb, var(--color-card) 50%, transparent)', 
          borderColor: 'color-mix(in srgb, var(--color-secondary) 50%, transparent)' 
        }}
      >
        <CheckCircle2 style={{ color: 'var(--color-accent)' }} className="shrink-0 mt-0.5" size={16} />
        <p 
          className="text-xs leading-relaxed"
          style={{ color: 'var(--color-text)', opacity: 0.9 }}
        >
          <strong style={{ color: 'var(--color-accent)' }}>Tip de Retención:</strong> Mantener una efectividad de aciertos superior al 80-90% indica que tu intervalo de repaso es el correcto. Si baja del 80%, considera presionar "Otra vez" más seguido para reajustar la facilidad del algoritmo SuperMemo-2.
        </p>
      </div>

    </div>
  );
}
