const { ipcMain, BrowserWindow } = require("electron");

module.exports = function registerSettingsSave() {
  ipcMain.on("settings-save", () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.webContents.send("log-settings-save", "Settings saved!");
  });
};
