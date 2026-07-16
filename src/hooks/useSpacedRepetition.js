import { useState, useEffect } from 'react';
import { calculateSM2 } from '../utils/sm2';

/**
 * Hook personalizado para manejar la lógica de mazos, tarjetas y repetición espaciada.
 */
export function useSpacedRepetition() {
  const [data, setData] = useState({ decks: [] });
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar el componente
  useEffect(() => {
    async function loadInitialData() {
      try {
        if (window.electronAPI && window.electronAPI.loadData) {
          const res = await window.electronAPI.loadData();
          setData(res || { decks: [] });
        } else {
          // Fallback para testing en navegador web
          const local = localStorage.getItem('frida-data');
          if (local) {
            setData(JSON.parse(local));
          } else {
            // Datos de prueba iniciales para navegador
            const defaultData = {
              decks: [
                {
                  id: 'deck-1',
                  name: 'Vocabulario de Inglés 🇬🇧',
                  description: 'Palabras y frases esenciales para mejorar tu vocabulario diario.',
                  cards: [
                    {
                      id: 'card-1',
                      deckId: 'deck-1',
                      front: 'Ephemeral',
                      back: 'Efímero / Que dura muy poco tiempo.',
                      interval: 1,
                      easeFactor: 2.5,
                      repetitions: 0,
                      nextReviewDate: new Date().toISOString()
                    },
                    {
                      id: 'card-2',
                      deckId: 'deck-1',
                      front: 'Serendipity',
                      back: 'Serendipia / Hallazgo afortunado, valioso e inesperado.',
                      interval: 1,
                      easeFactor: 2.5,
                      repetitions: 0,
                      nextReviewDate: new Date().toISOString()
                    }
                  ]
                }
              ]
            };
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
    setData(newData);
    try {
      if (window.electronAPI && window.electronAPI.saveData) {
        await window.electronAPI.saveData(newData);
      } else {
        localStorage.setItem('frida-data', JSON.stringify(newData));
      }
    } catch (err) {
      console.error('Error al guardar datos persistentes:', err);
    }
  };

  // Crear un nuevo mazo
  const createDeck = (name, description) => {
    const newDeck = {
      id: `deck-${Date.now()}`,
      name,
      description: description || '',
      cards: []
    };
    const updatedData = { ...data, decks: [...data.decks, newDeck] };
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
    decks: data.decks,
    loading,
    createDeck,
    deleteDeck,
    addCard,
    reviewCard,
    deleteCard
  };
}
