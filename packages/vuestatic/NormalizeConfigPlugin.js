class NormalizeConfigPlugin {
  apply({ config }) {
    const path = require("path");

    config.baseDir = config.baseDir || process.cwd();
    config.serverPath =
      config.serverPath || path.resolve(config.baseDir, ".vuestatic", "server");
    config.isProd = config.isProd || process.env.NODE_ENV === "production";
    config.outputDir = path.join(config.baseDir, "dist");
  }
}

module.exports = NormalizeConfigPlugin;