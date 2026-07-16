import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, CheckCircle2, AlertCircle, Sparkles, Smile, RefreshCw } from 'lucide-react';
import Flashcard from './Flashcard';
import { filterCards } from '../utils/fridaStore';

export default function StudySession({ deck, onReviewCard, onBack }) {
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ dificil: 0, bien: 0, facil: 0 });

  // Estados de control para el flujo de estudio
  const [started, setStarted] = useState(false);
  const [hadCardsToStudy, setHadCardsToStudy] = useState(false);
  const [counts, setCounts] = useState({ newCount: 0, learningCount: 0, reviewCount: 0 });

  const lastDeckIdRef = useRef(null);

  // Filtrar tarjetas pendientes al inicio
  useEffect(() => {
    if (deck && deck.cards) {
      if (lastDeckIdRef.current === deck.id) {
        return; // Evitar reinicios si es el mismo mazo y solo cambiaron datos de tarjetas
      }
      lastDeckIdRef.current = deck.id;

      const { newCards, learningCards, reviewCards, total } = filterCards(deck, new Date());
      
      setCounts({
        newCount: newCards.length,
        learningCount: learningCards.length,
        reviewCount: reviewCards.length
      });

      // Cola de estudio: Aprendizaje -> Nuevas -> Repasar
      const queue = [...learningCards, ...newCards, ...reviewCards];
      setDueCards(queue);
      setCurrentIndex(0);
      setHadCardsToStudy(total > 0);
      setSessionCompleted(false);
      setStarted(false);
      setStats({ dificil: 0, bien: 0, facil: 0 });
    }
  }, [deck]);

  const currentCard = dueCards[currentIndex];

  // Obtener información visual de la categoría de la tarjeta
  const getCardCategoryInfo = (card) => {
    if (!card) return { label: '', classes: '' };
    const reps = card.algorithm?.repetitions ?? card.repetitions ?? 0;
    const interval = card.algorithm?.interval ?? card.interval ?? 1;

    if (reps === 0) {
      return {
        label: 'Nueva',
        classes: 'bg-lavender-100 dark:bg-lavender-950/40 text-lavender-700 dark:text-lavender-300 border border-lavender-200/50 dark:border-lavender-900/50'
      };
    } else if (interval < 1) {
      return {
        label: 'En Aprendizaje',
        classes: 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 border border-red-100 dark:border-red-950/30'
      };
    } else {
      return {
        label: 'Repaso',
        classes: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-150 dark:border-green-950/30'
      };
    }
  };

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

    // Si presiona "Difícil" (1), vuelve al final de la cola de aprendizaje de esta sesión
    if (quality === 1) {
      setIsFlipped(false);
      setTimeout(() => {
        setDueCards((prevQueue) => {
          const updatedQueue = [...prevQueue];
          const currentCardToRepeat = { ...currentCard };

          if (!currentCardToRepeat.algorithm) {
            currentCardToRepeat.algorithm = {};
          }
          currentCardToRepeat.algorithm.interval = 0.5; // forzar intervalo de aprendizaje
          
          // Buscar el índice del final de las tarjetas de aprendizaje en la cola restante (después de currentIndex)
          let insertIndex = currentIndex + 1;
          for (let i = currentIndex + 1; i < updatedQueue.length; i++) {
            const card = updatedQueue[i];
            const interval = card.algorithm?.interval ?? card.interval ?? 1;
            if (interval < 1) {
              insertIndex = i + 1;
            }
          }

          updatedQueue.splice(insertIndex, 0, currentCardToRepeat);
          return updatedQueue;
        });

        // Avanzar el índice actual
        setCurrentIndex((prev) => prev + 1);
      }, 200);
      return;
    }

    // Avanzar a la siguiente tarjeta o terminar para respuestas correctas (Bien o Fácil)
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 < dueCards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 200);
  }, [currentCard, currentIndex, dueCards, deck, onReviewCard]);

  // Manejo de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar atajos si la sesión terminó o no ha comenzado
      if (sessionCompleted || !started) return;

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
  }, [isFlipped, handleRate, sessionCompleted, started]);

  // 1. Pantalla "¡Al día!" (Zero State) si no hay tarjetas pendientes al inicio
  if (!hadCardsToStudy) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh] text-warmgray-900 dark:text-darkText animate-fade-in">
        <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 text-green-500 dark:text-green-455 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-lavender-950 dark:text-white mb-2">¡Todo al día!</h2>
        <p className="text-warmgray-450 dark:text-warmgray-450 max-w-sm mb-8 text-sm">
          ¡Felicidades! Estás al día con este mazo. Vuelve más tarde o mañana para repasar.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-colors duration-200 shadow-sm"
        >
          Volver al Inicio
        </button>
      </div>
    );
  }

  // 2. Pantalla de pre-estudio con contadores
  if (!started && !sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center h-[70vh] text-warmgray-900 dark:text-darkText animate-fade-in">
        <h2 className="text-3xl font-extrabold text-lavender-950 dark:text-white mb-2">
          {deck.name}
        </h2>
        <p className="text-sm text-warmgray-450 dark:text-warmgray-400 mb-8 max-w-md">
          Estás por comenzar tu sesión de estudio. Revisa el estado de tus tarjetas a continuación:
        </p>

        {/* Píldoras de contadores */}
        <div className="grid grid-cols-3 gap-4 w-full mb-10">
          <div className="flex flex-col items-center justify-center p-4 bg-lavender-100/50 dark:bg-lavender-950/20 border border-lavender-200/50 dark:border-lavender-900/40 rounded-2xl">
            <span className="text-2xl font-bold text-lavender-750 dark:text-lavender-300">
              {counts.newCount}
            </span>
            <span className="text-xs font-semibold text-lavender-800 dark:text-lavender-400 uppercase tracking-wider mt-1">
              Nuevas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-2xl">
            <span className="text-2xl font-bold text-red-650 dark:text-red-400">
              {counts.learningCount}
            </span>
            <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider mt-1">
              Aprendizaje
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-950/10 border border-green-150 dark:border-green-950/30 rounded-2xl">
            <span className="text-2xl font-bold text-green-700 dark:text-green-400">
              {counts.reviewCount}
            </span>
            <span className="text-xs font-semibold text-green-800 dark:text-green-400 uppercase tracking-wider mt-1">
              Repasar
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-white dark:bg-darkCard hover:bg-warmgray-50 dark:hover:bg-lavender-950/20 text-warmgray-450 dark:text-warmgray-400 border border-lavender-100 dark:border-lavender-950 font-bold rounded-2xl transition-colors duration-200 text-sm"
          >
            Volver
          </button>
          <button
            onClick={() => setStarted(true)}
            className="flex-2 py-3.5 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-colors duration-200 shadow-sm shadow-lavender-100 dark:shadow-none text-sm w-2/3"
          >
            Comenzar Sesión
          </button>
        </div>
      </div>
    );
  }

  // 3. Pantalla de sesión completada
  if (sessionCompleted) {
    const totalEstudiadas = stats.dificil + stats.bien + stats.facil;
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh] animate-fade-in text-warmgray-900 dark:text-darkText">
        <div className="w-20 h-20 bg-lavender-50 dark:bg-lavender-950/40 text-lavender-500 dark:text-lavender-450 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={40} className="text-lavender-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-lavender-950 dark:text-white mb-2">¡Buen trabajo!</h2>
        <p className="text-warmgray-450 dark:text-warmgray-400 mb-6 text-sm">
          Has completado todas las tarjetas pendientes de este mazo por hoy.
        </p>

        {/* Panel de estadísticas simplificado */}
        {totalEstudiadas > 0 && (
          <div className="w-full bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-5 mb-8 shadow-sm transition-colors duration-300">
            <h3 className="text-sm font-semibold text-lavender-800 dark:text-lavender-400 mb-4 uppercase tracking-wider">
              Resumen de Respuestas
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-2xl">
                <span className="block text-xl font-bold text-red-500 dark:text-red-400">{stats.dificil}</span>
                <span className="text-[10px] font-semibold text-red-450 dark:text-red-500 uppercase">Difícil</span>
              </div>
              <div className="p-3 bg-lavender-50/50 dark:bg-lavender-950/20 rounded-2xl">
                <span className="block text-xl font-bold text-lavender-500 dark:text-lavender-400">{stats.bien}</span>
                <span className="text-[10px] font-semibold text-lavender-400 dark:text-lavender-500 uppercase">Bien</span>
              </div>
              <div className="p-3 bg-green-50/50 dark:bg-green-950/20 rounded-2xl">
                <span className="block text-xl font-bold text-green-500 dark:text-green-400">{stats.facil}</span>
                <span className="text-[10px] font-semibold text-green-400 dark:text-green-550 uppercase">Fácil</span>
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
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-2 justify-between text-warmgray-900 dark:text-darkText">
      {/* Cabecera / Navegación interna */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-warmgray-455 hover:text-lavender-900 dark:text-warmgray-400 dark:hover:text-lavender-350 transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} />
          <span>Salir del Estudio</span>
        </button>
        
        <div className="flex items-center gap-2">
          {currentCard && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCardCategoryInfo(currentCard).classes}`}>
              {getCardCategoryInfo(currentCard).label}
            </span>
          )}
          <span className="text-xs font-bold bg-lavender-100 dark:bg-lavender-950/50 text-lavender-800 dark:text-lavender-300 px-3 py-1 rounded-full border border-lavender-200/20 dark:border-lavender-900/30">
            Mazo: {deck.name}
          </span>
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-warmgray-450 dark:text-warmgray-400 mb-1.5 font-semibold">
          <span>Progreso de hoy</span>
          <span>{currentIndex + 1} de {dueCards.length} tarjetas</span>
        </div>
        <div className="w-full h-2 bg-lavender-50 dark:bg-lavender-950/30 rounded-full overflow-hidden">
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
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-2 text-[10px] font-bold bg-lavender-600 dark:bg-lavender-700 text-lavender-100 rounded">
              Espacio
            </kbd>
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-3 w-full max-w-xl mx-auto animate-slide-up">
            {/* DIFICIL */}
            <button
              onClick={() => handleRate(1)}
              className="flex flex-col items-center justify-center p-3 bg-red-50 dark:bg-red-950/10 hover:bg-red-100/80 dark:hover:bg-red-950/30 border border-red-100 dark:border-red-950/50 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-red-500 dark:text-red-400 group-hover:scale-105 transition-transform flex items-center gap-1">
                Difícil
                <kbd className="px-1 text-[9px] bg-red-200 dark:bg-red-900/60 text-red-700 dark:text-red-300 rounded font-mono">1</kbd>
              </span>
              <span className="text-[10px] text-red-400 dark:text-red-500 mt-1 hidden sm:block">Repetir pronto</span>
            </button>

            {/* BIEN */}
            <button
              onClick={() => handleRate(2)}
              className="flex flex-col items-center justify-center p-3 bg-lavender-50 dark:bg-lavender-950/10 hover:bg-lavender-100/80 dark:hover:bg-lavender-950/30 border border-lavender-100 dark:border-lavender-950/50 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-lavender-600 dark:text-lavender-450 group-hover:scale-105 transition-transform flex items-center gap-1">
                Bien
                <kbd className="px-1 text-[9px] bg-lavender-200 dark:bg-lavender-900/60 text-lavender-750 dark:text-lavender-300 rounded font-mono">2</kbd>
              </span>
              <span className="text-[10px] text-lavender-450 dark:text-lavender-555 mt-1 hidden sm:block">Intervalo medio</span>
            </button>

            {/* FACIL */}
            <button
              onClick={() => handleRate(3)}
              className="flex flex-col items-center justify-center p-3 bg-green-50 dark:bg-green-950/10 hover:bg-green-100/80 dark:hover:bg-green-950/30 border border-green-100 dark:border-green-950/50 rounded-2xl transition-all group"
            >
              <span className="text-xs font-bold text-green-600 dark:text-green-400 group-hover:scale-105 transition-transform flex items-center gap-1">
                Fácil
                <kbd className="px-1 text-[9px] bg-green-200 dark:bg-green-900/60 text-green-700 dark:text-green-300 rounded font-mono">3</kbd>
              </span>
              <span className="text-[10px] text-green-400 dark:text-green-555 mt-1 hidden sm:block">Intervalo largo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
