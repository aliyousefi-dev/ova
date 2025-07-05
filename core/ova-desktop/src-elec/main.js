// main.js
const { app, globalShortcut, BrowserWindow } = require("electron");
const path = require("path");
const { onAppStart } = require("./onAppStart");
const { createWindow } = require("./createWindow"); // Import createWindow

process.on("uncaughtException", (error) => {
  console.error("Unexpected error:", error);
});

// Determine path to CLI binary
function getCliPath() {
  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      "app.asar.unpacked",
      "ova-cli",
      "ovacli.exe"
    );
  } else {
    return path.join(__dirname, "ova-cli", "ovacli.exe");
  }
}

// App ready
app.whenReady().then(() => {
  const mainWindow = createWindow(); // Create the window
  require("./ipc-handlers").registerIpcHandlers(mainWindow, getCliPath);
  onAppStart(mainWindow); // Pass the mainWindow to onAppStart

  // The rest of your app's initialization logic can remain here
});
