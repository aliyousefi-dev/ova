// shortcuts.js
const { globalShortcut } = require("electron");

function registerShortcuts(mainWindow) {
  // Register global shortcut for Ctrl+E (or Command+E)
  globalShortcut.register("CommandOrControl+E", () => {
    console.log("Shortcut Ctrl+E (or Command+E) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+E pressed!");
  });

  // Register global shortcut for Ctrl+N (or Command+N) - For New File
  globalShortcut.register("CommandOrControl+N", () => {
    console.log("Shortcut Ctrl+N (or Command+N) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+N pressed!");
    // You can add logic here to open a new file or clear the current document
  });

  // Register global shortcut for Ctrl+O (or Command+O) - For Open File
  globalShortcut.register("CommandOrControl+O", () => {
    console.log("Shortcut Ctrl+O (or Command+O) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+O pressed!");
    // You can add logic here to open a file dialog or perform any open action
  });
}

module.exports = { registerShortcuts };
