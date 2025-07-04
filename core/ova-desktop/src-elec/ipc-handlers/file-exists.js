const { ipcMain } = require("electron");
const fs = require("fs");

module.exports = function registerFileExists() {
  ipcMain.handle("file-exists", async (event, filePath) => {
    try {
      return fs.existsSync(filePath);
    } catch (e) {
      return false;
    }
  });
};
