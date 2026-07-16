import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  RotateCcw,
  Check,
  ArrowRight,
  Layers,
} from 'lucide-react';
import Flashcard from './Flashcard';
import { filterCards, getPrioritizedQueue } from '../utils/fridaStore';
import { applyStudyAction, getStudyActionPreview } from '../utils/fridaReview';

function buildInitialSessionState(cards) {
  return cards.reduce((acc, card) => {
    acc[card.id] = {
      awaitingGraduation: false,
      workingAlgorithm: {
        interval: Number.isFinite(card.algorithm?.interval) ? card.algorithm.interval : 1,
        easeFactor: Number.isFinite(card.algorithm?.easeFactor) ? card.algorithm.easeFactor : 2.5,
        repetitions: Number.isFinite(card.algorithm?.repetitions) ? card.algorithm.repetitions : 0,
        nextReviewDate: card.algorithm?.nextReviewDate,
      },
    };
    return acc;
  }, {});
}

function getCardCategoryInfo(card) {
  if (!card) return { label: '', classes: '' };

  const reps = card.algorithm?.repetitions ?? 0;

  if (reps === 0) {
    return {
      label: 'Nueva',
      classes: 'bg-lavender-100 dark:bg-lavender-950/40 text-lavender-700 dark:text-lavender-300 border border-lavender-200/50 dark:border-lavender-900/50',
    };
  }

  return {
    label: 'Repaso',
    classes: 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/40',
  };
}

function getToneClasses(tone, active) {
  const base =
    'group relative flex flex-col items-stretch justify-between gap-3 rounded-3xl border px-4 py-4 text-left shadow-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

  if (tone === 'again') {
    const stateClasses = active
      ? 'scale-95 bg-red-100/95 dark:bg-red-950/45 border-red-300 dark:border-red-800'
      : 'bg-white hover:bg-red-50/50 dark:bg-transparent border-red-200 dark:border-red-950/70 hover:-translate-y-0.5 hover:shadow-md';
    return `${base} ${stateClasses} text-red-500 dark:text-red-400 focus-visible:ring-red-400/50`;
  }

  if (tone === 'easy') {
    const stateClasses = active
      ? 'scale-95 bg-frida-accent/90 dark:bg-frida-accent border-frida-accent'
      : 'bg-frida-accent hover:bg-frida-accent/90 dark:bg-transparent dark:hover:bg-frida-accent dark:hover:text-light-text border-frida-accent/40 dark:border-frida-accent hover:-translate-y-0.5 hover:shadow-md';
    return `${base} ${stateClasses} text-light-text dark:text-frida-accent dark:active:text-light-text focus-visible:ring-frida-accent/50`;
  }

  // default tone: good (Bien)
  const stateClasses = active
    ? 'scale-95 bg-frida-secondary/90 dark:bg-frida-primary border-frida-primary'
    : 'bg-frida-secondary hover:bg-frida-secondary/90 dark:bg-transparent dark:hover:bg-frida-primary dark:hover:text-light-text border-frida-primary/40 dark:border-frida-primary hover:-translate-y-0.5 hover:shadow-md';
  return `${base} ${stateClasses} text-light-text dark:text-frida-primary dark:active:text-light-text focus-visible:ring-frida-primary/50`;
}

function FeedbackButton({ tone, label, shortcut, icon: Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick} className={getToneClasses(tone, active)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 dark:bg-white/5 border border-current/20">
            <Icon size={18} />
          </span>
          <div>
            <div className="text-sm font-extrabold tracking-tight">{label}</div>
          </div>
        </div>
        <kbd className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white/70 dark:bg-white/10 border border-current/15 shadow-sm">
          {shortcut}
        </kbd>
      </div>
    </button>
  );
}

