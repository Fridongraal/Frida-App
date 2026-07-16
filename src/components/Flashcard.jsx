import React from 'react';
import { HelpCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function Flashcard({ card, isFlipped, onFlip }) {
  return (
    <div 
      className="perspective-1000 w-full max-w-xl h-80 cursor-pointer select-none"
      onClick={onFlip}
    >
      <div
        className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* CARA ANTERIOR (Pregunta) */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-3xl p-8 border border-lavender-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-lavender-400 tracking-wider uppercase">
            <HelpCircle size={14} />
            <span>Pregunta</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4">
            <p className="text-2xl font-semibold text-lavender-950 leading-relaxed max-h-48 overflow-y-auto pr-1">
              {card.front}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-warmgray-400 font-medium">
            <RefreshCw size={12} className="animate-spin-slow" />
            <span>Haz clic o presiona Espacio para voltear</span>
          </div>
        </div>

        {/* CARA POSTERIOR (Respuesta) */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-lavender-50 rounded-3xl p-8 border border-lavender-200 shadow-sm flex flex-col justify-between items-center text-center">
          <div className="flex items-center gap-1.5 text-xs font-bold text-lavender-500 tracking-wider uppercase">
            <CheckCircle size={14} />
            <span>Respuesta</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto py-2">
            <p className="text-xl font-medium text-lavender-950 leading-relaxed whitespace-pre-wrap">
              {card.back}
            </p>
          </div>
          
          <div className="text-xs text-lavender-400 font-medium">
            <span>Califica tu recuerdo abajo para continuar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
