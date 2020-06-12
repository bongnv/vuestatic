class DevServerPlugin {
  apply({ commands }) {
    const pluginName = "DevServerPlugin";

    commands.for("dev").tap(pluginName, ({ steps }) => {
      steps.for("execute").tapAsync(pluginName, (execution, callback) => {
        const path = require("path");
        const webpack = require("webpack");
        const devMiddleware = require("./staticDevMiddleware");
        const webpackDevServer = require("webpack-dev-server");

        const { serverWebpackConfig, clientWebpackConfig } = execution.config;
        const serverCompiler = webpack(serverWebpackConfig.toConfig());
        const clientCompiler = webpack(clientWebpackConfig.toConfig());

        const devServerConfig = {
          ...clientWebpackConfig.toConfig().devServer,
          contentBase: path.join(execution.config.serverPath, "static"),
          serveIndex: false,
          after: (app, server) => {
            app.use(
              devMiddleware(
                execution.config,
                serverCompiler,
                server.middleware,
              ),
            );
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
    });
  }
}

module.exports = DevServerPlugin;
