const { ipcMain } = require("electron");
const path = require("path");

module.exports = function registerJoinPaths() {
  console.log("join-path handler registered"); // Debug log
  ipcMain.handle("join-paths", (event, folderPath, folderName) => {
    try {
      console.log("Joining paths:", folderPath, folderName); // Log the folder path and folder name being joined
      const result = path.join(folderPath, folderName);
      console.log("Joined path:", result); // Log the resulting joined path
      return result;
    } catch (e) {
      console.error("Error joining paths:", e);
      return null; // Return null in case of an error
    }
  });
};
