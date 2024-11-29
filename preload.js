const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  quitApp: () => ipcRenderer.send('quit-app')
});

// main.js
const { app, ipcMain } = require('electron');

ipcMain.on('quit-app', () => {
  app.quit();
});