class BundleClientPlugin {
  apply(app) {
    const pluginName = "BundleClientPlugin";

    app.steps["config"].tap(pluginName, ({ config }) => {
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

    app.steps["build"].tapPromise(pluginName, async ({ config }) => {
      const { webpackAsync } = require("./utils");

      const clientResult = await webpackAsync(config.clientWebpackConfig);
      console.log(clientResult.toString());
    });

    app.steps["dev"].tapAsync(pluginName, (execution, callback) => {
      const webpack = require("webpack");
      const devMiddleware = require("./staticDevMiddleware");
      const webpackDevServer = require("webpack-dev-server");
      const { serverWebpackConfig, clientWebpackConfig } = execution.config;

      const serverCompiler = webpack(serverWebpackConfig);
      const clientCompiler = webpack(clientWebpackConfig);

      const devServerConfig = {
        ...clientWebpackConfig.devServer,
        serveIndex: false,
        after: (app, server) => {
          app.use(devMiddleware(serverCompiler, server.middleware));
        },
      };

      execution.devServer = new webpackDevServer(
        clientCompiler,
        devServerConfig,
      );
      execution.devServer.listen(5000, "localhost", () => {
        console.log("dev server listening on port 5000");
        callback();
      });
    });
  }
}

module.exports = BundleClientPlugin;
