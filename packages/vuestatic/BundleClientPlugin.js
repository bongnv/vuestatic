class BundleClientPlugin {
  apply(execution) {
    const pluginName = "BundleClientPlugin";

    execution.hooks.stepsInitialized.tap(pluginName, ({ hooks }) => {
      hooks["config"].tap(pluginName, ({ config }) => {
        const path = require("path");
        const VueStaticWebpackPlugin = require("@bongnv/vue-static-webpack-plugin");

        const isProd = process.env.NODE_ENV === "production";

        const clientWebpackConfig = require(path.resolve(
          process.cwd(),
          "build",
          "webpack.client.conf",
        ));
        clientWebpackConfig.plugins.push(
          new VueStaticWebpackPlugin({
            paths: ["/"],
            crawl: true,
            htmlMinifier: isProd
              ? {
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                removeComments: true,
                minifyJS: true,
              }
              : false,
          }),
        );

        config.clientWebpackConfig = clientWebpackConfig;
      });

      hooks["build"].tapPromise(pluginName, async ({ config }) => {
        const { webpackAsync } = require("./utils");

        const clientResult = await webpackAsync(config.clientWebpackConfig);
        console.log(clientResult.toString());
      });
    })
  }
}

module.exports = BundleClientPlugin;
