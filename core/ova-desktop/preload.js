const { contextBridge, ipcRenderer, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runCli: (args) => ipcRenderer.invoke('run-cli', args),
  windowControl: (action) => ipcRenderer.send('window-control', action),
  pickFolder: () => ipcRenderer.invoke('pick-folder'),
  onCliLog: (callback) => ipcRenderer.on('cli-log', (_, msg) => callback(msg)),

  // New method to open folder in OS file explorer
  openInExplorer: (folderPath) => shell.openPath(folderPath),
});
