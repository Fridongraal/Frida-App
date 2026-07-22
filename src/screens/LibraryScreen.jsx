import React, { useState } from 'react';
import {
  FolderPlus,
  Layers,
  X,
  ChevronRight,
  AlertCircle,
  Trash2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import DeckList from '../components/DeckList';
import { getSubjectSummary } from '../utils/fridaStore';
import { getDisplayStreak } from '../utils/streakManager';
import logoIllustration from '../assets/logo.png';

export default function LibraryScreen({
  subjects,
  decks,
  onCreateSubject,
  onOpenSubject,
  onOpenSettings,
  onOpenStats,
  onOpenCSVImporter,
  onDeleteSubject,
  onStudy,
  onAddCard,
  onDeleteDeck,
  streakCount,
  lastStudyDate,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const displayStreak = getDisplayStreak({ streakCount, lastStudyDate });

  const totalSubjects = subjects.length;
  const totalDecks = decks.length;
  const totalDue = subjects.reduce(
    (acc, subject) => acc + getSubjectSummary(subject).dueCards,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    onCreateSubject(newSubjectName.trim());
    setNewSubjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in text-light-text dark:text-dark-text">
      {/* NAVBAR CON LOGO OFICIAL */}
      <Navbar
        displayStreak={displayStreak}
        onOpenStats={onOpenStats}
        onOpenSettings={onOpenSettings}
        onOpenCSVImporter={onOpenCSVImporter}
        onCreateSubject={() => setIsModalOpen(true)}
      />

      {/* STATS DE LA BIBLIOTECA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-450 uppercase tracking-wider">
            Materias
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
            {totalSubjects}
          </span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-450 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">
            {totalDecks}
          </span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-450 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span
            className={`text-2xl font-bold mt-2 ${
              totalDue > 0 ? 'text-frida-primary' : 'text-frida-success dark:text-frida-success'
            }`}
          >
            {totalDue}
          </span>
        </div>
      </div>

      {/* VISTA PRINCIPAL DE MATERIAS Y EMPTY STATES */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-frida-primary" />
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Tus Materias</h2>
          </div>
        </div>

        {subjects.length === 0 ? (
          /* EMPTY STATE 1: SIN MATERIAS CREADAS */
          <div className="flex flex-col items-center justify-center p-10 text-center bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-dark-muted shadow-sm animate-fade-in transition-colors duration-300 my-4">
            <div className="relative mb-4 group cursor-pointer">
              <div className="absolute -inset-2 bg-gradient-to-r from-frida-primary/30 to-frida-secondary/30 rounded-full blur-lg opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative p-3 rounded-full bg-white/20 dark:bg-white/10 border border-frida-primary/20 backdrop-blur-sm">
                <img
                  src={logoIllustration}
                  alt="Frida Ilus"
                  className="h-36 w-36 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-md"
                />
              </div>
            </div>
            <h3 className="text-xl font-extrabold text-light-text dark:text-dark-text mb-2">
              ¡Bienvenido a Frida!
            </h3>
            <p className="text-xs sm:text-sm text-warmgray-455 dark:text-warmgray-400 max-w-sm mb-6 font-medium">
              Crea tu primera materia para comenzar a organizar tus mazos y estudiar con repetición espaciada.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-frida-primary hover:bg-frida-primary/95 text-light-text font-extrabold rounded-2xl transition-all duration-200 shadow-md shadow-frida-secondary/30"
            >
              <FolderPlus size={18} />
              <span>Crear Primera Materia</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* TARJETA DE ESTADO: TODO AL DÍA (FRIDA DESCANSANDO) */}
            {totalDue === 0 && totalDecks > 0 && (
              <div className="p-6 bg-light-card dark:bg-dark-card border border-frida-primary/20 dark:border-dark-muted rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-6 animate-fade-in">
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1.5 bg-frida-primary/20 rounded-full blur-md opacity-60"></div>
                  <div className="relative p-2 rounded-full bg-white/20 dark:bg-white/10 border border-frida-primary/20 backdrop-blur-sm">
                    <img
                      src={logoIllustration}
                      alt="Frida Descansando"
                      className="h-28 w-28 object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
                <div className="flex flex-col text-center sm:text-left items-center sm:items-start gap-1">
                  <span className="text-xs font-bold text-frida-primary dark:text-frida-secondary uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={14} />
                    <span>¡Todo al día por aquí!</span>
                  </span>
                  <h3 className="text-lg font-black text-light-text dark:text-dark-text">
                    Frida descansando 🎨😴
                  </h3>
                  <p className="text-xs text-warmgray-455 dark:text-warmgray-400 font-medium max-w-md">
                    No tienes repeticiones pendientes para hoy. Puedes relajarte o repasar tus mazos para adelantar materia.
                  </p>
                </div>
              </div>
            )}

            {/* LISTA DE MATERIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map((subject) => {
                const summary = getSubjectSummary(subject, new Date());
                const subjectDecks = decks.filter((deck) => deck.subjectId === subject.id);

                return (
                  <div
                    key={subject.id}
                    className="bg-light-card dark:bg-dark-card border border-frida-primary/15 dark:border-dark-muted rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <button
                          onClick={() => onOpenSubject(subject.id)}
                          className="text-left font-extrabold text-lg text-light-text dark:text-dark-text hover:text-frida-primary dark:hover:text-frida-primary transition-colors flex items-center gap-2 group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>{subject.name}</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity text-frida-primary" />
                        </button>
                        <p className="text-xs text-warmgray-450 dark:text-warmgray-400 font-semibold mt-0.5">
                          {summary.deckCount} mazo{summary.deckCount === 1 ? '' : 's'} · {summary.cardCount} tarjeta{summary.cardCount === 1 ? '' : 's'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {summary.dueCards > 0 && (
                          <span className="text-xs font-black bg-frida-secondary/20 dark:bg-frida-primary/20 text-frida-primary dark:text-frida-secondary border border-frida-primary/30 px-2.5 py-1 rounded-full">
                            {summary.dueCards} hoy
                          </span>
                        )}
                        {onDeleteSubject && (
                          <button
                            onClick={() => setSubjectToDelete(subject)}
                            className="p-1.5 text-warmgray-450 hover:text-red-500 dark:text-warmgray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Eliminar materia"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* VISTA DE MAZOS DE LA MATERIA */}
                    {subjectDecks.length > 0 ? (
                      <DeckList
                        decks={subjectDecks}
                        onStudy={onStudy}
                        onAddCard={onAddCard}
                        onDeleteDeck={onDeleteDeck}
                      />
                    ) : (
                      <div className="p-4 bg-light-bg dark:bg-dark-bg/40 rounded-2xl border border-frida-primary/10 dark:border-dark-muted/30 text-center">
                        <span className="text-xs text-warmgray-450 dark:text-warmgray-400 font-medium">
                          Esta materia no tiene mazos aún.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR MATERIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-light-card dark:bg-dark-card border border-frida-primary/30 dark:border-dark-muted rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-slide-up text-light-text dark:text-dark-text">
            <div className="flex items-center justify-between border-b border-frida-primary/10 dark:border-dark-muted/40 pb-3">
              <div className="flex items-center gap-2 text-frida-primary">
                <span className="p-2 bg-frida-secondary/20 dark:bg-frida-primary/15 rounded-xl">
                  <FolderPlus size={18} />
                </span>
                <h3 className="text-base font-extrabold tracking-tight">Nueva Materia</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-warmgray-455 dark:text-warmgray-400 hover:bg-gray-100 dark:hover:bg-dark-muted/50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-frida-primary uppercase tracking-wider">
                  Nombre de la Materia
                </label>
                <input
                  type="text"
                  autoFocus
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Ej. Medicina, Inglés, Programación..."
                  className="w-full p-3.5 bg-light-bg dark:bg-dark-bg border border-frida-primary/20 dark:border-dark-muted rounded-2xl text-sm font-medium text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-frida-primary/40 transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-dark-muted/40 text-warmgray-455 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-muted rounded-xl text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newSubjectName.trim()}
                  className="px-5 py-2.5 bg-frida-primary hover:bg-frida-primary/95 disabled:opacity-50 text-light-text font-extrabold rounded-xl text-xs shadow-md transition-all shadow-frida-secondary/25"
                >
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMACIÓN ELIMINAR MATERIA */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-light-card dark:bg-dark-card border border-red-300 dark:border-red-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-slide-up text-light-text dark:text-dark-text text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-extrabold">¿Eliminar materia "{subjectToDelete.name}"?</h3>
              <p className="text-xs text-warmgray-450 dark:text-warmgray-400 mt-1 font-medium">
                Esta acción eliminará la materia y todos los mazos y tarjetas contenidos en ella.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubjectToDelete(null)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-dark-muted text-warmgray-455 dark:text-dark-text rounded-xl text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSubject(subjectToDelete.id);
                  setSubjectToDelete(null);
                }}
                className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-extrabold rounded-xl text-xs shadow-md"
              >
                Eliminar Materia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
