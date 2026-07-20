import React, { useState } from 'react';
import { ArrowLeft, Sun, Moon, Trash2, Download, ShieldAlert, Check, Sparkles, Settings, Volume2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playSuccess } from '../utils/soundManager';

export default function SettingsScreen({ store, saveStore, onClearData, onBack }) {
  const { theme, setTheme } = useTheme();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const soundEnabled = store.soundEnabled !== false;

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    if (saveStore) {
      saveStore({
        ...store,
        soundEnabled: nextVal
      });
    }
    if (nextVal) {
      setTimeout(() => {
        playSuccess();
      }, 50);
    }
  };

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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 'light', name: 'Atómico Claro', desc: 'Luminoso y limpio', bg: '#F7F8FF', card: '#FFFFFF', accent: '#9FA1FF', text: '#1C1B2E' },
              { id: 'dark', name: 'Atómico Oscuro', desc: 'Relajante y profundo', bg: '#070824', card: '#10123b', accent: '#9FA1FF', text: '#F0F1FF' },
              { id: 'atardecer-playa', name: 'Atardecer en la Playa', desc: 'Tonos cálidos y playeros', bg: '#CFEBFF', card: '#FFFCE1', accent: '#FFBE91', text: '#4A3E3D' },
              { id: 'lavanda-nocturno', name: 'Lavanda Nocturno', desc: 'Misterioso y relajante', bg: '#424874', card: '#A6B1E1', accent: '#F4EEFF', text: '#1E2238' },
              { id: 'menta-glacial', name: 'Menta Glacial', desc: 'Fresco e invernal', bg: '#E3FDFD', card: '#CBF1F5', accent: '#71C9CE', text: '#2B4F52' },
              { id: 'sunset-cyberpunk', name: 'Puesta de Sol Cyberpunk', desc: 'Vibrante y tecnológico', bg: '#6A2C70', card: '#B83B5E', accent: '#F9ED69', text: '#FFFBF2' },
              { id: 'bosque-matcha', name: 'Bosque Matcha', desc: 'Natural y orgánico', bg: '#40513B', card: '#609966', accent: '#EDF1D6', text: '#1A2218' },
              { id: 'codigo-dracula', name: 'Código Drácula', desc: 'Estética gótica de código', bg: '#2B2E4A', card: '#53354A', accent: '#E84545', text: '#FFF5F5' },
              { id: 'hacker-puro', name: 'Modo Hacker Puro', desc: 'Contraste negro y rojo terminal', bg: '#000000', card: '#3D0000', accent: '#FF0000', text: '#FFFFFF' },
              { id: 'oficina-nordica', name: 'Oficina Nórdica', desc: 'Minimalismo escandinavo', bg: '#F0F5F9', card: '#C9D6DF', accent: '#1E2022', text: '#1E2022' },
              { id: 'cyber-purple', name: 'Neon Cyber-Purple', desc: 'Oscuridad con acentos neón', bg: '#000000', card: '#52057B', accent: '#BC6FF1', text: '#FFFFFF' },
              { id: 'profundo-oceano', name: 'Profundidades del Océano', desc: 'Azules abisales profundos', bg: '#070F2B', card: '#1B1A55', accent: '#9290C3', text: '#F0F4FF' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all duration-300 relative text-left ${
                  theme === opt.id
                    ? 'border-frida-primary bg-frida-secondary/20 shadow-md font-bold'
                    : 'border-frida-primary/15 dark:border-lavender-950/40 hover:bg-frida-secondary/10 dark:hover:bg-frida-primary/5 text-warmgray-450'
                }`}
              >
                {theme === opt.id && (
                  <span className="absolute top-3 right-3 bg-frida-primary text-light-text rounded-full p-0.5 z-10">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <span className="text-sm font-bold text-light-text dark:text-dark-text">{opt.name}</span>
                <span className="text-[10px] text-warmgray-450 dark:text-warmgray-400 mt-0.5 line-clamp-1">{opt.desc}</span>
                
                {/* Visual Palette Representation */}
                <div className="flex gap-1.5 mt-4 w-full">
                  <div className="w-4 h-4 rounded-full border border-frida-primary/20 shadow-sm" style={{ backgroundColor: opt.bg }} title="Fondo" />
                  <div className="w-4 h-4 rounded-full border border-frida-primary/20 shadow-sm" style={{ backgroundColor: opt.card }} title="Tarjetas" />
                  <div className="w-4 h-4 rounded-full border border-frida-primary/20 shadow-sm" style={{ backgroundColor: opt.accent }} title="Acento" />
                  <div className="w-4 h-4 rounded-full border border-frida-primary/20 shadow-sm" style={{ backgroundColor: opt.text }} title="Texto" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* SECCIÓN AUDIO */}
        <section className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-6 shadow-sm transition-all duration-300">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-1 flex items-center gap-2">
            <Volume2 size={20} className="text-frida-primary" />
            <span>Audio</span>
          </h2>
          <p className="text-xs text-warmgray-450 mb-6">
            Controla los efectos de sonido y la retroalimentación auditiva de la aplicación.
          </p>

          <div className="flex items-center justify-between p-4 bg-frida-secondary/10 dark:bg-frida-primary/5 border border-frida-primary/15 dark:border-lavender-950/30 rounded-2xl">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-light-text dark:text-dark-text">Efectos de sonido de la app</span>
              <span className="text-xs text-warmgray-455">Sonidos sutiles al responder y completar mazos.</span>
            </div>
            
            {/* Toggle Switch */}
            <button
              onClick={handleToggleSound}
              aria-label="Alternar efectos de sonido"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                soundEnabled ? 'bg-[#9FA1FF]' : 'bg-warmgray-250 dark:bg-lavender-950/60'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
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
