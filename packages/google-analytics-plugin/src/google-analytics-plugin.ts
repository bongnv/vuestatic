import path from "path";
import webpack from "webpack";
import type { Execution } from "@bongnv/vuestatic-core";

interface Options {
  id: string;
}

class GoogleAnalyticsPlugin {
  GA: string;

  constructor({ id }: Options) {
    this.GA = id;
  }

  apply({ steps, config }: Execution) {
    const pluginName = "GoogleAnalyticsPlugin";
    config.clientPlugins.push(path.resolve(__dirname, "client-plugin.js"));

    steps.for("config").tap(pluginName, ({ config }: Execution) => {
      config.clientWebpackConfig.plugin("google-analytic-define").use(
        new webpack.DefinePlugin({
          __GOOGLE_ANALYTICS_ID__: JSON.stringify(this.GA),
        }),
      );
    })
  }
}

export = GoogleAnalyticsPlugin;
