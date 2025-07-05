// shortcuts.js
const { globalShortcut } = require("electron");

function registerShortcuts(mainWindow) {
  // Register global shortcut for Ctrl+E (or Command+E)
  globalShortcut.register("CommandOrControl+E", () => {
    // Log when the shortcut is pressed
    console.log("Shortcut Ctrl+E (or Command+E) pressed!");

    // Send message to renderer process (web contents)
    mainWindow.webContents.send("log-shortcut", "Ctrl+E pressed!");
  });
}

module.exports = { registerShortcuts };
