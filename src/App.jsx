import React, { useState } from 'react';
import { useFridaData } from './hooks/useFridaData';
import HomeScreen from './screens/HomeScreen';
import SubjectViewScreen from './screens/SubjectViewScreen';
import CreateCardScreen from './screens/CreateCardScreen';
import StudyScreen from './screens/StudyScreen';
import SettingsScreen from './screens/SettingsScreen';
import CSVImporter from './components/CSVImporter';
import { Sparkles } from 'lucide-react';

export default function App() {
  const {
    store,
    subjects,
    decks,
    loading,
    addSubject,
    addDeckToSubject,
    deleteDeck,
    addCardToDeck,
    importCards,
    reviewCard,
    deleteCard,
    deleteSubject,
    saveStore,
    streakCount,
    lastStudyDate,
    todayCardsCount,
    lastActiveDate
  } = useFridaData();
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'subject', 'create-card', 'study', 'settings'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [isCSVImporterOpen, setIsCSVImporterOpen] = useState(false);
  const [csvImporterDeckId, setCsvImporterDeckId] = useState(null);

  const handleOpenCSVImporter = (deckId = null) => {
    setCsvImporterDeckId(deckId);
    setIsCSVImporterOpen(true);
  };

  // Pantalla de carga estética
  if (loading) {
    return (
      <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
        <div className="w-16 h-16 bg-light-card dark:bg-dark-card rounded-3xl border border-frida-primary/30 dark:border-dark-muted flex items-center justify-center text-frida-primary shadow-sm relative transition-all duration-300 ease-in-out">
          <Sparkles size={28} className="animate-pulse text-frida-primary" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold text-light-text dark:text-dark-text">Frida</span>
          <span className="text-xs font-medium text-warmgray-450 dark:text-warmgray-400">Preparando tus mazos...</span>
        </div>
      </div>
    );
  }

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSelectedDeckId(null);
    setSelectedSubjectId(null);
  };

  const navigateToSubject = (subjectId) => {
    setSelectedSubjectId(subjectId);
    setSelectedDeckId(null);
    setCurrentScreen('subject');
  };

  const navigateToCreateCard = (deckId) => {
    const deck = decks.find((item) => item.id === deckId);
    if (deck?.subjectId) {
      setSelectedSubjectId(deck.subjectId);
    }
    setSelectedDeckId(deckId);
    setCurrentScreen('create-card');
  };

  const navigateToStudy = (deckId) => {
    const deck = decks.find((item) => item.id === deckId);
    if (deck?.subjectId) {
      setSelectedSubjectId(deck.subjectId);
    }
    setSelectedDeckId(deckId);
    setCurrentScreen('study');
  };

  const navigateBackFromDetail = () => {
    if (selectedSubjectId) {
      setSelectedDeckId(null);
      setCurrentScreen('subject');
    } else {
      navigateToHome();
    }
  };

  return (
    <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg select-none overflow-hidden text-light-text dark:text-dark-text font-sans flex flex-col transition-all duration-300 ease-in-out">
      {/* Contenedor Principal */}
      <main className="flex-1 overflow-hidden relative">
        {currentScreen === 'home' && (
          <HomeScreen
            subjects={subjects}
            decks={decks}
            onCreateSubject={addSubject}
            onOpenSubject={navigateToSubject}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenCSVImporter={() => handleOpenCSVImporter(null)}
            onDeleteSubject={deleteSubject}
            streakCount={streakCount}
            lastStudyDate={lastStudyDate}
          />
        )}

        {currentScreen === 'subject' && selectedSubject && (
          <SubjectViewScreen
            subject={selectedSubject}
            decks={decks.filter((deck) => deck.subjectId === selectedSubject.id)}
            onCreateDeck={addDeckToSubject}
            onDeleteDeck={deleteDeck}
            onStudy={navigateToStudy}
            onAddCard={navigateToCreateCard}
            onBack={navigateToHome}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenCSVImporter={(deckId) => handleOpenCSVImporter(deckId)}
            streakCount={streakCount}
            lastStudyDate={lastStudyDate}
          />
        )}

        {currentScreen === 'create-card' && (
          <CreateCardScreen
            subjects={subjects}
            decks={decks}
            selectedDeckId={selectedDeckId}
            onAddCard={addCardToDeck}
            onDeleteCard={deleteCard}
            onBack={navigateBackFromDetail}
          />
        )}

        {currentScreen === 'study' && (
          <StudyScreen
            deck={selectedDeck}
            onReviewCard={reviewCard}
            onBack={navigateBackFromDetail}
            streakCount={streakCount}
            lastStudyDate={lastStudyDate}
            todayCardsCount={todayCardsCount}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            store={store}
            onClearData={() => saveStore({ subjects: [] })}
            onBack={() => {
              if (selectedSubjectId) {
                setCurrentScreen('subject');
              } else {
                navigateToHome();
              }
            }}
          />
        )}
      </main>

      {isCSVImporterOpen && (
        <CSVImporter
          subjects={subjects}
          decks={decks}
          initialDeckId={csvImporterDeckId}
          onImport={async (subjectId, deckId, cards) => {
            await importCards(subjectId, deckId, cards);
          }}
          onClose={() => {
            setIsCSVImporterOpen(false);
            setCsvImporterDeckId(null);
          }}
        />
      )}
    </div>
  );
}
