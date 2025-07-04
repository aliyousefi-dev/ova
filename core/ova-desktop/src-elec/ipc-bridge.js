const { contextBridge, ipcRenderer, shell, path } = require("electron");

contextBridge.exposeInMainWorld("IPCBridge", {
  windowControl: (action) => ipcRenderer.send("window-control", action),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  folderExists: (folderPath) => ipcRenderer.invoke("folder-exists", folderPath), // Added
  joinPaths: (folderPath, folderName) =>
    ipcRenderer.invoke("join-paths", folderPath, folderName),
  saveRepositoryInfo: (metadata) => ipcRenderer.invoke('save-repository-info', metadata),
  loadRepositoryInfo: () => ipcRenderer.invoke('load-repository-info'),
});
