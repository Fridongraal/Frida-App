function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeFolder(folder) {
  if (!folder || typeof folder !== 'object') return null;

  return {
    id: folder.id || createId('folder'),
    name: folder.name || 'Sin nombre',
    createdAt: folder.createdAt || new Date().toISOString(),
  };
}

function normalizeCard(card, deckId) {
  if (!card || typeof card !== 'object') return null;

  return {
    id: card.id || createId('card'),
    deckId: card.deckId || deckId,
    front: card.front || '',
    back: card.back || '',
    interval: Number.isFinite(card.interval) ? card.interval : 1,
    easeFactor: Number.isFinite(card.easeFactor) ? card.easeFactor : 2.5,
    repetitions: Number.isFinite(card.repetitions) ? card.repetitions : 0,
    nextReviewDate: card.nextReviewDate || new Date().toISOString(),
  };
}

function normalizeDeck(deck, folderId) {
  if (!deck || typeof deck !== 'object') return null;

  const normalizedDeckId = deck.id || createId('deck');
  const cards = Array.isArray(deck.cards)
    ? deck.cards.map((card) => normalizeCard(card, normalizedDeckId)).filter(Boolean)
    : [];

  return {
    id: normalizedDeckId,
    folderId: deck.folderId || folderId,
    name: deck.name || 'Sin nombre',
    description: deck.description || '',
    cards,
  };
}

export function createInitialData() {
  const folderId = 'folder-idiomas';

  return {
    folders: [
      {
        id: folderId,
        name: 'Idiomas',
        createdAt: new Date().toISOString(),
      },
    ],
    decks: [
      normalizeDeck(
        {
          id: 'deck-1',
          folderId,
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
              nextReviewDate: new Date().toISOString(),
            },
            {
              id: 'card-2',
              deckId: 'deck-1',
              front: 'Serendipity',
              back: 'Serendipia / Hallazgo afortunado, valioso e inesperado.',
              interval: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date().toISOString(),
            },
          ],
        },
        folderId
      ),
      normalizeDeck(
        {
          id: 'deck-2',
          folderId,
          name: 'Capitales del Mundo 🌍',
          description: 'Aprende y recuerda las capitales de diversos países del mundo.',
          cards: [
            {
              id: 'card-4',
              deckId: 'deck-2',
              front: '¿Cuál es la capital de Australia?',
              back: 'Canberra (mucha gente cree erróneamente que es Sydney o Melbourne).',
              interval: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date().toISOString(),
            },
            {
              id: 'card-5',
              deckId: 'deck-2',
              front: '¿Cuál es la capital de Canadá?',
              back: 'Ottawa',
              interval: 1,
              easeFactor: 2.5,
              repetitions: 0,
              nextReviewDate: new Date().toISOString(),
            },
          ],
        },
        folderId
      ),
    ].filter(Boolean),
  };
}

export function normalizeData(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const rawFolders = Array.isArray(source.folders) ? source.folders : [];
  const rawDecks = Array.isArray(source.decks) ? source.decks : [];

  const folders = rawFolders.map(normalizeFolder).filter(Boolean);
  const fallbackFolderId = folders[0]?.id || 'folder-general';

  const normalizedDecks = rawDecks
    .map((deck) => normalizeDeck(deck, fallbackFolderId))
    .filter(Boolean)
    .map((deck) => {
      const folderExists = folders.some((folder) => folder.id === deck.folderId);
      return folderExists ? deck : { ...deck, folderId: fallbackFolderId };
    });

  const normalizedFolders =
    folders.length > 0
      ? folders
      : normalizedDecks.length > 0
        ? [
            {
              id: fallbackFolderId,
              name: 'General',
              createdAt: new Date().toISOString(),
            },
          ]
        : [];

  return {
    folders: normalizedFolders,
    decks: normalizedDecks,
  };
}

export function getFolderStats(folderId, decks, isCardDue) {
  const folderDecks = decks.filter((deck) => deck.folderId === folderId);

  return folderDecks.reduce(
    (acc, deck) => {
      const cards = deck.cards || [];
      acc.deckCount += 1;
      acc.cardCount += cards.length;
      acc.dueCards += cards.filter(isCardDue).length;
      return acc;
    },
    { deckCount: 0, cardCount: 0, dueCards: 0 }
  );
}
