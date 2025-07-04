const { contextBridge, ipcRenderer, shell } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  runCli: (args) => ipcRenderer.invoke("run-cli", args),
  windowControl: (action) => {
    console.log("windowControl action:", action);
    ipcRenderer.send("window-control", action);
  },
  pickFolder: () => ipcRenderer.invoke("pick-folder"),
  onCliLog: (callback) => ipcRenderer.on("cli-log", (_, msg) => callback(msg)),
});
