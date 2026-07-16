const fs = require('fs');
const path = require('path');
const { app } = require('electron');

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyStore() {
  return { subjects: [] };
}

function normalizeCard(card) {
  if (!card || typeof card !== 'object') return null;

  const algorithm = card.algorithm || card;

  return {
    id: card.id || createId('card'),
    front: card.front || '',
    back: card.back || '',
    createdAt: card.createdAt || nowIso(),
    algorithm: {
      interval: Number.isFinite(algorithm.interval) ? algorithm.interval : 1,
      easeFactor: Number.isFinite(algorithm.easeFactor) ? algorithm.easeFactor : 2.5,
      repetitions: Number.isFinite(algorithm.repetitions) ? algorithm.repetitions : 0,
      nextReviewDate: algorithm.nextReviewDate || nowIso(),
    }
  };
}

function normalizeDeck(deck) {
  if (!deck || typeof deck !== 'object') return null;

  return {
    id: deck.id || createId('deck'),
    name: deck.name || 'Sin nombre',
    createdAt: deck.createdAt || nowIso(),
    cards: Array.isArray(deck.cards) ? deck.cards.map(normalizeCard).filter(Boolean) : []
  };
}

function normalizeSubject(subject) {
  if (!subject || typeof subject !== 'object') return null;

  return {
    id: subject.id || createId('subject'),
    name: subject.name || 'Sin nombre',
    createdAt: subject.createdAt || nowIso(),
    decks: Array.isArray(subject.decks) ? subject.decks.map(normalizeDeck).filter(Boolean) : []
  };
}

function normalizeStore(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};

  if (Array.isArray(source.subjects)) {
    return {
      subjects: source.subjects.map(normalizeSubject).filter(Boolean)
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
          .map(normalizeDeck)
          .filter(Boolean)
      }))
    };
  }

  if (legacyDecks.length > 0) {
    return {
      subjects: [
        {
          id: 'subject-general',
          name: 'General',
          createdAt: nowIso(),
          decks: legacyDecks.map(normalizeDeck).filter(Boolean)
        }
      ]
    };
  }

  return createEmptyStore();
}

const DATA_FILE = path.join(app.getPath('userData'), 'frida-data.json');

function getStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const emptyStore = createEmptyStore();
      fs.writeFileSync(DATA_FILE, JSON.stringify(emptyStore, null, 2), 'utf-8');
      return emptyStore;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = raw ? JSON.parse(raw) : createEmptyStore();
    const normalized = normalizeStore(parsed);

    if (JSON.stringify(normalized) !== JSON.stringify(parsed)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    }

    return normalized;
  } catch (error) {
    console.error('Error loading store:', error);
    return createEmptyStore();
  }
}

function saveStore(data) {
  try {
    const normalized = normalizeStore(data);
    fs.writeFileSync(DATA_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
    return normalized;
  } catch (error) {
    console.error('Error saving store:', error);
    throw error;
  }
}

module.exports = {
  DATA_FILE,
  createEmptyStore,
  getStore,
  normalizeStore,
  saveStore
};

