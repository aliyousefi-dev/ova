// onAppStart.js
const { registerShortcuts } = require("./key-shortcuts"); // Import registerShortcuts

function onAppStart(mainWindow) {
  // Additional startup logic if needed
  console.log("App has started!");

  // Register global shortcuts
  registerShortcuts(mainWindow);
}

module.exports = { onAppStart };
