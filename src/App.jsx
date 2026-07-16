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
    saveStore
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
      <div className="h-screen w-screen bg-warmgray-50 dark:bg-darkBg flex flex-col items-center justify-center gap-4 transition-colors duration-300">
        <div className="w-16 h-16 bg-white dark:bg-darkCard rounded-3xl border border-lavender-100 dark:border-lavender-900 flex items-center justify-center text-lavender-500 dark:text-lavender-400 shadow-sm relative">
          <Sparkles size={28} className="animate-pulse text-lavender-500 dark:text-lavender-400" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold text-lavender-950 dark:text-white">Frida</span>
          <span className="text-xs font-medium text-warmgray-400 dark:text-warmgray-500">Preparando tus mazos...</span>
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
    <div className="h-screen w-screen bg-warmgray-50 dark:bg-darkBg select-none overflow-hidden text-warmgray-900 dark:text-darkText font-sans flex flex-col transition-colors duration-300">
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
