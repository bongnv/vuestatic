import type { AsyncSeriesHook } from "tapable";
import { BundleAnalyzerPlugin as WebpackBundleAnalyzer } from "webpack-bundle-analyzer";

interface Execution {
  config: Record<string, any>;
  hooks: Record<string, AsyncSeriesHook>;
}

class BundleAnalyzerPlugin {
  apply({ hooks }: Execution) {
    const pluginName = "BundleAnalyzerPlugin";
    hooks["config"].tap(pluginName, ({ config }: Execution) => {
      config.clientWebpackConfig
        .plugin("bundle-analyzer")
        .use(new WebpackBundleAnalyzer());
    });
  }
}

module.exports = BundleAnalyzerPlugin;
