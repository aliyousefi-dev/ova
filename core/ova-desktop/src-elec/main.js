// main.js
const { app } = require("electron");
const { onAppStart } = require("./onAppStart");
const { createWindow } = require("./createWindow"); // Import createWindow

process.on("uncaughtException", (error) => {
  console.error("Unexpected error:", error);
});

// App ready
app.whenReady().then(() => {
  const mainWindow = createWindow(); // Create the window
  require("./ipc-handlers").registerIpcHandlers(mainWindow); // Use getCliPath
  onAppStart(mainWindow); // Pass the mainWindow to onAppStart

  // The rest of your app's initialization logic can remain here
});
