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
  LogOut,
  Flame,
  Download,
  Pencil,
  Trash2,
  Save,
  X,
} from 'lucide-react';
import Flashcard from './Flashcard';
import confetti from 'canvas-confetti';
import Papa from 'papaparse';
import { playAgain, playSuccess, playEasy, playComplete } from '../utils/soundManager';
import { filterCards, getPrioritizedQueue } from '../utils/fridaStore';
import { getDisplayStreak } from '../utils/streakManager';
import { applyStudyAction, getStudyActionPreview, normalizeAlgorithm } from '../utils/fridaReview';

function buildInitialSessionState(cards) {
  return cards.reduce((acc, card) => {
    const alg = normalizeAlgorithm(card.algorithm || card);
    acc[card.id] = {
      workingAlgorithm: alg,
    };
    return acc;
  }, {});
}

function getCardCategoryInfo(card) {
  if (!card) return { label: '', classes: '' };

  const alg = normalizeAlgorithm(card.algorithm || card);
  const state = alg.state;

  if (state === 'new') {
    return {
      label: 'Nueva',
      classes: 'bg-lavender-100 dark:bg-lavender-950/40 text-lavender-700 dark:text-lavender-300 border border-lavender-200/50 dark:border-lavender-900/50',
    };
  }
  if (state === 'learning') {
    return {
      label: 'Aprendiendo',
      classes: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-900/50',
    };
  }
  if (state === 'relearning') {
    return {
      label: 'Reaprendizaje',
      classes: 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200/50 dark:border-orange-900/50',
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

export default function StudySession({
  deck,
  onReviewCard,
  onUpdateCard,
  onDeleteCard,
  onBack,
  streakCount,
  lastStudyDate,
  todayCardsCount,
}) {
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
  const [isSavingAndExiting, setIsSavingAndExiting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados para Edición Rápida In-Line
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleExportCSV = async () => {
    if (!deck || !deck.cards || deck.cards.length === 0) {
      triggerToast('El mazo no tiene tarjetas para exportar.');
      return;
    }

    try {
      const data = deck.cards.map((c) => ({
        Pregunta: c.front || '',
        Respuesta: c.back || '',
      }));

      const csvContent = Papa.unparse(data, {
        quotes: true,
        newline: '\r\n',
      });

      const defaultFilename = `${deck.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_exportado.csv`;

      let saved = false;
      if (window.electronAPI?.exportDeckToCSV) {
        saved = await window.electronAPI.exportDeckToCSV(defaultFilename, csvContent);
      } else {
        const dataStr = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(csvContent);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', defaultFilename);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        saved = true;
      }

      if (saved) {
        triggerToast('¡Mazo exportado con éxito!');
      }
    } catch (error) {
      console.error('Error al exportar mazo a CSV:', error);
      triggerToast('Error al exportar el mazo.');
    }
  };

  const activeShortcutTimerRef = useRef(null);
  const lastDeckIdRef = useRef(null);
  const flippedAtRef = useRef(0);

  const displayStreak = getDisplayStreak({ streakCount, lastStudyDate });

  useEffect(() => {
    if (sessionCompleted) {
      playComplete();
      const colors = ['#9FA1FF', '#AEE2FF', '#FFFFFF', '#B5BAFF'];
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: colors,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: colors,
      });
    }
  }, [sessionCompleted]);

  const handleSaveAndExit = () => {
    setIsSavingAndExiting(true);
    setTimeout(() => {
      onBack();
    }, 600);
  };

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

    const { queue, strictlyDueCount, dueCardsCount, newCardsCount } = getPrioritizedQueue(
      deck,
      new Date()
    );

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

  // Manejadores de Edición Rápida In-Line
  const handleOpenEdit = useCallback((cardToEdit) => {
    if (!cardToEdit) return;
    setEditFront(cardToEdit.front || '');
    setEditBack(cardToEdit.back || '');
    setShowDeleteConfirm(false);
    setIsEditingCard(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditingCard(false);
    setShowDeleteConfirm(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!currentCard) return;

    const trimmedFront = editFront.trim();
    const trimmedBack = editBack.trim();

    if (!trimmedFront || !trimmedBack) {
      triggerToast('La pregunta y respuesta no pueden estar vacías.');
      return;
    }

    if (onUpdateCard) {
      onUpdateCard(deck.id, currentCard.id, { front: trimmedFront, back: trimmedBack });
    }

    setDueCards((prev) =>
      prev.map((c) => (c.id === currentCard.id ? { ...c, front: trimmedFront, back: trimmedBack } : c))
    );

    handleCloseEdit();
    triggerToast('¡Tarjeta actualizada en tiempo real!');
  }, [currentCard, deck, editBack, editFront, handleCloseEdit, onUpdateCard]);

  const handleDeleteCard = useCallback(() => {
    if (!currentCard) return;

    const targetCardId = currentCard.id;

    if (onDeleteCard) {
      onDeleteCard(deck.id, targetCardId);
    }

    setDueCards((prev) => {
      const next = prev.filter((c) => c.id !== targetCardId);
      if (next.length === 0 || currentIndex >= next.length) {
        if (started && next.length === 0) {
          setSessionCompleted(true);
        }
      }
      return next;
    });

    setSessionStates((prev) => {
      const next = { ...prev };
      delete next[targetCardId];
      return next;
    });

    setStrictlyDueCount((prev) => Math.max(0, prev - 1));

    handleCloseEdit();
    triggerToast('Tarjeta eliminada del mazo.');
  }, [currentIndex, currentCard, deck, handleCloseEdit, onDeleteCard, started]);

  const pulseShortcut = useCallback((shortcut) => {
    setActiveShortcut(shortcut);
    if (activeShortcutTimerRef.current) {
      window.clearTimeout(activeShortcutTimerRef.current);
    }
    activeShortcutTimerRef.current = window.setTimeout(() => {
      setActiveShortcut(null);
    }, 140);
  }, []);

  const queueCurrentCard = useCallback(
    (mode) => {
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
    },
    [currentCard, currentIndex]
  );

  const handleRate = useCallback(
    (quality) => {
      if (!currentCard || !deck) return;

      if (quality === 1) playAgain();
      else if (quality === 2) playSuccess();
      else if (quality === 3) playEasy();

      const cardId = currentCard.id;
      const sessionState = sessionStates[cardId] || {
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
          workingAlgorithm: outcome.sessionAlgorithm,
        },
      }));

      if (outcome.persistAlgorithm) {
        onReviewCard(deck.id, cardId, outcome.persistAlgorithm, {
          rating: quality,
          isNew: currentCard.algorithm?.state === 'new' || currentCard.algorithm?.repetitions === 0,
        });
      }

      pulseShortcut(String(quality));
      setIsFlipped(false);

      if (outcome.requeueMode !== 'none') {
        queueCurrentCard(outcome.requeueMode);
      }

      window.setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 180);
    },
    [currentCard, currentCardView, deck, onReviewCard, pulseShortcut, queueCurrentCard, sessionStates]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditingCard) {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCloseEdit();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleSaveEdit();
        }
        return;
      }

      if (sessionCompleted || !started) return;

      if (!isFlipped && e.code === 'Space') {
        e.preventDefault();
        pulseShortcut('space');
        setIsFlipped(true);
        flippedAtRef.current = Date.now();
        return;
      }

      if (e.key === 'e' || e.key === 'E') {
        if (currentCard) {
          e.preventDefault();
          handleOpenEdit(currentCardView || currentCard);
          return;
        }
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
  }, [
    currentCard,
    currentCardView,
    handleCloseEdit,
    handleOpenEdit,
    handleRate,
    handleSaveEdit,
    isEditingCard,
    isFlipped,
    pulseShortcut,
    sessionCompleted,
    started,
  ]);

  if (!started && deck && deck.cards) {
    const totalInDeck = deck.cards.length;

    return (
      <div className="flex flex-col items-center justify-between h-full w-full max-w-xl mx-auto px-4 py-4 text-light-text dark:text-dark-text animate-fade-in overflow-y-auto">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-frida-secondary/15 dark:bg-dark-muted/30 hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary text-frida-primary dark:text-dark-text border border-frida-primary/20 rounded-xl transition-all duration-200 text-xs font-bold shadow-sm"
          >
            <ChevronLeft size={16} />
            <span>Volver</span>
          </button>
          <span className="text-xs font-extrabold bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary dark:text-dark-muted px-3.5 py-1 rounded-full border border-frida-primary/20 dark:border-dark-muted">
            {deck.name}
          </span>
        </div>

        <div className="w-full bg-light-card dark:bg-dark-card rounded-3xl p-6 border border-frida-primary/15 dark:border-dark-muted shadow-sm my-auto flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-frida-primary/10 dark:border-dark-muted/40 pb-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-frida-secondary/20 dark:bg-frida-primary/15 text-frida-primary border border-frida-primary/20">
                <Layers size={24} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
                  {deck.name}
                </h2>
                <p className="text-xs text-warmgray-450 dark:text-warmgray-400 font-semibold">
                  Resumen de la sesión de estudio
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              title="Exportar mazo a CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-frida-secondary/15 dark:bg-dark-muted/30 hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary text-frida-primary dark:text-dark-text border border-frida-primary/20 dark:border-dark-muted rounded-xl transition-all text-xs font-bold shadow-sm"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-lavender-100/60 dark:bg-lavender-950/20 p-4 rounded-2xl border border-lavender-200/50 dark:border-lavender-900/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-lavender-700 dark:text-lavender-300">Nuevas</span>
              <span className="text-2xl font-black text-lavender-700 dark:text-lavender-300 mt-1">
                {counts.newCount}
              </span>
            </div>

            <div className="bg-sky-50/70 dark:bg-sky-950/20 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/30 flex flex-col justify-between">
              <span className="text-xs font-bold text-sky-700 dark:text-sky-300">Repaso</span>
              <span className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-1">
                {counts.reviewCount}
              </span>
            </div>
          </div>

          {strictlyDueCount > 0 ? (
            <div className="p-3.5 bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/20 rounded-2xl text-xs text-frida-primary dark:text-frida-secondary font-bold flex items-center gap-2">
              <Sparkles size={16} className="shrink-0" />
              <span>Tienes {strictlyDueCount} tarjeta(s) prioritarias para repasar hoy.</span>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
              <Sparkles size={16} className="shrink-0" />
              <span>No tienes repasos estrictos pendientes. Puedes adelantar repasos futuros.</span>
            </div>
          )}

          <button
            onClick={() => setStarted(true)}
            disabled={totalInDeck === 0}
            className="w-full py-4 bg-frida-primary hover:bg-frida-primary/95 active:scale-[0.98] disabled:opacity-50 text-light-text font-extrabold text-base rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-frida-secondary/30"
          >
            <Sparkles size={20} className="text-light-text" />
            <span>{totalInDeck === 0 ? 'Sin tarjetas para estudiar' : 'Comenzar repaso'}</span>
          </button>
        </div>

        <div className="w-full text-center text-xs text-warmgray-450 dark:text-warmgray-400 font-medium">
          Total de tarjetas en el mazo: <span className="font-bold">{totalInDeck}</span>
        </div>
      </div>
    );
  }

  if (sessionCompleted || dueCards.length === 0) {
    const totalRated = stats.dificil + stats.bien + stats.facil;

    return (
      <div className="flex flex-col items-center justify-between h-full w-full max-w-xl mx-auto px-4 py-4 text-light-text dark:text-dark-text animate-fade-in overflow-y-auto">
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 bg-frida-secondary/15 dark:bg-dark-muted/30 hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary text-frida-primary dark:text-dark-text border border-frida-primary/20 rounded-xl transition-all duration-200 text-xs font-bold shadow-sm"
          >
            <ChevronLeft size={16} />
            <span>Volver</span>
          </button>
        </div>

        <div className="w-full bg-light-card dark:bg-dark-card rounded-3xl p-6 border border-frida-primary/15 dark:border-dark-muted shadow-sm my-auto flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-frida-secondary/20 dark:bg-frida-primary/20 text-frida-primary rounded-full flex items-center justify-center mb-1">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            ¡Sesión completada!
          </h2>

          <p className="text-xs text-warmgray-450 dark:text-warmgray-400 font-medium -mt-2 max-w-sm">
            Has repasado todas las tarjetas del mazo de hoy. ¡Excelente trabajo manteniendo tu hábito!
          </p>

          <div className="w-full grid grid-cols-3 gap-2 my-2">
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
              <div className="text-xs font-bold text-red-500">Otra vez</div>
              <div className="text-xl font-black text-red-600 dark:text-red-400 mt-1">
                {stats.dificil}
              </div>
            </div>
            <div className="p-3 bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/20 rounded-2xl">
              <div className="text-xs font-bold text-frida-primary">Bien</div>
              <div className="text-xl font-black text-frida-primary dark:text-frida-secondary mt-1">
                {stats.bien}
              </div>
            </div>
            <div className="p-3 bg-frida-accent/15 dark:bg-frida-accent/20 border border-frida-accent/30 rounded-2xl">
              <div className="text-xs font-bold text-frida-accent dark:text-frida-accent">Fácil</div>
              <div className="text-xl font-black text-frida-accent dark:text-frida-accent mt-1">
                {stats.facil}
              </div>
            </div>
          </div>

          {todayCardsCount >= 5 ? (
            <div className="mt-2 p-3 bg-orange-500/10 border border-orange-500/25 rounded-2xl flex items-center justify-center gap-2 text-orange-500 font-extrabold text-xs animate-pulse w-full">
              <Flame size={16} fill="currentColor" className="animate-bounce" />
              <span>
                ¡Racha diaria mantenida! Racha de {displayStreak.count} día{displayStreak.count === 1 ? '' : 's'} 🔥
              </span>
            </div>
          ) : (
            <div className="mt-2 p-3 bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/20 rounded-2xl flex flex-col items-center gap-1.5 w-full">
              <div className="flex items-center gap-1.5 text-frida-primary font-bold text-xs">
                <Flame size={14} />
                <span>Meta diaria: {todayCardsCount} de 5 tarjetas</span>
              </div>
              <p className="text-[10px] text-warmgray-450 dark:text-warmgray-400">
                ¡Estudia {5 - todayCardsCount} tarjetas más hoy para mantener tu racha!
              </p>
            </div>
          )}
        </div>

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
  const againPreview = currentCardView
    ? getStudyActionPreview(currentCardView, 1, currentSessionState || {})
    : { label: '<1m' };
  const actionPreview = currentCardView
    ? getStudyActionPreview(currentCardView, 2, currentSessionState || {})
    : { label: '<10m' };
  const easyPreview = currentCardView
    ? getStudyActionPreview(currentCardView, 3, currentSessionState || {})
    : { label: '4d' };

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto px-4 py-4 justify-between text-light-text dark:text-dark-text overflow-y-auto relative">
      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleSaveAndExit}
            className="flex items-center gap-2 px-3 py-1.5 bg-frida-secondary/15 dark:bg-dark-muted/30 hover:bg-frida-primary hover:text-light-text dark:hover:bg-frida-primary text-frida-primary dark:text-dark-text border border-frida-primary/20 rounded-xl transition-all duration-200 text-xs font-bold shadow-sm"
          >
            <LogOut size={14} />
            <span>Guardar y Salir</span>
          </button>

          <div className="flex items-center gap-2">
            {currentCardView && (
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  getCardCategoryInfo(currentCardView).classes
                }`}
              >
                {getCardCategoryInfo(currentCardView).label}
              </span>
            )}
            <span className="text-xs font-bold bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary dark:text-dark-muted px-3 py-1 rounded-full border border-frida-primary/20 dark:border-dark-muted">
              Mazo: {deck.name}
            </span>
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between text-xs text-warmgray-455 dark:text-warmgray-455 mb-1.5 font-semibold">
            <span>Progreso de hoy</span>
            <span>
              {Math.min(currentIndex + 1, dueCards.length)} de {dueCards.length} tarjetas
            </span>
          </div>
          <div className="w-full h-2 bg-frida-secondary/15 dark:bg-dark-muted/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-frida-primary transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent || 5}%` }}
            />
          </div>
        </div>

        {strictlyDueCount > 0 && currentIndex >= strictlyDueCount && (
          <div className="w-full bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 text-green-800 dark:text-green-300 px-4 py-2.5 rounded-2xl text-xs font-bold text-center shadow-sm flex items-center justify-center gap-2 mb-2 animate-bounce">
            <span>
              🎉🎉 ¡Completaste las tarjetas programadas para hoy! Puedes salir o continuar repasando el resto del mazo.
            </span>
          </div>
        )}

        {strictlyDueCount === 0 && (
          <div className="w-full bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/20 text-frida-primary dark:text-frida-secondary px-4 py-2.5 rounded-2xl text-xs font-bold text-center shadow-sm">
            <span>⚡ Estás adelantando repasos futuros. Tus respuestas actualizarán el algoritmo.</span>
          </div>
        )}
      </div>

      <div className="flex-1 w-full flex items-center justify-center my-6">
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
            onEdit={handleOpenEdit}
          />
        )}
      </div>

      <div className="mt-4 min-h-[120px] w-full flex flex-col justify-center">
        {!isFlipped ? (
          <button
            onClick={() => {
              pulseShortcut('space');
              setIsFlipped(true);
              flippedAtRef.current = Date.now();
            }}
            className="w-full max-w-xl mx-auto py-4 bg-frida-primary hover:bg-frida-primary/95 active:scale-[0.98] text-light-text font-extrabold rounded-2xl shadow transition-all duration-200 flex items-center justify-center gap-2 shadow-frida-secondary/25"
          >
            <RefreshCw size={18} className="animate-spin-slow text-light-text" />
            <span>Mostrar respuesta</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 ml-2 text-[10px] font-bold bg-frida-primary/20 dark:bg-frida-primary/10 text-light-text dark:text-dark-text rounded">
              Espacio
            </kbd>
          </button>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mx-auto animate-slide-up">
            <FeedbackButton
              tone="again"
              label={`Otra vez (${againPreview.label})`}
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

      {/* MODAL DE EDICIÓN RÁPIDA IN-LINE */}
      {isEditingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-light-card dark:bg-dark-card border border-frida-primary/30 dark:border-dark-muted rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-slide-up text-light-text dark:text-dark-text">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-frida-primary/10 dark:border-dark-muted/40 pb-3">
              <div className="flex items-center gap-2.5 text-frida-primary">
                <span className="p-2 bg-frida-secondary/20 dark:bg-frida-primary/15 rounded-xl">
                  <Pencil size={18} />
                </span>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight">Edición Rápida</h3>
                  <p className="text-[11px] text-warmgray-450 dark:text-warmgray-400 font-medium">
                    Actualiza la tarjeta sin perder el progreso de tu sesión.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="p-1.5 rounded-xl text-warmgray-450 dark:text-warmgray-400 hover:bg-gray-100 dark:hover:bg-dark-muted/50 transition-colors"
                title="Cancelar (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form inputs */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-frida-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Pregunta (Frente)</span>
                </label>
                <textarea
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  placeholder="Escribe la pregunta..."
                  rows={3}
                  className="w-full p-3.5 bg-light-bg dark:bg-dark-bg border border-frida-primary/20 dark:border-dark-muted rounded-2xl text-sm font-medium text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-frida-primary/40 transition-all resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-frida-primary flex items-center gap-1.5 uppercase tracking-wider">
                  <span>Respuesta (Reverso)</span>
                </label>
                <textarea
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  placeholder="Escribe la respuesta..."
                  rows={4}
                  className="w-full p-3.5 bg-light-bg dark:bg-dark-bg border border-frida-primary/20 dark:border-dark-muted rounded-2xl text-sm font-medium text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-frida-primary/40 transition-all resize-none"
                />
              </div>
            </div>

            {/* Confirm Delete Banner */}
            {showDeleteConfirm ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex flex-col gap-2 animate-fade-in">
                <p className="text-xs font-extrabold text-red-600 dark:text-red-400 text-center">
                  ⚠️ ¿Seguro que deseas eliminar esta tarjeta del mazo permanentemente?
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteCard}
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Sí, eliminar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-1.5 bg-gray-200 dark:bg-dark-muted text-warmgray-450 dark:text-dark-text rounded-xl text-xs font-bold transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : null}

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-frida-primary/10 dark:border-dark-muted/40">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 bg-red-50 dark:bg-red-950/30 hover:bg-red-500 hover:text-white border border-red-200 dark:border-red-800/60 text-red-500 dark:text-red-400 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
                title="Eliminar tarjeta del mazo"
              >
                <Trash2 size={14} />
                <span>Eliminar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-muted/40 text-warmgray-450 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-muted rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shadow-frida-secondary/25"
                >
                  <Save size={14} />
                  <span>Guardar Cambios</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-white/20 rounded">
                    Ctrl+Enter
                  </kbd>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-slide-up z-50 text-sm font-semibold border border-frida-primary/30">
          <Sparkles size={16} className="text-frida-primary" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
