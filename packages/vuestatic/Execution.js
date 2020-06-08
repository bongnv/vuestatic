const { AsyncSeriesHook } = require("tapable");
const BundleClientPlugin = require("./BundleClientPlugin");
const BundleServerPlugin = require("./BundleServerPlugin");
// const BundleStaticPlugin = require("./BundleStaticPlugin");

class Execution {
  constructor(config = {}) {
    this.config = config;
    this.plugins = config.plugins || [];
    this.steps = {};
    this._setupStep("config");
    this._setupStep("build");
    this._setupStep("dev");
  }

  _setupStep(name) {
    const params = ["app"];
    this.steps["pre-" + name] = new AsyncSeriesHook(params);
    this.steps[name] = new AsyncSeriesHook(params);
    this.steps["post-" + name] = new AsyncSeriesHook(params);
  }

  async _execStep(name) {
    console.log(`Executing step: ${name} ...`);
    await this.steps["pre-" + name].promise(this);
    await this.steps[name].promise(this);
    await this.steps["post-" + name].promise(this);
  }

  _applyPlugins() {
    const plugins = [
      new BundleServerPlugin(),
      new BundleClientPlugin(),
      // new BundleStaticPlugin(),
      ...this.plugins,
    ];

    plugins.forEach((plugin) => plugin.apply(this));
  }

  async run() {
    this._applyPlugins();

    const steps = ["config"];

    if (this.config.isDev) {
      steps.push("dev");
    } else if (this.config.isAnalyze) {
      steps.push("analyze");
    } else {
      steps.push("build");
    }

    for (let step of steps) {
      await this._execStep(step);
    }
  }
}

module.exports = Execution;
