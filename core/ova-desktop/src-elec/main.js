// main.js
const { app, globalShortcut, BrowserWindow } = require("electron");
const path = require("path");
const { onAppStart } = require("./onAppStart");
const { createWindow } = require("./createWindow"); // Import createWindow
const { getCliPath } = require("./ovacliPath"); // Import getCliPath

process.on("uncaughtException", (error) => {
  console.error("Unexpected error:", error);
});

// App ready
app.whenReady().then(() => {
  const mainWindow = createWindow(); // Create the window
  require("./ipc-handlers").registerIpcHandlers(mainWindow, getCliPath); // Use getCliPath
  onAppStart(mainWindow); // Pass the mainWindow to onAppStart

  // The rest of your app's initialization logic can remain here
});
