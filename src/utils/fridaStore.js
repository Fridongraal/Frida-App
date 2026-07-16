function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function createDefaultAlgorithm(algorithm = {}) {
  return {
    interval: Number.isFinite(algorithm.interval) ? algorithm.interval : 1,
    easeFactor: Number.isFinite(algorithm.easeFactor) ? algorithm.easeFactor : 2.5,
    repetitions: Number.isFinite(algorithm.repetitions) ? algorithm.repetitions : 0,
    nextReviewDate: algorithm.nextReviewDate || nowIso(),
  };
}

export function createEmptyStore() {
  return { subjects: [] };
}

export function normalizeCard(card) {
  if (!card || typeof card !== 'object') return null;

  return {
    id: card.id || createId('card'),
    front: card.front || '',
    back: card.back || '',
    createdAt: card.createdAt || nowIso(),
    algorithm: createDefaultAlgorithm(card.algorithm || card),
  };
}

export function normalizeDeck(deck) {
  if (!deck || typeof deck !== 'object') return null;

  return {
    id: deck.id || createId('deck'),
    name: deck.name || 'Sin nombre',
    createdAt: deck.createdAt || nowIso(),
    cards: Array.isArray(deck.cards) ? deck.cards.map(normalizeCard).filter(Boolean) : [],
  };
}

export function normalizeSubject(subject) {
  if (!subject || typeof subject !== 'object') return null;

  return {
    id: subject.id || createId('subject'),
    name: subject.name || 'Sin nombre',
    createdAt: subject.createdAt || nowIso(),
    decks: Array.isArray(subject.decks) ? subject.decks.map(normalizeDeck).filter(Boolean) : [],
  };
}

function normalizeLegacyDeck(deck) {
  return {
    id: deck.id || createId('deck'),
    name: deck.name || 'Sin nombre',
    createdAt: deck.createdAt || nowIso(),
    cards: Array.isArray(deck.cards) ? deck.cards.map(normalizeCard).filter(Boolean) : [],
  };
}

export function normalizeStore(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  if (Array.isArray(source.subjects)) {
    return {
      subjects: source.subjects.map(normalizeSubject).filter(Boolean),
    };
  }

  const legacyFolders = Array.isArray(source.folders) ? source.folders : [];
  const legacyDecks = Array.isArray(source.decks) ? source.decks : [];

  if (legacyFolders.length > 0) {
    return {
      subjects: legacyFolders.map((folder) => ({
        id: folder.id || createId('subject'),
        name: folder.name || 'Sin nombre',
        createdAt: folder.createdAt || nowIso(),
        decks: legacyDecks
          .filter((deck) => deck.folderId === folder.id)
          .map(normalizeLegacyDeck),
      })),
    };
  }

  if (legacyDecks.length > 0) {
    return {
      subjects: [
        {
          id: 'subject-general',
          name: 'General',
          createdAt: nowIso(),
          decks: legacyDecks.map(normalizeLegacyDeck),
        },
      ],
    };
  }

  return createEmptyStore();
}

export function addSubject(store, subjectName) {
  const normalized = normalizeStore(store);
  const newSubject = {
    id: createId('subject'),
    name: subjectName,
    createdAt: nowIso(),
    decks: [],
  };

  return {
    ...normalized,
    subjects: [...normalized.subjects, newSubject],
  };
}

export function addDeckToSubject(store, subjectId, deckName) {
  const normalized = normalizeStore(store);

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      return {
        ...subject,
        decks: [
          ...subject.decks,
          {
            id: createId('deck'),
            name: deckName,
            createdAt: nowIso(),
            cards: [],
          },
        ],
      };
    }),
  };
}

export function addCardToDeck(store, subjectId, deckId, cardData) {
  const normalized = normalizeStore(store);
  const newCard = {
    id: cardData.id || createId('card'),
    front: cardData.front || '',
    back: cardData.back || '',
    createdAt: cardData.createdAt || nowIso(),
    algorithm: createDefaultAlgorithm(cardData.algorithm || cardData),
  };

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      return {
        ...subject,
        decks: subject.decks.map((deck) => {
          if (deck.id !== deckId) return deck;

          return {
            ...deck,
            cards: [...deck.cards, newCard],
          };
        }),
      };
    }),
  };
}

export function importCardsToDeck(store, subjectId, deckId, cardsData) {
  const normalized = normalizeStore(store);
  const now = nowIso();

  const newCards = cardsData.map((cardData) => ({
    id: cardData.id || createId('card'),
    front: cardData.front || '',
    back: cardData.back || '',
    createdAt: cardData.createdAt || now,
    algorithm: createDefaultAlgorithm(cardData.algorithm),
  }));

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      return {
        ...subject,
        decks: subject.decks.map((deck) => {
          if (deck.id !== deckId) return deck;

          return {
            ...deck,
            cards: [...deck.cards, ...newCards],
          };
        }),
      };
    }),
  };
}

export function updateCardAlgorithm(store, subjectId, deckId, cardId, updatedAlgorithm) {
  const normalized = normalizeStore(store);

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      return {
        ...subject,
        decks: subject.decks.map((deck) => {
          if (deck.id !== deckId) return deck;

          return {
            ...deck,
            cards: deck.cards.map((card) => {
              if (card.id !== cardId) return card;

              return {
                ...card,
                algorithm: {
                  ...createDefaultAlgorithm(card.algorithm),
                  ...updatedAlgorithm,
                },
              };
            }),
          };
        }),
      };
    }),
  };
}

export function deleteDeckFromSubject(store, subjectId, deckId) {
  const normalized = normalizeStore(store);

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;
      return {
        ...subject,
        decks: subject.decks.filter((deck) => deck.id !== deckId),
      };
    }),
  };
}

