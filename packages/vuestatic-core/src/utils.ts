import path from "path";
import Config from "webpack-chain";

import { NormalizedConfig } from "./Execution";

export const defaultExecutionConfig = (): NormalizedConfig => {
  const baseDir = path.resolve(process.cwd());
  const outputDir = path.join(baseDir, "dist");
  const serverPath = path.join(baseDir, ".vuestatic", "server");
  const srcDir = path.join(baseDir, "src");
  const coreVueApp = path.resolve(__dirname, "../vue-app");

  return {
    isProd: false,
    baseDir,
    outputDir,
    publicPath: "/",
    serverPath,
    srcDir,
    coreVueApp,
    clientPlugins: [],
    plugins: [],
    clientWebpackConfig: new Config(),
    serverWebpackConfig: new Config(),
  };
};
