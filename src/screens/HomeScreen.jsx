import React, { useState } from 'react';
import { FolderPlus, Layers, X, ChevronRight, AlertCircle } from 'lucide-react';
import { isCardDue } from '../components/DeckList';
import { getSubjectSummary } from '../utils/fridaStore';

export default function HomeScreen({ folders, decks, onCreateFolder, onOpenFolder }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const totalFolders = folders.length;
  const totalDecks = decks.length;
  const totalDue = decks.reduce(
    (acc, deck) => acc + (deck.cards?.filter(isCardDue).length || 0),
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    onCreateFolder(newFolderName.trim());
    setNewFolderName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-lavender-950 tracking-tight flex items-center gap-2">
            <span>Frida</span>
            <span className="text-sm font-bold bg-lavender-100 text-lavender-700 px-2.5 py-0.5 rounded-full">
              MVP
            </span>
          </h1>
          <p className="text-sm text-warmgray-400 mt-1">
            Organiza tus mazos por materia y estudia con un flujo más claro.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-3 bg-lavender-500 hover:bg-lavender-600 active:scale-[0.98] text-white font-bold rounded-2xl transition-all duration-200 shadow-sm shadow-lavender-100"
        >
          <FolderPlus size={18} />
          <span>Nueva Materia</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Materias
          </span>
          <span className="text-2xl font-bold text-lavender-900 mt-2">{totalFolders}</span>
        </div>
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-lavender-900 mt-2">{totalDecks}</span>
        </div>
        <div className="bg-white rounded-3xl border border-lavender-100 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-warmgray-400 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span className={`text-2xl font-bold mt-2 ${totalDue > 0 ? 'text-lavender-500' : 'text-green-500'}`}>
            {totalDue}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-lavender-400" />
          <h2 className="text-xl font-bold text-lavender-950">Tus Materias</h2>
        </div>

        {folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-lavender-100 shadow-sm animate-fade-in">
            <div className="w-16 h-16 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-400 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-semibold text-lavender-950 mb-2">No tienes materias aún</h3>
            <p className="text-warmgray-400 max-w-sm mb-6">
              Crea tu primera carpeta para empezar a organizar mazos por tema.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-colors"
            >
              Crear Materia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {folders.map((folder) => {
              const stats = getSubjectSummary(
                {
                  ...folder,
                  decks: decks
                    .filter((deck) => deck.folderId === folder.id)
                    .map((deck) => ({
                      ...deck,
                      cards: deck.cards || [],
                    })),
                },
                new Date()
              );

              return (
                <button
                  key={folder.id}
                  onClick={() => onOpenFolder(folder.id)}
                  className="text-left group relative flex flex-col justify-between p-6 bg-white rounded-3xl border border-lavender-100 shadow-sm hover:shadow-md hover:border-lavender-200 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-500 group-hover:bg-lavender-100 transition-colors">
                        <Layers size={22} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-lavender-950">{folder.name}</h3>
                        <p className="text-sm text-warmgray-400 mt-1">
                          {stats.deckCount} mazo{stats.deckCount === 1 ? '' : 's'} dentro de esta materia
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-warmgray-300 group-hover:text-lavender-400 transition-colors mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="rounded-2xl bg-lavender-50/70 border border-lavender-100 p-3">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-lavender-500">
                        Mazos
                      </span>
                      <span className="block text-xl font-bold text-lavender-950 mt-1">{stats.deckCount}</span>
                    </div>
                    <div className="rounded-2xl bg-white border border-lavender-100 p-3">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-warmgray-400">
                        Pendientes
                      </span>
                      <span className={`block text-xl font-bold mt-1 ${stats.dueCards > 0 ? 'text-lavender-500' : 'text-green-500'}`}>
                        {stats.dueCards}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 text-sm">
                    <span className="text-warmgray-400">
                      {stats.cardCount} tarjeta{stats.cardCount === 1 ? '' : 's'} en total
                    </span>
                    <span className="inline-flex items-center gap-1 text-lavender-600 font-semibold">
                      Abrir
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
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

            <h3 className="text-xl font-bold text-lavender-950 mb-1">Crear Nueva Materia</h3>
            <p className="text-xs text-warmgray-400 mb-6">
              Agrupa tus mazos por tema para mantener la organización simple.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-lavender-800 uppercase tracking-wider mb-1">
                  Nombre de la materia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Programación, Inglés, Medicina..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-warmgray-50 border border-lavender-100 focus:border-lavender-400 focus:bg-white text-sm text-lavender-950 focus:outline-none transition-all"
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
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
