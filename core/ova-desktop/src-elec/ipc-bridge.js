const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("IPCBridge", {
  windowControl: (action) => ipcRenderer.send("window-control", action),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
});
