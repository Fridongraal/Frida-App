import { useEffect, useState } from 'react';
import { calculateSM2 } from '../utils/sm2';
import {
  addCardToDeck,
  addDeckToSubject,
  addSubject,
  createEmptyStore,
  deleteCardFromDeck,
  deleteDeckFromSubject,
  findDeckLocation,
  normalizeStore,
  updateCardAlgorithm,
} from '../utils/fridaStore';

function toFlatDecks(subjects) {
  return subjects.flatMap((subject) =>
    subject.decks.map((deck) => ({
      ...deck,
      folderId: subject.id,
      subjectId: subject.id,
      description: '',
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
          setStore(normalizeStore(nextStore));
        } else {
          const local = localStorage.getItem('frida-data');
          setStore(normalizeStore(local ? JSON.parse(local) : createEmptyStore()));
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

  const reviewCard = (deckId, cardId, quality) => {
    const location = findDeckLocation(store, deckId);
    if (!location) return;

    const { subject } = location;
    const deck = subject.decks.find((candidate) => candidate.id === deckId);
    const card = deck?.cards.find((candidate) => candidate.id === cardId);
    if (!deck || !card) return;

    const result = calculateSM2(
      quality,
      card.algorithm.interval,
      card.algorithm.easeFactor,
      card.algorithm.repetitions
    );

    persistStore(
      updateCardAlgorithm(store, subject.id, deckId, cardId, {
        interval: result.interval,
        easeFactor: result.easeFactor,
        repetitions: result.repetitions,
        nextReviewDate: result.nextReviewDate,
      })
    );
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
    folders: subjects,
    decks,
    loading,
    addSubject: createSubject,
    createFolder: createSubject,
    addDeckToSubject: createDeck,
    createDeck,
    addCardToDeck: addCard,
    addCard,
    updateCardAlgorithm: (subjectId, deckId, cardId, updatedAlgorithm) =>
      persistStore(updateCardAlgorithm(store, subjectId, deckId, cardId, updatedAlgorithm)),
    reviewCard,
    deleteDeck,
    deleteCard,
    saveStore: persistStore,
  };
}
