import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, BookOpen, Trash2 } from 'lucide-react';
import { isCardDue } from '../components/DeckList';

export default function CreateCardScreen({
  subjects,
  decks,
  selectedDeckId,
  onAddCard,
  onBack,
  onDeleteCard,
}) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeDeckId, setActiveDeckId] = useState(selectedDeckId || decks[0]?.id || '');
  const frontInputRef = useRef(null);

  useEffect(() => {
    if (selectedDeckId) {
      setActiveDeckId(selectedDeckId);
      return;
    }

    const activeDeckExists = decks.some((deck) => deck.id === activeDeckId);
    if (!activeDeckExists && decks.length > 0) {
      setActiveDeckId(decks[0].id);
    }
  }, [selectedDeckId, decks, activeDeckId]);

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === activeDeckId),
    [decks, activeDeckId]
  );

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedDeck?.subjectId),
    [subjects, selectedDeck]
  );

  const groupedDecks = useMemo(
    () =>
      subjects.map((subject) => ({
        subject,
        decks: decks.filter((deck) => deck.subjectId === subject.id),
      })),
    [subjects, decks]
  );

  if (decks.length === 0 || !selectedDeck) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh] text-light-text dark:text-dark-text">
        <AlertCircle className="text-red-500 mb-4" size={32} />
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">No hay mazos disponibles</h2>
        <p className="text-sm text-warmgray-450 dark:text-warmgray-450 mt-2 max-w-sm">
          Primero crea una materia y un mazo antes de añadir tarjetas.
        </p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-frida-primary text-light-text font-bold rounded-xl shadow">
          Volver
        </button>
      </div>
    );
  }

  const handleSave = (e, shouldClose) => {
    e.preventDefault();
    if (!front.trim() || !back.trim() || !selectedDeck) return;

    onAddCard(selectedDeck.id, front.trim(), back.trim());

    setFront('');
    setBack('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    if (shouldClose) {
      onBack();
    } else {
      frontInputRef.current?.focus();
    }
  };

  const totalCards = selectedDeck.cards?.length || 0;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-6 py-8 overflow-hidden animate-fade-in text-light-text dark:text-dark-text">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-warmgray-450 hover:text-frida-primary dark:text-warmgray-455 dark:hover:text-frida-secondary transition-colors text-sm font-medium mb-6 self-start"
      >
        <ArrowLeft size={18} />
        <span>Volver</span>
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-light-text dark:text-dark-text flex items-center gap-2 flex-wrap">
          <span>Añadir Tarjetas</span>
          <span className="text-sm font-semibold bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary dark:text-frida-secondary px-3 py-1 rounded-full border border-frida-primary/20 dark:border-lavender-950/40">
            {selectedDeck.name}
          </span>
        </h2>
        <p className="text-sm text-warmgray-455 dark:text-warmgray-450 mt-1">
          Selecciona el mazo destino. La lista está agrupada por materia para mantener el contexto claro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 flex-1 overflow-hidden">
        <form
          className="flex flex-col gap-4 md:col-span-3 overflow-y-auto pr-1"
          onSubmit={(e) => handleSave(e, false)}
        >
          <div className="bg-light-card dark:bg-dark-card border border-frida-primary/15 dark:border-lavender-950/40 rounded-3xl p-4 shadow-sm transition-colors duration-300">
            <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-2">
              Mazo destino
            </label>
            <select
              value={activeDeckId}
              onChange={(e) => setActiveDeckId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-light-bg dark:bg-dark-bg/40 border border-frida-primary/20 dark:border-lavender-950/60 focus:border-frida-primary focus:bg-light-card dark:focus:bg-dark-card text-sm text-light-text dark:text-dark-text focus:outline-none transition-all duration-200"
            >
              {groupedDecks.map(({ subject, decks: subjectDecks }) => (
                <optgroup key={subject.id} label={subject.name} className="dark:bg-dark-card">
                  {subjectDecks.map((deck) => (
                    <option key={deck.id} value={deck.id} className="dark:bg-dark-card">
                      {deck.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {selectedSubject && (
              <div className="mt-3 flex items-center gap-2 text-xs text-warmgray-450 dark:text-warmgray-400">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-frida-secondary/20 dark:bg-frida-primary/10 text-frida-primary dark:text-frida-secondary border border-frida-primary/20 dark:border-lavender-950/40">
                  Materia: {selectedSubject.name}
                </span>
                <span>{selectedDeck.cards?.filter(isCardDue).length || 0} pendientes en este mazo</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1">
                Anverso (Pregunta / Concepto)
              </label>
              <textarea
                ref={frontInputRef}
                required
                placeholder="Escribe aquí el término o pregunta..."
                value={front}
                onChange={(e) => setFront(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 rounded-2xl bg-light-bg dark:bg-dark-bg/20 border border-frida-primary/25 dark:border-lavender-950/50 focus:border-frida-primary dark:focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text transition-all resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider mb-1">
                Reverso (Respuesta / Definición)
              </label>
              <textarea
                required
                placeholder="Escribe la respuesta, aclaración o traducción..."
                value={back}
                onChange={(e) => setBack(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 rounded-2xl bg-light-bg dark:bg-dark-bg/20 border border-frida-primary/25 dark:border-lavender-950/50 focus:border-frida-primary dark:focus:border-frida-primary focus:outline-none text-sm text-light-text dark:text-dark-text transition-all resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="h-6 flex items-center justify-center">
            {showSuccess && (
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-3 py-1 rounded-full animate-fade-in flex items-center gap-1">
                <Sparkles size={12} /> ¡Tarjeta guardada con éxito!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 bg-light-card dark:bg-dark-card hover:bg-frida-secondary/15 dark:hover:bg-frida-primary/10 text-frida-primary dark:text-frida-secondary border border-frida-primary/25 dark:border-lavender-950/55 font-bold rounded-2xl text-sm transition-colors duration-200"
            >
              Añadir otra
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e, true)}
              className="flex-1 py-3 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-2xl text-sm transition-colors duration-200 shadow-sm shadow-frida-secondary/25"
            >
              Guardar y Cerrar
            </button>
          </div>
        </form>

        <div className="md:col-span-2 bg-light-card dark:bg-dark-card border border-frida-primary/15 dark:border-lavender-950/40 p-4 flex flex-col overflow-hidden shadow-sm h-full max-h-[400px] md:max-h-none transition-colors duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-frida-primary/10 dark:border-lavender-950/40 pb-2">
            <span className="text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider">
              Tarjetas en Mazo
            </span>
            <span className="text-xs font-bold bg-frida-secondary/20 dark:bg-frida-primary/15 text-frida-primary dark:text-frida-secondary px-2 py-0.5 rounded-full">
              {totalCards}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2">
            {selectedDeck.cards && selectedDeck.cards.length > 0 ? (
              selectedDeck.cards.slice().reverse().map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-2.5 bg-light-bg dark:bg-dark-bg/30 rounded-xl hover:bg-frida-secondary/15 dark:hover:bg-frida-primary/10 transition-colors border border-transparent hover:border-frida-primary/20 dark:hover:border-lavender-900 group"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{card.front}</p>
                    <p className="text-[10px] text-warmgray-450 dark:text-warmgray-500 truncate">{card.back}</p>
                  </div>
                  {onDeleteCard && (
                    <button
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
                          onDeleteCard(selectedDeck.id, card.id);
                        }
                      }}
                      className="p-1.5 text-warmgray-455 dark:text-warmgray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Eliminar tarjeta"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <BookOpen size={24} className="text-frida-primary/30 dark:text-lavender-950 mb-2" />
                <span className="text-xs text-warmgray-450 dark:text-warmgray-500">El mazo está vacío</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

