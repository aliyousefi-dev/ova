const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

process.on('uncaughtException', (error) => {
    console.error("Unexpected error:", error);
});

// Determine path to CLI binary
function getCliPath() {
    if (app.isPackaged) {
        return path.join(process.resourcesPath, 'app.asar.unpacked', 'ova-cli', 'ovacli.exe');
    } else {
        return path.join(__dirname, 'ova-cli', 'ovacli.exe');
    }
}

// Global reference to the main window
let mainWindow = null;

// Create browser window and load Angular app
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        frame: false,               // Custom frame (no OS default)
        autoHideMenuBar: true,     // Hide menu bar
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.setMenuBarVisibility(false); // Fully hide menu bar

    // Set minimum window size (width: 800, height: 600)
    mainWindow.setMinimumSize(800, 600);

    const isDev = !app.isPackaged;
    const url = isDev
        ? 'http://localhost:4200/#/my-route'
        : `file://${path.join(__dirname, 'dist/ova-desktop/browser/index.html').replace(/\\/g, '/') }#/my-route`;

    mainWindow.loadURL(url);
}

// App ready
app.whenReady().then(() => {
    createWindow();

    // Handle CLI command execution
    ipcMain.handle('run-cli', async (event, args) => {
        const cliPath = getCliPath();
        const win = BrowserWindow.getFocusedWindow();
    
        return await new Promise((resolve) => {
            const child = spawn(cliPath, args, { shell: true });
    
            child.stdout.on('data', (data) => {
                const msg = data.toString();
                win?.webContents.send('cli-log', msg);  // Live log
            });
    
            child.stderr.on('data', (data) => {
                const msg = data.toString();
                win?.webContents.send('cli-log', msg);  // Live error
            });
    
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: `CLI exited with code ${code}` });
                }
            });
    
            child.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        });
    });
    

    ipcMain.handle('pick-folder', async (event) => {
        const window = BrowserWindow.getFocusedWindow();
        if (!window) return null;

        const result = await dialog.showOpenDialog(window, {
            properties: ['openDirectory'],
        });

        if (result.canceled || result.filePaths.length === 0) return null;

        return result.filePaths[0]; // return selected path
    });

    // Handle custom window control events
    ipcMain.on('window-control', (event, action) => {
        if (!mainWindow) return;
        switch (action) {
            case 'minimize':
                mainWindow.minimize();
                break;
            case 'maximize':
                if (mainWindow.isMaximized()) {
                    mainWindow.unmaximize();
                } else {
                    mainWindow.maximize();
                }
                break;
            case 'close':
                mainWindow.close();
                break;
        }
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
