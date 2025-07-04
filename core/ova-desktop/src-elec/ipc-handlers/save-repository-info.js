const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "data", "repository-info.json");

module.exports = function registerSaveRepositoryInfo() {
  console.log("save-repository-info handler registered");

  ipcMain.handle("save-repository-info", async (event, metadata) => {
    try {
      // Write metadata to the file
      await fs.promises.writeFile(
        dataFilePath,
        JSON.stringify(metadata, null, 2)
      );
      console.log("Repository info saved:", metadata);
      return { success: true };
    } catch (e) {
      console.error("Error saving repository info:", e);
      return { success: false, error: e.message };
    }
  });
};
