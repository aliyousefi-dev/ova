const { ipcMain } = require("electron");
const path = require("path");

module.exports = function registerJoinPaths() {
  console.log("join-path handler registered"); // Debug log
  ipcMain.handle("join-paths", (event, folderPath, folderName) => {
    try {
      const result = path.join(folderPath, folderName);
      return result;
    } catch (e) {
      console.error("Error joining paths:", e);
      return null; // Return null in case of an error
    }
  });
};
