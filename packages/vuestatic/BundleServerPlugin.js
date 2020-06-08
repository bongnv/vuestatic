class BundleServerPlugin {
  apply(execution) {
    const pluginName = "BundleServerPlugin";

    execution.hooks.stepsInitialized.tap(pluginName, ({ hooks }) => {
      hooks["config"].tap(pluginName, ({ config }) => {
        const path = require("path");

        const serverWebpackConfig = require(path.resolve(
          process.cwd(),
          "build",
          "webpack.server.conf",
        ));
        config.serverWebpackConfig = serverWebpackConfig;
      });

      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("./utils");

        const serverResult = await webpackAsync(config.serverWebpackConfig);
        console.log(serverResult.toString());
      });
    });
  }
}

module.exports = BundleServerPlugin;
