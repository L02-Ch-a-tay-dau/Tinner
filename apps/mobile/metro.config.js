const { getDefaultConfig } = require("expo/metro-config"); // Giữ lại để reference nếu cần hoặc dùng trực tiếp từ sentry
const { getSentryExpoConfig } = require("@sentry/react-native/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../.."); // Giả định theo logic bên trái của bạn

// Mix: Dùng hàm của Sentry nhưng truyền projectRoot vào
const config = getSentryExpoConfig(projectRoot);

// Giữ lại các cấu hình Monorepo/Workspace từ nhánh Incoming
config.watchFolders = [
  projectRoot,
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

config.resolver.blockList = [
  /[\\/]apps[\\/]backend[\\/]dist[\\/].*/,
];

module.exports = config;