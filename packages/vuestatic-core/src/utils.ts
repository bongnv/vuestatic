import path from "path";
import Config from "webpack-chain";

import type { NormalizedConfig, ExecutionConfig } from "./Execution";

export const defaultExecutionConfig = (
  rawConfig: ExecutionConfig = {},
): NormalizedConfig => {
  const baseDir = rawConfig.baseDir || path.resolve(process.cwd());
  const outputDir = rawConfig.outputDir || path.join(baseDir, "dist");
  const serverPath =
    rawConfig.serverPath || path.join(baseDir, ".vuestatic", "server");
  const srcDir = rawConfig.srcDir || path.join(baseDir, "src");
  const plugins = rawConfig.plugins || [];

  return {
    isProd: false,
    baseDir,
    outputDir,
    publicPath: "/",
    serverPath,
    srcDir,
    clientPlugins: [],
    propsHandlers: [],
    plugins: plugins,
    clientWebpackConfig: new Config(),
    serverWebpackConfig: new Config(),
  };
};
