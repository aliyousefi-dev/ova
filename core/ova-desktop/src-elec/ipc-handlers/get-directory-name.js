// ipc-handlers/get-directory-name.js
const { ipcMain } = require("electron");
const path = require("path");

module.exports = function registerGetDirectoryName() {
  console.log("get-directory-name handler registered"); // Debug log
  ipcMain.handle("get-directory-name", (event, fullPath) => {
    try {
      const dirName = path.dirname(fullPath);
      return dirName;
    } catch (e) {
      console.error("Error getting directory name:", e);
      return null; // Return null in case of an error
    }
  });
};
