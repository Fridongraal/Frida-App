import React from 'react';
import { BookOpen, PlusCircle, Trash2, Layers } from 'lucide-react';

/**
 * Función para verificar si una tarjeta está pendiente para estudio hoy.
 */
export function isCardDue(card) {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Incluye todo el día de hoy
  return new Date(card.nextReviewDate) <= now;
}

export default function DeckList({ decks, onStudy, onAddCard, onDeleteDeck }) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-lavender-100 shadow-sm animate-fade-in">
        <div className="w-16 h-16 bg-lavender-50 rounded-2xl flex items-center justify-center text-lavender-400 mb-4">
          <Layers size={32} />
        </div>
        <h3 className="text-xl font-semibold text-lavender-950 mb-2">No tienes mazos aún</h3>
        <p className="text-warmgray-400 max-w-sm mb-6">
          Comienza creando un nuevo mazo de tarjetas para empezar a estudiar con repetición espaciada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
      {decks.map((deck) => {
        const totalCards = deck.cards?.length || 0;
        const dueCards = deck.cards?.filter(isCardDue).length || 0;

        return (
          <div
            key={deck.id}
            className="group relative flex flex-col justify-between p-6 bg-white rounded-3xl border border-lavender-100 shadow-sm hover:shadow-md hover:border-lavender-200 transition-all duration-300"
          >
            <div>
              {/* Encabezado del Mazo */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-lavender-50 rounded-xl flex items-center justify-center text-lavender-500 group-hover:bg-lavender-100 transition-colors">
                    <Layers size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-lavender-950 truncate max-w-[200px]" title={deck.name}>
                    {deck.name}
                  </h3>
                </div>
                
                {/* Botón Eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`¿Estás seguro de que quieres eliminar el mazo "${deck.name}"?`)) {
                      onDeleteDeck(deck.id);
                    }
                  }}
                  className="p-2 text-warmgray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Eliminar mazo"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Descripción */}
              <p className="text-sm text-warmgray-400 line-clamp-2 mb-6 h-10">
                {deck.description || 'Sin descripción.'}
              </p>
            </div>

            {/* Estadísticas y Acciones */}
            <div className="flex items-end justify-between mt-auto">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-warmgray-400 font-medium">Tarjetas</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-lavender-900">{totalCards} total</span>
                  {dueCards > 0 ? (
                    <span className="px-2 py-0.5 text-xs font-bold text-lavender-700 bg-lavender-100 rounded-full animate-pulse">
                      {dueCards} pendientes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                      Al día 🎉
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddCard(deck.id)}
                  className="p-2.5 text-lavender-600 hover:bg-lavender-50 rounded-xl transition-all duration-200"
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
                      : 'bg-warmgray-100 text-warmgray-400 cursor-not-allowed'
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
