import React from 'react';
import { BookOpen, PlusCircle, Trash2, Layers, Upload } from 'lucide-react';
import { getDeckSummary, isCardDue as isCardDueHelper } from '../utils/fridaStore';

export function isCardDue(card) {
  return isCardDueHelper(card, new Date());
}

export default function DeckList({ decks, onStudy, onAddCard, onDeleteDeck, onOpenCSVImporter }) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 shadow-sm animate-fade-in transition-colors duration-300">
        <div className="w-16 h-16 bg-lavender-50 dark:bg-lavender-950/40 rounded-2xl flex items-center justify-center text-lavender-400 dark:text-lavender-500 mb-4">
          <Layers size={32} />
        </div>
        <h3 className="text-xl font-semibold text-lavender-950 dark:text-white mb-2">No tienes mazos aún</h3>
        <p className="text-warmgray-450 dark:text-warmgray-450 max-w-sm mb-6 text-sm">
          Comienza creando un nuevo mazo de tarjetas para empezar a estudiar con repetición espaciada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
      {decks.map((deck) => {
        const { cardCount: totalCards, dueCards } = getDeckSummary(deck);

        return (
          <div
            key={deck.id}
            className="group relative flex flex-col justify-between p-6 bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 shadow-sm hover:shadow-md hover:border-lavender-200 dark:hover:border-lavender-800 transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lavender-50 dark:bg-lavender-950/40 rounded-xl flex items-center justify-center text-lavender-500 dark:text-lavender-450 group-hover:bg-lavender-100 dark:group-hover:bg-lavender-900/60 transition-colors">
                    <Layers size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-lavender-950 dark:text-white truncate max-w-[200px]" title={deck.name}>
                    {deck.name}
                  </h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Estás seguro de que quieres eliminar el mazo "${deck.name}"?`)) {
                      onDeleteDeck(deck.id);
                    }
                  }}
                  className="p-2 text-warmgray-400 dark:text-warmgray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Eliminar mazo"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p className="text-sm text-warmgray-450 dark:text-warmgray-450 line-clamp-2 mb-6 h-10">
                Sin descripción.
              </p>
            </div>

            <div className="flex items-end justify-between mt-auto">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-warmgray-450 dark:text-warmgray-400 font-medium">Tarjetas</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-lavender-900 dark:text-lavender-300">{totalCards} total</span>
                  {dueCards > 0 ? (
                    <span className="px-2 py-0.5 text-xs font-bold text-lavender-700 dark:text-lavender-300 bg-lavender-100 dark:bg-lavender-950/50 rounded-full animate-pulse">
                      {dueCards} pendientes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 rounded-full">
                      Al día 🎉
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCSVImporter(deck.id)}
                  className="p-2.5 text-lavender-600 dark:text-lavender-450 hover:bg-lavender-50 dark:hover:bg-lavender-950/20 rounded-xl transition-all duration-200"
                  title="Importar desde CSV"
                >
                  <Upload size={20} />
                </button>

                <button
                  onClick={() => onAddCard(deck.id)}
                  className="p-2.5 text-lavender-600 dark:text-lavender-450 hover:bg-lavender-50 dark:hover:bg-lavender-950/20 rounded-xl transition-all duration-200"
                  title="Añadir tarjetas"
                >
                  <PlusCircle size={20} />
                </button>

                <button
                  onClick={() => onStudy(deck.id)}
                  disabled={dueCards === 0}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    dueCards > 0
                      ? 'bg-lavender-500 text-white hover:bg-lavender-600 hover:shadow-sm'
                      : 'bg-warmgray-100 dark:bg-lavender-950/20 text-warmgray-450 dark:text-warmgray-500 cursor-not-allowed'
                  }`}
                >
                  <BookOpen size={16} />
                  Estudiar
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

