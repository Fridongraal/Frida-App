import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, CheckCircle2, AlertCircle, Sparkles, Smile, RefreshCw } from 'lucide-react';
import Flashcard from './Flashcard';
import { isCardDue } from './DeckList';

export default function StudySession({ deck, onReviewCard, onBack }) {
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ dificil: 0, bien: 0, facil: 0 });

  // Filtrar tarjetas pendientes al inicio
  useEffect(() => {
    if (deck && deck.cards) {
      const filtered = deck.cards.filter(isCardDue);
      setDueCards(filtered);
      setCurrentIndex(0);
      setSessionCompleted(filtered.length === 0);
    }
  }, [deck]);

  const currentCard = dueCards[currentIndex];

  // Calificar la tarjeta actual
  const handleRate = useCallback((quality) => {
    if (!currentCard) return;

    // Registrar estadísticas
    setStats((prev) => {
      if (quality === 1) return { ...prev, dificil: prev.dificil + 1 };
      if (quality === 2) return { ...prev, bien: prev.bien + 1 };
      return { ...prev, facil: prev.facil + 1 };
    });

    // Guardar revisión usando el hook / callback superior
    onReviewCard(deck.id, currentCard.id, quality);

    // Avanzar a la siguiente tarjeta o terminar
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 < dueCards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 200); // Pequeña pausa para transición suave
  }, [currentCard, currentIndex, dueCards, deck, onReviewCard]);

  // Manejo de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar atajos si la sesión terminó
      if (sessionCompleted) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') {
          handleRate(1);
        } else if (e.key === '2') {
          handleRate(2);
        } else if (e.key === '3') {
          handleRate(3);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, handleRate, sessionCompleted]);

  // Si no hay tarjetas pendientes al inicio
  if (dueCards.length === 0 && !sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh]">
        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-lavender-950 mb-2">¡Todo al día!</h2>
        <p className="text-warmgray-400 mb-8">
          No tienes tarjetas pendientes de repasar en este mazo por hoy. ¡Vuelve más tarde!
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-colors shadow-sm"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // Pantalla de sesión completada
  if (sessionCompleted) {
    const totalEstudiadas = stats.dificil + stats.bien + stats.facil;
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh] animate-fade-in">
        <div className="w-20 h-20 bg-lavender-50 text-lavender-500 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={40} className="text-lavender-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-lavender-950 mb-2">¡Buen trabajo!</h2>
        <p className="text-warmgray-400 mb-6">
          Has completado todas las tarjetas pendientes de este mazo por hoy.
        </p>

        {/* Panel de estadísticas simplificado */}
        {totalEstudiadas > 0 && (
          <div className="w-full bg-white rounded-3xl border border-lavender-100 p-5 mb-8 shadow-sm">
            <h3 className="text-sm font-semibold text-lavender-800 mb-4 uppercase tracking-wider">
              Resumen de Respuestas
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-red-50/50 rounded-2xl">
                <span className="block text-xl font-bold text-red-500">{stats.dificil}</span>
                <span className="text-[10px] font-semibold text-red-400 uppercase">Difícil</span>
              </div>
              <div className="p-3 bg-lavender-50/50 rounded-2xl">
                <span className="block text-xl font-bold text-lavender-500">{stats.bien}</span>
                <span className="text-[10px] font-semibold text-lavender-400 uppercase">Bien</span>
              </div>
              <div className="p-3 bg-green-50/50 rounded-2xl">
                <span className="block text-xl font-bold text-green-500">{stats.facil}</span>
                <span className="text-[10px] font-semibold text-green-400 uppercase">Fácil</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-4 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-all duration-200 shadow-sm hover:shadow"
        >
          Volver al menú principal
        </button>
      </div>
    );
  }

  // Progreso
  const progressPercent = ((currentIndex) / dueCards.length) * 100;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-2 justify-between">
      {/* Cabecera / Navegación interna */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-warmgray-400 hover:text-lavender-900 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} />
          <span>Salir del Estudio</span>
        </button>
        <span className="text-xs font-bold bg-lavender-100 text-lavender-800 px-3 py-1 rounded-full">
          Mazo: {deck.name}
        </span>
      </div>

      {/* Barra de Progreso */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-warmgray-400 mb-1.5 font-semibold">
          <span>Progreso de hoy</span>
          <span>{currentIndex + 1} de {dueCards.length} tarjetas</span>
        </div>
        <div className="w-full h-2 bg-lavender-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-lavender-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent || 5}%` }}
          />
        </div>
      </div>

      {/* Tarjeta de Memoria */}
      <div className="flex-1 flex items-center justify-center my-4">
        {currentCard && (
          <Flashcard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped((prev) => !prev)}
          />
        )}
      </div>

      {/* Controles de Calificación / Volteo */}
      <div className="mt-4 min-h-[90px] flex flex-col justify-center">
        {!isFlipped ? (
          <button
            onClick={() => setIsFlipped(true)}
            className="w-full max-w-md mx-auto py-4 bg-lavender-500 hover:bg-lavender-600 active:scale-[0.98] text-white font-bold rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} className="animate-spin-slow" />
            <span>Mostrar Respuesta</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-2 text-[10px] font-bold bg-lavender-600 text-lavender-100 rounded">
              Espacio
            </kbd>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3 w-full max-w-xl mx-auto animate-slide-up">
            {/* DIFICIL */}
            <button
              onClick={() => handleRate(1)}
              className="flex flex-col items-center justify-center p-3 bg-red-50 hover:bg-red-100/80 border border-red-100 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-red-500 group-hover:scale-105 transition-transform flex items-center gap-1">
                Difícil
                <kbd className="px-1 text-[9px] bg-red-200 text-red-700 rounded font-mono">1</kbd>
              </span>
              <span className="text-[10px] text-red-400 mt-1 hidden sm:block">Repetir pronto</span>
            </button>

            {/* BIEN */}
            <button
              onClick={() => handleRate(2)}
              className="flex flex-col items-center justify-center p-3 bg-lavender-50 hover:bg-lavender-100/80 border border-lavender-100 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-lavender-600 group-hover:scale-105 transition-transform flex items-center gap-1">
                Bien
                <kbd className="px-1 text-[9px] bg-lavender-200 text-lavender-700 rounded font-mono">2</kbd>
              </span>
              <span className="text-[10px] text-lavender-400 mt-1 hidden sm:block">Intervalo medio</span>
            </button>

            {/* FACIL */}
            <button
              onClick={() => handleRate(3)}
              className="flex flex-col items-center justify-center p-3 bg-green-50 hover:bg-green-100/80 border border-green-100 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-green-600 group-hover:scale-105 transition-transform flex items-center gap-1">
                Fácil
                <kbd className="px-1 text-[9px] bg-green-200 text-green-700 rounded font-mono">3</kbd>
              </span>
              <span className="text-[10px] text-green-400 mt-1 hidden sm:block">Intervalo largo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
