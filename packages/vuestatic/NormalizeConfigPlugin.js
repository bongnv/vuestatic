class NormalizeConfigPlugin {
  apply({ config }) {
    const path = require("path");

    config.serverPath = config.serverPath || path.resolve(process.cwd(), ".vuestatic", "server");
  }
}

module.exports = NormalizeConfigPlugin
