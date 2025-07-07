// ipc-handlers/show-item-in-folder.js
const { ipcMain, shell } = require("electron");

module.exports = function registerShowItemInFolder() {
  console.log("show-item-in-folder handler registered"); // Debug log
  ipcMain.handle("show-item-in-folder", async (event, fullPath) => {
    try {
      // shell.showItemInFolder directly takes the full path to the item
      const success = shell.showItemInFolder(fullPath);
      if (!success) {
        console.error(`Failed to show item in folder: ${fullPath}`);
        return false;
      }
      return true;
    } catch (e) {
      console.error("Error showing item in folder:", e);
      return false; // Return false in case of an error
    }
  });
};
