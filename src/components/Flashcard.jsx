import React from 'react';
import { HelpCircle, CheckCircle, RefreshCw, Pencil } from 'lucide-react';

export default function Flashcard({ card, isFlipped, onFlip, onEdit }) {
  return (
    <div 
      className="perspective-1000 w-full max-w-xl h-80 cursor-pointer select-none relative"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* CARA ANTERIOR (Pregunta) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-light-card dark:bg-dark-card rounded-3xl p-8 border border-frida-primary/15 dark:border-dark-muted shadow-sm hover:shadow-md transition-all duration-300 ease-in-out flex flex-col justify-between items-center text-center">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-frida-primary tracking-wider uppercase">
              <HelpCircle size={14} />
              <span>Pregunta</span>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
                }}
                title="Edición rápida"
                className="p-2 rounded-xl bg-frida-secondary/15 dark:bg-dark-muted/40 text-frida-primary dark:text-dark-text hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary transition-all duration-200 shadow-sm border border-frida-primary/20 dark:border-dark-muted focus:outline-none focus:ring-2 focus:ring-frida-primary/40"
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-2xl font-semibold text-light-text dark:text-dark-text leading-relaxed max-h-48 overflow-y-auto pr-1">
              {card.front}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-warmgray-400 dark:text-warmgray-500 font-medium">
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Haz clic o presiona Espacio para voltear</span>
          </div>
        </div>

        {/* CARA POSTERIOR (Respuesta) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-light-card dark:bg-dark-card rounded-3xl p-8 border border-frida-primary/20 dark:border-dark-muted shadow-sm flex flex-col justify-between items-center text-center transition-all duration-300 ease-in-out">
          <div className="w-full flex items-center justify-between rotate-y-180">
            <div className="flex items-center gap-1.5 text-xs font-bold text-frida-primary tracking-wider uppercase">
              <CheckCircle size={14} />
              <span>Respuesta</span>
            </div>
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
                }}
                title="Edición rápida"
                className="p-2 rounded-xl bg-frida-secondary/15 dark:bg-dark-muted/40 text-frida-primary dark:text-dark-text hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary transition-all duration-200 shadow-sm border border-frida-primary/20 dark:border-dark-muted focus:outline-none focus:ring-2 focus:ring-frida-primary/40"
              >
                <Pencil size={15} />
              </button>
            )}
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto py-2 rotate-y-180">
            <p className="text-xl font-medium text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap">
              {card.back}
            </p>
          </div>
          
          <div className="text-xs text-frida-primary/80 dark:text-frida-primary/60 font-medium rotate-y-180">
            <span>Califica tu recuerdo abajo para continuar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
