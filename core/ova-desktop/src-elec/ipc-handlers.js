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
  require("./ipc-handlers/show-item-in-folder")(); // NEW: Register show-item-in-folder handler
  require("./ipc-handlers/get-directory-name")(); // NEW: Register get-directory-name handler

  // Register global shortcut handlers
  require("./ipc-handlers/key-shortcuts").registerShortcuts(mainWindow); // Register key-shortcuts handler
}

module.exports = { registerIpcHandlers };
