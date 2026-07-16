import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, Trash2, Download, ShieldAlert, Check, Sparkles, Settings } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ store, onClearData, onBack }) {
  const { theme, setTheme } = useTheme();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `frida-datos-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast('¡Datos exportados con éxito!');
    } catch (error) {
      console.error('Error al exportar datos:', error);
      triggerToast('Error al exportar los datos');
    }
  };

  const handleClearData = () => {
    onClearData();
    setShowConfirmDelete(false);
    triggerToast('¡Todos los datos han sido eliminados!');
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in text-light-text dark:text-dark-text">
      {/* Botón de regreso */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warmgray-450 hover:text-frida-primary dark:hover:text-frida-secondary transition-colors text-sm font-medium mb-6 self-start"
      >
        <ArrowLeft size={18} />
        <span>Volver al Inicio</span>
      </button>

      {/* Título de la pantalla */}
      <div className="flex items-center gap-3 mb-8 border-b border-frida-primary/15 dark:border-lavender-950/40 pb-4">
        <div className="w-12 h-12 bg-frida-secondary/15 dark:bg-frida-primary/10 rounded-2xl flex items-center justify-center text-frida-primary">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Configuración</h1>
          <p className="text-sm text-warmgray-455 mt-0.5">
            Personaliza el tema visual y gestiona tus datos de estudio.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* SECCIÓN TEMA */}
        <section className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-6 shadow-sm transition-all duration-300">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-1 flex items-center gap-2">
            <span>Tema Visual</span>
          </h2>
          <p className="text-xs text-warmgray-450 mb-6">
            Elige el aspecto visual que mejor se adapte a tu entorno de estudio.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Opción Claro */}
            <button
              onClick={() => setTheme('light')}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 relative ${
                theme === 'light'
                  ? 'border-frida-primary bg-frida-secondary/20 text-light-text shadow-sm font-bold'
                  : 'border-frida-primary/15 dark:border-lavender-950/40 hover:bg-frida-secondary/10 dark:hover:bg-frida-primary/5 text-warmgray-450'
              }`}
            >
              {theme === 'light' && (
                <span className="absolute top-3 right-3 bg-frida-primary text-light-text rounded-full p-0.5">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <Sun size={28} className={theme === 'light' ? 'text-frida-primary' : 'text-warmgray-450'} />
              <span className="text-sm font-bold mt-3">Modo Claro</span>
              <span className="text-[10px] text-warmgray-450 mt-1">Luminoso y limpio</span>
            </button>

            {/* Opción Oscuro */}
            <button
              onClick={() => setTheme('dark')}
              className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300 relative ${
                theme === 'dark'
                  ? 'border-frida-primary bg-frida-primary/20 text-dark-text shadow-sm font-bold'
                  : 'border-frida-primary/15 dark:border-lavender-950/40 hover:bg-frida-secondary/10 dark:hover:bg-frida-primary/5 text-warmgray-450'
              }`}
            >
              {theme === 'dark' && (
                <span className="absolute top-3 right-3 bg-frida-primary text-light-text rounded-full p-0.5">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <Moon size={28} className={theme === 'dark' ? 'text-frida-primary' : 'text-warmgray-450'} />
              <span className="text-sm font-bold mt-3">Modo Oscuro</span>
              <span className="text-[10px] text-warmgray-455 mt-1">Relajante y profundo</span>
            </button>
          </div>
        </section>

        {/* SECCIÓN DATOS */}
        <section className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-6 shadow-sm transition-all duration-300">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-1">Copia de Seguridad y Datos</h2>
          <p className="text-xs text-warmgray-450 mb-6">
            Exporta tus tarjetas para guardarlas o limpia la base de datos de la app.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Exportar */}
            <div className="flex-1 bg-frida-secondary/10 dark:bg-frida-primary/5 border border-frida-primary/15 dark:border-lavender-950/30 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-light-text dark:text-dark-text flex items-center gap-2">
                  <Download size={16} />
                  <span>Exportar Datos</span>
                </h3>
                <p className="text-xs text-warmgray-455 mt-1.5 leading-relaxed">
                  Descarga un archivo JSON de respaldo con todas tus materias, mazos e historial de estudio.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="mt-5 w-full py-2.5 bg-frida-primary hover:bg-frida-primary/90 text-light-text font-bold rounded-xl text-xs transition-colors shadow-sm shadow-frida-primary/10"
              >
                Exportar JSON
              </button>
            </div>

            {/* Borrar Todo */}
            <div className="flex-1 bg-red-50/30 dark:bg-red-950/10 border border-red-100 dark:border-red-950/50 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-red-650 dark:text-red-400 flex items-center gap-2">
                  <Trash2 size={16} />
                  <span>Restablecer Aplicación</span>
                </h3>
                <p className="text-xs text-warmgray-450 mt-1.5 leading-relaxed">
                  Elimina de manera permanente todas las materias, mazos y tarjetas creadas. Esta acción no se puede deshacer.
                </p>
              </div>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="mt-5 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Borrar todos mis datos
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up z-50 text-sm font-semibold border border-frida-primary/30">
          <Sparkles size={16} className="text-frida-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN PARA BORRAR */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-lavender-950/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-6 w-full max-w-md shadow-2xl relative animate-slide-up">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-red-500 dark:text-red-400 mb-4 mx-auto">
              <ShieldAlert size={26} />
            </div>

            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-2 text-center">
              ¿Estás completamente seguro?
            </h3>
            <p className="text-xs text-warmgray-400 mb-6 text-center leading-relaxed">
              Estás a punto de borrar permanentemente todas las materias, mazos y tarjetas de Frida. 
              <strong> Esta acción no se puede deshacer.</strong> Te recomendamos exportar tus datos antes de continuar.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-3 text-sm font-semibold text-warmgray-400 hover:bg-warmgray-100 dark:hover:bg-lavender-950/20 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleClearData}
                className="flex-1 py-3 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors shadow-sm"
              >
                Sí, borrar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
