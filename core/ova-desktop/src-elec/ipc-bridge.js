// ipc-bridge.js

const { contextBridge, ipcRenderer } = require("electron");

console.log("IPC Bridge is loaded on Web and ready.");

contextBridge.exposeInMainWorld("IPCBridge", {
  windowControl: (action) => ipcRenderer.send("window-control", action),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  folderExists: (folderPath) => ipcRenderer.invoke("folder-exists", folderPath),
  joinPaths: (folderPath, folderName) =>
    ipcRenderer.invoke("join-paths", folderPath, folderName),
  saveRepositoryInfo: (metadata) =>
    ipcRenderer.invoke("save-repository-info", metadata),
  loadRepositoryInfo: () => ipcRenderer.invoke("load-repository-info"),
});
