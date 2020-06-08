class DevServerPlugin {
  apply({ steps, hooks }) {
    const pluginName = "DevServerPlugin";

    steps.push("dev");

    hooks.stepsInitialized.tap(pluginName, ({ hooks }) => {
      hooks["dev"].tapAsync(pluginName, (execution, callback) => {
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
    })
  }
}

module.exports = DevServerPlugin;