export default function StudySession({ deck, onReviewCard, onBack }) {
  const [dueCards, setDueCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [stats, setStats] = useState({ dificil: 0, bien: 0, facil: 0 });
  const [started, setStarted] = useState(false);
  const [hadCardsToStudy, setHadCardsToStudy] = useState(false);
  const [counts, setCounts] = useState({ newCount: 0, learningCount: 0, reviewCount: 0 });
  const [sessionStates, setSessionStates] = useState({});
  const [activeShortcut, setActiveShortcut] = useState(null);
  const [strictlyDueCount, setStrictlyDueCount] = useState(0);

  const activeShortcutTimerRef = useRef(null);
  const lastDeckIdRef = useRef(null);
  const flippedAtRef = useRef(0);

  useEffect(() => {
    return () => {
      if (activeShortcutTimerRef.current) {
        window.clearTimeout(activeShortcutTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!deck || !deck.cards) return;

    if (lastDeckIdRef.current === deck.id) {
      return;
    }

    lastDeckIdRef.current = deck.id;

    const { queue, strictlyDueCount, dueCardsCount, newCardsCount } = getPrioritizedQueue(deck, new Date());

    setCounts({
      newCount: newCardsCount,
      learningCount: 0,
      reviewCount: dueCardsCount,
    });
    setDueCards(queue);
    setStrictlyDueCount(strictlyDueCount);
    setCurrentIndex(0);
    setHadCardsToStudy(deck.cards.length > 0);
    setSessionCompleted(false);
    setStarted(false);
    setStats({ dificil: 0, bien: 0, facil: 0 });
    setSessionStates(buildInitialSessionState(queue));
  }, [deck]);

  useEffect(() => {
    if (started && !sessionCompleted && dueCards.length > 0 && currentIndex >= dueCards.length) {
      setSessionCompleted(true);
    }
  }, [currentIndex, dueCards.length, sessionCompleted, started]);

  const currentCard = dueCards[currentIndex];
  const currentSessionState = currentCard ? sessionStates[currentCard.id] : null;
  const currentCardView = currentCard
    ? {
        ...currentCard,
        algorithm: currentSessionState?.workingAlgorithm || currentCard.algorithm,
      }
    : null;

  const pulseShortcut = useCallback((shortcut) => {
    setActiveShortcut(shortcut);
    if (activeShortcutTimerRef.current) {
      window.clearTimeout(activeShortcutTimerRef.current);
    }
    activeShortcutTimerRef.current = window.setTimeout(() => {
      setActiveShortcut(null);
    }, 140);
  }, []);

  const queueCurrentCard = useCallback((mode) => {
    if (!currentCard) return;

    setDueCards((prevQueue) => {
      const nextQueue = [...prevQueue];

      if (mode === 'short') {
        const insertIndex = Math.min(currentIndex + 3, nextQueue.length);
        nextQueue.splice(insertIndex, 0, currentCard);
      } else if (mode === 'end') {
        nextQueue.push(currentCard);
      }

      return nextQueue;
    });
  }, [currentCard, currentIndex]);

  const handleRate = useCallback((quality) => {
    if (!currentCard || !deck) return;

    const cardId = currentCard.id;
    const sessionState = sessionStates[cardId] || {
      awaitingGraduation: false,
      workingAlgorithm: currentCard.algorithm,
    };

    const outcome = applyStudyAction(currentCardView || currentCard, quality, sessionState);

    setStats((prev) => {
      if (quality === 1) return { ...prev, dificil: prev.dificil + 1 };
      if (quality === 2) return { ...prev, bien: prev.bien + 1 };
      return { ...prev, facil: prev.facil + 1 };
    });

    setSessionStates((prev) => ({
      ...prev,
      [cardId]: {
        awaitingGraduation: outcome.awaitingGraduation,
        workingAlgorithm: outcome.sessionAlgorithm,
      },
    }));

    if (outcome.persistAlgorithm) {
      onReviewCard(deck.id, cardId, outcome.persistAlgorithm);
    }

    pulseShortcut(String(quality));
    setIsFlipped(false);

    if (outcome.requeueMode !== 'none') {
      queueCurrentCard(outcome.requeueMode);
    }

    window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 180);
  }, [currentCard, currentCardView, deck, onReviewCard, pulseShortcut, queueCurrentCard, sessionStates]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionCompleted || !started) return;

      if (!isFlipped && e.code === 'Space') {
        e.preventDefault();
        pulseShortcut('space');
        setIsFlipped(true);
        flippedAtRef.current = Date.now();
        return;
      }

      if (!isFlipped) return;

      if (e.key === '1') {
        e.preventDefault();
        pulseShortcut('1');
        handleRate(1);
      } else if (e.key === '2') {
        e.preventDefault();
        pulseShortcut('2');
        handleRate(2);
      } else if (e.key === '3') {
        e.preventDefault();
        pulseShortcut('3');
        handleRate(3);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRate, isFlipped, pulseShortcut, sessionCompleted, started]);

  if (!hadCardsToStudy) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh] text-light-text dark:text-dark-text animate-fade-in">
        <div className="w-16 h-16 bg-frida-secondary/15 dark:bg-frida-primary/10 text-frida-primary rounded-2xl flex items-center justify-center mb-6">
          <Layers size={32} />
        </div>
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">El mazo está vacío</h2>
        <p className="text-warmgray-450 dark:text-warmgray-450 max-w-sm mb-8 text-sm">
          Añade o importa algunas tarjetas para poder comenzar a estudiar en este mazo.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-frida-primary hover:bg-frida-primary/90 text-light-text font-extrabold rounded-2xl transition-colors duration-200 shadow-sm shadow-frida-secondary/25 text-sm"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!started && !sessionCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-lg mx-auto text-center h-[70vh] text-light-text dark:text-dark-text animate-fade-in">
        <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text mb-2">{deck.name}</h2>
        <p className="text-sm text-warmgray-455 dark:text-warmgray-450 mb-8 max-w-md">
          Estás por comenzar tu sesión de estudio. Revisa el estado de tus tarjetas a continuación:
        </p>

        {strictlyDueCount === 0 && (
          <p className="text-xs font-semibold text-frida-primary dark:text-frida-secondary mb-6 bg-frida-secondary/15 px-4 py-2.5 rounded-2xl">
            ✨ Estás al día con este mazo. Al comenzar, repasarás tarjetas futuras de forma adelantada.
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 w-full mb-10">
          <div className="flex flex-col items-center justify-center p-4 bg-frida-secondary/80 dark:bg-frida-secondary/20 border border-frida-primary/30 dark:border-dark-muted rounded-2xl">
            <span className="text-2xl font-bold text-light-text dark:text-frida-secondary">{counts.newCount}</span>
            <span className="text-[10px] font-bold text-light-text/75 dark:text-frida-secondary/80 uppercase tracking-wider mt-1">
              Nuevas
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-frida-success/80 dark:bg-frida-success/20 border border-frida-success/30 dark:border-dark-muted rounded-2xl">
            <span className="text-2xl font-bold text-green-900 dark:text-green-300">{counts.reviewCount}</span>
            <span className="text-[10px] font-bold text-green-950/75 dark:text-green-400 uppercase tracking-wider mt-1">
              Repaso
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onBack}
            className="flex-1 py-3.5 bg-light-card dark:bg-dark-card hover:bg-frida-secondary/15 dark:hover:bg-dark-muted/20 text-warmgray-455 dark:text-warmgray-400 border border-frida-primary/20 dark:border-dark-muted font-bold rounded-2xl transition-colors duration-200 text-sm"
          >
            Volver
          </button>
          <button
            onClick={() => setStarted(true)}
            className="w-2/3 py-3.5 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-2xl transition-colors duration-200 shadow-sm shadow-frida-secondary/20 text-sm"
          >
            Comenzar sesión
          </button>
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    const totalEstudiadas = stats.dificil + stats.bien + stats.facil;

    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center h-[70vh] animate-fade-in text-light-text dark:text-dark-text">
        <div className="w-20 h-20 bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={40} className="text-frida-primary" />
        </div>
        <h2 className="text-3xl font-extrabold text-light-text dark:text-dark-text mb-2">¡Mazo completado!</h2>
        <p className="text-warmgray-450 dark:text-warmgray-400 mb-6 text-sm">
          Has repasado la totalidad de las tarjetas en este mazo.
        </p>

        {totalEstudiadas > 0 && (
          <div className="w-full bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 mb-8 shadow-sm transition-colors duration-300">
            <h3 className="text-sm font-semibold text-frida-primary dark:text-dark-muted mb-4 uppercase tracking-wider">
              Resumen de respuestas
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-2xl">
                <span className="block text-xl font-bold text-red-500 dark:text-red-400">{stats.dificil}</span>
                <span className="text-[10px] font-semibold text-red-400 dark:text-red-500 uppercase">Otra vez</span>
              </div>
              <div className="p-3 bg-frida-secondary/20 dark:bg-frida-primary/10 rounded-2xl">
                <span className="block text-xl font-bold text-frida-primary dark:text-frida-secondary">{stats.bien}</span>
                <span className="text-[10px] font-semibold text-frida-primary dark:text-frida-secondary uppercase">Bien</span>
              </div>
              <div className="p-3 bg-frida-accent/20 dark:bg-frida-accent/10 rounded-2xl">
                <span className="block text-xl font-bold text-sky-600 dark:text-frida-accent">{stats.facil}</span>
                <span className="text-[10px] font-semibold text-sky-650 dark:text-sky-350 uppercase">Fácil</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onBack}
          className="w-full py-4 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-2xl transition-all duration-200 shadow-sm shadow-frida-secondary/25 hover:shadow"
        >
          Volver al menú principal
        </button>
      </div>
    );
  }

  const progressPercent = dueCards.length > 0 ? (currentIndex / dueCards.length) * 100 : 0;
  const actionPreview = currentCardView ? getStudyActionPreview(currentCardView, 2, currentSessionState || {}) : { label: '<10m' };
  const easyPreview = currentCardView ? getStudyActionPreview(currentCardView, 3, currentSessionState || {}) : { label: '5d' };
  const isShortLearning = Boolean(currentSessionState?.awaitingGraduation || currentCardView?.algorithm?.repetitions === 0);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto px-4 py-2 justify-between text-light-text dark:text-dark-text">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-warmgray-455 hover:text-frida-primary dark:text-warmgray-400 dark:hover:text-frida-secondary transition-colors text-sm font-medium"
        >
          <ChevronLeft size={18} />
          <span>Salir del estudio</span>
        </button>

        <div className="flex items-center gap-2">
          {currentCardView && (
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getCardCategoryInfo(currentCardView).classes}`}>
              {getCardCategoryInfo(currentCardView).label}
            </span>
          )}
          <span className="text-xs font-bold bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary dark:text-dark-muted px-3 py-1 rounded-full border border-frida-primary/20 dark:border-dark-muted">
            Mazo: {deck.name}
          </span>
        </div>
      </div>

      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-warmgray-455 dark:text-warmgray-455 mb-1.5 font-semibold">
          <span>Progreso de hoy</span>
          <span>
            {Math.min(currentIndex + 1, dueCards.length)} de {dueCards.length} tarjetas
          </span>
        </div>
        <div className="w-full h-2 bg-frida-secondary/15 dark:bg-dark-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-frida-primary transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent || 5}%` }}
          />
        </div>
      </div>

      {strictlyDueCount > 0 && currentIndex >= strictlyDueCount && (
        <div className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-800 dark:text-green-300 px-4 py-2.5 rounded-2xl text-xs font-bold text-center shadow-sm flex items-center justify-center gap-2 mb-2 animate-bounce">
          <span>🎉🎉 ¡Completaste las tarjetas programadas para hoy! Puedes salir o continuar repasando el resto del mazo.</span>
        </div>
      )}

      {strictlyDueCount === 0 && (
        <div className="w-full bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/20 text-frida-primary dark:text-frida-secondary px-4 py-2.5 rounded-2xl text-xs font-bold text-center shadow-sm mb-2">
          <span>⚡ Estás adelantando repasos futuros. Tus respuestas actualizarán el algoritmo.</span>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center my-4">
         {currentCardView && (
          <Flashcard
            card={currentCardView}
            isFlipped={isFlipped}
            onFlip={() => {
              pulseShortcut('space');
              setIsFlipped((prev) => {
                const next = !prev;
                if (next) {
                  flippedAtRef.current = Date.now();
                }
                return next;
              });
            }}
          />
        )}
      </div>

      <div className="mt-4 min-h-[120px] flex flex-col justify-center">
        {!isFlipped ? (
          <button
            onClick={() => {
              pulseShortcut('space');
              setIsFlipped(true);
              flippedAtRef.current = Date.now();
            }}
            className="w-full max-w-md mx-auto py-4 bg-frida-primary hover:bg-frida-primary/95 active:scale-[0.98] text-light-text font-extrabold rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-2 shadow-frida-secondary/25"
          >
            <RefreshCw size={18} className="animate-spin-slow text-light-text" />
            <span>Mostrar respuesta</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-2 text-[10px] font-bold bg-frida-primary/20 dark:bg-frida-primary/10 text-light-text dark:text-dark-text rounded">
              Espacio
            </kbd>
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mx-auto animate-slide-up">
            <FeedbackButton
              tone="again"
              label="Otra vez (<1m)"
              shortcut="1"
              icon={RotateCcw}
              active={activeShortcut === '1'}
              onClick={() => {
                pulseShortcut('1');
                handleRate(1);
              }}
            />

            <FeedbackButton
              tone="good"
              label={`Bien (${actionPreview.label})`}
              shortcut="2"
              icon={Check}
              active={activeShortcut === '2'}
              onClick={() => {
                pulseShortcut('2');
                handleRate(2);
              }}
            />

            <FeedbackButton
              tone="easy"
              label={`Fácil (${easyPreview.label})`}
              shortcut="3"
              icon={ArrowRight}
              active={activeShortcut === '3'}
              onClick={() => {
                pulseShortcut('3');
                handleRate(3);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
