const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error:", error);
});

// Determine path to CLI binary
function getCliPath() {
    if (app.isPackaged) {
        // Packaged app: use unpacked CLI path
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'ova-cli', 'ovacli.exe');
    } else {
        // Dev mode: use local CLI path
        return path.join(__dirname, 'ova-cli', 'ovacli.exe');
    }
}

// Create browser window and load Angular app
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });

    const isDev = !app.isPackaged;

    const url = isDev
        ? 'http://localhost:4200/#/my-route'
        : `file://${path.join(__dirname, 'dist/ova-desktop/browser/index.html').replace(/\\/g, '/') }#/my-route`;

    win.loadURL(url);

    if (isDev) {
        win.webContents.openDevTools();
    }
}

// App ready
app.whenReady().then(() => {
    createWindow();

    // Handle CLI command execution
    ipcMain.handle('run-cli', async (event, args) => {
        const cliPath = getCliPath();

        return await new Promise((resolve) => {
            const child = spawn(cliPath, args);

            let output = '';
            let error = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                } else {
                    resolve({ success: false, error: `CLI exited with code ${code}: ${error}` });
                }
            });

            child.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        });
    });
});

// Handle window close on non-macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Reopen app on macOS when dock icon is clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
