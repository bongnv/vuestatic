const { AsyncSeriesHook } = require("tapable");
const BundleClientPlugin = require("./BundleClientPlugin");
const BundleServerPlugin = require("./BundleServerPlugin");
const DevServerPlugin = require("./DevServerPlugin");
// const BundleStaticPlugin = require("./BundleStaticPlugin");

class Execution {
  constructor(config = {}) {
    this.config = config;
    this.plugins = config.plugins || [];
    this.steps = ["config", "build"];
    this.hooks = {
      stepsInitialized: new AsyncSeriesHook(["execution"]),
    };
  }

  _setupSteps() {
    const params = ["execution"];

    this.steps.forEach((step) => {
      this.hooks["pre-" + step] = new AsyncSeriesHook(params);
      this.hooks[step] = new AsyncSeriesHook(params);
      this.hooks["post-" + step] = new AsyncSeriesHook(params);
    })
  }

  async _execStep(name) {
    console.log(`Executing step: ${name} ...`);
    await this.hooks["pre-" + name].promise(this);
    await this.hooks[name].promise(this);
    await this.hooks["post-" + name].promise(this);
  }

  _applyPlugins() {
    const plugins = [
      new BundleServerPlugin(),
      new BundleClientPlugin(),
      this.config.isDev && new DevServerPlugin(),
      // new BundleStaticPlugin(),
      ...this.plugins,
    ];

    plugins.forEach((plugin) => plugin && plugin.apply(this));
  }

  async run() {
    this._applyPlugins();

    this._setupSteps();
    await this.hooks.stepsInitialized.promise(this);

    for (let step of this.steps) {
      await this._execStep(step);
    }
  }
}

module.exports = Execution;
