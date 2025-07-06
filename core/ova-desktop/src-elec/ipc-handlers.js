const path = require("path");

function registerIpcHandlers(mainWindow, getCliPath) {
  // Register the different IPC handlers
  require("./ipc-handlers/run-cli")(getCliPath);
  require("./ipc-handlers/pick-folder")();
  require("./ipc-handlers/window-control")(mainWindow);
  require("./ipc-handlers/folder-exists")();
  require("./ipc-handlers/settings-save")();
  require("./ipc-handlers/serve-repo")();
  require("./ipc-handlers/join-path")();
  require("./ipc-handlers/save-repository-info")();
  require("./ipc-handlers/load-repository-info")();

  // Register global shortcut handlers
  require("./key-shortcuts").registerShortcuts(mainWindow);
}

module.exports = { registerIpcHandlers };
