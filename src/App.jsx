import React, { useState } from 'react';
import { useFridaData } from './hooks/useFridaData';
import HomeScreen from './screens/HomeScreen';
import SubjectViewScreen from './screens/SubjectViewScreen';
import CreateCardScreen from './screens/CreateCardScreen';
import StudyScreen from './screens/StudyScreen';
import SettingsScreen from './screens/SettingsScreen';
import StatsScreen from './screens/StatsScreen';
import CSVImporter from './components/CSVImporter';
import { Sparkles } from 'lucide-react';
import logoIcon from './assets/logo-icon.png';

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
    updateCard,
    deleteCard,
    deleteSubject,
    saveStore,
    streakCount,
    lastStudyDate,
    todayCardsCount,
    lastActiveDate,
    reviewHistory
  } = useFridaData();
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'subject', 'create-card', 'study', 'settings', 'stats'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [isCSVImporterOpen, setIsCSVImporterOpen] = useState(false);
  const [csvImporterDeckId, setCsvImporterDeckId] = useState(null);

  const handleOpenCSVImporter = (deckId = null) => {
    setCsvImporterDeckId(deckId);
    setIsCSVImporterOpen(true);
  };

  // Pantalla de carga estética con logo oficial
  if (loading) {
    return (
      <div className="h-screen w-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-in-out">
        <div className="w-20 h-20 p-2.5 bg-light-card/90 dark:bg-dark-card/90 rounded-3xl border border-frida-primary/30 dark:border-dark-muted flex items-center justify-center shadow-lg relative transition-all duration-300 ease-in-out animate-bounce">
          <img src={logoIcon} alt="Frida Doodle Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg font-black uppercase tracking-tight text-light-text dark:text-dark-text">Frida</span>
          <span className="text-xs font-semibold text-warmgray-450 dark:text-warmgray-400">Preparando tus mazos...</span>
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
            reviewHistory={reviewHistory}
            onCreateSubject={addSubject}
            onOpenSubject={navigateToSubject}
            onOpenSettings={() => setCurrentScreen('settings')}
            onOpenStats={() => setCurrentScreen('stats')}
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
            onOpenStats={() => setCurrentScreen('stats')}
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
            onUpdateCard={updateCard}
            onDeleteCard={deleteCard}
            onBack={navigateBackFromDetail}
            streakCount={streakCount}
            lastStudyDate={lastStudyDate}
            todayCardsCount={todayCardsCount}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            store={store}
            saveStore={saveStore}
            onClearData={() => {
              saveStore({ subjects: [], soundEnabled: store.soundEnabled });
              setSelectedSubjectId(null);
              setSelectedDeckId(null);
            }}
            onBack={() => {
              if (selectedSubjectId) {
                setCurrentScreen('subject');
              } else {
                navigateToHome();
              }
            }}
          />
        )}

        {currentScreen === 'stats' && (
          <StatsScreen
            decks={decks}
            reviewHistory={reviewHistory}
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
