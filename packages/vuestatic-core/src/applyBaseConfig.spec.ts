import Config from "webpack-chain";

import applyBaseConfig from "./applyBaseConfig";
import { defaultExecutionConfig } from "./utils";

test("applyBaseConfig should configure basic configuration", () => {
  const webpackConfig = new Config();
  const config = defaultExecutionConfig();
  applyBaseConfig(config, webpackConfig);
  const serializedConfig = webpackConfig.toConfig();
  expect(serializedConfig).toBeTruthy();
  expect(serializedConfig.mode).toBe("development");
  expect(serializedConfig.module?.rules).toHaveLength(2);
});
