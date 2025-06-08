const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error: ", error);
});

function getCliPath() {
    if (app.isPackaged) {
        // When built: app.asar.unpacked/ova-cli/ovacli.exe
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'ova-cli', 'ovacli.exe');
    } else {
        // During development
        return path.join(__dirname, 'ova-cli', 'ovacli.exe');
    }
}

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

    const indexPath = path.join(__dirname, 'dist/ova-desktop/browser/index.html');
    const url = `file://${indexPath.replace(/\\/g, '/') }#/my-route`;

    win.loadURL(url);
}

app.whenReady().then(() => {
    createWindow();

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

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
