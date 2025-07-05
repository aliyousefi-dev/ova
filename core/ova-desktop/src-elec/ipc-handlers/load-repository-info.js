const { ipcMain, shell, app } = require("electron");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "data", "repository-info.json"); // Same file path as before

module.exports = function registerLoadRepositoryInfo() {
  console.log("load-repository-info handler registered");

  // Load repository info
  ipcMain.handle("load-repository-info", async () => {
    try {
      // Test: Open userData folder in file explorer
      const userDataPath = app.getPath("userData");
      console.log("Opening userData folder:", userDataPath);
      await shell.openPath(userDataPath); // Open userData folder in explorer

      const data = await fs.promises.readFile(dataFilePath, "utf-8");
      const metadata = JSON.parse(data); // Assuming the file contains JSON data
      console.log("Repository info loaded:", metadata);

      return metadata;
    } catch (e) {
      console.error("Error loading repository info:", e);
      return { error: e.message };
    }
  });
};
