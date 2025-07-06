// ipc-handlers.js
const path = require("path");

function registerIpcHandlers(mainWindow) {
  // Register the different IPC handlers
  require("./ipc-handlers/ovacli")(); // Register the ovacli handler
  require("./ipc-handlers/pick-folder")(); // Register pick-folder handler
  require("./ipc-handlers/window-control")(mainWindow); // Register window control handler
  require("./ipc-handlers/folder-exists")(); // Register folder-exists handler
  require("./ipc-handlers/settings-save")(); // Register settings-save handler
  require("./ipc-handlers/serve-repo")(); // Register serve-repo handler
  require("./ipc-handlers/join-path")(); // Register join-path handler
  require("./ipc-handlers/save-repository-info")(); // Register save-repository-info handler
  require("./ipc-handlers/load-repository-info")(); // Register load-repository-info handler

  // Register global shortcut handlers
  require("./ipc-handlers/key-shortcuts").registerShortcuts(mainWindow); // Register key-shortcuts handler
}

module.exports = { registerIpcHandlers };
