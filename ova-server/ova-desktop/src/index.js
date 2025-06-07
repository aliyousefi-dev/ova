const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // ✅ move this outside webPreferences
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  const indexPath = path.join(__dirname, 'frontend', 'browser', 'index.html');

  const indexUrl = url.format({
    pathname: indexPath,
    protocol: 'file:',
    slashes: true,
  });

  win.loadURL(indexUrl);

  // Optional: completely disable menu bar (Alt won't show it either)
  const { Menu } = require('electron');
  Menu.setApplicationMenu(null);
}


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
