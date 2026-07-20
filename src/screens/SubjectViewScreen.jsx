import React, { useState } from 'react';
import { ArrowLeft, Plus, FolderOpen, X, Settings, Flame, Download, Sparkles, TrendingUp } from 'lucide-react';
import DeckList from '../components/DeckList';
import { getSubjectSummary } from '../utils/fridaStore';
import { getDisplayStreak } from '../utils/streakManager';
import Papa from 'papaparse';

export default function SubjectViewScreen({
  subject,
  decks,
  onCreateDeck,
  onDeleteDeck,
  onStudy,
  onAddCard,
  onBack,
  onOpenSettings,
  onOpenStats,
  onOpenCSVImporter,
  streakCount,
  lastStudyDate,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const displayStreak = getDisplayStreak({ streakCount, lastStudyDate });

  const stats = getSubjectSummary(subject, new Date());

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportDeck = async (deck) => {
    if (!deck.cards || deck.cards.length === 0) {
      triggerToast('El mazo no tiene tarjetas para exportar.');
      return;
    }

    try {
      const data = deck.cards.map(c => ({
        Pregunta: c.front || '',
        Respuesta: c.back || ''
      }));

      const csvContent = Papa.unparse(data, {
        quotes: true,
        newline: '\r\n'
      });

      const defaultFilename = `${deck.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_exportado.csv`;

      let saved = false;
      if (window.electronAPI?.exportDeckToCSV) {
        saved = await window.electronAPI.exportDeckToCSV(defaultFilename, csvContent);
      } else {
        const dataStr = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", defaultFilename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        saved = true;
      }

      if (saved) {
        triggerToast('¡Mazo exportado con éxito!');
      }
    } catch (err) {
      console.error('Error al exportar mazo:', err);
      triggerToast('Error al exportar el mazo.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    onCreateDeck(subject.id, newDeckName.trim());
    setNewDeckName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in text-light-text dark:text-dark-text">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-warmgray-450 hover:text-frida-primary dark:text-warmgray-400 dark:hover:text-frida-secondary transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={18} />
            <span>Volver a Materias</span>
          </button>

          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight flex items-center gap-3">
            <span>{subject.name}</span>
            <span className="text-sm font-bold bg-frida-secondary/30 dark:bg-frida-primary/25 text-frida-primary dark:text-frida-secondary px-2.5 py-0.5 rounded-full">
              Materia
            </span>
          </h1>
          <p className="text-sm text-warmgray-455 dark:text-warmgray-400 mt-1">
            {stats.deckCount} mazo{stats.deckCount === 1 ? '' : 's'} · {stats.cardCount} tarjeta
            {stats.cardCount === 1 ? '' : 's'} · {stats.dueCards} pendiente{stats.dueCards === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily Streak Flame Icon */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-300 shadow-sm ${
              displayStreak.active
                ? 'bg-orange-500/15 dark:bg-orange-500/10 border-orange-500/30 text-orange-500 animate-pulse'
                : 'bg-warmgray-50/50 dark:bg-dark-muted/20 border-warmgray-200 dark:border-dark-muted text-warmgray-450 dark:text-warmgray-400 opacity-60'
            }`}
            title={
              displayStreak.active
                ? `¡Meta diaria cumplida! Racha de ${displayStreak.count} día(s) 🔥`
                : displayStreak.count > 0
                  ? `Estudia 5 tarjetas hoy para mantener tu racha de ${displayStreak.count} día(s)`
                  : 'Completa 5 tarjetas hoy para iniciar tu racha'
            }
          >
            <Flame size={18} fill={displayStreak.active ? "currentColor" : "none"} className={displayStreak.active ? "text-orange-500 animate-bounce" : ""} />
            <span className="text-sm font-extrabold">{displayStreak.count}</span>
          </div>

          <button
            onClick={onOpenStats}
            className="p-3 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-300 dark:hover:text-frida-primary hover:bg-frida-primary/10 dark:hover:bg-frida-primary/20 rounded-2xl transition-all duration-200"
            title="Estadísticas"
          >
            <TrendingUp size={20} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-3 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-300 dark:hover:text-frida-primary hover:bg-frida-primary/10 dark:hover:bg-frida-primary/20 rounded-2xl transition-all duration-200"
            title="Configuración"
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-frida-primary hover:bg-frida-primary/90 active:scale-[0.98] text-light-text font-extrabold rounded-2xl transition-all duration-200 shadow-sm shadow-frida-secondary/30 dark:shadow-none"
          >
            <Plus size={18} />
            <span>Crear Mazo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-450 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{stats.deckCount}</span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-450 uppercase tracking-wider">
            Tarjetas
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{stats.cardCount}</span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-455 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span className={`text-2xl font-bold mt-2 ${stats.dueCards > 0 ? 'text-frida-primary' : 'text-green-500 dark:text-green-400'}`}>
            {stats.dueCards}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-frida-primary" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Mazos dentro de esta materia</h2>
        </div>

        <DeckList
          decks={decks}
          onStudy={onStudy}
          onAddCard={onAddCard}
          onDeleteDeck={onDeleteDeck}
          onOpenCSVImporter={onOpenCSVImporter}
          onExportDeck={handleExportDeck}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-light-bg/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-6 w-full max-w-md shadow-2xl relative animate-slide-up transition-colors duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-warmgray-400 dark:text-warmgray-500 hover:text-light-text dark:hover:text-white hover:bg-frida-secondary/15 dark:hover:bg-frida-primary/10 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-1">Crear Nuevo Mazo</h3>
            <p className="text-xs text-warmgray-450 mb-6">
              Este mazo quedará asociado a <span className="font-semibold text-frida-primary dark:text-dark-muted">{subject.name}</span>.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-frida-primary dark:text-dark-muted uppercase tracking-wider mb-1">
                  Nombre del mazo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Verbos Irregulares, Anatomía..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-dark-muted focus:border-frida-primary focus:bg-light-card dark:focus:bg-dark-card text-sm text-light-text dark:text-dark-text focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-semibold text-warmgray-400 dark:text-warmgray-500 hover:bg-warmgray-100 dark:hover:bg-lavender-950/20 rounded-2xl transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-extrabold bg-frida-primary hover:bg-frida-primary/95 text-light-text rounded-2xl transition-colors duration-200 shadow-sm shadow-frida-secondary/20"
                >
                  Crear Mazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up z-50 text-sm font-semibold border border-frida-primary/30">
          <Sparkles size={16} className="text-frida-primary" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

