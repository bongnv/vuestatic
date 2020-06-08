class App {
  constructor(config) {
    this.config = config;
  }

  async run() {
    if (this.config.isDev) {
      return this.dev();
    }

    const { webpackAsync } = require("./utils");
    const serverResult = await webpackAsync(this.config.serverWebpackConfig);
    console.log(serverResult.toString());
    const clientResult = await webpackAsync(this.config.clientWebpackConfig);
    console.log(clientResult.toString());
  }

  async dev() {
    const webpack = require("webpack");
    const webpackDevServer = require("webpack-dev-server");
    const devMiddleware = require("./staticDevMiddleware");
    const serverCompiler = webpack(this.config.serverWebpackConfig);
    const clientCompiler = webpack(this.config.clientWebpackConfig);

    const devServerConfig = {
      ...this.config.clientWebpackConfig.devServer,
      serveIndex: false,
      after: (app, server) => {
        app.use(devMiddleware(serverCompiler, server.middleware));
      },
    }
    const server = new webpackDevServer(clientCompiler, devServerConfig);

    server.listen(5000, "localhost", () => {
      console.log("dev server listening on port 5000");
    });
  }
}

module.exports = App;
