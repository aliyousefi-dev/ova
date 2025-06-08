const { app, BrowserWindow } = require('electron');
const path = require('path');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error: ", error);
});

function createWindow() {
    const win = new BrowserWindow({ width: 800, height: 800 });

    // Build absolute path to index.html
    const indexPath = path.join(__dirname, 'dist/ova-desktop/browser/index.html');

    // Convert to file URL and add hash route
    const url = `file://${indexPath.replace(/\\/g, '/') }#/my-route`;

    win.loadURL(url);
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
