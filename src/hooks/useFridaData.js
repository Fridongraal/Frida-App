import { useEffect, useState } from 'react';
import { applyStudyAction } from '../utils/fridaReview';
import { processCardReviewStreak } from '../utils/streakManager';
import { setSoundEnabled } from '../utils/soundManager';
import {
  addCardToDeck,
  addDeckToSubject,
  addSubject,
  createEmptyStore,
  deleteCardFromDeck,
  deleteDeckFromSubject,
  deleteSubject,
  findDeckLocation,
  normalizeStore,
  updateCardAlgorithm,
  importCardsToDeck,
} from '../utils/fridaStore';

function toFlatDecks(subjects) {
  return subjects.flatMap((subject) =>
    subject.decks.map((deck) => ({
      ...deck,
      subjectId: subject.id,
      cards: deck.cards.map((card) => ({
        ...card,
        interval: card.algorithm.interval,
        easeFactor: card.algorithm.easeFactor,
        repetitions: card.algorithm.repetitions,
        nextReviewDate: card.algorithm.nextReviewDate,
      })),
    }))
  );
}

export function useFridaData() {
  const [store, setStore] = useState(createEmptyStore());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialStore() {
      try {
        if (window.electronAPI?.getStore) {
          const nextStore = await window.electronAPI.getStore();
          const normalized = normalizeStore(nextStore);
          setStore(normalized);
          setSoundEnabled(normalized.soundEnabled);
        } else {
          const local = localStorage.getItem('frida-data');
          const normalized = normalizeStore(local ? JSON.parse(local) : createEmptyStore());
          setStore(normalized);
          setSoundEnabled(normalized.soundEnabled);
        }
      } catch (error) {
        console.error('Error loading Frida store:', error);
        setStore(createEmptyStore());
      } finally {
        setLoading(false);
      }
    }

    loadInitialStore();
  }, []);

  const persistStore = async (nextStore) => {
    const normalized = normalizeStore(nextStore);
    setStore(normalized);
    setSoundEnabled(normalized.soundEnabled);

    try {
      if (window.electronAPI?.saveStore) {
        await window.electronAPI.saveStore(normalized);
      } else {
        localStorage.setItem('frida-data', JSON.stringify(normalized));
      }
    } catch (error) {
      console.error('Error saving Frida store:', error);
    }
  };

  const createSubject = (subjectName) => {
    const nextStore = addSubject(store, subjectName);
    persistStore(nextStore);
  };

  const createDeck = (subjectId, deckName) => {
    const nextStore = addDeckToSubject(store, subjectId, deckName);
    persistStore(nextStore);
  };

  const addCard = (deckId, front, back) => {
    const location = findDeckLocation(store, deckId);
    if (!location) return;

    const nextStore = addCardToDeck(store, location.subject.id, deckId, { front, back });
    persistStore(nextStore);
  };

  const reviewCard = (deckId, cardId, quality, historyMeta) => {
    const location = findDeckLocation(store, deckId);
    if (!location) return;

    const { subject } = location;
    const deck = subject.decks.find((candidate) => candidate.id === deckId);
    const card = deck?.cards.find((candidate) => candidate.id === cardId);
    if (!deck || !card) return;

    const persistAlgorithm = (typeof quality === 'object' && quality !== null)
      ? (quality.persistAlgorithm ? quality.persistAlgorithm : (quality.nextReviewDate ? quality : null))
      : applyStudyAction(card, quality, {}).persistAlgorithm;

    if (!persistAlgorithm) return;

    const nextStore = updateCardAlgorithm(store, subject.id, deckId, cardId, {
      interval: persistAlgorithm.interval,
      easeFactor: persistAlgorithm.easeFactor,
      repetitions: persistAlgorithm.repetitions,
      nextReviewDate: persistAlgorithm.nextReviewDate,
    });

    // Record review in history
    const localDate = new Date();
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0');
    const day = String(localDate.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    const newHistoryEntry = {
      date: dateString,
      deckId,
      cardId,
      rating: historyMeta?.rating || 2, // 1: Otra vez, 2: Bien, 3: Fácil
      isNew: historyMeta?.isNew ?? (card.algorithm?.repetitions === 0)
    };

    const currentHistory = Array.isArray(nextStore.reviewHistory) ? nextStore.reviewHistory : [];
    const updatedHistory = [...currentHistory, newHistoryEntry];
    
    const storeWithHistory = {
      ...nextStore,
      reviewHistory: updatedHistory
    };

    const storeWithStreak = processCardReviewStreak(storeWithHistory);
    persistStore(storeWithStreak);
  };

  const removeSubject = (subjectId) => {
    persistStore(deleteSubject(store, subjectId));
  };

  const deleteDeck = (deckId) => {
    const location = findDeckLocation(store, deckId);
    if (!location) return;

    persistStore(deleteDeckFromSubject(store, location.subject.id, deckId));
  };

  const deleteCard = (deckId, cardId) => {
    const location = findDeckLocation(store, deckId);
    if (!location) return;

    persistStore(deleteCardFromDeck(store, location.subject.id, deckId, cardId));
  };

  const subjects = store.subjects;
  const decks = toFlatDecks(subjects);

  return {
    store,
    subjects,
    decks,
    loading,
    addSubject: createSubject,
    addDeckToSubject: createDeck,
    addCardToDeck: addCard,
    importCards: (subjectId, deckId, cards) =>
      persistStore(importCardsToDeck(store, subjectId, deckId, cards)),
    updateCardAlgorithm: (subjectId, deckId, cardId, updatedAlgorithm) =>
      persistStore(updateCardAlgorithm(store, subjectId, deckId, cardId, updatedAlgorithm)),
    reviewCard,
    deleteDeck,
    deleteCard,
    deleteSubject: removeSubject,
    saveStore: persistStore,
    streakCount: store.streakCount || 0,
    lastStudyDate: store.lastStudyDate || null,
    todayCardsCount: store.todayCardsCount || 0,
    lastActiveDate: store.lastActiveDate || null,
    reviewHistory: store.reviewHistory || []
  };
}
