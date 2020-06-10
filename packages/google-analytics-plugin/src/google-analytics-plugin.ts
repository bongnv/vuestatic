import path from "path";
import webpack from "webpack";
import type { AsyncSeriesHook } from "tapable";

interface Options {
  id: string;
}

interface Execution {
  config: Record<string, any>;
  hooks: Record<string, AsyncSeriesHook>;
}

class GoogleAnalyticsPlugin {
  GA: string;

  constructor({ id }: Options) {
    this.GA = id;
  }

  apply({ hooks }: Execution) {
    console.log("applying google analytics plugin");

    const pluginName = "GoogleAnalyticsPlugin";
    hooks["pre-config"].tap(pluginName, ({ config }: Execution) => {
      config.clientPlugins.push(path.resolve(__dirname, "client-plugin.js"));
    });

    hooks["post-config"].tap(pluginName, ({ config }: Execution) => {
      config.clientWebpackConfig.plugin("google-analytic-define").use(
        new webpack.DefinePlugin({
          __GOOGLE_ANALYTICS_ID__: JSON.stringify(this.GA),
        }),
      );
    });
  }
}

module.exports = GoogleAnalyticsPlugin;
