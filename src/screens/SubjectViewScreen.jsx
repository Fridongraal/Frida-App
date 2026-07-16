import React, { useState } from 'react';
import { ArrowLeft, Plus, FolderOpen, X } from 'lucide-react';
import DeckList, { isCardDue } from '../components/DeckList';
import { getFolderStats } from '../utils/dataModel';

export default function SubjectViewScreen({
  folder,
  decks,
  onCreateDeck,
  onDeleteDeck,
  onStudy,
  onAddCard,
  onBack,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');

  const stats = getFolderStats(folder.id, decks, isCardDue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    onCreateDeck(folder.id, newDeckName.trim(), newDeckDesc.trim());
    setNewDeckName('');
    setNewDeckDesc('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-warmgray-400 hover:text-lavender-900 transition-colors text-sm font-medium mb-4"
          >
            <ArrowLeft size={18} />
            <span>Volver a Materias</span>
          </button>

          <h1 className="text-3xl font-extrabold text-lavender-950 tracking-tight flex items-center gap-3">
            <span>{folder.name}</span>
            <span className="text-sm font-bold bg-lavender-100 text-lavender-700 px-2.5 py-0.5 rounded-full">
              Materia
            </span>
          </h1>
          <p className="text-sm text-warmgray-400 mt-1">
            {stats.deckCount} mazo{stats.deckCount === 1 ? '' : 's'} · {stats.cardCount} tarjeta
            {stats.cardCount === 1 ? '' : 's'} · {stats.dueCards} pendiente{stats.dueCards === 1 ? '' : 's'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-lavender-500 hover:bg-lavender-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all duration-200 shadow-sm shadow-lavender-100"
        >
          <Plus size={18} />
          <span>Crear Mazo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-lavender-900 mt-2">{stats.deckCount}</span>
        </div>
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Tarjetas
          </span>
          <span className="text-2xl font-bold text-lavender-900 mt-2">{stats.cardCount}</span>
        </div>
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span className={`text-2xl font-bold mt-2 ${stats.dueCards > 0 ? 'text-lavender-500' : 'text-green-500'}`}>
            {stats.dueCards}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-lavender-400" />
          <h2 className="text-xl font-bold text-lavender-950">Mazos dentro de esta materia</h2>
        </div>

        <DeckList
          decks={decks}
          onStudy={onStudy}
          onAddCard={onAddCard}
          onDeleteDeck={onDeleteDeck}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-lavender-950/20 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-lavender-100 p-6 w-full max-w-md shadow-2xl relative animate-slide-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-warmgray-400 hover:text-lavender-950 hover:bg-lavender-50 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-lavender-950 mb-1">Crear Nuevo Mazo</h3>
            <p className="text-xs text-warmgray-400 mb-6">
              Este mazo quedará asociado a <span className="font-semibold text-lavender-700">{folder.name}</span>.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-lavender-800 uppercase tracking-wider mb-1">
                  Nombre del mazo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Verbos Irregulares, Anatomía..."
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-warmgray-50 border border-lavender-100 focus:border-lavender-400 focus:bg-white text-sm text-lavender-950 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-lavender-800 uppercase tracking-wider mb-1">
                  Descripción (Opcional)
                </label>
                <textarea
                  placeholder="Añade una descripción breve..."
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl bg-warmgray-50 border border-lavender-100 focus:border-lavender-400 focus:bg-white text-sm text-lavender-950 focus:outline-none transition-all resize-none"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-semibold text-warmgray-400 hover:bg-warmgray-100 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold bg-lavender-500 hover:bg-lavender-600 text-white rounded-2xl transition-colors shadow-sm"
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
