const { AsyncSeriesHook } = require("tapable");
const _ = require("lodash");

const BundleClientPlugin = require("./BundleClientPlugin");
const BundleServerPlugin = require("./BundleServerPlugin");
const DevServerPlugin = require("@bongnv/dev-server-plugin");
const StaticGenPlugin = require("@bongnv/static-gen-plugin");
const NormalizeConfigPlugin = require("./NormalizeConfigPlugin");

class Execution {
  constructor(config = {}) {
    this.config = config;
    this.plugins = config.plugins || [];
    this.steps = ["config", config.isDev ? "dev" : "build"];
    this.hooks = {};
  }

  _setupSteps() {
    const params = ["execution"];

    this.steps.forEach((step) => {
      this.hooks["pre-" + step] = new AsyncSeriesHook(params);
      this.hooks[step] = new AsyncSeriesHook(params);
      this.hooks["post-" + step] = new AsyncSeriesHook(params);
    });
  }

  async _execStep(name) {
    console.log(`Executing step: ${name} ...`);
    await this.hooks["pre-" + name].promise(this);
    await this.hooks[name].promise(this);
    await this.hooks["post-" + name].promise(this);
  }

  _applyPlugins() {
    const plugins = _.compact([
      new NormalizeConfigPlugin(),
      new BundleServerPlugin(),
      new BundleClientPlugin(),
      new StaticGenPlugin({
        // crawl: true,
      }),
      this.config.isDev && new DevServerPlugin(),
      ...this.plugins,
    ]);

    plugins.forEach((plugin) => plugin.apply(this));
  }

  async run() {
    this._setupSteps();
    this._applyPlugins();

    for (let step of this.steps) {
      await this._execStep(step);
    }
  }
}

module.exports = Execution;
