const { ipcMain, BrowserWindow } = require("electron");

module.exports = function registerServeRepo() {
  ipcMain.on("serve-repo", () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.webContents.send("log-serve-repo", "Serve button clicked!");
  });
};
