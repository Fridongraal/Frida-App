const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getStore: () => ipcRenderer.invoke('get-store'),
  saveStore: (data) => ipcRenderer.invoke('save-store', data),
  loadData: () => ipcRenderer.invoke('get-store'),
  saveData: (data) => ipcRenderer.invoke('save-store', data)
});
