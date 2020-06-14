import Config from "webpack-chain";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

import applyBaseConfig from "./applyBaseConfig";
import { defaultExecutionConfig } from "./utils";

jest.mock("mini-css-extract-plugin");

test("applyBaseConfig should configure basic configuration", () => {
  const webpackConfig = new Config();
  const config = defaultExecutionConfig();
  applyBaseConfig(config, webpackConfig);
  const serializedConfig = webpackConfig.toConfig();
  expect(serializedConfig).toBeTruthy();
  expect(serializedConfig.mode).toBe("development");
  expect(serializedConfig.module?.rules).toHaveLength(2);
});

test("applyBaseConfig should match snapshot", () => {
  MiniCssExtractPlugin.loader = "mini-css-extract-plugin-loader";
  const webpackConfig = new Config();
  const config = defaultExecutionConfig({
    baseDir: "/",
  });
  applyBaseConfig(config, webpackConfig);
  const serializedConfig = webpackConfig.toConfig();
  expect(serializedConfig).toMatchSnapshot();
});
