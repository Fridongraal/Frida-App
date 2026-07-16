import { useState, useEffect } from 'react';
import { calculateSM2 } from '../utils/sm2';
import { createInitialData, normalizeData } from '../utils/dataModel';

/**
 * Hook personalizado para manejar la lógica de mazos, tarjetas y repetición espaciada.
 */
export function useSpacedRepetition() {
  const [data, setData] = useState({ folders: [], decks: [] });
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    async function loadInitialData() {
      try {
        if (window.electronAPI && window.electronAPI.loadData) {
          const res = await window.electronAPI.loadData();
          const normalized = normalizeData(res);
          setData(normalized);
        } else {
          // Fallback para testing en navegador web
          const local = localStorage.getItem('frida-data');
          if (local) {
            const normalized = normalizeData(JSON.parse(local));
            setData(normalized);
            localStorage.setItem('frida-data', JSON.stringify(normalized));
          } else {
            const defaultData = createInitialData();
            localStorage.setItem('frida-data', JSON.stringify(defaultData));
            setData(defaultData);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos persistentes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  // Guardar datos en el almacén persistente
  const saveData = async (newData) => {
    const normalized = normalizeData(newData);
    setData(normalized);
    try {
      if (window.electronAPI && window.electronAPI.saveData) {
        await window.electronAPI.saveData(normalized);
      } else {
        localStorage.setItem('frida-data', JSON.stringify(normalized));
      }
    } catch (err) {
      console.error('Error al guardar datos persistentes:', err);
    }
  };

  // Crear una nueva carpeta / materia
  const createFolder = (name) => {
    const newFolder = {
      id: `folder-${Date.now()}`,
      name,
      createdAt: new Date().toISOString()
    };
    const updatedData = { ...data, folders: [...data.folders, newFolder] };
    saveData(updatedData);
    return newFolder;
  };

  // Crear un nuevo mazo
  const createDeck = (folderId, name, description) => {
    let targetFolderId = folderId;
    let folders = data.folders;

    if (!targetFolderId) {
      if (folders.length === 0) {
        const fallbackFolder = {
          id: `folder-${Date.now()}`,
          name: 'General',
          createdAt: new Date().toISOString()
        };
        folders = [fallbackFolder];
        targetFolderId = fallbackFolder.id;
      } else {
        targetFolderId = folders[0].id;
      }
    }

    const newDeck = {
      id: `deck-${Date.now()}`,
      folderId: targetFolderId,
      name,
      description: description || '',
      cards: []
    };
    const updatedData = { ...data, folders, decks: [...data.decks, newDeck] };
    saveData(updatedData);
    return newDeck;
  };

  // Eliminar un mazo
  const deleteDeck = (deckId) => {
    const updatedData = {
      ...data,
      decks: data.decks.filter(d => d.id !== deckId)
    };
    saveData(updatedData);
  };

  // Añadir una tarjeta a un mazo específico
  const addCard = (deckId, front, back) => {
    const newCard = {
      id: `card-${Date.now()}`,
      deckId,
      front,
      back,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      nextReviewDate: new Date().toISOString()
    };

    const updatedData = {
      ...data,
      decks: data.decks.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: [...deck.cards, newCard]
          };
        }
        return deck;
      })
    };
    saveData(updatedData);
    return newCard;
  };

  // Calificar tarjeta (actualizar con SM-2)
  const reviewCard = (deckId, cardId, quality) => {
    const updatedData = {
      ...data,
      decks: data.decks.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: deck.cards.map(card => {
              if (card.id === cardId) {
                const sm2Result = calculateSM2(
                  quality,
                  card.interval,
                  card.easeFactor,
                  card.repetitions
                );
                return {
                  ...card,
                  ...sm2Result
                };
              }
              return card;
            })
          };
        }
        return deck;
      })
    };
    saveData(updatedData);
  };

  // Eliminar una tarjeta de un mazo específico
  const deleteCard = (deckId, cardId) => {
    const updatedData = {
      ...data,
      decks: data.decks.map(deck => {
        if (deck.id === deckId) {
          return {
            ...deck,
            cards: deck.cards.filter(card => card.id !== cardId)
          };
        }
        return deck;
      })
    };
    saveData(updatedData);
  };

  return {
    folders: data.folders,
    decks: data.decks,
    loading,
    createFolder,
    createDeck,
    deleteDeck,
    addCard,
    reviewCard,
    deleteCard
  };
}
