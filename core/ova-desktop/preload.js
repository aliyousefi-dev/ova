const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runCli: (args) => ipcRenderer.invoke('run-cli', args),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  onCliLog: (callback) => ipcRenderer.on('cli-log', (_, msg) => callback(msg)),

  // New method to open folder in OS file explorer
  openInExplorer: (folderPath) => shell.openPath(folderPath),

  onLogShortcut: (callback) => ipcRenderer.on('log-shortcut', (_, msg) => callback(msg)),

  sendSettingsSave: () => ipcRenderer.send('settings-save'),

  // New method to receive log-settings-save event
  onSettingsSavedLog: (callback) => ipcRenderer.on('log-settings-save', (_, msg) => callback(msg)),

  // New method to send serve-repo event
  sendServeRepo: () => ipcRenderer.send('serve-repo'),

  // New method to receive log-serve-repo event
  onServeRepoLog: (callback) => ipcRenderer.on('log-serve-repo', (_, msg) => callback(msg)),
});
