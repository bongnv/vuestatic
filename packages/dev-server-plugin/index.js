class DevServerPlugin {
  apply({ hooks }) {
    const pluginName = "DevServerPlugin";

    hooks["dev"] &&
      hooks["dev"].tapAsync(pluginName, (execution, callback) => {
        const webpack = require("webpack");
        const devMiddleware = require("./staticDevMiddleware");
        const webpackDevServer = require("webpack-dev-server");
        const { serverWebpackConfig, clientWebpackConfig, staticWebpackConfig } = execution.config;

        const serverCompiler = webpack(serverWebpackConfig);
        const clientCompiler = webpack(clientWebpackConfig);
        const staticCompiler = webpack(staticWebpackConfig);

        const devServerConfig = {
          ...clientWebpackConfig.devServer,
          serveIndex: false,
          after: (app, server) => {
            app.use(devMiddleware(serverCompiler, server.middleware));
          },
        };

        staticCompiler.watch(staticWebpackConfig.watchOptions, (err, stats) => {
          if (err) {
            return console.error(err);
          }

          console.log(stats.toString());
        })

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

module.exports = DevServerPlugin;
