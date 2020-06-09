class DevServerPlugin {
  apply({ config, hooks }) {
    if (!config.isDev) {
      console.log("Skip processing as this is not a development execution.");
      return;
    }
    const pluginName = "DevServerPlugin";

    hooks["dev"] &&
      hooks["dev"].tapAsync(pluginName, (execution, callback) => {
        const path = require("path");
        const webpack = require("webpack");
        const devMiddleware = require("./staticDevMiddleware");
        const webpackDevServer = require("webpack-dev-server");

        const { serverWebpackConfig, clientWebpackConfig, staticWebpackConfig } = execution.config;
        const serverCompiler = webpack(serverWebpackConfig.toConfig());
        const clientCompiler = webpack(clientWebpackConfig);

        const devServerConfig = {
          ...clientWebpackConfig.devServer,
          contentBase: path.join(execution.config.serverPath, "static"),
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

module.exports = DevServerPlugin;
