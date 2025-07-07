// ipc-bridge.js
const { contextBridge, ipcRenderer } = require("electron");

console.log("IPC Bridge is loaded on Web and ready.");

contextBridge.exposeInMainWorld("IPCBridge", {
  windowControl: (action) => ipcRenderer.send("window-control", action),
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  folderExists: (folderPath) => ipcRenderer.invoke("folder-exists", folderPath),
  joinPaths: (folderPath, folderName) =>
    ipcRenderer.invoke("join-paths", folderPath, folderName),

  // New method to listen for shortcut presses
  onShortcutPressed: (callback) => {
    ipcRenderer.on("key-shortcut", (event, message) => {
      callback(message); // Pass the message received from the main process
    });
  },

  // Exposing the "ovacli" function to the renderer process
  runOvacli: (args) => ipcRenderer.invoke("ovacli", args), // This will be used to run the CLI

  showItemInFolder: (fullPath) =>
    ipcRenderer.invoke("show-item-in-folder", fullPath),

  getDirectoryName: (fullPath) =>
    ipcRenderer.invoke("get-directory-name", fullPath),
});
