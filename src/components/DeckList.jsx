import React from 'react';
import { BookOpen, PlusCircle, Trash2, Layers, Upload, Download } from 'lucide-react';
import { getPrioritizedQueue, isCardDue as isCardDueHelper } from '../utils/fridaStore';

export function isCardDue(card) {
  return isCardDueHelper(card, new Date());
}

export default function DeckList({
  decks,
  onStudy,
  onAddCard,
  onDeleteDeck,
  onOpenCSVImporter,
  onExportDeck,
}) {
  if (!decks || decks.length === 0) {
    return (
      <div className="p-6 bg-light-bg dark:bg-dark-bg/40 rounded-2xl border border-frida-primary/10 dark:border-dark-muted/30 text-center w-full py-6">
        <span className="text-xs text-warmgray-450 dark:text-warmgray-400 font-semibold">
          Esta materia no tiene mazos aún.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full animate-slide-up">
      {decks.map((deck) => {
        const { strictlyDueCount } = getPrioritizedQueue(deck);
        const totalCards = deck.cards?.length || 0;

        return (
          <div
            key={deck.id}
            className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-light-card/90 dark:bg-dark-card/90 rounded-2xl border border-frida-primary/15 dark:border-dark-muted shadow-sm hover:shadow-md hover:border-frida-primary/30 dark:hover:border-frida-primary/60 transition-all duration-300 w-full gap-3"
          >
            {/* LADO IZQUIERDO: ICONO + NOMBRE + ESTADO DE TARJETAS */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 shrink-0 bg-frida-secondary/20 dark:bg-frida-primary/20 rounded-xl flex items-center justify-center text-frida-primary group-hover:bg-frida-secondary/30 dark:group-hover:bg-frida-primary/30 transition-colors">
                <Layers size={20} />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className="text-base font-extrabold text-light-text dark:text-dark-text truncate max-w-[220px] sm:max-w-xs"
                    title={deck.name}
                  >
                    {deck.name}
                  </h3>
                  {strictlyDueCount > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-black text-sky-850 dark:text-frida-secondary bg-frida-secondary/30 dark:bg-frida-primary/25 border border-frida-primary/20 rounded-full animate-pulse shrink-0">
                      {strictlyDueCount} pendientes
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-green-700 dark:text-green-300 bg-green-500/15 dark:bg-green-500/20 rounded-full shrink-0">
                      Al día 🎉
                    </span>
                  )}
                </div>
                <span className="text-xs text-warmgray-450 dark:text-warmgray-400 font-medium">
                  {totalCards} tarjeta{totalCards === 1 ? '' : 's'} en total
                </span>
              </div>
            </div>

            {/* LADO DERECHO: BOTONES DE ACCIÓN + BOTÓN ESTUDIAR */}
            <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-frida-primary/10 dark:border-dark-muted/30">
              <div className="flex items-center gap-1">
                {onOpenCSVImporter && (
                  <button
                    onClick={() => onOpenCSVImporter(deck.id)}
                    className="p-2 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-400 dark:hover:text-frida-secondary hover:bg-frida-secondary/15 rounded-xl transition-colors"
                    title="Importar tarjetas desde CSV"
                  >
                    <Upload size={16} />
                  </button>
                )}

                {onExportDeck && (
                  <button
                    onClick={() => onExportDeck(deck)}
                    className="p-2 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-400 dark:hover:text-frida-secondary hover:bg-frida-secondary/15 rounded-xl transition-colors"
                    title="Exportar mazo a CSV"
                  >
                    <Download size={16} />
                  </button>
                )}

                {onAddCard && (
                  <button
                    onClick={() => onAddCard(deck.id)}
                    className="p-2 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-400 dark:hover:text-frida-secondary hover:bg-frida-secondary/15 rounded-xl transition-colors"
                    title="Añadir tarjetas al mazo"
                  >
                    <PlusCircle size={16} />
                  </button>
                )}

                {onDeleteDeck && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`¿Estás seguro de que quieres eliminar el mazo "${deck.name}"?`)) {
                        onDeleteDeck(deck.id);
                      }
                    }}
                    className="p-2 text-warmgray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                    title="Eliminar mazo"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {onStudy && (
                <button
                  onClick={() => onStudy(deck.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-xl text-xs transition-all shadow-xs shadow-frida-secondary/20 shrink-0 ml-auto sm:ml-0"
                >
                  <BookOpen size={14} />
                  <span>Estudiar</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
