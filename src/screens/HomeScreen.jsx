import React, { useState } from 'react';
import { FolderPlus, Layers, X, ChevronRight, AlertCircle, Settings, Upload } from 'lucide-react';
import { getSubjectSummary } from '../utils/fridaStore';

export default function HomeScreen({ subjects, decks, onCreateSubject, onOpenSubject, onOpenSettings, onOpenCSVImporter }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const totalSubjects = subjects.length;
  const totalDecks = decks.length;
  const totalDue = subjects.reduce((acc, subject) => acc + getSubjectSummary(subject).dueCards, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    onCreateSubject(newSubjectName.trim());
    setNewSubjectName('');
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-6 py-8 overflow-y-auto animate-fade-in text-light-text dark:text-dark-text">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight flex items-center gap-2">
            <span>Frida</span>
            <span className="text-sm font-bold bg-frida-secondary/30 dark:bg-frida-primary/25 text-frida-primary dark:text-frida-secondary px-2.5 py-0.5 rounded-full">
              MVP
            </span>
          </h1>
          <p className="text-sm text-warmgray-450 dark:text-warmgray-450 mt-1">
            Organiza tus mazos por materia y estudia con un flujo más claro.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenSettings}
            className="p-3 text-warmgray-450 hover:text-frida-primary dark:text-warmgray-300 dark:hover:text-frida-primary hover:bg-frida-primary/10 dark:hover:bg-frida-primary/20 rounded-2xl transition-all duration-200"
            title="Configuración"
          >
            <Settings size={20} />
          </button>

          <button
            onClick={onOpenCSVImporter}
            className="flex items-center gap-2 px-4 py-3 bg-light-card dark:bg-dark-card hover:bg-frida-secondary/15 dark:hover:bg-frida-secondary/20 text-frida-primary dark:text-frida-secondary border border-frida-primary/30 dark:border-lavender-950/60 font-bold rounded-2xl transition-all duration-200 shadow-sm"
            title="Importar tarjetas desde CSV"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Importar CSV</span>
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-frida-primary hover:bg-frida-primary/90 active:scale-[0.98] text-light-text font-extrabold rounded-2xl transition-all duration-200 shadow-sm shadow-frida-secondary/30 dark:shadow-none"
          >
            <FolderPlus size={18} />
            <span>Nueva Materia</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-450 uppercase tracking-wider">
            Materias
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{totalSubjects}</span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-450 uppercase tracking-wider">
            Mazos
          </span>
          <span className="text-2xl font-bold text-light-text dark:text-dark-text mt-2">{totalDecks}</span>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 p-5 shadow-sm flex flex-col justify-between transition-colors duration-300">
          <span className="text-xs font-semibold text-warmgray-455 dark:text-warmgray-450 uppercase tracking-wider">
            Pendientes Hoy
          </span>
          <span className={`text-2xl font-bold mt-2 ${totalDue > 0 ? 'text-frida-primary' : 'text-frida-success dark:text-frida-success'}`}>
            {totalDue}
          </span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-frida-primary" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Tus Materias</h2>
        </div>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 shadow-sm animate-fade-in transition-colors duration-300">
            <div className="w-16 h-16 bg-frida-secondary/15 dark:bg-frida-primary/10 rounded-2xl flex items-center justify-center text-frida-primary mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-xl font-semibold text-lavender-950 dark:text-white mb-2">No tienes materias aún</h3>
            <p className="text-warmgray-450 dark:text-warmgray-450 max-w-sm mb-6 text-sm">
              Crea tu primera materia para empezar a organizar mazos por tema.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-3 bg-lavender-500 hover:bg-lavender-600 text-white font-bold rounded-2xl transition-colors duration-200"
            >
              Crear Materia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {subjects.map((subject) => {
              const stats = getSubjectSummary(subject, new Date());

              return (
                <button
                  key={subject.id}
                  onClick={() => onOpenSubject(subject.id)}
                  className="text-left group relative flex flex-col justify-between p-6 bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/15 dark:border-lavender-950/40 shadow-sm hover:shadow-md hover:border-frida-primary/30 dark:hover:border-lavender-800 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-frida-secondary/15 dark:bg-frida-primary/10 rounded-2xl flex items-center justify-center text-frida-primary group-hover:bg-frida-secondary/30 dark:group-hover:bg-frida-primary/20 transition-colors">
                        <Layers size={22} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-light-text dark:text-dark-text">{subject.name}</h3>
                        <p className="text-sm text-warmgray-450 dark:text-warmgray-450 mt-1">
                          {stats.deckCount} mazo{stats.deckCount === 1 ? '' : 's'} dentro de esta materia
                        </p>
                      </div>
                    </div>

                    <ChevronRight size={18} className="text-warmgray-300 dark:text-warmgray-600 group-hover:text-frida-primary transition-colors mt-1" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="rounded-2xl bg-frida-secondary/15 dark:bg-frida-primary/10 border border-frida-primary/15 dark:border-lavender-950/30 p-3 transition-colors duration-300">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-frida-primary">
                        Mazos
                      </span>
                      <span className="block text-xl font-bold text-light-text dark:text-dark-text mt-1">{stats.deckCount}</span>
                    </div>
                    <div className="rounded-2xl bg-light-card dark:bg-dark-card border border-frida-primary/15 dark:border-lavender-950/40 p-3 transition-colors duration-300">
                      <span className="block text-xs font-semibold uppercase tracking-wider text-warmgray-455 dark:text-warmgray-450">
                        Pendientes
                      </span>
                      <span className={`block text-xl font-bold mt-1 ${stats.dueCards > 0 ? 'text-frida-primary' : 'text-green-500 dark:text-green-400'}`}>
                        {stats.dueCards}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-5 text-sm">
                    <span className="text-warmgray-455 dark:text-warmgray-450 text-xs">
                      {stats.cardCount} tarjeta{stats.cardCount === 1 ? '' : 's'} en total
                    </span>
                    <span className="inline-flex items-center gap-1 text-frida-primary dark:text-frida-secondary font-semibold group-hover:translate-x-0.5 transition-transform duration-200">
                      Abrir
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-lavender-950/20 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-950 p-6 w-full max-w-md shadow-2xl relative animate-slide-up transition-all duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-warmgray-400 dark:text-warmgray-500 hover:text-lavender-950 dark:hover:text-white hover:bg-lavender-50 dark:hover:bg-lavender-950/30 rounded-xl transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-bold text-lavender-950 dark:text-white mb-1">Crear Nueva Materia</h3>
            <p className="text-xs text-warmgray-450 mb-6">
              Agrupa tus mazos por tema para mantener la organización simple.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-lavender-800 dark:text-lavender-400 uppercase tracking-wider mb-1">
                  Nombre de la materia
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Programación, Inglés, Medicina..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-warmgray-50 dark:bg-lavender-950/20 border border-lavender-100 dark:border-lavender-950 focus:border-lavender-400 focus:bg-white dark:focus:bg-darkCard text-sm text-lavender-950 dark:text-white focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-sm font-semibold text-warmgray-400 dark:text-warmgray-500 hover:bg-warmgray-100 dark:hover:bg-lavender-950/20 rounded-2xl transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold bg-lavender-500 hover:bg-lavender-600 text-white rounded-2xl transition-colors duration-200 shadow-sm"
                >
                  Crear Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

