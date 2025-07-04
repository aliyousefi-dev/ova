const { ipcMain } = require("electron");

module.exports = function registerWindowControl(mainWindow) {
  ipcMain.on("window-control", (event, action) => {
    console.log(`Window control action: ${action}`);
    if (!mainWindow) return;
    switch (action) {
      case "minimize":
        mainWindow.minimize();
        break;
      case "maximize":
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case "close":
        mainWindow.close();
        break;
    }
  });
};
