const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { getStore, saveStore } = require('./storage');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  const iconName = process.platform === 'win32' ? 'icon.ico' : (process.platform === 'darwin' ? 'icon.icns' : 'icon.png');
  const iconPath = path.join(__dirname, '../assets', iconName);

  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    minWidth: 850,
    minHeight: 650,
    titleBarStyle: 'default',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    show: false,
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
  ipcMain.handle('get-store', () => getStore());
  ipcMain.handle('save-store', (_event, data) => saveStore(data));
  ipcMain.handle('load-data', () => getStore());
  ipcMain.handle('save-data', (_event, data) => saveStore(data));

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

