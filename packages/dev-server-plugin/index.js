class DevServerPlugin {
  apply({ config, hooks }) {
    if (!config.isDev) {
      console.log("Skip processing as this is not a development execution.");
      return;
    }
    const pluginName = "DevServerPlugin";

    hooks["config"].tap(pluginName, ({ config }) => {
      const { staticWebpackConfig } = config;
      staticWebpackConfig.module
        .rule("compile-images")
        .use("file-loader")
        .tap(options => ({
          ...options,
          outputPath: "static/_assets/images",
        }));
    })

    hooks["dev"] &&
      hooks["dev"].tapAsync(pluginName, (execution, callback) => {
        const path = require("path");
        const webpack = require("webpack");
        const devMiddleware = require("./staticDevMiddleware");
        const webpackDevServer = require("webpack-dev-server");

        const { serverWebpackConfig, clientWebpackConfig, staticWebpackConfig } = execution.config;
        const serverCompiler = webpack(serverWebpackConfig);
        const clientCompiler = webpack(clientWebpackConfig);
        const staticCompiler = webpack(staticWebpackConfig.toConfig());

        const devServerConfig = {
          ...clientWebpackConfig.devServer,
          contentBase: path.resolve(process.cwd(), ".vuestatic/static-props/static"),
          serveIndex: false,
          after: (app, server) => {
            app.use(devMiddleware(serverCompiler, staticCompiler, server.middleware));
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
