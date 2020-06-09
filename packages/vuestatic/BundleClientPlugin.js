class BundleClientPlugin {
  apply({ hooks }) {
    const pluginName = "BundleClientPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const path = require("path");
      const isProd = process.env.NODE_ENV === "production";

      const clientWebpackConfig = require(path.resolve(
        process.cwd(),
        "build",
        "webpack.client.conf",
      ));

      config.clientWebpackConfig = clientWebpackConfig;
    });

    hooks["build"] &&
      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("./utils");

        const clientResult = await webpackAsync(config.clientWebpackConfig);
        console.log(clientResult.toString());
      });
  }
}

module.exports = BundleClientPlugin;
