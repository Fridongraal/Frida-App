import React, { useState } from 'react';
import { useFridaData } from './hooks/useFridaData';
import HomeScreen from './screens/HomeScreen';
import SubjectViewScreen from './screens/SubjectViewScreen';
import CreateCardScreen from './screens/CreateCardScreen';
import StudyScreen from './screens/StudyScreen';
import { Sparkles } from 'lucide-react';

export default function App() {
  const {
    subjects,
    decks,
    loading,
    addSubject,
    addDeckToSubject,
    deleteDeck,
    addCardToDeck,
    reviewCard,
    deleteCard
  } = useFridaData();
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'subject', 'create-card', 'study'
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedDeckId, setSelectedDeckId] = useState(null);

  // Pantalla de carga estética
  if (loading) {
    return (
      <div className="h-screen w-screen bg-warmgray-50 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 bg-white rounded-3xl border border-lavender-100 flex items-center justify-center text-lavender-500 shadow-sm relative">
          <Sparkles size={28} className="animate-pulse text-lavender-500" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-base font-bold text-lavender-950">Frida</span>
          <span className="text-xs font-medium text-warmgray-400">Preparando tus mazos...</span>
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
    <div className="h-screen w-screen bg-warmgray-50 select-none overflow-hidden text-warmgray-900 font-sans flex flex-col">
      {/* Contenedor Principal */}
      <main className="flex-1 overflow-hidden relative">
        {currentScreen === 'home' && (
          <HomeScreen
            subjects={subjects}
            decks={decks}
            onCreateSubject={addSubject}
            onOpenSubject={navigateToSubject}
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
      </main>
    </div>
  );
}
