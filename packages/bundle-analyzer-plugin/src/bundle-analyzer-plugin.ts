import webpack from "webpack";
import { BundleAnalyzerPlugin as WebpackBundleAnalyzer } from "webpack-bundle-analyzer";
import type { Execution } from "@bongnv/vuestatic-core";

class BundleAnalyzerPlugin {
  apply({ commands }: Execution): void {
    const pluginName = "BundleAnalyzerPlugin";
    commands.for("analyze").tap(pluginName, ({ steps }: Execution) => {
      steps.for("config").tap(pluginName, ({ config }: Execution) => {
        config.clientWebpackConfig
          .plugin("bundle-analyzer")
          .use(new WebpackBundleAnalyzer());
      });

      steps
        .for("execute")
        .tapAsync(
          pluginName,
          ({ config }: Execution, callback: (err?: Error) => void) => {
            webpack(config.clientWebpackConfig.toConfig(), (err, stats) => {
              if (err) {
                callback(err);
              }

              console.log(stats.toString());
              callback();
            });
          },
        );
    });
  }
}

export = BundleAnalyzerPlugin;
