const { AsyncSeriesHook } = require("tapable");
const _ = require("lodash");

const DevServerPlugin = require("@bongnv/dev-server-plugin");
const StaticGenPlugin = require("@bongnv/static-gen-plugin");
const MarkdownVueStaticPlugin = require("@bongnv/markdown-vuestatic-plugin");
const BundleAnalyzerPlugin = require("@bongnv/bundle-analyzer-plugin");
const {
  BundleClientPlugin,
  BundleServerPlugin,
} = require("@bongnv/vuestatic-core-plugin");
const NormalizeConfigPlugin = require("./plugins/NormalizeConfigPlugin");

class Execution {
  constructor(config = {}) {
    this.config = config;
    this.steps = ["config", config.isWatch ? "dev" : "build"];
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

  _loadLocalConfig() {
    const path = require("path");
    const fs = require("fs");
    const localConfigFile = path.resolve(process.cwd(), "vuestatic.config.js");
    if (fs.existsSync(localConfigFile)) {
      const localConfig = require(path.resolve(
        process.cwd(),
        "vuestatic.config.js",
      ));
      this.config = Object.assign(this.config, localConfig);
    } else {
      console.warn("vuestatic.config.js is not found.");
    }
  }

  _applyPlugins() {
    const { isWatch, isAnalyze } = this.config;
    const plugins = this.config.plugins || [];
    plugins.unshift(
      new NormalizeConfigPlugin(),
      new BundleClientPlugin(),
      !isAnalyze && new BundleServerPlugin(),
      !isAnalyze && new MarkdownVueStaticPlugin(),
      !isAnalyze &&
        new StaticGenPlugin({
          crawl: true,
        }),
      isAnalyze && new BundleAnalyzerPlugin(),
      isWatch && new DevServerPlugin(),
    );

    _.compact(plugins).forEach((plugin) => plugin.apply(this));
  }

  async run() {
    this._loadLocalConfig();
    this._setupSteps();
    this._applyPlugins();

    for (let step of this.steps) {
      await this._execStep(step);
    }
  }
}

module.exports = Execution;
