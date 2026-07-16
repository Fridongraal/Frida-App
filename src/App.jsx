import React, { useState } from 'react';
import { useSpacedRepetition } from './hooks/useSpacedRepetition';
import HomeScreen from './screens/HomeScreen';
import CreateCardScreen from './screens/CreateCardScreen';
import StudyScreen from './screens/StudyScreen';
import { Sparkles } from 'lucide-react';

export default function App() {
  const { decks, loading, createDeck, deleteDeck, addCard, reviewCard, deleteCard } = useSpacedRepetition();
  const [currentScreen, setCurrentScreen] = useState('home'); // 'home', 'create-card', 'study'
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

  // Buscar el mazo seleccionado actualmente
  const selectedDeck = decks.find((d) => d.id === selectedDeckId);

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSelectedDeckId(null);
  };

  const navigateToCreateCard = (deckId) => {
    setSelectedDeckId(deckId);
    setCurrentScreen('create-card');
  };

  const navigateToStudy = (deckId) => {
    setSelectedDeckId(deckId);
    setCurrentScreen('study');
  };

  return (
    <div className="h-screen w-screen bg-warmgray-50 select-none overflow-hidden text-warmgray-900 font-sans flex flex-col">
      {/* Contenedor Principal */}
      <main className="flex-1 overflow-hidden relative">
        {currentScreen === 'home' && (
          <HomeScreen
            decks={decks}
            onCreateDeck={createDeck}
            onDeleteDeck={deleteDeck}
            onStudy={navigateToStudy}
            onAddCard={navigateToCreateCard}
          />
        )}

        {currentScreen === 'create-card' && (
          <CreateCardScreen
            deck={selectedDeck}
            onAddCard={addCard}
            onDeleteCard={deleteCard}
            onBack={navigateToHome}
          />
        )}

        {currentScreen === 'study' && (
          <StudyScreen
            deck={selectedDeck}
            onReviewCard={reviewCard}
            onBack={navigateToHome}
          />
        )}
      </main>
    </div>
  );
}
