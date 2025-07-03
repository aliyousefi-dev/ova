const fs = require("fs");
const angularJson = "./angular.json";
const packageJson = "./package.json";

// Read the version from package.json using require
const { version } = require(packageJson);

// Read the angular.json file
const config = JSON.parse(fs.readFileSync(angularJson, "utf8"));

// Update the outputPath to include the version
config.projects["ova-ui"].architect.build.options.outputPath = {
  base: `dist/ovaui-${version}`,
  browser: "",
};

// Write the changes back to angular.json
fs.writeFileSync(angularJson, JSON.stringify(config, null, 2));

console.log(`Updated outputPath to dist/ui-${version}`);
