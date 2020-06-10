class NormalizeConfigPlugin {
  apply({ config }) {
    const path = require("path");

    config.baseDir = config.baseDir || process.cwd();
    config.serverPath =
      config.serverPath || path.resolve(config.baseDir, ".vuestatic", "server");
    config.isProd = config.isProd || process.env.NODE_ENV === "production";
    config.srcDir = path.join(config.baseDir, "src");
    config.outputDir = path.join(config.baseDir, "dist");
    config.clientPlugins = [];
    config.defaultVueApp = path.resolve(__dirname, "../vue-app");
  }
}

module.exports = NormalizeConfigPlugin;
