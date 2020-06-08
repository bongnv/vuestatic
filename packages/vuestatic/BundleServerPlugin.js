class BundleServerPlugin {
  apply(app) {
    const pluginName = "BundleServerPlugin";

    app.steps["config"].tap(pluginName, ({ config }) => {
      const path = require("path");

      const serverWebpackConfig = require(path.resolve(
        process.cwd(),
        "build",
        "webpack.server.conf",
      ));
      config.serverWebpackConfig = serverWebpackConfig;
    });

    app.steps["build"].tapPromise(pluginName, async ({ config }) => {
      const { webpackAsync } = require("./utils");

      const serverResult = await webpackAsync(config.serverWebpackConfig);
      console.log(serverResult.toString());
    });
  }
}

module.exports = BundleServerPlugin;
