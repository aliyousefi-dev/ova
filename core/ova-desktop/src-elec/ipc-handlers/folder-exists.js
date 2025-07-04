const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

module.exports = function registerFolderExists() {
  ipcMain.handle("folder-exists", async (event, folderPath) => {
    try {
      const stats = fs.statSync(folderPath);
      return stats.isDirectory(); // Check if it's a directory
    } catch (e) {
      return false; // Return false if the path doesn't exist or isn't accessible
    }
  });
};
