import webpack from "webpack";
import { BundleAnalyzerPlugin as WebpackBundleAnalyzer } from "webpack-bundle-analyzer";
import type { Execution } from "@bongnv/vuestatic-core";

class BundleAnalyzerPlugin {
  apply({ commands }: Execution) {
    const pluginName = "BundleAnalyzerPlugin";
    commands.for("analyze").tap(pluginName, ({ steps }) => {
      steps.for("execute").tapAsync(pluginName, ({ config }: Execution, callback: Function) => {
        config.clientWebpackConfig
        .plugin("bundle-analyzer")
        .use(new WebpackBundleAnalyzer());

        webpack(config.clientWebpackConfig.toConfig(), (err, stats) => {
          if (err) {
            callback(err);
          }

          console.log(stats.toString());
          callback();
        });
      })
    });
  }
}

export = BundleAnalyzerPlugin;
