const { ipcMain, dialog, BrowserWindow } = require("electron");

module.exports = function registerPickFolder() {
  ipcMain.handle("pick-folder", async (event) => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return null;

    const result = await dialog.showOpenDialog(window, {
      properties: ["openDirectory"],
    });

    if (result.canceled || result.filePaths.length === 0) return null;

    return result.filePaths[0];
  });
};
