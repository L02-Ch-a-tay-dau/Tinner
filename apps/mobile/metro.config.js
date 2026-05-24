const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// IMPORTANT: Metro needs to watch the workspace root to resolve hoisted modules
config.watchFolders = [
  workspaceRoot,
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

config.resolver.blockList = [
  /[\\/]apps[\\/]backend[\\/]dist[\\/].*/,
  /[\\/]\.bin[\\/].*/,
];

module.exports = config;