const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Resolve packages: mobile first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Block ONLY the root's react (not react-native) to prevent duplicate React
const rootReactPath = path.resolve(monorepoRoot, "node_modules", "react");
const escape = (p) => p.replace(/[/\\]/g, "[/\\\\]");
config.resolver.blockList = [
  new RegExp(`^${escape(rootReactPath)}[/\\\\].*$`),
];

module.exports = config;
