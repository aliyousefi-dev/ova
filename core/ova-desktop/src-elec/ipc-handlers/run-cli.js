const { ipcMain, BrowserWindow } = require("electron");
const { spawn } = require("child_process");

module.exports = function registerRunCli(getCliPath) {
  ipcMain.handle("run-cli", async (event, args) => {
    const cliPath = getCliPath();
    const win = BrowserWindow.getFocusedWindow();

    return await new Promise((resolve) => {
      const child = spawn(cliPath, args, { shell: true });

      child.stdout.on("data", (data) => {
        const msg = data.toString();
        win?.webContents.send("cli-log", msg);
      });

      child.stderr.on("data", (data) => {
        const msg = data.toString();
        win?.webContents.send("cli-log", msg);
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `CLI exited with code ${code}` });
        }
      });

      child.on("error", (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  });
};
