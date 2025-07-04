const { ipcMain } = require("electron");

module.exports = function registerWindowControl(mainWindow) {
  ipcMain.on("window-control", (event, action) => {
    console.log(`Received window control action: ${action}`); // Log the received action

    if (!mainWindow) {
      console.log("Main window is not available."); // Log if mainWindow is not available
      return;
    }

    switch (action) {
      case "minimize":
        console.log("Minimizing window..."); // Log minimize action
        mainWindow.minimize();
        break;
      case "maximize":
        if (mainWindow.isMaximized()) {
          console.log("Unmaximizing window..."); // Log unmaximize action
          mainWindow.unmaximize();
        } else {
          console.log("Maximizing window..."); // Log maximize action
          mainWindow.maximize();
        }
        break;
      case "close":
        console.log("Closing window..."); // Log close action
        mainWindow.close();
        break;
      default:
        console.log(`Unknown window control action: ${action}`); // Log any unknown actions
        break;
    }
  });
};
