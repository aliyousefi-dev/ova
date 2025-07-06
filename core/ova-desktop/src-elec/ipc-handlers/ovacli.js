// ovacli.js
const { ipcMain, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const { getCliPath } = require("../ovacliPath"); // Import the getCliPath function

module.exports = function registerRunCli() {
  ipcMain.handle("ovacli", async (event, args) => {
    const cliPath = getCliPath(); // Get the path to the cli
    const win = BrowserWindow.getFocusedWindow();

    let output = ""; // Variable to capture output

    return new Promise((resolve) => {
      const child = spawn(cliPath, args, { shell: true });

      // Handle the standard output of the command
      child.stdout.on("data", (data) => {
        const msg = data.toString();
        output += msg; // Append the output
        win?.webContents.send("cli-log", msg); // Send to renderer process
      });

      // Handle errors from the command
      child.stderr.on("data", (data) => {
        const msg = data.toString();
        output += msg; // Append error output as well
        win?.webContents.send("cli-log", msg); // Send to renderer process
      });

      // Handle process exit
      child.on("close", (code) => {
        if (code === 0) {
          resolve({ success: true, output }); // Return the captured output
        } else {
          resolve({
            success: false,
            error: `CLI exited with code ${code}`,
            output,
          });
        }
      });

      // Handle process errors
      child.on("error", (err) => {
        resolve({ success: false, error: err.message, output });
      });
    });
  });
};
