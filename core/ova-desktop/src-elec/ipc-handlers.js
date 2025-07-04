const path = require("path");

function registerIpcHandlers(mainWindow, getCliPath) {
  require("./ipc-handlers/run-cli")(getCliPath);
  require("./ipc-handlers/pick-folder")();
  require("./ipc-handlers/window-control")(mainWindow);
  require("./ipc-handlers/file-exists")();
  require("./ipc-handlers/settings-save")();
  require("./ipc-handlers/serve-repo")();
}

module.exports = { registerIpcHandlers };
