const { webpackAsync } = require("./utils");

class App {
  constructor(config) {
    this.config = config;
  }

  async run() {
    const serverResult = await webpackAsync(this.config.serverWebpackConfig);
    console.log(serverResult.toString());
    const clientResult = await webpackAsync(this.config.clientWebpackConfig);
    console.log(clientResult.toString());
  }
}

module.exports = App;
