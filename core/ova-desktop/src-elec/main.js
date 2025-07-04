const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
const fs = require("fs"); // <-- Add this line

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

// Global reference to the main window
let mainWindow = null;

// Create browser window and load Angular app
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false, // Custom frame (no OS default)
    autoHideMenuBar: true, // Hide menu bar
    webPreferences: {
      preload: path.join(__dirname, "electron-bridge.js"),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true, // Enable webview tag
    },
  });

  mainWindow.setMenuBarVisibility(false); // Fully hide menu bar

  // Set minimum window size (width: 800, height: 600)
  mainWindow.setMinimumSize(800, 600);

  const isDev = !app.isPackaged;
  const url = isDev
    ? "http://localhost:4200/"
    : `file://${path
        .join(__dirname, "..", "ova-desktop-ui/index.html")
        .replace(/\\/g, "/")}`;

  mainWindow.loadURL(url);
}

// App ready
app.whenReady().then(() => {
  createWindow();

  // Register global shortcut
  globalShortcut.register("CommandOrControl+E", () => {
    const win = BrowserWindow.getFocusedWindow();
    win?.webContents.send("log-shortcut", "Ctrl+E pressed!");
  });
  // Register IPC handlers in separate file
  require("./ipc-handlers").registerIpcHandlers(mainWindow, getCliPath);
});
