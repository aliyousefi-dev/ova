const { globalShortcut, ipcMain } = require("electron");

function registerShortcuts(mainWindow) {
  // Register global shortcuts
  globalShortcut.register("CommandOrControl+E", () => {
    console.log("Shortcut Ctrl+E (or Command+E) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+E pressed!");
  });

  globalShortcut.register("CommandOrControl+N", () => {
    console.log("Shortcut Ctrl+N (or Command+N) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+N pressed!");
  });

  globalShortcut.register("CommandOrControl+O", () => {
    console.log("Shortcut Ctrl+O (or Command+O) pressed!");
    mainWindow.webContents.send("log-shortcut", "Ctrl+O pressed!");
  });

  // Handle IPC for shortcut logging (main process)
  ipcMain.on("log-shortcut", (event, message) => {
    console.log(`Received shortcut log request: ${message}`);
    // You can add additional logic here if needed for handling the shortcut in the main process
    // For example, you could trigger different actions based on the shortcut pressed.
  });
}

module.exports = { registerShortcuts };
