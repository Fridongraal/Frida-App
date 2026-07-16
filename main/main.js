const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DATA_FILE = path.join(app.getPath('userData'), 'frida-data.json');

// Helper to load data
function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      // Default initial seed data for MVP
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
              },
              {
                id: 'card-3',
                deckId: 'deck-1',
                front: 'Melancholy',
                back: 'Melancolía / Tristeza vaga, profunda, sosegada y permanente.',
                interval: 1,
                easeFactor: 2.5,
                repetitions: 0,
                nextReviewDate: new Date().toISOString()
              }
            ]
          },
          {
            id: 'deck-2',
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
                nextReviewDate: new Date().toISOString()
              },
              {
                id: 'card-5',
                deckId: 'deck-2',
                front: '¿Cuál es la capital de Canadá?',
                back: 'Ottawa',
                interval: 1,
                easeFactor: 2.5,
                repetitions: 0,
                nextReviewDate: new Date().toISOString()
              }
            ]
          }
        ]
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error loading data:', err);
    return { decks: [] };
  }
}

// Helper to save data
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Error saving data:', err);
    return { success: false, error: err.message };
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 850,
    minHeight: 650,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false, // Prevents white screen flash on load
    backgroundColor: '#fafaf9'
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  // Register IPC handlers
  ipcMain.handle('load-data', () => readData());
  ipcMain.handle('save-data', (event, data) => writeData(data));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
