import React from 'react';
import { BookOpen, PlusCircle, Trash2, Layers, Upload } from 'lucide-react';
import { getPrioritizedQueue, isCardDue as isCardDueHelper } from '../utils/fridaStore';

export function isCardDue(card) {
  return isCardDueHelper(card, new Date());
}

export default function DeckList({ decks, onStudy, onAddCard, onDeleteDeck, onOpenCSVImporter }) {
  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted shadow-sm animate-fade-in transition-colors duration-300">
        <div className="w-16 h-16 bg-frida-secondary/15 dark:bg-frida-primary/20 rounded-2xl flex items-center justify-center text-frida-primary mb-4">
          <Layers size={32} />
        </div>
        <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">No tienes mazos aún</h3>
        <p className="text-warmgray-450 dark:text-warmgray-450 max-w-sm mb-6 text-sm">
          Comienza creando un nuevo mazo de tarjetas para empezar a estudiar con repetición espaciada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
      {decks.map((deck) => {
        const { strictlyDueCount, dueCardsCount, newCardsCount } = getPrioritizedQueue(deck);
        const totalCards = deck.cards?.length || 0;

        return (
          <div
            key={deck.id}
            className="group relative flex flex-col justify-between p-6 bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted shadow-sm hover:shadow-md hover:border-frida-primary/30 dark:hover:border-frida-primary/60 transition-all duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-frida-secondary/15 dark:bg-frida-primary/20 rounded-xl flex items-center justify-center text-frida-primary group-hover:bg-frida-secondary/30 dark:group-hover:bg-frida-primary/30 transition-colors">
                    <Layers size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text truncate max-w-[200px]" title={deck.name}>
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
                  <span className="text-sm font-bold text-light-text/80 dark:text-dark-text/85">{totalCards} total</span>
                  {strictlyDueCount > 0 ? (
                    <span className="px-2 py-0.5 text-xs font-bold text-sky-850 dark:text-frida-accent bg-frida-accent/30 dark:bg-frida-accent/20 rounded-full animate-pulse">
                      {strictlyDueCount} pendientes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-bold text-green-800 dark:text-green-300 bg-frida-success/80 dark:bg-frida-success/20 rounded-full">
                      Al día 🎉
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenCSVImporter(deck.id)}
                  className="p-2.5 text-frida-primary hover:bg-frida-primary/10 rounded-xl transition-all duration-200"
                  title="Importar desde CSV"
                >
                  <Upload size={20} />
                </button>

                <button
                  onClick={() => onAddCard(deck.id)}
                  className="p-2.5 text-frida-primary hover:bg-frida-primary/10 rounded-xl transition-all duration-200"
                  title="Añadir tarjetas"
                >
                  <PlusCircle size={20} />
                </button>

                <button
                  onClick={() => onStudy(deck.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-frida-primary hover:bg-frida-primary/90 hover:shadow-sm shadow-frida-secondary/20 text-light-text font-extrabold rounded-xl text-sm transition-all duration-200"
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

