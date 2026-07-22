import React from 'react';
import { Flame, TrendingUp, Settings, Upload, FolderPlus } from 'lucide-react';
import logoIcon from '../assets/logo-icon.png';

export default function Navbar({
  displayStreak,
  onOpenStats,
  onOpenSettings,
  onOpenCSVImporter,
  onCreateSubject,
}) {
  return (
    <header className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
      {/* BRAND LOGO CONTAINER */}
      <div className="flex items-center gap-3 group cursor-pointer">
        <div className="relative flex items-center justify-center p-2 rounded-2xl bg-light-card/80 dark:bg-dark-card/80 border border-frida-primary/20 dark:border-dark-muted shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:rotate-2">
          <img
            src={logoIcon}
            alt="Frida Logo"
            className="h-9 w-9 object-contain drop-shadow-sm transition-transform duration-200"
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-light-text dark:text-dark-text tracking-tight uppercase">
              Frida
            </h1>
            <span className="text-[10px] font-extrabold bg-frida-secondary/30 dark:bg-frida-primary/25 text-frida-primary dark:text-frida-secondary px-2.5 py-0.5 rounded-full border border-frida-primary/20">
              Doodle App
            </span>
          </div>
          <p className="text-xs text-warmgray-455 dark:text-warmgray-400 font-medium">
            Repetición espaciada inteligente
          </p>
        </div>
      </div>

      {/* HEADER ACTIONS */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {displayStreak && (
          <div
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-300 shadow-sm ${
              displayStreak.active
                ? 'bg-orange-500/15 dark:bg-orange-500/10 border-orange-500/30 text-orange-500 animate-pulse'
                : 'bg-warmgray-50/50 dark:bg-dark-muted/20 border-warmgray-200 dark:border-dark-muted text-warmgray-400 dark:text-warmgray-455 opacity-60'
            }`}
            title={
              displayStreak.active
                ? `¡Meta diaria cumplida! Racha de ${displayStreak.count} día(s) 🔥`
                : displayStreak.count > 0
                ? `Estudia 5 tarjetas hoy para mantener tu racha de ${displayStreak.count} día(s)`
                : 'Completa 5 tarjetas hoy para iniciar tu racha'
            }
          >
            <Flame
              size={18}
              fill={displayStreak.active ? 'currentColor' : 'none'}
              className={displayStreak.active ? 'text-orange-500 animate-bounce' : ''}
            />
            <span className="text-xs font-extrabold">{displayStreak.count}</span>
          </div>
        )}

        {onOpenStats && (
          <button
            onClick={onOpenStats}
            className="p-2.5 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-300 dark:hover:text-frida-primary hover:bg-frida-primary/10 dark:hover:bg-frida-primary/20 rounded-2xl transition-all duration-200 border border-transparent hover:border-frida-primary/20"
            title="Estadísticas"
          >
            <TrendingUp size={18} />
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-2.5 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-300 dark:hover:text-frida-primary hover:bg-frida-primary/10 dark:hover:bg-frida-primary/20 rounded-2xl transition-all duration-200 border border-transparent hover:border-frida-primary/20"
            title="Configuración"
          >
            <Settings size={18} />
          </button>
        )}

        {onOpenCSVImporter && (
          <button
            onClick={onOpenCSVImporter}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-light-card dark:bg-dark-card hover:bg-frida-secondary/15 dark:hover:bg-frida-secondary/20 text-frida-primary dark:text-frida-secondary border border-frida-primary/30 dark:border-dark-muted font-bold rounded-2xl transition-all duration-200 text-xs shadow-sm"
            title="Importar tarjetas desde CSV"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">Importar CSV</span>
          </button>
        )}

        {onCreateSubject && (
          <button
            onClick={onCreateSubject}
            className="flex items-center gap-2 px-4 py-2.5 bg-frida-primary hover:bg-frida-primary/90 active:scale-[0.98] text-light-text font-extrabold rounded-2xl transition-all duration-200 text-xs shadow-sm shadow-frida-secondary/30"
          >
            <FolderPlus size={16} />
            <span>Nueva Materia</span>
          </button>
        )}
      </div>
    </header>
  );
}
