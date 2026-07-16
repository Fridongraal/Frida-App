import React, { useState } from 'react';
import { ArrowLeft, Plus, FolderOpen, X, Settings } from 'lucide-react';
import DeckList from '../components/DeckList';
import { getSubjectSummary } from '../utils/fridaStore';

export default function SubjectViewScreen({
  subject,
  decks,
  onCreateDeck,
  onDeleteDeck,
  onStudy,
  onAddCard,
  onBack,
  onOpenSettings,
  onOpenCSVImporter,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');

  const stats = getSubjectSummary(subject, new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    onCreateDeck(subject.id, newDeckName.trim());
    setNewDeckName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in text-warmgray-900 dark:text-darkText">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-warmgray-450 hover:text-lavender-900 dark:text-warmgray-400 dark:hover:text-lavender-300 transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={18} />
            <span>Volver a Materias</span>
          </button>

          <h1 className="text-3xl font-extrabold text-lavender-950 dark:text-white tracking-tight flex items-center gap-3">
            <span>{subject.name}</span>
            <span className="text-sm font-bold bg-lavender-100 dark:bg-lavender-950/50 text-lavender-700 dark:text-lavender-300 px-2.5 py-0.5 rounded-full">
              Materia
            </span>
          </h1>
          <p className="text-sm text-warmgray-455 dark:text-warmgray-400 mt-1">
            {stats.deckCount} mazo{stats.deckCount === 1 ? '' : 's'} · {stats.cardCount} tarjeta
            {stats.cardCount === 1 ? '' : 's'} · {stats.dueCards} pendiente{stats.dueCards === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-3 text-warmgray-450 hover:text-lavender-650 dark:text-warmgray-300 dark:hover:text-lavender-400 hover:bg-lavender-50 dark:hover:bg-lavender-950/20 rounded-2xl transition-all duration-200"
            title="Configuración"
          >
            <Settings size={20} />
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-lavender-500 hover:bg-lavender-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all duration-200 shadow-sm shadow-lavender-100 dark:shadow-none"
          >
            <Plus size={18} />
            <span>Crear Mazo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-400 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-lavender-900 dark:text-white mt-2">{stats.deckCount}</span>
        </div>
        <div className="bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-400 uppercase tracking-wider">
            Tarjetas
          </span>
          <span className="text-2xl font-bold text-lavender-900 dark:text-white mt-2">{stats.cardCount}</span>
        </div>
        <div className="bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-400 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span className={`text-2xl font-bold mt-2 ${stats.dueCards > 0 ? 'text-lavender-500 dark:text-lavender-450' : 'text-green-500 dark:text-green-400'}`}>
            {stats.dueCards}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-lavender-400 dark:text-lavender-500" />
          <h2 className="text-xl font-bold text-lavender-950 dark:text-white">Mazos dentro de esta materia</h2>
        </div>

        <DeckList
          decks={decks}
          onStudy={onStudy}
          onAddCard={onAddCard}
          onDeleteDeck={onDeleteDeck}
          onOpenCSVImporter={onOpenCSVImporter}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-lavender-950/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-6 w-full max-w-md shadow-2xl relative animate-slide-up transition-colors duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-warmgray-400 dark:text-warmgray-500 hover:text-lavender-950 dark:hover:text-white hover:bg-lavender-50 dark:hover:bg-lavender-950/30 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-lavender-950 dark:text-white mb-1">Crear Nuevo Mazo</h3>
            <p className="text-xs text-warmgray-450 mb-6">
              Este mazo quedará asociado a <span className="font-semibold text-lavender-700 dark:text-lavender-400">{subject.name}</span>.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-lavender-800 dark:text-lavender-400 uppercase tracking-wider mb-1">
                  Nombre del mazo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Verbos Irregulares, Anatomía..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-warmgray-50 dark:bg-lavender-950/20 border border-lavender-100 dark:border-lavender-950 focus:border-lavender-400 focus:bg-white dark:focus:bg-darkCard text-sm text-lavender-950 dark:text-white focus:outline-none transition-all duration-200"
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
                  className="flex-1 py-3 text-sm font-bold bg-lavender-500 hover:bg-lavender-600 text-white rounded-2xl transition-colors duration-200 shadow-sm"
                >
                  Crear Mazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

