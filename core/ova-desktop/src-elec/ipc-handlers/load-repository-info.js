const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "data", "repository-info.json"); // Same file path as before

module.exports = function registerLoadRepositoryInfo() {
  console.log("load-repository-info handler registered");

  ipcMain.handle("load-repository-info", async () => {
    try {
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
