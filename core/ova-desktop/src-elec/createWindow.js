// createWindow.js
const { BrowserWindow, app } = require("electron"); // <-- Import app here
const path = require("path");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false, // Custom frame (no OS default)
    autoHideMenuBar: true, // Hide menu bar
    webPreferences: {
      preload: path.join(__dirname, "ipc-bridge.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // Enable webview tag
    },
  });

  mainWindow.setMenuBarVisibility(false); // Fully hide menu bar

  // Set minimum window size (width: 800, height: 600)
  mainWindow.setMinimumSize(800, 600);

  const isDev = !app.isPackaged; // Now app is available directly
  const url = isDev
    ? "http://localhost:4200/"
    : `file://${path
        .join(__dirname, "..", "ova-desktop-ui/index.html")
        .replace(/\\/g, "/")}`;

  mainWindow.loadURL(url);

  return mainWindow;
}

module.exports = { createWindow };