export function deleteCardFromDeck(store, subjectId, deckId, cardId) {
  const normalized = normalizeStore(store);

  return {
    ...normalized,
    subjects: normalized.subjects.map((subject) => {
      if (subject.id !== subjectId) return subject;

      return {
        ...subject,
        decks: subject.decks.map((deck) => {
          if (deck.id !== deckId) return deck;
          return {
            ...deck,
            cards: deck.cards.filter((card) => card.id !== cardId),
          };
        }),
      };
    }),
  };
}

export function findDeckLocation(store, deckId) {
  const normalized = normalizeStore(store);

  for (const subject of normalized.subjects) {
    const deck = subject.decks.find((candidate) => candidate.id === deckId);
    if (deck) {
      return { subject, deck };
    }
  }

  return null;
}

export function isCardDue(card, asOf = new Date()) {
  const cutoff = asOf instanceof Date ? asOf.getTime() : new Date(asOf).getTime();
  const nextReviewDate = card?.algorithm?.nextReviewDate || card?.nextReviewDate;
  if (!nextReviewDate) return false;
  return new Date(nextReviewDate).getTime() <= cutoff;
}

export function getPendingCounts(store, asOf = new Date()) {
  const normalized = normalizeStore(store);
  const subjectCounts = {};
  const deckCounts = {};
  const cutoff = asOf instanceof Date ? asOf.getTime() : new Date(asOf).getTime();

  for (const subject of normalized.subjects) {
    let subjectTotal = 0;

    for (const deck of subject.decks) {
      let deckTotal = 0;

      for (const card of deck.cards) {
        const reviewDate = card?.algorithm?.nextReviewDate || card?.nextReviewDate;
        if (reviewDate && new Date(reviewDate).getTime() <= cutoff) {
          deckTotal += 1;
        }
      }

      deckCounts[deck.id] = deckTotal;
      subjectTotal += deckTotal;
    }

    subjectCounts[subject.id] = subjectTotal;
  }

  return { subjectCounts, deckCounts };
}

export function getSubjectSummary(subject, asOf = new Date()) {
  const pending = getPendingCounts({ subjects: [subject] }, asOf);
  const deckCount = subject?.decks?.length || 0;
  const cardCount = subject?.decks?.reduce((acc, deck) => acc + (deck.cards?.length || 0), 0) || 0;
  const dueCards = pending.subjectCounts[subject.id] || 0;

  return { deckCount, cardCount, dueCards };
}

export function filterCards(deck, asOf = new Date()) {
  const cards = deck?.cards || [];
  const cutoff = asOf instanceof Date ? asOf.getTime() : new Date(asOf).getTime();

  const newCards = [];
  const learningCards = [];
  const reviewCards = [];

  for (const card of cards) {
    const reps = card.algorithm?.repetitions ?? card.repetitions ?? 0;
    const interval = card.algorithm?.interval ?? card.interval ?? 1;
    const nextReviewDate = card.algorithm?.nextReviewDate || card.nextReviewDate;

    if (reps === 0) {
      newCards.push(card);
    } else if (interval < 1) {
      learningCards.push(card);
    } else if (nextReviewDate && new Date(nextReviewDate).getTime() <= cutoff) {
      reviewCards.push(card);
    }
  }

  return {
    newCards,
    learningCards,
    reviewCards,
    total: newCards.length + learningCards.length + reviewCards.length
  };
}

export function getDeckSummary(deck, asOf = new Date()) {
  const cardCount = deck?.cards?.length || 0;
  const dueCards = filterCards(deck, asOf).total;

  return { cardCount, dueCards };
}

export function getPrioritizedQueue(deck, asOf = new Date()) {
  const cards = deck?.cards || [];
  const cutoff = asOf instanceof Date ? asOf.getTime() : new Date(asOf).getTime();

  const dueCards = [];
  const newCards = [];
  const futureCards = [];

  for (const card of cards) {
    const reps = card.algorithm?.repetitions ?? card.repetitions ?? 0;
    const nextReviewDate = card.algorithm?.nextReviewDate || card.nextReviewDate;

    if (reps === 0) {
      newCards.push(card);
    } else {
      const reviewTime = nextReviewDate ? new Date(nextReviewDate).getTime() : 0;
      if (reviewTime <= cutoff) {
        dueCards.push(card);
      } else {
        futureCards.push(card);
      }
    }
  }

  // Sort dueCards: smaller interval first, then smaller easeFactor
  dueCards.sort((a, b) => {
    const intA = a.algorithm?.interval ?? a.interval ?? 1;
    const intB = b.algorithm?.interval ?? b.interval ?? 1;
    if (intA !== intB) return intA - intB;

    const easeA = a.algorithm?.easeFactor ?? a.easeFactor ?? 2.5;
    const easeB = b.algorithm?.easeFactor ?? b.easeFactor ?? 2.5;
    return easeA - easeB;
  });

  // Sort futureCards: closest date first
  futureCards.sort((a, b) => {
    const dateA = new Date(a.algorithm?.nextReviewDate || a.nextReviewDate || 0).getTime();
    const dateB = new Date(b.algorithm?.nextReviewDate || b.nextReviewDate || 0).getTime();
    return dateA - dateB;
  });

  const queue = [...dueCards, ...newCards, ...futureCards];
  const strictlyDueCount = dueCards.length + newCards.length;

  return {
    queue,
    strictlyDueCount,
    dueCardsCount: dueCards.length,
    newCardsCount: newCards.length,
    futureCardsCount: futureCards.length
  };
}
