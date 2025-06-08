const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  runCli: (args) => ipcRenderer.invoke('run-cli', args),
});