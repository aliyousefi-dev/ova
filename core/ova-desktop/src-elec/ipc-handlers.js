const path = require("path");

function registerIpcHandlers(mainWindow, getCliPath) {
  require("./ipc-handlers/run-cli")(getCliPath);
  require("./ipc-handlers/pick-folder")();
  require("./ipc-handlers/window-control")(mainWindow);
  require("./ipc-handlers/folder-exists")();
  require("./ipc-handlers/settings-save")();
  require("./ipc-handlers/serve-repo")();
  require("./ipc-handlers/join-path")();
  require("./ipc-handlers/save-repository-info")();
  require("./ipc-handlers/load-repository-info")();
}

module.exports = { registerIpcHandlers };
