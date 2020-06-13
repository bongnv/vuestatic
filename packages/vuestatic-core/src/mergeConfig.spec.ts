import path from "path";

import { mergeConfig } from "./mergeConfig";
import { defaultExecutionConfig } from "./utils";
import { BundleClientPlugin } from "./BundleClientPlugin";
import { BundleServerPlugin } from "./BundleServerPlugin";

test("mergeConfig should merge configuration", () => {
  const targetConfig = defaultExecutionConfig();

  const result = mergeConfig(targetConfig, {});

  const expectedBaseDir = path.resolve(__dirname, "..");
  expect(targetConfig).toEqual(result);
  expect(result.baseDir).toEqual(expectedBaseDir);
});

test("mergeConfig should merge plugins", () => {
  const targetConfig = defaultExecutionConfig();
  targetConfig.plugins.push(new BundleClientPlugin());

  const result = mergeConfig(targetConfig, {
    plugins: [new BundleServerPlugin()],
  });

  const expectedBaseDir = path.resolve(__dirname, "..");
  expect(targetConfig).toEqual(result);
  expect(result.baseDir).toEqual(expectedBaseDir);
  expect(result.plugins).toHaveLength(2);
});
