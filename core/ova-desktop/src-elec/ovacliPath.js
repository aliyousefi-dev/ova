// ovacliPath.js
const path = require("path");
const { app } = require("electron");

function getCliPath() {
  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "ova-cli",
      "ovacli.exe"
    );
  } else {
    return path.join(__dirname, "..", "thirdparty", "ova-cli", "ovacli.exe");
  }
}

module.exports = { getCliPath };
